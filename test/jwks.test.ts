/**
 * The JWKS cache's three rules.
 *
 * The clock is injected rather than slept through: every rule here is stated
 * in tens or hundreds of seconds, and a suite that waited for them would take
 * twenty minutes to prove what these assertions prove in milliseconds.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { TokenError } from '../src/errors.js'
import {
  clearJwksCaches,
  DEFAULT_TTL_SECONDS,
  JwksCache,
  jwksFor,
  MIN_REFETCH_SECONDS,
} from '../src/jwks.js'
import { USER_AGENT } from '../src/version.js'
import { clock, startIssuer, type TestIssuer } from './issuer.js'

let issuer: TestIssuer

beforeEach(async () => {
  issuer = await startIssuer()
  clearJwksCaches()
})

afterEach(async () => {
  await issuer.stop()
})

describe('JwksCache', () => {
  it('fetches once and answers from the cache inside the document TTL', async () => {
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })

    await cache.get(issuer.active.kid)
    time.advance(299)
    await cache.get(issuer.active.kid)

    expect(cache.fetches).toBe(1)
    expect(issuer.requests).toBe(1)
  })

  it('identifies this package and its version to the issuer', async () => {
    // Every request an SDK makes carries
    // `User-Agent: kleora-{package}/{version}`. This fetch once sent only
    // `Accept`, which made the rule one the Node SDK followed everywhere but
    // the one request it makes on its own initiative — and an access log is where somebody asks what that traffic was.
    //
    // Both halves are asserted on the value the server actually received: the
    // constant, so a rename cannot quietly drop it, and the shape, so
    // `kleora-node` with no version behind it fails too.
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })

    await cache.get(issuer.active.kid)

    expect(issuer.lastReceived?.['user-agent']).toBe(USER_AGENT)
    expect(issuer.lastReceived?.['user-agent']).toMatch(/^kleora-node\/\d+\.\d+\.\d+$/)
    expect(issuer.lastReceived?.accept).toBe('application/json')
  })

  it('honours the document max-age rather than a constant of its own', async () => {
    issuer.maxAge = 30
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })

    await cache.get(issuer.active.kid)
    time.advance(31)
    await cache.get(issuer.active.kid)

    expect(cache.fetches).toBe(2)
  })

  it('falls back to the default TTL when the document names none', async () => {
    issuer.maxAge = null
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })

    await cache.get(issuer.active.kid)
    time.advance(DEFAULT_TTL_SECONDS - 1)
    await cache.get(issuer.active.kid)
    expect(cache.fetches).toBe(1)

    time.advance(2)
    await cache.get(issuer.active.kid)
    expect(cache.fetches).toBe(2)
  })

  it('refuses an unknown kid without a fetch inside the 60 s floor', async () => {
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })
    await cache.get(issuer.active.kid)

    time.advance(MIN_REFETCH_SECONDS - 1)
    await expect(cache.get('a-kid-nobody-published')).rejects.toBeInstanceOf(TokenError)
    expect(cache.fetches).toBe(1)
  })

  it('refetches once for an unknown kid past the floor, and still refuses it', async () => {
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })
    await cache.get(issuer.active.kid)

    time.advance(MIN_REFETCH_SECONDS)
    await expect(cache.get('a-kid-nobody-published')).rejects.toMatchObject({
      code: 'unknown_kid',
    })
    expect(cache.fetches).toBe(2)

    // The floor holds after the refetch too, which is the point of it: a
    // stream of forged kids costs one request a minute, not one each.
    await expect(cache.get('another-kid-nobody-published')).rejects.toMatchObject({
      code: 'unknown_kid',
    })
    expect(cache.fetches).toBe(2)
  })

  it('picks up a rotated key with exactly one refetch', async () => {
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })
    await cache.get(issuer.active.kid)

    const rotated = await issuer.publish()
    time.advance(MIN_REFETCH_SECONDS)

    await expect(cache.get(rotated.kid)).resolves.toBeDefined()
    expect(cache.fetches).toBe(2)
  })

  it('needs no refetch at all for a key the issuer pre-announced', async () => {
    // Every signing-key rotation promotes a key
    // that was published as `next` beforehand, so a caller's cache already
    // holds it. This is the case a rotation is designed to be.
    const announced = await issuer.publish()
    const cache = new JwksCache(issuer.url)

    await cache.get(issuer.active.kid)
    await expect(cache.get(announced.kid)).resolves.toBeDefined()

    expect(cache.fetches).toBe(1)
  })

  it('serves the stale set while the endpoint is down, up to twice the TTL', async () => {
    issuer.maxAge = 100
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })
    await cache.get(issuer.active.kid)

    issuer.status = 503
    time.advance(150)
    await expect(cache.get(issuer.active.kid)).resolves.toBeDefined()

    // Past 2 × TTL there is no document this cache may trust, so what it
    // reports is the outage — not "no such key", which would be a lie a
    // middleware answers 401 to.
    time.advance(60)
    await expect(cache.get(issuer.active.kid)).rejects.toMatchObject({
      code: 'issuer_unavailable',
    })
  })

  it('recovers when the endpoint comes back inside the stale window', async () => {
    issuer.maxAge = 100
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })
    await cache.get(issuer.active.kid)

    issuer.status = 503
    time.advance(120)
    await cache.get(issuer.active.kid)

    issuer.status = 200
    const rotated = await issuer.publish()
    time.advance(MIN_REFETCH_SECONDS)
    await expect(cache.get(rotated.kid)).resolves.toBeDefined()
  })

  it('fails when the first fetch fails: there is no stale set to fall back to', async () => {
    issuer.status = 503
    const cache = new JwksCache(issuer.url)

    await expect(cache.get(issuer.active.kid)).rejects.toMatchObject({
      name: 'TokenError',
      code: 'issuer_unavailable',
    })
  })

  it('reports a refused connection as issuer_unavailable, not as a TypeError', async () => {
    // Before the fix this escaped as `TypeError: fetch failed`, outside the
    // taxonomy a caller catches and outside anything a middleware can map.
    const cache = new JwksCache('http://127.0.0.1:1')

    const error = await cache.get('any-kid').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(TokenError)
    expect(error).toMatchObject({ code: 'issuer_unavailable' })
  })

  it('reports a body that is not a JWK Set as issuer_unavailable', async () => {
    issuer.body = 'not json at all'
    const cache = new JwksCache(issuer.url)

    await expect(cache.get(issuer.active.kid)).rejects.toMatchObject({
      code: 'issuer_unavailable',
    })
  })

  it('reports an empty key set as issuer_unavailable', async () => {
    issuer.body = JSON.stringify({ keys: [] })
    const cache = new JwksCache(issuer.url)

    await expect(cache.get(issuer.active.kid)).rejects.toMatchObject({
      code: 'issuer_unavailable',
    })
  })

  it('times out a hung endpoint and rejects every coalesced waiter', async () => {
    // The reason a timeout matters more here than elsewhere: `refresh()`
    // coalesces, so without one a single blackholed request would hold every
    // concurrent verification for undici's 300 s default, not just the first.
    issuer.hang = true
    const cache = new JwksCache(issuer.url, { timeout: 150 })

    const waiters = await Promise.allSettled(
      Array.from({ length: 5 }, () => cache.get(issuer.active.kid)),
    )

    expect(waiters.map((settled) => settled.status)).toEqual(Array(5).fill('rejected'))
    for (const settled of waiters) {
      expect((settled as PromiseRejectedResult).reason).toMatchObject({
        name: 'TokenError',
        code: 'issuer_unavailable',
      })
    }
    expect(issuer.requests).toBe(1)

    // `inFlight` is cleared, so the endpoint coming back is picked up rather
    // than every later call awaiting the dead promise for ever.
    issuer.hang = false
    await expect(cache.get(issuer.active.kid)).resolves.toBeDefined()
  })

  it('measures its intervals on a clock a wall-clock correction cannot move', async () => {
    // The default clock, not an injected one. With `Date.now` as the source an
    // NTP step backwards makes `now() - lastAttempt` negative, the refetch
    // floor stays shut for the length of the step, and a genuinely rotated
    // `kid` cannot be fetched until the clock catches up.
    const cache = new JwksCache(issuer.url, { minRefetchInterval: 0 })
    await cache.get(issuer.active.kid)
    const rotated = await issuer.publish()

    const real = Date.now
    try {
      Date.now = () => real() - 3_600_000
      await expect(cache.get(rotated.kid)).resolves.toBeDefined()
    } finally {
      Date.now = real
    }
    expect(cache.fetches).toBe(2)
  })

  it('stops answering for a key that has left the document', async () => {
    issuer.maxAge = 10
    const time = clock()
    const cache = new JwksCache(issuer.url, { now: time.now })
    const dropped = await issuer.publish()
    await cache.get(dropped.kid)

    // A key retired immediately, without a grace period.
    issuer.keys = issuer.keys.filter((key) => key.kid !== dropped.kid)
    time.advance(MIN_REFETCH_SECONDS)

    await expect(cache.get(dropped.kid)).rejects.toMatchObject({ code: 'unknown_kid' })
  })

  it('makes one request when twenty verifications start at once', async () => {
    const cache = new JwksCache(issuer.url)

    await Promise.all(
      Array.from({ length: 20 }, () => cache.get(issuer.active.kid)),
    )

    expect(issuer.requests).toBe(1)
  })

  it('is keyed on the JWKS URL, one per issuer', () => {
    expect(jwksFor(issuer.url)).toBe(jwksFor(`${issuer.url}/`))
    expect(jwksFor(issuer.url).url).toBe(`${issuer.url}/.well-known/jwks.json`)

    clearJwksCaches()
    expect(jwksFor(issuer.url)).not.toBe(jwksFor('http://127.0.0.1:1/'))
  })

  it('gives a later caller the first caller\'s cache, options and all', () => {
    // Documented rather than merged (jwks.ts): one caller's 5 s timeout
    // silently becoming another's is worse than first-writer-wins, and a
    // caller that needs its own settings constructs its own cache.
    const first = jwksFor(issuer.url, { timeout: 1 })

    expect(jwksFor(issuer.url, { timeout: 9_000 })).toBe(first)
  })
})

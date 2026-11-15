/**
 * `ManagementClient`: requests, secrets and the environment guard.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { inspect } from 'node:util'

import { classifyKey } from '../src/environment.js'
import { ApiError, EnvironmentMismatch, KleoraError } from '../src/errors.js'
import { ManagementClient } from '../src/management.js'
import { USER_AGENT } from '../src/version.js'
import { problemBody, startApi, type FakeApi } from './api.js'

const TEST_KEY = 'kl_test_753aypZzabcdefghijklmnopqrstuvwxyz01234567'
const LIVE_KEY = 'kl_live_4Kd9sQx2abcdefghijklmnopqrstuvwxyz01234567'
const SANDBOX_ISSUER = 'https://acme-sandbox.kleora.eu'
const PRODUCTION_ISSUER = 'https://acme.kleora.eu'
// Key prefixes from before the product's rename. The API
// honours none of them, so the SDK must not read one as either environment.
const RETIRED_KEY_PREFIXES = ['pa_live_', 'pa_test_']

let api: FakeApi

const client = (overrides: Record<string, unknown> = {}): ManagementClient =>
  new ManagementClient({ apiKey: TEST_KEY, baseUrl: api.url, ...overrides })

beforeEach(async () => {
  api = await startApi()
})

afterEach(async () => {
  await api.stop()
})

describe('configuration', () => {
  it('refuses a credential that is not an API key', () => {
    expect(() => new ManagementClient({ apiKey: 'not-a-key' })).toThrow(KleoraError)
  })

  it('reads each prefix as its environment', () => {
    expect(classifyKey(LIVE_KEY)).toBe('production')
    expect(classifyKey(TEST_KEY)).toBe('sandbox')
  })

  it.each(RETIRED_KEY_PREFIXES)('refuses a key carrying the retired prefix %s', (prefix) => {
    const retired = prefix + TEST_KEY.slice('kl_test_'.length)

    expect(classifyKey(retired)).toBeNull()
    expect(() => new ManagementClient({ apiKey: retired, baseUrl: api.url })).toThrow(
      /must start with 'kl_live_' or 'kl_test_'/,
    )
    expect(api.requests).toEqual([])
  })

  it('refuses an issuer that is not an absolute URL', () => {
    expect(() => client({ issuer: 'acme-sandbox.kleora.eu' })).toThrow(KleoraError)
  })

  it('refuses a base URL that is not an absolute URL', () => {
    // Before the fix this survived construction and surfaced as a raw
    // `TypeError` from `new URL` on the first call.
    expect(() => new ManagementClient({ apiKey: TEST_KEY, baseUrl: 'api.example.test' })).toThrow(
      KleoraError,
    )
  })

  it('accepts a base URL that already carries the /api/v1 prefix', async () => {
    const configured = new ManagementClient({ apiKey: TEST_KEY, baseUrl: `${api.url}/api/v1` })

    await configured.get('/api/v1/me')

    expect(configured.baseUrl).toBe(api.url)
    expect(api.requests[0]?.path).toBe('/api/v1/me')
  })
})

describe('the environment guard', () => {
  it('refuses a sandbox key aimed at a production issuer at construction', () => {
    // The environment guard: with `issuer` configured the
    // prefix can be checked with no network call, so it is checked before the
    // object exists rather than on the first call — the timing `kleora`
    // (Python) has always had. The counter is what proves "no request with the
    // key is sent" rather than "sent and then rejected".
    expect(() => client({ issuer: PRODUCTION_ISSUER })).toThrow(EnvironmentMismatch)
    expect(api.requests).toEqual([])
  })

  it('refuses a production key aimed at a sandbox issuer at construction', () => {
    expect(() => client({ apiKey: LIVE_KEY, issuer: SANDBOX_ISSUER })).toThrow(
      EnvironmentMismatch,
    )
    expect(api.requests).toEqual([])
  })

  it('defers to the first call GET /me when no issuer is configured', async () => {
    // The other half of the amended rule: nothing local to compare against, so
    // the mismatch can only come from the server, and it still does.
    api.environment = { id: 'x', kind: 'production', issuer: PRODUCTION_ISSUER }
    const configured = client()

    expect(api.requests).toEqual([])
    await expect(configured.get('/api/v1/apps')).rejects.toBeInstanceOf(EnvironmentMismatch)
    expect(api.requests.map((request) => request.path)).toEqual(['/api/v1/me'])
  })

  it('reads the environment from GET /me and lets the call through', async () => {
    const configured = client()

    await configured.get('/api/v1/apps')

    expect(api.requests.map((request) => request.path)).toEqual(['/api/v1/me', '/api/v1/apps'])
    expect(configured.environment?.kind).toBe('sandbox')
    expect(configured.environment?.issuer).toBe(SANDBOX_ISSUER)
  })

  it('calls GET /me once, however many calls follow', async () => {
    const configured = client()

    await configured.get('/api/v1/apps')
    await configured.get('/api/v1/apps')
    await configured.get('/api/v1/account')

    expect(api.requests.filter((request) => request.path === '/api/v1/me')).toHaveLength(1)
  })

  it('makes one GET /me even when the first calls are concurrent', async () => {
    const configured = client()

    await Promise.all([
      configured.get('/api/v1/apps'),
      configured.get('/api/v1/apps'),
      configured.get('/api/v1/account'),
    ])

    expect(api.requests.filter((request) => request.path === '/api/v1/me')).toHaveLength(1)
  })

  it('refuses when GET /me reports the other kind of environment', async () => {
    api.environment = { id: 'x', kind: 'production', issuer: PRODUCTION_ISSUER }

    await expect(client().get('/api/v1/apps')).rejects.toBeInstanceOf(EnvironmentMismatch)
    expect(api.calls).toEqual([])
  })

  it('refuses when GET /me reports another issuer than the one configured', async () => {
    const configured = client({ issuer: 'https://other-sandbox.kleora.eu' })

    await expect(configured.get('/api/v1/apps')).rejects.toBeInstanceOf(EnvironmentMismatch)
    expect(api.calls).toEqual([])
  })

  it('ignores a trailing slash when comparing issuers', async () => {
    const configured = client({ issuer: `${SANDBOX_ISSUER}/` })

    await expect(configured.get('/api/v1/apps')).resolves.toBeDefined()
  })

  it('refuses when GET /me reports no environment at all', async () => {
    api.environment = null

    await expect(client().get('/api/v1/apps')).rejects.toBeInstanceOf(EnvironmentMismatch)
  })

  it('remembers a mismatch: it will not fix itself, so it is not re-derived', async () => {
    api.environment = { id: 'x', kind: 'production', issuer: PRODUCTION_ISSUER }
    const configured = client()

    await expect(configured.get('/api/v1/apps')).rejects.toBeInstanceOf(EnvironmentMismatch)
    api.environment = { id: 'x', kind: 'sandbox', issuer: SANDBOX_ISSUER }
    await expect(configured.get('/api/v1/apps')).rejects.toBeInstanceOf(EnvironmentMismatch)

    expect(api.requests.filter((request) => request.path === '/api/v1/me')).toHaveLength(1)
  })

  it('retries after a transient failure rather than poisoning the client', async () => {
    // A 503 on the start-up `GET /me` is a moment, not a configuration. Before
    // the fix the rejected promise was remembered and every later call
    // re-threw it for the life of the process.
    let first = true
    api.respond = (request) => {
      if (request.path !== '/api/v1/me') return { body: { ok: true } }
      if (first) {
        first = false
        return { status: 503, body: problemBody('unavailable', 503) }
      }
      return { body: api.me() }
    }
    const configured = client()

    await expect(configured.get('/api/v1/apps')).rejects.toBeInstanceOf(ApiError)
    await expect(configured.get('/api/v1/apps')).resolves.toBeDefined()

    expect(api.requests.filter((request) => request.path === '/api/v1/me')).toHaveLength(2)
    expect(configured.environment?.kind).toBe('sandbox')
  })
})

describe('requests', () => {
  it('sends the credential, the User-Agent and an Accept', async () => {
    await client().get('/api/v1/apps')

    const call = api.calls[0]
    expect(call?.headers['authorization']).toBe(`Bearer ${TEST_KEY}`)
    expect(call?.headers['user-agent']).toBe(USER_AGENT)
    expect(call?.headers['accept']).toContain('application/problem+json')
  })

  it('forwards the caller X-Request-Id onto the guard request made for it', async () => {
    // The guard's `GET /me` is part of the call that triggered it, and is the
    // request an operator chasing that correlation id most needs to find.
    await client().get('/api/v1/apps', { requestId: 'req_the_first_call' })

    const me = api.requests.find((request) => request.path === '/api/v1/me')
    expect(me?.headers['x-request-id']).toBe('req_the_first_call')
  })

  it('times out a hung request rather than blocking the caller for ever', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me' ? { body: api.me() } : { hang: true }
    const configured = client({ timeout: 150 })

    const error = await configured.get('/api/v1/apps').catch((caught: unknown) => caught)

    expect((error as Error).name).toBe('TimeoutError')
  })

  it('bounds the guard request too, so one hung /me cannot block every call', async () => {
    api.respond = () => ({ hang: true })
    const configured = client({ timeout: 150 })

    const error = await configured.get('/api/v1/apps').catch((caught: unknown) => caught)

    expect((error as Error).name).toBe('TimeoutError')
  })

  it('still honours the caller own signal alongside the timeout', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me' ? { body: api.me() } : { hang: true }
    const controller = new AbortController()
    const configured = client({ timeout: 30_000 })
    setTimeout(() => {
      controller.abort(new Error('the caller changed its mind'))
    }, 50)

    await expect(
      configured.get('/api/v1/apps', { signal: controller.signal }),
    ).rejects.toThrow('the caller changed its mind')
  })

  it('forwards X-Request-Id only when the caller supplies one', async () => {
    const configured = client()

    await configured.get('/api/v1/apps', { requestId: 'req_from_the_caller' })
    await configured.get('/api/v1/apps')

    expect(api.calls[0]?.headers['x-request-id']).toBe('req_from_the_caller')
    expect(api.calls[1]?.headers['x-request-id']).toBeUndefined()
  })

  it('sends Idempotency-Key when asked', async () => {
    await client().post('/api/v1/apps', {
      body: { name: 'Acme', slug: 'acme' },
      idempotencyKey: 'key-1',
    })

    expect(api.calls[0]?.headers['idempotency-key']).toBe('key-1')
  })

  it('substitutes path parameters', async () => {
    await client().get('/api/v1/apps/{app_id}', { path: { app_id: 'a b/c' } })

    expect(api.calls[0]?.path).toBe('/api/v1/apps/a%20b%2Fc')
  })

  it('refuses a path whose parameters were not supplied', async () => {
    // The generated types make this a compile error; the runtime check is for
    // the JavaScript caller the types cannot reach.
    const configured = client() as unknown as { get: (path: string) => Promise<unknown> }

    await expect(configured.get('/api/v1/apps/{app_id}')).rejects.toBeInstanceOf(KleoraError)
  })

  it('serialises a query, dropping the parameters that were not set', async () => {
    await client().get('/api/v1/apps', { query: { limit: 25, cursor: null, slug: 'acme' } })

    expect(api.calls[0]?.query.toString()).toBe('limit=25&slug=acme')
  })

  it('sends a JSON body with its content type', async () => {
    await client().post('/api/v1/apps', { body: { name: 'Acme', slug: 'acme' } })

    expect(api.calls[0]?.headers['content-type']).toBe('application/json')
    expect(api.calls[0]?.body).toEqual({ name: 'Acme', slug: 'acme' })
  })

  it('answers a 204 with nothing', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me' ? { body: api.me() } : { status: 204 }

    await expect(
      client().delete('/api/v1/apps/{app_id}', { path: { app_id: 'an-id' } }),
    ).resolves.toBeUndefined()
  })
})

describe('problem parsing', () => {
  it('turns a problem document into an ApiError', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : { status: 404, body: problemBody('not-found', 404) }

    const error = await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      type: 'https://kleora.io/problems/not-found',
      status: 404,
      detail: 'a not-found problem',
    })
    expect((error as ApiError).problem.document['request_id']).toBe(
      'req_01J000000000000000000000',
    )
  })

  it('exposes errors[] for a validation problem', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : {
            status: 422,
            body: problemBody('validation-error', 422, {
              errors: [{ field: 'slug', message: 'must be a slug', code: 'invalid_slug' }],
            }),
          }

    const error = (await client()
      .post('/api/v1/apps', { body: { name: 'Acme', slug: '!' } })
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.errors).toEqual([
      { field: 'slug', message: 'must be a slug', code: 'invalid_slug' },
    ])
  })

  it('reads Retry-After off the response, and the body when the header is absent', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : {
            status: 429,
            headers: { 'Retry-After': '30' },
            body: problemBody('rate-limited', 429),
          }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.problem.retryAfter).toBe(30)
  })

  it('reads a Retry-After in the HTTP-date form a proxy may rewrite', async () => {
    const when = new Date(Date.now() + 45_000).toUTCString()
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : { status: 503, headers: { 'Retry-After': when }, body: problemBody('unavailable', 503) }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.problem.retryAfter).toBeGreaterThan(40)
    expect(error.problem.retryAfter).toBeLessThanOrEqual(45)
  })

  it('reads Idempotency-Replayed', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : {
            status: 409,
            headers: { 'Idempotency-Replayed': 'unavailable' },
            body: problemBody('conflict', 409),
          }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.problem.idempotencyReplayed).toBe('unavailable')
  })

  it('reads the request id off the document', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : {
            status: 404,
            body: problemBody('not-found', 404),
            // A header that disagrees with the body, which the running stack
            // never sends: the assertion is that the *body* is what is read,
            // and a header equal to it could not tell the two apart.
            headers: { 'X-Request-Id': 'req_from_the_header' },
          }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.requestId).toBe('req_01J000000000000000000000')
  })

  it('falls back to X-Request-Id when the document has no request_id', async () => {
    // An older deployment, or an error from something in front of the API.
    const withoutId = problemBody('not-found', 404)
    delete withoutId['request_id']
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : {
            status: 404,
            body: withoutId,
            headers: { 'X-Request-Id': 'req_from_the_header' },
          }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.requestId).toBe('req_from_the_header')
  })

  it('leaves the request id undefined when neither half carried one', async () => {
    const withoutId = problemBody('not-found', 404)
    delete withoutId['request_id']
    api.respond = (request) =>
      request.path === '/api/v1/me' ? { body: api.me() } : { status: 404, body: withoutId }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.requestId).toBeUndefined()
  })

  it('still raises an ApiError when the body is not a problem document', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : { status: 502, text: '<html>bad gateway</html>' }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(502)
    expect(error.type).toBe('about:blank')
  })

  it('names the request even when the body is not a problem document', async () => {
    api.respond = (request) =>
      request.path === '/api/v1/me'
        ? { body: api.me() }
        : {
            status: 502,
            text: '<html>bad gateway</html>',
            headers: { 'X-Request-Id': 'req_from_the_header' },
          }

    const error = (await client()
      .get('/api/v1/apps')
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.requestId).toBe('req_from_the_header')
  })
})

describe('the key is never written down', () => {
  it('shows only the prefix in toString, inspect and JSON', () => {
    const configured = client()

    expect(configured.toString()).toContain('kl_test_753aypZz')
    expect(configured.toString()).not.toContain(TEST_KEY)
    expect(inspect(configured)).not.toContain(TEST_KEY)
    expect(`${String(configured)}`).not.toContain(TEST_KEY)
    expect(JSON.stringify(configured)).not.toContain(TEST_KEY)
    expect(JSON.stringify(configured)).toContain('kl_test_753aypZz')
  })

  it('shows only the prefix in an EnvironmentMismatch message', () => {
    let error: unknown
    try {
      client({ issuer: PRODUCTION_ISSUER })
    } catch (caught: unknown) {
      error = caught
    }

    expect(error).toBeInstanceOf(EnvironmentMismatch)
    expect((error as Error).message).toContain('kl_test_753aypZz')
    expect((error as Error).message).not.toContain(TEST_KEY)
  })

  it('keeps the key off every own property of the object', () => {
    const configured = client()

    expect(JSON.stringify(Object.entries(configured))).not.toContain(TEST_KEY)
  })
})

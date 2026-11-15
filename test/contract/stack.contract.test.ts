/**
 * The SDK against a running Kleora environment.
 *
 * These are the tests that would catch the package agreeing with itself: the
 * unit suite serves its own JWKS and its own management API, so it can only
 * prove that this code does what this repository *believes* the endpoints do.
 * Here the endpoints answer for themselves — real ES256 tokens from a real
 * login, a real rotation through `POST …/signing-keys/rotate`, and a real
 * `kl_test_` key.
 *
 * They skip when `KLEORA_TEST_*` is absent, so `pnpm test` stays green in
 * CI, which has no environment. To run them (README, "Contract tests"):
 *
 * ```
 * KLEORA_TEST_ISSUER=<issuer> \
 * KLEORA_TEST_API_BASE=<management API base>/api/v1 \
 * KLEORA_TEST_CLIENT_ID=<client id> \
 * KLEORA_TEST_REDIRECT_URI=<a registered redirect URI> \
 * KLEORA_TEST_USERNAME=<an account owner's email> \
 * KLEORA_TEST_PASSWORD=<their password> \
 * pnpm test
 * ```
 */

import { randomBytes } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AccountClient } from '../../src/account.js'
import { ApiError, EnvironmentMismatch } from '../../src/errors.js'
import { JwksCache, MIN_REFETCH_SECONDS } from '../../src/jwks.js'
import { ManagementClient } from '../../src/management.js'
import { accountPortalUrl } from '../../src/portal.js'
import { verifyAccessToken } from '../../src/verify.js'
import { clock } from '../issuer.js'
import { Jar, login } from './hosted-login.js'
import {
  apiOrigin,
  configured,
  required,
  CLIENT_ID,
  ISSUER,
  REDIRECT_URI,
  provision,
  teardown,
  type Stack,
} from './stack.js'

let stack: Stack

beforeAll(async () => {
  if (configured) stack = await provision()
}, 60_000)

afterAll(async () => {
  if (configured) await teardown(stack)
})

/** Rewrite a token's header to name a `kid` no issuer published. */
function withUnknownKid(token: string, kid: string): string {
  const [, payload, signature] = token.split('.')
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid, typ: 'at+jwt' })).toString(
    'base64url',
  )
  return `${header}.${String(payload)}.${String(signature)}`
}

/** The `kid` a token names, read straight off its header. */
function kidOf(token: string): string {
  const [header] = token.split('.')
  const decoded = JSON.parse(Buffer.from(String(header), 'base64url').toString()) as {
    kid?: string
    typ?: string
  }
  return String(decoded.kid)
}

// The guard on the guard. Everything below skips itself when `KLEORA_TEST_*`
// is absent, which is right on a developer's machine and wrong in a step that
// booted a stack on purpose: five silent skips and exit 0 read as coverage.
// This is the one assertion that runs when `KLEORA_TEST_REQUIRE_LIVE=1` says
// an environment was arranged.
describe.runIf(required)('the contract environment', () => {
  it('is configured, because this run required it', () => {
    expect(configured).toBe(true)
  })
})

describe.skipIf(!configured)('@kleora-io/node against a running stack', () => {
  describe('verification', () => {
    it('verifies a token the stack minted', async () => {
      const claims = await verifyAccessToken(stack.consoleToken, {
        issuer: ISSUER as string,
        audience: CLIENT_ID as string,
      })

      expect(claims.iss).toBe(ISSUER)
      expect(claims.client_id).toBe(CLIENT_ID)
      expect(claims.env).toBe('production')
      expect(claims.aud).toContain(CLIENT_ID)
      expect(claims.permissions).toContain('apps:read')
      expect(claims.amr).toContain('pwd')
      expect(typeof claims.jti).toBe('string')
    })

    it('the stack really does mint at+jwt, which the verifier now requires', () => {
      // The platform writes the header; RFC 9068 §4
      // says a resource server must check it. This is the half of the pair
      // that only a real token can prove.
      const [header] = stack.consoleToken.split('.')
      const decoded = JSON.parse(Buffer.from(String(header), 'base64url').toString()) as {
        typ?: string
        alg?: string
      }

      expect(decoded.typ).toBe('at+jwt')
      expect(decoded.alg).toBe('ES256')
    })

    it('refuses the stack own ID token, which is signed by the same key', async () => {
      const tokens = await stack.signIn()
      const idToken = tokens.id_token
      expect(idToken).toBeDefined()

      await expect(
        verifyAccessToken(String(idToken), {
          issuer: stack.sandbox.issuer,
          audience: stack.clientId,
        }),
      ).rejects.toMatchObject({ name: 'TokenError', code: 'invalid_type' })
    })

    it('refuses a wrong audience', async () => {
      await expect(
        verifyAccessToken(stack.consoleToken, {
          issuer: ISSUER as string,
          audience: 'https://api.not-this-one.example',
        }),
      ).rejects.toMatchObject({ name: 'TokenError', code: 'audience_mismatch' })
    })

    it('refuses a wrong issuer', async () => {
      // The cache is aimed at the real issuer deliberately: the point is the
      // `iss` comparison, and letting the key resolution fail first would
      // report `unknown_kid` and prove nothing about it.
      await expect(
        verifyAccessToken(stack.consoleToken, {
          issuer: 'https://elsewhere.kleora.eu',
          audience: CLIENT_ID as string,
          jwks: new JwksCache(ISSUER as string),
        }),
      ).rejects.toMatchObject({ name: 'TokenError', code: 'issuer_mismatch' })
    })

    it('refuses the same token once it has expired', async () => {
      const claims = await verifyAccessToken(stack.consoleToken, {
        issuer: ISSUER as string,
        audience: CLIENT_ID as string,
      })

      await expect(
        verifyAccessToken(stack.consoleToken, {
          issuer: ISSUER as string,
          audience: CLIENT_ID as string,
          now: () => (claims.exp + 61) * 1000,
        }),
      ).rejects.toMatchObject({ name: 'TokenError', code: 'expired' })
    })

    it('refuses an unknown kid, refetching once past the 60 s floor', async () => {
      const time = clock()
      const cache = new JwksCache(ISSUER as string, { now: time.now })
      await verifyAccessToken(stack.consoleToken, {
        issuer: ISSUER as string,
        audience: CLIENT_ID as string,
        jwks: cache,
      })
      expect(cache.fetches).toBe(1)

      time.advance(MIN_REFETCH_SECONDS)
      await expect(
        verifyAccessToken(withUnknownKid(stack.consoleToken, 'nothing-published-this'), {
          issuer: ISSUER as string,
          audience: CLIENT_ID as string,
          jwks: cache,
        }),
      ).rejects.toMatchObject({ name: 'TokenError', code: 'unknown_kid' })
      expect(cache.fetches).toBe(2)
    })
  })

  describe('the JWKS cache across a rotation', () => {
    it('verifies the next token with exactly one refetch, and refuses the next unknown kid without one', async () => {
      const issuer = stack.sandbox.issuer
      const audience = stack.clientId
      const time = clock()
      const cache = new JwksCache(issuer, { now: time.now })

      const before = await stack.signIn()
      await verifyAccessToken(before.access_token, { issuer, audience, jwks: cache })
      expect(cache.fetches).toBe(1)

      // Twice, deliberately. One rotation promotes the key that was published
      // as `next` before the cache's first fetch, so the cache already holds
      // it and needs no request at all. The second rotation promotes the `next` the first one
      // created, which no cache anywhere had seen — the case where a refetch
      // is what stands between a valid token and a rejected one.
      await stack.admin('POST', `/api/v1/environments/${stack.sandbox.id}/signing-keys/rotate`)
      await stack.admin('POST', `/api/v1/environments/${stack.sandbox.id}/signing-keys/rotate`)

      const after = await stack.signIn()
      // Without this the assertion below could be satisfied by a TTL refresh
      // if the stack ever published `max-age < 60`: the new key would then
      // already be present, the floor would never be consulted, and
      // `fetches === 2` would prove nothing about the unknown-`kid` path.
      expect(kidOf(after.access_token)).not.toBe(kidOf(before.access_token))
      time.advance(MIN_REFETCH_SECONDS)

      const claims = await verifyAccessToken(after.access_token, { issuer, audience, jwks: cache })
      expect(claims.env).toBe('sandbox')
      expect(cache.fetches).toBe(2)

      await expect(
        verifyAccessToken(withUnknownKid(after.access_token, 'still-nothing'), {
          issuer,
          audience,
          jwks: cache,
        }),
      ).rejects.toMatchObject({ code: 'unknown_kid' })
      expect(cache.fetches).toBe(2)
    })

    it('keeps verifying a token signed by the key the rotation retired', async () => {
      // A retired key stays in JWKS
      // for `access_token_ttl + 300` seconds, so tokens in flight survive.
      const issuer = stack.sandbox.issuer
      const before = await stack.signIn()
      await stack.admin('POST', `/api/v1/environments/${stack.sandbox.id}/signing-keys/rotate`)

      await expect(
        verifyAccessToken(before.access_token, {
          issuer,
          audience: stack.clientId,
          jwks: new JwksCache(issuer),
        }),
      ).resolves.toMatchObject({ env: 'sandbox' })
    })
  })

  describe('ManagementClient', () => {
    it('refuses a kl_test_ key configured with a production issuer, sending nothing', () => {
      // The environment guard: raised at construction when
      // `issuer` is configured. The counter is the proof of "sending nothing" —
      // it counts every `fetch` this client would make, and stays at zero
      // because the client never comes into existence.
      let calls = 0

      expect(
        () =>
          new ManagementClient({
            apiKey: stack.testKey,
            baseUrl: apiOrigin(),
            issuer: stack.production.issuer,
            fetch: (input, init) => {
              calls += 1
              return globalThis.fetch(input, init)
            },
          }),
      ).toThrow(EnvironmentMismatch)
      expect(calls).toBe(0)
    })

    it('reports its own sandbox environment from GET /me and then calls through', async () => {
      const client = new ManagementClient({
        apiKey: stack.testKey,
        baseUrl: apiOrigin(),
        issuer: stack.sandbox.issuer,
      })

      const clients = await client.get('/api/v1/environments/{environment_id}/clients', {
        path: { environment_id: stack.sandbox.id },
      })

      expect(client.environment?.kind).toBe('sandbox')
      expect(client.environment?.issuer).toBe(stack.sandbox.issuer)
      expect(clients.items.map((entry) => entry.client_id)).toContain(stack.clientId)
    })

    it('surfaces a call to a production environment as an ApiError 404', async () => {
      // Outside the key's scope is 404, not
      // 403 — the existence of another environment is never revealed.
      const client = new ManagementClient({ apiKey: stack.testKey, baseUrl: apiOrigin() })

      const error = await client
        .get('/api/v1/environments/{environment_id}', {
          path: { environment_id: stack.production.id },
        })
        .catch((caught: unknown) => caught)

      expect(error).toBeInstanceOf(ApiError)
      expect(error).toMatchObject({
        status: 404,
        type: 'https://kleora.io/problems/not-found',
      })
      // The whole document is kept, extension members included, so a caller
      // can render what `ApiError`'s four fields have no room for.
      expect((error as ApiError).problem.document).toMatchObject({
        title: expect.any(String),
        instance: expect.stringContaining(stack.production.id),
      })
      // The server puts the correlation id in both places and they agree.
      expect((error as ApiError).requestId).toEqual(expect.any(String))
      expect((error as ApiError).problem.document['request_id']).toBe(
        (error as ApiError).requestId,
      )
    })

    it('sends the API key nowhere but the API base', () => {
      // The suite-wide recorder (test/network.ts) asserts the hosts; this
      // asserts that the credential itself never reaches a message.
      const client = new ManagementClient({ apiKey: stack.testKey, baseUrl: apiOrigin() })

      expect(client.toString()).not.toContain(stack.testKey)
      expect(client.toString()).toContain(stack.testKey.slice(0, 16))
    })
  })

  // The portal URL and the
  // self-service token are both proved by using them. A person of their own,
  // so changing a password here moves nothing the tests above rely on.
  describe('self-service and the account portal', () => {
    const scope = 'openid profile email offline_access self_service'
    const returnTo = `${new URL(REDIRECT_URI).origin}/`
    let person: { email: string; password: string }
    let clientRow: { id: string; allowed_scopes: string[] }

    beforeAll(async () => {
      person = {
        email: `sdk-self-${randomBytes(4).toString('hex')}@example.test`,
        password: randomBytes(24).toString('base64url'),
      }
      await stack.admin('POST', `/api/v1/environments/${stack.sandbox.id}/users`, {
        ...person,
        email_verified: true,
      })
      const clients = await stack.admin<{ items: { id: string; client_id: string; allowed_scopes: string[] }[] }>(
        'GET',
        `/api/v1/environments/${stack.sandbox.id}/clients`,
      )
      const row = clients.items.find((entry) => entry.client_id === stack.clientId)
      if (row === undefined) throw new Error('the provisioned client is gone')
      clientRow = row
      await stack.admin('PATCH', `/api/v1/environments/${stack.sandbox.id}/clients/${row.id}`, {
        post_logout_redirect_uris: [returnTo],
      })
    }, 30_000)

    /** `POST /flow/portal/token` as the portal page itself makes it: same origin, the session cookie. */
    async function portalToken(jar: Jar, portalUrl: string): Promise<Response> {
      const url = new URL(portalUrl)
      return fetch(new URL('/flow/portal/token', url.origin), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: url.origin, Cookie: jar.header() },
        body: JSON.stringify({
          client_id: url.searchParams.get('client_id'),
          return_to: url.searchParams.get('return_to'),
        }),
      })
    }

    it('is not offered, and cannot be granted, before the Client lists self_service', async () => {
      // The portal: a session on the issuer, and a Client that has not opted in.
      const jar = new Jar()
      await login({ issuer: stack.sandbox.issuer, clientId: stack.clientId, redirectUri: REDIRECT_URI, ...person }, jar)
      const url = accountPortalUrl({ issuer: stack.sandbox.issuer, clientId: stack.clientId, returnTo })
      const refused = await portalToken(jar, url)
      expect(refused.status).toBe(403)
      expect(((await refused.json()) as { type: string }).type).toMatch(/\/portal-not-offered$/)

      // The API: the scope itself is refused at /oauth/authorize.
      await expect(
        login({ issuer: stack.sandbox.issuer, clientId: stack.clientId, redirectUri: REDIRECT_URI, scope, ...person }),
      ).rejects.toThrow(/invalid_scope|without a code/)
    }, 60_000)

    it('opens the portal the URL names, with the return link it asked for', async () => {
      await stack.admin('PATCH', `/api/v1/environments/${stack.sandbox.id}/clients/${clientRow.id}`, {
        allowed_scopes: [...clientRow.allowed_scopes, 'self_service'],
      })
      const url = accountPortalUrl({
        issuer: stack.sandbox.issuer,
        clientId: stack.clientId,
        section: 'sessions',
        returnTo,
      })

      // The page itself is served, and refuses to be framed.
      const page = await fetch(url)
      expect(page.status).toBe(200)
      expect(page.headers.get('content-security-policy')).toContain("frame-ancestors 'none'")

      // What the page does with the URL's two parameters, done as the page does it.
      const jar = new Jar()
      await login({ issuer: stack.sandbox.issuer, clientId: stack.clientId, redirectUri: REDIRECT_URI, ...person }, jar)
      const minted = await portalToken(jar, url)
      expect(minted.status).toBe(200)
      const body = (await minted.json()) as { access_token: string; return_to: string | null; client_id: string }
      expect(body.return_to).toBe(returnTo)
      expect(body.client_id).toBe(stack.clientId)

      // And the token the portal was handed works on the API this package wraps.
      const account = new AccountClient({ issuer: stack.sandbox.issuer, accessToken: body.access_token })
      expect((await account.getProfile()).email).toBe(person.email)
      const sessions = await account.listSessions()
      expect(sessions.items.filter((row) => row.current)).toHaveLength(1)
    }, 60_000)

    it('changes the password with the token the application holds', async () => {
      const tokens = await login({
        issuer: stack.sandbox.issuer,
        clientId: stack.clientId,
        redirectUri: REDIRECT_URI,
        scope,
        ...person,
      })
      const claims = await verifyAccessToken(tokens.access_token, {
        issuer: stack.sandbox.issuer,
        audience: stack.clientId,
      })
      expect(claims.scope.split(' ')).toContain('self_service')

      const account = new AccountClient({ issuer: stack.sandbox.issuer, accessToken: tokens.access_token })
      const before = await account
        .changePassword({ currentPassword: person.password, newPassword: 'x' })
        .catch((caught: unknown) => caught)
      expect(before).toBeInstanceOf(ApiError)
      expect((before as ApiError).type).toMatch(/\/reauth-required$/)

      await account.reauthenticate(person.password)
      const next = randomBytes(24).toString('base64url')
      await account.changePassword({ currentPassword: person.password, newPassword: next })

      // The new password is the one that signs in now; the old one is refused.
      await expect(
        login({ issuer: stack.sandbox.issuer, clientId: stack.clientId, redirectUri: REDIRECT_URI, ...person }),
      ).rejects.toThrow()
      person.password = next
      const again = await login({ issuer: stack.sandbox.issuer, clientId: stack.clientId, redirectUri: REDIRECT_URI, ...person })
      expect(again.access_token).toBeTruthy()
    }, 60_000)
  })
})

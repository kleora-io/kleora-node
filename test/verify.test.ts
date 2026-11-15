/**
 * `verifyAccessToken` against a real issuer publishing a real JWKS.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'

import { EnvironmentMismatch, LoginRequired, KleoraError, TokenError } from '../src/errors.js'
import { JwksCache } from '../src/jwks.js'
import { authenticate, verifyAccessToken } from '../src/verify.js'
import { startIssuer, type TestIssuer } from './issuer.js'

let issuer: TestIssuer

const options = () => ({ issuer: issuer.url, audience: 'test-client', jwks: new JwksCache(issuer.url) })

beforeAll(async () => {
  issuer = await startIssuer()
})

afterAll(async () => {
  await issuer.stop()
})

describe('verifyAccessToken', () => {
  it('returns the claims of a token the issuer signed', async () => {
    const token = await issuer.sign(issuer.claims())

    const claims = await verifyAccessToken(token, options())

    expect(claims.iss).toBe(issuer.url)
    expect(claims.sub).toBe('3e419a39-bace-4bd3-97b7-fa245726a6b9')
    expect(claims.aud).toEqual(['test-client'])
    expect(claims.client_id).toBe('test-client')
    expect(claims.env).toBe('production')
    expect(claims.tenant_slug).toBe('acme')
    expect(claims.roles).toEqual(['owner'])
    expect(claims.permissions).toEqual(['invoices:read'])
    expect(claims.amr).toEqual(['pwd'])
    expect(claims.email_verified).toBe(true)
  })

  it('accepts a token whose aud carries the api_audience beside the client id', async () => {
    const token = await issuer.sign(issuer.claims({ aud: ['test-client', 'https://api.example.test'] }))

    const claims = await verifyAccessToken(token, {
      ...options(),
      audience: 'https://api.example.test',
    })

    expect(claims.aud).toEqual(['test-client', 'https://api.example.test'])
  })

  it('refuses a token issued by another issuer', async () => {
    const token = await issuer.sign(issuer.claims({ iss: 'https://elsewhere.example.test' }))

    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'issuer_mismatch',
    })
  })

  it('refuses a token whose aud does not contain the configured audience', async () => {
    const token = await issuer.sign(issuer.claims())

    await expect(
      verifyAccessToken(token, { ...options(), audience: 'https://other.example.test' }),
    ).rejects.toMatchObject({ name: 'TokenError', code: 'audience_mismatch' })
  })

  it('refuses a token past exp plus the clock tolerance', async () => {
    const now = Math.floor(Date.now() / 1000)
    const token = await issuer.sign(issuer.claims({ iat: now - 1000, exp: now - 61 }))

    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'expired',
    })
  })

  it('accepts a token inside the 60 s tolerance, and refuses it with no tolerance', async () => {
    const now = Math.floor(Date.now() / 1000)
    const token = await issuer.sign(issuer.claims({ iat: now - 1000, exp: now - 30 }))

    await expect(verifyAccessToken(token, options())).resolves.toMatchObject({ env: 'production' })
    await expect(
      verifyAccessToken(token, { ...options(), clockTolerance: 0 }),
    ).rejects.toMatchObject({ code: 'expired' })
  })

  it('refuses a token issued further in the future than the tolerance', async () => {
    const now = Math.floor(Date.now() / 1000)
    const token = await issuer.sign(issuer.claims({ iat: now + 3600, exp: now + 4500 }))

    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'expired',
    })
  })

  it('refuses a token naming a kid the issuer does not publish', async () => {
    const stranger = await issuer.publish()
    // Published, then unpublished: the key exists and can sign, but the
    // document the cache will fetch does not list it.
    issuer.keys = issuer.keys.filter((key) => key.kid !== stranger.kid)
    const token = await issuer.sign(issuer.claims(), stranger)

    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'unknown_kid',
    })
  })

  it('refuses a token whose signature does not verify', async () => {
    const other = await issuer.publish()
    // Signed by `other`, but the header names the active key, so the cache
    // resolves a key that cannot have produced this signature.
    const token = await new SignJWT(issuer.claims())
      .setProtectedHeader({ alg: 'ES256', kid: issuer.active.kid, typ: 'at+jwt' })
      .sign(other.privateKey)

    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'invalid_signature',
    })
  })

  describe('the typ header (RFC 9068 §4)', () => {
    // Without this check the only thing separating an access token from an ID
    // token signed by the same key is that `parseClaims` happens to require
    // four claims an ID token happens not to carry — an accident that any
    // additive change to the ID token's claim set would end.
    it.each([
      ['an ID token', 'JWT'],
      ['a DPoP proof', 'dpop+jwt'],
      ['something else entirely', 'application/jwt'],
    ])('refuses %s (typ %s) with invalid_type', async (_name, typ) => {
      const token = await new SignJWT(issuer.claims())
        .setProtectedHeader({ alg: 'ES256', kid: issuer.active.kid, typ })
        .sign(issuer.active.privateKey)

      await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
        name: 'TokenError',
        code: 'invalid_type',
      })
    })

    it('refuses a header with no typ at all', async () => {
      const token = await new SignJWT(issuer.claims())
        .setProtectedHeader({ alg: 'ES256', kid: issuer.active.kid })
        .sign(issuer.active.privateKey)

      await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
        code: 'invalid_type',
      })
    })

    it.each(['at+jwt', 'AT+JWT', 'application/at+jwt', 'application/AT+JWT'])(
      'accepts %s',
      async (typ) => {
        // RFC 9068 §4: both spellings, and the media type is case-insensitive.
        const token = await new SignJWT(issuer.claims())
          .setProtectedHeader({ alg: 'ES256', kid: issuer.active.kid, typ })
          .sign(issuer.active.privateKey)

        await expect(verifyAccessToken(token, options())).resolves.toMatchObject({
          env: 'production',
        })
      },
    )

    it('refuses before it reads a claim, so a hostile payload is never parsed', async () => {
      // Full permissions, wrong `typ`: the answer must still be about the
      // type, not about the claims.
      const token = await new SignJWT(issuer.claims({ permissions: ['*'] }))
        .setProtectedHeader({ alg: 'ES256', kid: 'a-kid-that-does-not-exist', typ: 'JWT' })
        .sign(issuer.active.privateKey)

      await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
        code: 'invalid_type',
      })
    })
  })

  describe('configuration', () => {
    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
      'refuses a clockTolerance of %s as a configuration error',
      async (clockTolerance) => {
        const token = await issuer.sign(issuer.claims())

        await expect(
          verifyAccessToken(token, { ...options(), clockTolerance }),
        ).rejects.toBeInstanceOf(KleoraError)
        await expect(
          verifyAccessToken(token, { ...options(), clockTolerance }),
        ).rejects.not.toBeInstanceOf(TokenError)
      },
    )

    it('forgives a trailing slash on the configured issuer', async () => {
      // The JWKS registry already normalises the same string, and the Python
      // SDK forgives it; the three had to agree.
      const token = await issuer.sign(issuer.claims())

      await expect(
        verifyAccessToken(token, { ...options(), issuer: `${issuer.url}/` }),
      ).resolves.toMatchObject({ iss: issuer.url })
    })

    it('still refuses a genuinely different issuer', async () => {
      const token = await issuer.sign(issuer.claims())

      await expect(
        verifyAccessToken(token, { ...options(), issuer: 'https://elsewhere.example.test' }),
      ).rejects.toMatchObject({ code: 'issuer_mismatch' })
    })

    it('refuses an issuer that is not an absolute URL as a configuration error', async () => {
      const token = await issuer.sign(issuer.claims())

      await expect(
        verifyAccessToken(token, { ...options(), issuer: 'not-a-url' }),
      ).rejects.toBeInstanceOf(KleoraError)
    })
  })

  it('refuses an algorithm that is not ES256 without consulting a key', async () => {
    const token = await new SignJWT(issuer.claims())
      .setProtectedHeader({ alg: 'HS256', kid: issuer.active.kid })
      .sign(new TextEncoder().encode('a shared secret this platform never uses'))

    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'malformed',
    })
  })

  it.each([
    ['not a jwt at all', 'not-a-jwt'],
    ['two segments', 'aGVhZGVy.cGF5bG9hZA'],
    ['an empty string', ''],
  ])('refuses %s as malformed', async (_name, token) => {
    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'malformed',
    })
  })

  it('refuses a token missing a claim the platform always mints', async () => {
    const claims = issuer.claims()
    delete claims['jti']
    const token = await issuer.sign(claims)

    await expect(verifyAccessToken(token, options())).rejects.toMatchObject({
      name: 'TokenError',
      code: 'malformed',
    })
    await expect(verifyAccessToken(token, options())).rejects.toThrow(/jti/)
  })

  it('refuses a sandbox token from a production issuer', async () => {
    const token = await issuer.sign(issuer.claims({ env: 'sandbox' }))

    await expect(verifyAccessToken(token, options())).rejects.toBeInstanceOf(EnvironmentMismatch)
  })

  it('reads aud as a single string, which RFC 7519 allows', async () => {
    const token = await issuer.sign(issuer.claims({ aud: 'test-client' }))

    await expect(verifyAccessToken(token, options())).resolves.toMatchObject({
      aud: ['test-client'],
    })
  })

  it('defaults roles, permissions and amr to empty rather than undefined', async () => {
    const claims = issuer.claims()
    delete claims['roles']
    delete claims['permissions']
    delete claims['amr']
    delete claims['tenant']
    const token = await issuer.sign(claims)

    await expect(verifyAccessToken(token, options())).resolves.toMatchObject({
      roles: [],
      permissions: [],
      amr: [],
    })
  })

  it('keeps claims the SDK does not know about', async () => {
    const token = await issuer.sign(issuer.claims({ permissions_truncated: true }))

    const claims = await verifyAccessToken(token, options())

    expect(claims.permissions_truncated).toBe(true)
  })
})

describe('authenticate', () => {
  it('verifies the bearer token on a request-shaped object', async () => {
    const token = await issuer.sign(issuer.claims())

    const claims = await authenticate({ headers: { authorization: `Bearer ${token}` } }, options())

    expect(claims.sub).toBe('3e419a39-bace-4bd3-97b7-fa245726a6b9')
  })

  it('accepts the scheme in any case, as RFC 7235 requires', async () => {
    const token = await issuer.sign(issuer.claims())

    await expect(
      authenticate({ headers: { authorization: `bearer ${token}` } }, options()),
    ).resolves.toMatchObject({ env: 'production' })
  })

  it.each([
    ['no header', {}],
    ['an empty header', { authorization: '' }],
    ['another scheme', { authorization: 'Basic dXNlcjpwYXNz' }],
    ['a bare token', { authorization: 'abc.def.ghi' }],
  ])('refuses %s with LoginRequired', async (_name, headers) => {
    await expect(authenticate({ headers }, options())).rejects.toBeInstanceOf(LoginRequired)
  })

  it('does not confuse a missing credential with a bad one', async () => {
    await expect(authenticate({ headers: {} }, options())).rejects.not.toBeInstanceOf(TokenError)
  })
})

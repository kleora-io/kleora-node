/**
 * Access-token verification.
 *
 * Everything is local: the signature against the issuer's published keys and
 * every claim against the configuration. `/oauth/userinfo` is never called —
 * a verification that made a network round trip per request would put the
 * issuer in the path of every one of a customer's API calls, and the claims
 * are already in the token.
 */

import { compactVerify, decodeProtectedHeader } from 'jose'

import { classify, parseAbsolute } from './environment.js'
import { EnvironmentMismatch, LoginRequired, KleoraError, TokenError } from './errors.js'
import { jwksFor, type JwksCacheOptions } from './jwks.js'
import type { AuthenticatableRequest, Claims, JwksResolver, VerifyOptions } from './types.js'

/** The clock skew allowed on `exp` and `iat`, in seconds. */
export const CLOCK_TOLERANCE_SECONDS = 60

/** The one algorithm this platform signs with. */
const ALGORITHM = 'ES256'

/**
 * The media type RFC 9068 §2.1 gives an access token, in the two spellings
 * §4 says a resource server must accept.
 *
 * The platform writes `typ: at+jwt` into every access-token header it mints,
 * so checking it costs a correct token nothing.
 * It matters because it is the *only* thing that structurally separates an
 * access token from an ID token signed by the same key. Today an ID token is
 * turned away because `parseClaims` demands `client_id`, `env`, `jti` and
 * `scope`, which an ID token happens not to carry; that is an accident, and
 * adding `jti` to the ID token for replay protection would silently end it.
 */
const ACCESS_TOKEN_TYPES = new Set(['at+jwt', 'application/at+jwt'])

const BEARER = /^Bearer +(?<token>[^\s]+)$/i

/**
 * Verify `token` and return its claims.
 *
 * The order of the checks is deliberate, and it matters for what a caller is
 * told: a token that fails the signature never has its claims reported on,
 * and a token from another issuer is `issuer_mismatch` rather than
 * `audience_mismatch` even though both are wrong.
 */
export async function verifyAccessToken(
  token: string,
  options: VerifyOptions,
): Promise<Claims> {
  const issuer = parseAbsolute('issuer', options.issuer)
  // Compared without a trailing slash, the way `jwksFor` already keys the
  // cache (jwks.ts) and the way the Python SDK compares: "exactly, no trailing
  // slash" describes the *stored* issuer, and a configuration
  // that copied one in should not verify under one SDK and fail under the
  // other. The token's own `iss` is still matched exactly.
  const expectedIssuer = trimTrailingSlash(options.issuer)
  const tolerance = clockTolerance(options)
  const keys = options.jwks ?? resolverFor(options)

  const header = readHeader(token)
  if (header.alg !== ALGORITHM) {
    throw new TokenError(
      'malformed',
      `the token is signed with '${String(header.alg)}'; this issuer signs ${ALGORITHM} only`,
    )
  }
  // Before the key is fetched and long before a claim is read: an ID token or
  // a DPoP proof must not get as far as having its claims inspected.
  const typ = typeof header.typ === 'string' ? header.typ.toLowerCase() : null
  if (typ === null || !ACCESS_TOKEN_TYPES.has(typ)) {
    throw new TokenError(
      'invalid_type',
      `the token header's typ is ${typ === null ? 'absent or not a string' : `'${typ}'`}; ` +
        `an access token is 'at+jwt' (RFC 9068 §2.1)`,
    )
  }
  if (typeof header.kid !== 'string' || header.kid === '') {
    throw new TokenError('malformed', 'the token header names no kid')
  }

  // Resolving the key can itself fail with `unknown_kid`, which is the right
  // verdict: a token naming a key the issuer does not publish is a token this
  // issuer did not sign.
  const key = await keys.get(header.kid)

  let payload: string
  try {
    const verified = await compactVerify(token, key, { algorithms: [ALGORITHM] })
    payload = new TextDecoder().decode(verified.payload)
  } catch (cause) {
    throw new TokenError('invalid_signature', `the token's signature does not verify`, {
      cause,
    })
  }

  const claims = parseClaims(payload)

  if (claims.iss !== expectedIssuer) {
    throw new TokenError(
      'issuer_mismatch',
      `the token's iss is '${claims.iss}', expected '${expectedIssuer}'`,
    )
  }
  if (!claims.aud.includes(options.audience)) {
    throw new TokenError(
      'audience_mismatch',
      `the token's aud ${JSON.stringify(claims.aud)} does not contain '${options.audience}'`,
    )
  }

  const now = Math.floor((options.now?.() ?? Date.now()) / 1000)
  if (now > claims.exp + tolerance) {
    throw new TokenError(
      'expired',
      `the token expired at ${String(claims.exp)}, now ${String(now)} ` +
        `(clock tolerance ${String(tolerance)}s)`,
    )
  }
  if (claims.iat > now + tolerance) {
    throw new TokenError(
      'expired',
      `the token was issued at ${String(claims.iat)}, in the future of ${String(now)} ` +
        `(clock tolerance ${String(tolerance)}s)`,
    )
  }

  const kind = classify(issuer.host)
  if (claims.env !== kind) {
    throw new EnvironmentMismatch(
      `the token's env claim is '${claims.env}' but the issuer '${options.issuer}' is ${kind}`,
    )
  }

  return claims
}

/**
 * Framework-free authentication: read the bearer token off a request-like
 * object and verify it.
 *
 * The parameter is structural — `{ headers: { authorization } }` — so it
 * accepts an express `Request`, a fastify `FastifyRequest`, a Node
 * `IncomingMessage` and a plain object without this package depending on any
 * of them (no framework at runtime).
 */
export async function authenticate(
  request: AuthenticatableRequest,
  options: VerifyOptions,
): Promise<Claims> {
  return verifyAccessToken(bearerOf(request), options)
}

/** The token in `Authorization: Bearer …`, or `LoginRequired`. */
export function bearerOf(request: AuthenticatableRequest): string {
  const header = request.headers.authorization
  if (typeof header !== 'string' || header.trim() === '') {
    throw new LoginRequired('the request carries no Authorization header')
  }
  const token = BEARER.exec(header.trim())?.groups?.['token']
  if (token === undefined) {
    throw new LoginRequired('the Authorization header is not a Bearer credential')
  }
  return token
}

/** The shared cache for this issuer, carrying the caller's `fetch` if any. */
function resolverFor(options: VerifyOptions): JwksResolver {
  const cacheOptions: JwksCacheOptions = {}
  if (options.fetch !== undefined) cacheOptions.fetch = options.fetch
  return jwksFor(options.issuer, cacheOptions)
}

/** Trailing slashes off an issuer, so `https://x/` and `https://x` agree. */
export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

/**
 * The tolerance to apply, refusing a value that would quietly disable a check.
 *
 * A negative number tightens expiry past what the caller can have meant, and
 * `Infinity` accepts a token that expired last year. Both are configuration
 * errors and are reported as such rather than obeyed.
 */
function clockTolerance(options: VerifyOptions): number {
  const value = options.clockTolerance ?? CLOCK_TOLERANCE_SECONDS
  if (!Number.isFinite(value) || value < 0) {
    throw new KleoraError(
      'invalid_configuration',
      `clockTolerance must be a finite number of seconds >= 0, got ${String(value)}`,
    )
  }
  return value
}

/**
 * Refuse a configuration that cannot verify anything, as a configuration
 * error rather than as a failed verification.
 *
 * The middlewares call this when they are *built*, so a service started with
 * `KLEORA_ISSUER` unset fails at boot with a message naming the variable —
 * instead of answering 401 to every request and logging nothing, which looks
 * to an operator like a fleet of bad credentials rather than a missing
 * environment variable.
 */
export function assertVerifyOptions(options: VerifyOptions): void {
  parseAbsolute('issuer', options.issuer)
  if (typeof options.audience !== 'string' || options.audience === '') {
    throw new KleoraError(
      'invalid_configuration',
      'audience must be a non-empty string: the environment\'s api_audience, ' +
        'or the client id when it declares none',
    )
  }
  clockTolerance(options)
}

function readHeader(token: string): { alg?: unknown; kid?: unknown; typ?: unknown } {
  try {
    return decodeProtectedHeader(token)
  } catch (cause) {
    throw new TokenError('malformed', 'the token is not a compact JWS', { cause })
  }
}

/** The payload as `Claims`, refusing anything the platform always mints. */
function parseClaims(payload: string): Claims {
  let document: unknown
  try {
    document = JSON.parse(payload)
  } catch (cause) {
    throw new TokenError('malformed', 'the token payload is not JSON', { cause })
  }
  if (typeof document !== 'object' || document === null || Array.isArray(document)) {
    throw new TokenError('malformed', 'the token payload is not a JSON object')
  }
  const claims = document as Record<string, unknown>

  // `aud` is an array on this platform and always has been, but RFC 7519 allows the single
  // string, and a verifier that refused it would fail on a token no other
  // verifier objects to.
  const audience = claims['aud']
  const aud =
    typeof audience === 'string'
      ? [audience]
      : Array.isArray(audience) && audience.every((entry) => typeof entry === 'string')
        ? audience
        : null

  const required = {
    iss: string(claims['iss']),
    sub: string(claims['sub']),
    jti: string(claims['jti']),
    client_id: string(claims['client_id']),
    scope: string(claims['scope']),
    exp: integer(claims['exp']),
    iat: integer(claims['iat']),
  }
  const env = claims['env']
  const missing = Object.entries(required)
    .filter(([, value]) => value === null)
    .map(([name]) => name)
  if (aud === null) missing.push('aud')
  if (env !== 'sandbox' && env !== 'production') missing.push('env')
  if (missing.length > 0) {
    throw new TokenError(
      'malformed',
      `the token is missing or misdeclares: ${missing.sort().join(', ')}`,
    )
  }

  return {
    ...claims,
    iss: required.iss as string,
    sub: required.sub as string,
    aud: aud as string[],
    exp: required.exp as number,
    iat: required.iat as number,
    jti: required.jti as string,
    client_id: required.client_id as string,
    scope: required.scope as string,
    env: env as Claims['env'],
    roles: stringList(claims['roles']),
    permissions: stringList(claims['permissions']),
    amr: stringList(claims['amr']),
  }
}

const string = (value: unknown): string | null => (typeof value === 'string' ? value : null)

const integer = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

/** `[]` for an absent list: `roles` and `permissions` are never absent in
 * practice, and a caller checking membership should not have to test for it. */
const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []

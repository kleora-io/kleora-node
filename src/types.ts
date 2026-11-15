/**
 * The public types of `@kleora-io/node`.
 */

import type { importJWK } from 'jose'

import type { EnvironmentKind } from './environment.js'

/**
 * A key `verifyAccessToken` can check a signature with.
 *
 * Spelled as what `jose` hands back rather than as `CryptoKey`: the global
 * `CryptoKey` is a value in `@types/node` and not a type, and naming the
 * library's own return type keeps this correct across a `jose` upgrade.
 */
export type VerificationKey = Awaited<ReturnType<typeof importJWK>>

/**
 * An access token's claims.
 *
 * Optional members are optional on the wire too: `tenant` and `tenant_slug`
 * are absent when the session has no tenant, `email` and `email_verified`
 * only when `scope` contains `email`, and `permissions_truncated` only when
 * the union exceeded 200 entries. `roles` and `permissions` are always
 * present — `[]` when there is no tenant — so an authorisation check never
 * has to test for absence before it tests for membership.
 */
export interface Claims {
  iss: string
  sub: string
  aud: string[]
  exp: number
  iat: number
  jti: string
  client_id: string
  scope: string
  env: EnvironmentKind
  tenant?: string
  tenant_slug?: string
  roles: string[]
  permissions: string[]
  permissions_truncated?: boolean
  email?: string
  email_verified?: boolean
  amr: string[]
  /**
   * Anything the environment adds later. The claim set is the server's to
   * grow (new fields are additive), and a
   * client that dropped unknown members would have to be republished for
   * each one.
   */
  [claim: string]: unknown
}

/** What `verifyAccessToken` needs to know. */
export interface VerifyOptions {
  /**
   * The issuer, compared to `iss` by exact string equality.
   */
  issuer: string
  /**
   * The value `aud` must contain: the environment's `api_audience`, or the
   * `client_id` when it declares none. At least one of the two has to be
   * configured, which is why this is required rather than optional.
   */
  audience: string
  /** Allowed clock skew in seconds. Default 60. */
  clockTolerance?: number
  /**
   * The cache to resolve keys through. One is created per issuer and reused
   * when this is omitted, which is what makes repeated verification cheap.
   */
  jwks?: JwksResolver
  /** `fetch`, for tests and for a caller with its own agent. */
  fetch?: typeof globalThis.fetch
  /**
   * The clock, in milliseconds. Injectable for the same reason `JwksCache`'s
   * is: a suite cannot wait fifteen minutes to watch a real token expire, and
   * a clock seam is a smaller and more honest fake than a token minted to
   * look expired.
   */
  now?: () => number
}

/** What the verifier needs from a JWKS cache. */
export interface JwksResolver {
  /** The key for `kid`, refetching within the cache's own rules. */
  get(kid: string): Promise<VerificationKey>
}

/** A request object with just enough shape for `authenticate` to read. */
export interface AuthenticatableRequest {
  headers: {
    authorization?: string | undefined
    [name: string]: unknown
  }
}

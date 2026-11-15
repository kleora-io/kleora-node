/**
 * The error hierarchy every Kleora SDK shares.
 *
 * The same shapes `@kleora-io/browser` exports, because an application
 * that uses both packages should be able to branch on one taxonomy: a
 * `KleoraError` base carrying a machine-readable `code`, `TokenError` with
 * six shared token codes, `EnvironmentMismatch` for a sandbox
 * credential pointed at production, and `ApiError` for an RFC 9457 problem
 * document. Messages are English and written for developers.
 *
 * They are declared here rather than imported from the browser package on
 * purpose: `instanceof` is the way an application tells these apart, and two
 * copies of one class in a dependency graph make `instanceof` lie. The two
 * packages are installed independently and neither depends on the other, so a
 * shared class would be exactly that hazard.
 */

/** Base class for everything this package throws. */
export class KleoraError extends Error {
  readonly code: string

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'KleoraError'
    this.code = code
  }
}

/**
 * Codes for a token that cannot be trusted.
 *
 * Unlike the browser SDK, this package does verify signatures, so every one
 * of the six shared codes can be raised here. Two more are added, and neither
 * is an invention of convenience:
 *
 * - `invalid_type` — the JWS header's `typ` is not `at+jwt`. RFC 9068 §4
 *   requires a resource server to check it, and the platform writes it into
 *   every header it mints. Without a code
 *   of its own an ID token presented as an access token would report as
 *   `malformed`, which reads as "not a JWT" and is not what happened.
 * - `issuer_unavailable` — the JWKS endpoint could not be read at all
 *   (refused, timed out, non-2xx, unparseable). Folding this into
 *   `unknown_kid` would force a middleware to answer 401 for an
 *   outage: every caller is then told its token is bad and re-authenticates
 *   against the issuer that is already down. A distinct code is what lets
 *   the middleware answer 503 instead.
 */
export type TokenErrorCode =
  | 'expired'
  | 'invalid_signature'
  | 'invalid_type'
  | 'issuer_mismatch'
  | 'audience_mismatch'
  | 'unknown_kid'
  | 'issuer_unavailable'
  | 'malformed'

/** A token failed verification. */
export class TokenError extends KleoraError {
  declare readonly code: TokenErrorCode

  constructor(code: TokenErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options)
    this.name = 'TokenError'
  }
}

/**
 * No credential was presented at all.
 *
 * The middlewares answer this with a 401 the same way they answer a
 * `TokenError`, but the two are distinct facts and an application that logs
 * them wants to tell "no `Authorization` header" from "a token that did not
 * verify".
 */
export class LoginRequired extends KleoraError {
  constructor(message: string) {
    super('login_required', message)
    this.name = 'LoginRequired'
  }
}

/**
 * A sandbox credential was mixed with production configuration or the
 * reverse. Thrown before any request
 * carrying the credential is sent.
 */
export class EnvironmentMismatch extends KleoraError {
  constructor(message: string) {
    super('environment_mismatch', message)
    this.name = 'EnvironmentMismatch'
  }
}

/**
 * What `ApiError`'s four fields have no room for, carried alongside them.
 *
 * The same shape `@kleora-io/nuxt` attaches under `problem`, so code that handles one handles the
 * other: the document as it arrived — extension members such as `request_id`
 * and `title` included — plus the two headers a caller cannot recover once
 * the response is gone.
 */
export interface ProblemDetails {
  /** The RFC 9457 document as it arrived, extension members included. */
  document: Record<string, unknown>
  /** `Retry-After` in seconds, falling back to the document's `retry_after`. */
  retryAfter: number | null
  /** `Idempotency-Replayed`: `true`, `unavailable`, or absent. */
  idempotencyReplayed: string | null
}

/**
 * An RFC 9457 problem document from the management API.
 *
 * `type` is the slug a caller branches on — the management API's documented set is
 * the whole set, so a client can name an error before its
 * endpoint exists.
 */
export class ApiError extends KleoraError {
  readonly type: string
  readonly status: number
  readonly detail: string | undefined
  readonly errors: unknown[] | undefined
  readonly problem: ProblemDetails
  /**
   * The correlation id of the response that failed.
   *
   * The one field a support conversation needs: it is what ties the error a
   * customer pasted to the request in our logs. Read from the document's
   * `request_id` first and from the `X-Request-Id` response header otherwise,
   * because the header is all there is when the body is not a problem document
   * — an intermediary's HTML 502 — or when the deployment answering predates
   * the member. `undefined` only when neither carried one.
   */
  readonly requestId: string | undefined

  constructor(
    type: string,
    status: number,
    detail: string | undefined,
    errors: unknown[] | undefined,
    problem: ProblemDetails,
    requestId?: string,
  ) {
    super('api_error', detail ?? type)
    this.name = 'ApiError'
    this.type = type
    this.status = status
    this.detail = detail
    this.errors = errors
    this.problem = problem
    this.requestId = requestId
  }
}

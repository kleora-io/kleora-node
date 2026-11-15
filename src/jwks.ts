/**
 * The JWKS cache.
 *
 * Three rules, and they exist for three different reasons:
 *
 * - **TTL from the document.** The issuer publishes `Cache-Control:
 *   max-age=300` on `/.well-known/jwks.json`, and honouring
 *   the header rather than a constant means a deployment that shortens the
 *   window does not need every SDK republished to be obeyed.
 * - **A 60 s refetch floor.** An unknown `kid` is the only thing that forces
 *   a fetch outside the TTL, and it arrives from whoever sends the token. A
 *   floor is what stops a stream of forged `kid`s from turning one verifier
 *   into a load generator against its own issuer.
 * - **Stale serving to 2 × TTL.** A JWKS endpoint that is briefly down must
 *   not take every API of every customer down with it. Past 2 × TTL the keys
 *   are old enough that a rotation could have completed unseen, so the cache
 *   fails closed instead.
 * - **A 5 s timeout on every fetch.** Matching the Python SDK's
 *   `DEFAULT_TIMEOUT`. Without one the only bound is undici's 300 s header
 *   timeout, and because a refresh is coalesced every verification arriving
 *   during that window awaits the *same* hung promise — one blackholed issuer
 *   would hold every request slot in a customer's API for five minutes.
 * - **A `User-Agent` on the request.** `kleora-node/{version}`, the
 *   same value the management client sends and the same shape every other SDK
 *   sends. It is the only thing that lets an
 *   operator reading an issuer's access log tell an SDK's key fetch from a
 *   scraper, which is the first question asked about traffic nobody can
 *   account for. A rule one SDK ignores is not a rule.
 * - **Every failure becomes a `TokenError`.** A refused connection, a
 *   timeout, a non-2xx and a body that is not a JWK Set all leave here as
 *   `issuer_unavailable`, never as a raw `TypeError` or `SyntaxError`. A
 *   caller that catches the taxonomy has to be able to catch an outage, and a
 *   middleware has to be able to tell an outage from a bad token.
 */

import { importJWK, type JWK } from 'jose'

import { TokenError } from './errors.js'
import type { VerificationKey } from './types.js'
import { USER_AGENT } from './version.js'

/** The document's default lifetime when it names none, in seconds. */
export const DEFAULT_TTL_SECONDS = 300

/** The shortest interval between two fetches of one issuer's keys, in seconds. */
export const MIN_REFETCH_SECONDS = 60

/** How many multiples of the TTL a stale set may still answer for. */
export const STALE_MULTIPLIER = 2

/** How long one JWKS request may take, in milliseconds (Python: 5.0 s). */
export const DEFAULT_TIMEOUT_MS = 5_000

/**
 * A clock that no wall-clock correction can move backwards.
 *
 * Every number this cache compares is an *interval* — the age of the set, the
 * distance to the last attempt — and `Date.now` is the wrong source for those:
 * an NTP step backwards makes `now() - lastAttempt` negative, so the refetch
 * floor stays shut for the length of the step and a genuinely rotated `kid`
 * cannot be fetched; a step forward expires the set early. The Python SDK uses
 * `time.monotonic` for exactly this reason.
 */
const monotonic = (): number => performance.now()

export interface JwksCacheOptions {
  /** `fetch`, for tests and for a caller with its own agent. */
  fetch?: typeof globalThis.fetch
  /**
   * The clock, in milliseconds, monotonic by default. Injectable so that the
   * tests can walk past the 60 s floor and the 2 × TTL stale window without
   * sleeping through them; nothing else has a reason to pass it.
   */
  now?: () => number
  /** Overrides the TTL the document asks for. Seconds. */
  ttl?: number
  /** Overrides the refetch floor. Seconds. */
  minRefetchInterval?: number
  /** How long one request may take, in milliseconds. Default 5000. */
  timeout?: number
}

interface KeySet {
  keys: Map<string, JWK>
  /** When the set arrived. */
  at: number
  /** The lifetime the document asked for, in milliseconds. */
  ttl: number
}

/** One issuer's published keys, cached under the rules above. */
export class JwksCache {
  readonly url: string

  private readonly doFetch: typeof globalThis.fetch
  private readonly now: () => number
  private readonly ttlOverride: number | undefined
  private readonly floor: number
  private readonly timeout: number

  private set: KeySet | null = null
  /** When a fetch was last *attempted*, successful or not. */
  private lastAttempt: number | null = null
  /** When a fetch last failed, or `null` if the last one succeeded. */
  private lastFailure: number | null = null
  /** Why it last failed, so `get` can report the outage rather than guess. */
  private lastError: TokenError | null = null
  /** In-flight fetch, so concurrent verifications share one request. */
  private inFlight: Promise<void> | null = null
  private imported = new Map<string, VerificationKey>()

  /** Fetches performed, for the tests that count them. */
  fetches = 0

  constructor(issuer: string, options: JwksCacheOptions = {}) {
    this.url = new URL('/.well-known/jwks.json', issuer).href
    this.doFetch = options.fetch ?? globalThis.fetch
    this.now = options.now ?? monotonic
    this.ttlOverride = options.ttl === undefined ? undefined : options.ttl * 1000
    this.floor = (options.minRefetchInterval ?? MIN_REFETCH_SECONDS) * 1000
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT_MS
  }

  /**
   * The key `kid` names, refetching within the rules above.
   *
   * Throws `TokenError('unknown_kid')` when the issuer does not publish it —
   * which is also the answer when the endpoint is unreachable and the cached
   * set is past 2 × TTL, because at that point the SDK cannot tell an
   * unpublished key from an unfetchable one and must fail closed.
   */
  async get(kid: string): Promise<VerificationKey> {
    if (this.set === null) {
      // Nothing cached: a failure here is the caller's failure. There is no
      // stale set to fall back to and no key to answer with.
      await this.refresh()
    } else if (this.age() >= this.set.ttl && this.mayRetry()) {
      await this.refreshQuietly()
    }

    if (this.lookup(kid) === undefined && this.mayRefetch()) {
      await this.refreshQuietly()
    }

    const jwk = this.lookup(kid)
    if (jwk === undefined) {
      // Two different facts, and a middleware answers them with two different
      // statuses. "The document does not list this key" is a bad token (401);
      // "there is no document I am allowed to trust" is the issuer being
      // unreachable (503). The cached set is the discriminator: while it is
      // usable — inside 2 × TTL — its contents are an answer, and past that it
      // is not, so whatever went wrong reaching the endpoint is the answer.
      if (!this.usable()) {
        throw (
          this.lastError ??
          new TokenError('issuer_unavailable', `${this.url} could not be read`)
        )
      }
      throw new TokenError(
        'unknown_kid',
        `the issuer at ${this.url} publishes no key with kid '${kid}'`,
      )
    }

    const cached = this.imported.get(kid)
    if (cached !== undefined) return cached
    const key = await importJWK(jwk, 'ES256')
    this.imported.set(kid, key)
    return key
  }

  /** Whether the cached set may still answer at all. */
  private usable(): boolean {
    return this.set !== null && this.age() < this.set.ttl * STALE_MULTIPLIER
  }

  private lookup(kid: string): JWK | undefined {
    return this.usable() ? this.set?.keys.get(kid) : undefined
  }

  private age(): number {
    return this.set === null ? Number.POSITIVE_INFINITY : this.now() - this.set.at
  }

  /**
   * Whether an unknown `kid` may force a fetch.
   *
   * The floor counts from the last *attempt*, not the last success: an issuer
   * that is answering 500 would otherwise be refetched on every token, and
   * the whole point of the floor is that whoever sends the token does not get
   * to decide how often this process calls its issuer.
   */
  private mayRefetch(): boolean {
    return this.lastAttempt === null || this.now() - this.lastAttempt >= this.floor
  }

  /**
   * Whether an expired TTL may be refreshed.
   *
   * The document's `max-age` is the issuer's own instruction and is obeyed as
   * given, floor or no floor — a deployment that publishes `max-age=30` means
   * thirty seconds. What is throttled is *retrying a failure*: an endpoint
   * that is down would otherwise be asked once per verification for as long
   * as the stale window lasts.
   */
  private mayRetry(): boolean {
    return this.lastFailure === null || this.now() - this.lastFailure >= this.floor
  }

  /** Refresh, tolerating a failure. The callers decide whether to try. */
  private async refreshQuietly(): Promise<void> {
    try {
      await this.refresh()
    } catch {
      // Deliberately swallowed: `usable()` decides whether the stale set may
      // still answer, and `get` raises `unknown_kid` when it may not. The
      // caller of a verification wants the token's verdict, not the JWKS
      // endpoint's HTTP status.
    }
  }

  private async refresh(): Promise<void> {
    // One request even when twenty requests arrive at once with the same
    // rotated `kid`; without this the floor would be the only thing between
    // a cold start and a thundering herd.
    this.inFlight ??= this.fetchKeys().finally(() => {
      this.inFlight = null
    })
    await this.inFlight
  }

  private async fetchKeys(): Promise<void> {
    this.lastAttempt = this.now()
    this.lastFailure = this.lastAttempt
    this.fetches += 1
    try {
      const response = await this.doFetch(this.url, {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
        // Bounded here rather than left to the runtime: undici's default is
        // 300 s, and a coalesced refresh makes that every concurrent
        // verification's wait, not just the first one's.
        signal: AbortSignal.timeout(this.timeout),
      })
      if (!response.ok) {
        throw new TokenError(
          'issuer_unavailable',
          `${this.url} answered ${String(response.status)}`,
        )
      }
      const document: unknown = await response.json()
      const keys = new Map<string, JWK>()
      if (typeof document === 'object' && document !== null) {
        const listed = (document as { keys?: unknown }).keys
        if (Array.isArray(listed)) {
          for (const entry of listed as JWK[]) {
            if (typeof entry.kid === 'string') keys.set(entry.kid, entry)
          }
        }
      }
      if (keys.size === 0) {
        throw new TokenError('issuer_unavailable', `${this.url} published no usable key`)
      }
      this.set = { keys, at: this.now(), ttl: this.ttlOverride ?? maxAge(response) }
      this.lastFailure = null
      this.lastError = null
      // A rotation can retire a `kid` this cache has already imported, and a
      // retired key must stop answering when it leaves the document.
      for (const kid of [...this.imported.keys()]) {
        if (!keys.has(kid)) this.imported.delete(kid)
      }
    } catch (cause) {
      // Everything: a refused connection and a timeout arrive as `TypeError`
      // and `DOMException`, an unparseable body as `SyntaxError`, and none of
      // those is in the taxonomy a caller catches. They leave as one code.
      const error =
        cause instanceof TokenError
          ? cause
          : new TokenError('issuer_unavailable', `${this.url} could not be read: ${reason(cause)}`, {
              cause,
            })
      this.lastError = error
      throw error
    }
  }
}

/**
 * The document's own lifetime, in milliseconds.
 *
 * `max-age` from `Cache-Control`, ignoring a `no-store`/`no-cache` document
 * by falling back to the default rather than refetching per token — the floor
 * would throttle that anyway, and a JWKS marked uncacheable is a
 * misconfiguration, not an instruction worth obeying at that cost.
 */
function maxAge(response: Response): number {
  const header = response.headers.get('cache-control')
  const match = header === null ? null : /(?:^|[\s,])max-age\s*=\s*(\d+)/i.exec(header)
  const seconds = match?.[1] === undefined ? Number.NaN : Number(match[1])
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_TTL_SECONDS) * 1000
}

/** A short, safe description of whatever `fetch` threw. */
function reason(cause: unknown): string {
  if (cause instanceof Error) {
    // `AbortSignal.timeout` rejects with a `TimeoutError` DOMException, whose
    // message is the unhelpful "The operation was aborted"; name it properly.
    return cause.name === 'TimeoutError' ? 'the request timed out' : cause.message
  }
  return 'unknown error'
}

/**
 * The process-wide cache, one per issuer, keyed by
 * `{issuer}/.well-known/jwks.json`.
 *
 * `verifyAccessToken` reaches for this when the caller passes no cache, which
 * is what makes the common case — a middleware verifying every request —
 * fetch once every five minutes rather than once per request.
 */
const caches = new Map<string, JwksCache>()

/**
 * The shared cache for `issuer`, created on first use.
 *
 * **Only the first call's `options` apply.** A later call for the same issuer
 * gets the cache that already exists, configured the way the first caller
 * configured it — merging them would mean one caller's 5 s timeout silently
 * became another's, which is worse than a documented first-writer-wins. A
 * caller that needs its own settings should construct a `JwksCache` directly
 * and pass it as `VerifyOptions.jwks`.
 */
export function jwksFor(issuer: string, options: JwksCacheOptions = {}): JwksCache {
  const url = new URL('/.well-known/jwks.json', issuer).href
  let cache = caches.get(url)
  if (cache === undefined) {
    cache = new JwksCache(issuer, options)
    caches.set(url, cache)
  }
  return cache
}

/** Forget every shared cache. For tests, and for a long-lived process's tests. */
export function clearJwksCaches(): void {
  caches.clear()
}

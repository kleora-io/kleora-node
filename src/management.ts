/**
 * The management client: a thin typed `fetch` wrapper over the generated
 * paths that adds auth, problem parsing and the environment guard.
 *
 * `./generated/management.ts` is the only description of what the surface
 * looks like — every path, every body, every response envelope. Nothing here
 * restates a schema, and nothing here is a hand-written method per endpoint:
 * a method per endpoint is a second copy of the document that goes stale
 * silently, and the CI diff that guards the generated tree cannot see it.
 * What is left is the part a generator cannot know — the credential, the
 * error shape and the environment guard.
 */

import type { paths } from './generated/management.js'
import {
  assertKeyMatches,
  classify,
  classifyKey,
  parseAbsolute,
  redactKey,
  type EnvironmentKind,
} from './environment.js'
import { ApiError, EnvironmentMismatch, KleoraError, type ProblemDetails } from './errors.js'
import { USER_AGENT } from './version.js'

/** Where the management API lives. */
export const DEFAULT_BASE_URL = 'https://api.kleora.io'

/** The prefix every generated path already carries. */
const PREFIX = '/api/v1'

/** How long one management request may take, in ms (Python: 10.0 s). */
export const DEFAULT_TIMEOUT_MS = 10_000

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

/** The paths this document declares an `M` operation for. */
export type PathsWith<M extends HttpMethod> = {
  [P in keyof paths]: undefined extends paths[P][M] ? never : P
}[keyof paths]

type Op<P extends keyof paths, M extends HttpMethod> = paths[P][M]

type PathParamsOf<O> = O extends { parameters: { path: infer T } } ? T : never
type QueryOf<O> = O extends { parameters: { query?: infer T } } ? NonNullable<T> : never
type BodyOf<O> = O extends { requestBody: { content: { 'application/json': infer T } } }
  ? T
  : O extends { requestBody?: { content: { 'application/json': infer T } } }
    ? T | undefined
    : never

/**
 * What a 2xx answers with.
 *
 * `204` is `void`: the delete and revoke endpoints answer with no body at
 * all, and typing them `unknown` would push every caller into a check that
 * can only ever fail.
 */
type SuccessOf<O> = O extends { responses: infer R }
  ? R extends { 200: { content: { 'application/json': infer T } } }
    ? T
    : R extends { 201: { content: { 'application/json': infer T } } }
      ? T
      : R extends { 204: unknown }
        ? void
        : unknown
  : unknown

/** Per-request options that are not part of the document. */
export interface CallOptions {
  /**
   * Forwarded as `X-Request-Id`. The server generates one
   * when absent, so this is for a caller that already has a correlation id of
   * its own.
   */
  requestId?: string
  /** `Idempotency-Key` for a `POST`. */
  idempotencyKey?: string
  signal?: AbortSignal
}

type Args<O> = CallOptions &
  ([PathParamsOf<O>] extends [never] ? unknown : { path: PathParamsOf<O> }) &
  ([QueryOf<O>] extends [never] ? unknown : { query?: QueryOf<O> }) &
  ([BodyOf<O>] extends [never]
    ? unknown
    : undefined extends BodyOf<O>
      ? { body?: BodyOf<O> }
      : { body: BodyOf<O> })

/** `args` is optional exactly when nothing in it is required. */
type ArgsTuple<O> = Record<never, never> extends Args<O> ? [args?: Args<O>] : [args: Args<O>]

export interface ManagementClientOptions {
  /** `kl_live_…` or `kl_test_…`. Never logged. */
  apiKey: string
  /**
   * The API's origin. A value ending in `/api/v1` is accepted and trimmed,
   * because that is how `NUXT_PUBLIC_API_BASE` spells it and a caller reading
   * one environment variable should not have to know that the generated paths
   * carry the prefix themselves.
   */
  baseUrl?: string
  /**
   * The issuer this key is expected to belong to. Optional, and worth
   * setting: it is what turns a copy-pasted production key in a sandbox
   * deployment into an `EnvironmentMismatch` instead of a successful write to
   * the wrong environment.
   */
  issuer?: string
  fetch?: typeof globalThis.fetch
  /**
   * How long one request may take, in milliseconds. Default 10 000, matching
   * the Python SDK. It bounds the guard's `GET /me` too — and that one matters
   * most, because every method awaits the guard, so one hung `/me` would
   * otherwise block every call this client will ever make.
   */
  timeout?: number
}

/** The environment `GET /me` reports for an API key. */
export interface KeyEnvironment {
  id: string
  kind: EnvironmentKind
  issuer: string
  app?: { id: string; slug: string }
}

/**
 * A typed `fetch` over the management API.
 *
 * ```ts
 * const client = new ManagementClient({ apiKey, issuer: 'https://acme-sandbox.kleora.eu' })
 * const apps = await client.get('/api/v1/apps', { query: { limit: 10 } })
 * ```
 */
export class ManagementClient {
  readonly baseUrl: string
  readonly issuer: string | null

  readonly #apiKey: string
  readonly #fetch: typeof globalThis.fetch
  readonly #timeout: number
  /** The guard, run at most once; a rejection is remembered and re-thrown. */
  #guard: Promise<void> | null = null
  #environment: KeyEnvironment | null = null

  constructor(options: ManagementClientOptions) {
    if (classifyKey(options.apiKey) === null) {
      throw new KleoraError(
        'invalid_configuration',
        `apiKey must start with 'kl_live_' or 'kl_test_'`,
      )
    }
    this.#apiKey = options.apiKey
    this.#fetch = options.fetch ?? globalThis.fetch
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT_MS
    // Validated for the same reason `issuer` is: a base without a scheme
    // would otherwise surface as a raw `TypeError` from `new URL` on the
    // first call, and `http://` would ship the API key in clear with no
    // complaint at all. Both are configuration errors and belong here.
    this.baseUrl = normaliseBase(parseAbsolute('baseUrl', options.baseUrl ?? DEFAULT_BASE_URL).href)
    this.issuer = options.issuer === undefined ? null : trimSlash(options.issuer)
    if (options.issuer !== undefined) {
      // Parsed for its side effect too: a malformed issuer must be a
      // configuration error now, not a confusing comparison failure inside the
      // guard.
      const parsed = parseAbsolute('issuer', options.issuer)
      // The environment guard: `EnvironmentMismatch` is
      // raised at construction when `issuer` is configured, because the key
      // prefix can be checked against it with no network call at all — so the
      // object a `kl_test_` key aimed at production would produce never exists,
      // and there is no window in which something holds it and has not called
      // anything yet. `kleora` (Python) draws the line in the
      // same place; without an `issuer` there is nothing local to compare against
      // and the guard still defers to the first call's `GET /me`.
      assertKeyMatches(
        options.apiKey,
        classify(parsed.host),
        `the configured issuer '${this.issuer}'`,
      )
    }
  }

  /** The key's environment, once the guard has read it. `null` before that. */
  get environment(): KeyEnvironment | null {
    return this.#environment
  }

  get<P extends PathsWith<'get'>>(
    path: P,
    ...args: ArgsTuple<Op<P, 'get'>>
  ): Promise<SuccessOf<Op<P, 'get'>>> {
    return this.#call('GET', path, args[0])
  }

  post<P extends PathsWith<'post'>>(
    path: P,
    ...args: ArgsTuple<Op<P, 'post'>>
  ): Promise<SuccessOf<Op<P, 'post'>>> {
    return this.#call('POST', path, args[0])
  }

  put<P extends PathsWith<'put'>>(
    path: P,
    ...args: ArgsTuple<Op<P, 'put'>>
  ): Promise<SuccessOf<Op<P, 'put'>>> {
    return this.#call('PUT', path, args[0])
  }

  patch<P extends PathsWith<'patch'>>(
    path: P,
    ...args: ArgsTuple<Op<P, 'patch'>>
  ): Promise<SuccessOf<Op<P, 'patch'>>> {
    return this.#call('PATCH', path, args[0])
  }

  delete<P extends PathsWith<'delete'>>(
    path: P,
    ...args: ArgsTuple<Op<P, 'delete'>>
  ): Promise<SuccessOf<Op<P, 'delete'>>> {
    return this.#call('DELETE', path, args[0])
  }

  /** The prefix, and nothing else. The key itself never leaves this object. */
  toString(): string {
    return `ManagementClient(${redactKey(this.#apiKey)} @ ${this.baseUrl})`
  }

  toJSON(): Record<string, unknown> {
    return { apiKey: redactKey(this.#apiKey), baseUrl: this.baseUrl, issuer: this.issuer }
  }

  /** `console.log(client)` and `util.inspect` see the same redaction. */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString()
  }

  async #call<T>(method: string, path: string, args: RawArgs | undefined): Promise<T> {
    await this.#ensureGuarded(args)
    return this.#send<T>(method, path, args)
  }

  /**
   * The environment guard.
   *
   * The remote half. The local half — key prefix against the configured issuer
   * — already ran in the constructor, which is what "no request with the key is
   * sent" means for a sandbox key aimed at production. This is
   * one `GET /me`, and it is the authority: the prefix says which *kind* of
   * environment the key belongs to, and only the server says which environment
   * that is.
   */
  #ensureGuarded(args: RawArgs | undefined): Promise<void> {
    this.#guard ??= this.#runGuard(args).catch((error: unknown) => {
      // Only a mismatch is remembered. A mismatch is a fact about the
      // configuration and will not fix itself, so re-deriving it on every call
      // would be a pointless `GET /me` per call. Anything else — a 503, a
      // dropped connection, a timeout — is a moment, and remembering the
      // rejected promise would let one bad second at start-up poison the
      // client for the life of the process. The Python SDK draws the line in
      // the same place.
      if (!(error instanceof EnvironmentMismatch)) this.#guard = null
      throw error
    })
    return this.#guard
  }

  async #runGuard(args: RawArgs | undefined): Promise<void> {
    // The caller's correlation id travels with the request made on its
    // behalf: the guard's `GET /me` is part of the call that triggered it, and
    // is the request most likely to be the one an operator is looking for.
    const me = await this.#send<{ environment?: KeyEnvironment | null }>(
      'GET',
      `${PREFIX}/me`,
      args?.requestId === undefined ? {} : { requestId: args.requestId },
    )
    const environment = me.environment ?? null
    if (environment === null) {
      // Only an `api_key` principal has an environment, and this client only
      // ever holds an API key — so this is a surface that answered something
      // this client cannot check rather than a configuration to accept.
      throw new EnvironmentMismatch(
        `GET ${PREFIX}/me reported no environment for ${redactKey(this.#apiKey)}`,
      )
    }

    assertKeyMatches(this.#apiKey, environment.kind, `its environment '${environment.issuer}'`)
    if (this.issuer !== null && trimSlash(environment.issuer) !== this.issuer) {
      throw new EnvironmentMismatch(
        `the key belongs to '${environment.issuer}' but the client was configured ` +
          `with issuer '${this.issuer}'`,
      )
    }
    this.#environment = environment
  }

  async #send<T>(method: string, path: string, args: RawArgs | undefined): Promise<T> {
    const url = new URL(this.baseUrl + expand(path, args?.path))
    for (const [name, value] of queryEntries(args?.query)) url.searchParams.append(name, value)

    const headers: Record<string, string> = {
      Accept: 'application/json, application/problem+json',
      Authorization: `Bearer ${this.#apiKey}`,
      'User-Agent': USER_AGENT,
    }
    if (args?.requestId !== undefined) headers['X-Request-Id'] = args.requestId
    if (args?.idempotencyKey !== undefined) headers['Idempotency-Key'] = args.idempotencyKey
    if (args?.body !== undefined) headers['Content-Type'] = 'application/json'

    const response = await this.#fetch(url, {
      method,
      headers,
      ...(args?.body === undefined ? {} : { body: JSON.stringify(args.body) }),
      signal: deadline(this.#timeout, args?.signal),
    })

    if (!response.ok) throw await toApiError(response)
    if (response.status === 204) return undefined as T
    const text = await response.text()
    return (text === '' ? undefined : JSON.parse(text)) as T
  }
}

interface RawArgs extends CallOptions {
  path?: Record<string, string>
  query?: Record<string, unknown>
  body?: unknown
}

/** `https://api.example/api/v1/` and `https://api.example` mean the same thing. */
function normaliseBase(value: string): string {
  const trimmed = trimSlash(value)
  return trimmed.endsWith(PREFIX) ? trimmed.slice(0, -PREFIX.length) : trimmed
}

const trimSlash = (value: string): string => value.replace(/\/+$/, '')

/**
 * The caller's own cancellation, if any, and the client's timeout.
 *
 * `AbortSignal.any` rather than replacing one with the other: a caller that
 * passed a `signal` still wants its own cancellation to work, and a caller
 * that passed none still gets a bound.
 */
function deadline(timeout: number, signal: AbortSignal | undefined): AbortSignal {
  const own = AbortSignal.timeout(timeout)
  return signal === undefined ? own : AbortSignal.any([signal, own])
}

/** Substitute `{name}` with the caller's path parameters. */
function expand(path: string, params: Record<string, string> | undefined): string {
  return path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = params?.[name]
    if (value === undefined || value === null) {
      throw new KleoraError(
        'invalid_request',
        `${path} needs the path parameter '${name}'`,
      )
    }
    return encodeURIComponent(String(value))
  })
}

/**
 * Query parameters, dropping the absent ones.
 *
 * `null` and `undefined` are both dropped rather than serialised: the
 * document types several filters `string | null` for "no filter", and
 * `?slug=null` would be a filter for the literal text.
 */
function queryEntries(query: Record<string, unknown> | undefined): [string, string][] {
  const entries: [string, string][] = []
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue
    for (const item of Array.isArray(value) ? (value as unknown[]) : [value]) {
      // Only the three primitive kinds the document declares for a query
      // parameter. Anything else has no unambiguous query form, and
      // `String(…)` on an object would silently send `[object Object]`.
      if (typeof item === 'string') entries.push([name, item])
      else if (typeof item === 'number' || typeof item === 'boolean') {
        entries.push([name, String(item)])
      }
    }
  }
  return entries
}

/** An RFC 9457 response as an `ApiError`. */
export async function toApiError(response: Response): Promise<ApiError> {
  let document: Record<string, unknown> = {}
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      document = body as Record<string, unknown>
    }
  } catch {
    // A body that is not JSON — a proxy's HTML error page, an empty 502 —
    // still has to become an `ApiError`, because the status is the fact the
    // caller needs and a parse failure would hide it behind a SyntaxError.
  }
  const errors = document['errors']
  const problem: ProblemDetails = {
    document,
    retryAfter: retryAfterOf(response, document),
    idempotencyReplayed: response.headers.get('idempotency-replayed'),
  }
  return new ApiError(
    typeof document['type'] === 'string' ? document['type'] : 'about:blank',
    response.status,
    typeof document['detail'] === 'string'
      ? document['detail']
      : response.statusText === ''
        ? undefined
        : response.statusText,
    Array.isArray(errors) ? (errors as unknown[]) : undefined,
    problem,
    requestIdOf(response, document),
  )
}

/**
 * The response's correlation id: the document's member, then the header.
 *
 * Body first because it is the value this surface put there deliberately, and
 * the two agree — one middleware assigns the id and the renderer reads it back
 * The header is the fallback for everything
 * the body cannot answer for: a 502 an intermediary wrote, a deployment older
 * than the member.
 */
function requestIdOf(response: Response, document: Record<string, unknown>): string | undefined {
  const fromDocument = document['request_id']
  if (typeof fromDocument === 'string' && fromDocument !== '') return fromDocument
  return response.headers.get('x-request-id') ?? undefined
}

/**
 * `Retry-After` as whole seconds, falling back to the document's own field.
 *
 * RFC 9110 §10.2.3 allows both forms and this surface only ever sends
 * delta-seconds, but a proxy in front of it may rewrite a 429 or a 503 with an
 * HTTP-date, and a client that read that as "no advice" would retry
 * immediately into the same limit.
 */
function retryAfterOf(response: Response, document: Record<string, unknown>): number | null {
  const raw = response.headers.get('retry-after')
  const trimmed = raw?.trim() ?? ''
  if (trimmed !== '') {
    const seconds = Number(trimmed)
    if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds)
    const at = Date.parse(trimmed)
    if (Number.isFinite(at)) return Math.max(0, Math.round((at - Date.now()) / 1000))
  }
  const fromDocument = document['retry_after']
  return typeof fromDocument === 'number' && Number.isFinite(fromDocument) ? fromDocument : null
}

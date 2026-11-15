/**
 * The express middleware, the fastify plugin and `requirePermission`.
 *
 * None of the three imports a framework. Each parameter is described
 * structurally — what the middleware actually reads and writes — so that
 * installing this package pulls in no web server, its published types name
 * none, and the same `requirePermission` serves as an express middleware and
 * a fastify `preHandler`. The frameworks are optional peer dependencies for
 * exactly this reason.
 *
 * The three answers these give are deliberately three, not one:
 *
 * | Cause | Answer |
 * | --- | --- |
 * | No credential, or one that does not verify | 401 `unauthenticated` |
 * | The issuer's JWKS could not be read at all | 503 `issuer-unavailable` |
 * | This service is misconfigured | 500, through the application's own handler |
 *
 * Collapsing them — which is what answering 401 to all three does — makes an
 * outage and a missing environment variable look to an operator like a fleet
 * of bad credentials, and tells every client to discard its token and
 * re-authenticate against the issuer that is already down.
 */

import type { Claims, VerifyOptions } from './types.js'
import { LoginRequired, TokenError } from './errors.js'
import {
  problem,
  sendProblem,
  type ExpressLikeResponse,
  type FastifyLikeReply,
  type Problem,
  type ProblemResponse,
} from './problem.js'
import { assertVerifyOptions, authenticate } from './verify.js'

/** What both middlewares need: the verifier's options, plus somewhere to log. */
export interface MiddlewareOptions extends VerifyOptions {
  /**
   * Where a refusal's reason and an internal failure go.
   *
   * The 401 body says only that the request was not authenticated — the same
   * answer for an absent header as for an expired token, because the
   * difference is of no use to a caller that does not already hold a valid
   * token and of every use to one probing. The reason still has to reach
   * somebody, so it comes here. Without a logger, refusals are silent and
   * internal failures still reach `console.error`: a 500 nobody logged is
   * worse than a noisy log.
   */
  logger?: (error: unknown) => void
}

/** A request after the middleware has run. */
export interface KleoraRequest {
  headers: {
    authorization?: string | undefined
    [name: string]: unknown
  }
  /** The verified claims. Present only once the middleware has admitted the request. */
  kleora?: Claims
}

/**
 * `req.kleora`, for express's own `Request` type.
 *
 * Without this the example in this package's README does not compile: `kleora` is not a member of
 * express's `Request`, so a TypeScript caller had to write the augmentation
 * itself or reach for `as any`, which is the opposite of what a typed SDK is
 * for. The Nuxt package ships its augmentations; this is the same courtesy.
 *
 * **It costs no dependency.** `Express` is a *global namespace* that
 * `@types/express-serve-static-core` merges into `Request`, so declaring into
 * it resolves nothing and imports nothing: with express installed the member
 * appears on `req`, and without it the namespace is an unused global. That is
 * why this is safe to ship from the main entry, where the older reasoning —
 * "declaring it would put express and fastify into the published types" —
 * conflated it with the fastify half, which genuinely cannot be shipped here.
 * `declare module 'fastify'` in a module file is a module *augmentation*:
 * TypeScript resolves the name, and a consumer without fastify installed gets
 * `TS2664` out of our own `.d.ts`. Fastify users add three lines, and the
 * README has them.
 *
 * **Optional, and it has to be.** A request that has not been through the
 * middleware genuinely has no claims. A non-optional declaration would let a
 * route that forgot `app.use(kleora(...))` compile and then read a property
 * of `undefined` at runtime — the same mistake `requirePermission` answers 401
 * rather than 403 to avoid.
 */
declare global {
  // `@types/express` merges `Express.Request`; a module declaration cannot
  // express that, so the namespace is the only spelling there is.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /**
       * The verified claims, once the middleware has admitted this request.
       *
       * `undefined` on a route the middleware never ran on — which is a
       * configuration mistake rather than an anonymous caller, since an
       * unverifiable token is answered 401 and never reaches a handler.
       */
      kleora?: Claims
    }
  }
}

/**
 * `next`/`done`, in the one shape both frameworks' own types satisfy.
 *
 * `Error` rather than `unknown`: fastify types its `done` as `(err?: Error)`
 * and a parameter position is contravariant, so a wider type here would make
 * `requirePermission` unusable as a `preHandler` — which is half of what
 * it is for.
 */
type Next = (error?: Error) => void

/** What `admit` decided. */
type Verdict =
  | { kind: 'ok' }
  | { kind: 'answered' }
  /** Not this request's fault: the service cannot verify anything right now. */
  | { kind: 'internal'; error: unknown }

/** The detail every 401 carries, whatever the reason was. */
const UNAUTHENTICATED = 'the request could not be authenticated'

/**
 * The problem document for a refusal, or `null` when the failure is ours.
 *
 * A `TokenError` and a `LoginRequired` are both about the credential and are
 * both 401. `issuer_unavailable` is the one `TokenError` that is not about the
 * credential at all — the issuer's key set could not be read, so nothing could
 * be judged — and answering it 401 would be a lie with consequences. Anything
 * else is a bug or a misconfiguration in this service, and is not a status
 * this package gets to choose.
 */
function refusal(error: unknown): Problem | null {
  if (error instanceof TokenError && error.code === 'issuer_unavailable') {
    return problem(
      'issuer-unavailable',
      503,
      'the identity provider could not be reached to verify this token',
    )
  }
  if (error instanceof TokenError || error instanceof LoginRequired) {
    return problem('unauthenticated', 401, UNAUTHENTICATED)
  }
  return null
}

/** Log through the caller's logger, or to `console.error` when it must not be lost. */
function report(options: MiddlewareOptions, error: unknown, mustLog: boolean): void {
  if (options.logger !== undefined) {
    try {
      options.logger(error)
    } catch {
      // A logger that throws must not become the failure; there is nowhere
      // left to report that to.
    }
    return
  }
  if (mustLog) console.error('[@kleora-io/node]', error)
}

const asError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error))

/**
 * Express middleware: verify the bearer token, set `req.kleora`, or answer.
 *
 * ```ts
 * import { express as kleora } from '@kleora-io/node'
 * app.use(kleora({ issuer: process.env.KLEORA_ISSUER!, audience: 'https://api.example.com' }))
 * ```
 *
 * Throws at *this* call — not per request — when the options cannot verify
 * anything.
 */
export function express(
  options: MiddlewareOptions,
): (request: KleoraRequest, response: ExpressLikeResponse, next: Next) => void {
  assertVerifyOptions(options)
  return (request, response, next) => {
    void admit(request, response, options)
      .then(
        (verdict) => {
          if (verdict.kind === 'ok') next()
          else if (verdict.kind === 'internal') next(asError(verdict.error))
        },
        (error: unknown) => {
          // `admit` answers rather than throws, so reaching here means the
          // response object itself failed. Hand it on and let the application
          // decide; the `catch` below is what keeps a second failure from
          // reaching Node's unhandled-rejection handler.
          report(options, error, true)
          next(asError(error))
        },
      )
      .catch((error: unknown) => {
        // `next()` threw — an error handler of the application's own, or a
        // response already sent. Nothing here can answer any more, and an
        // unattached rejection would take the worker down under Node's
        // default `--unhandled-rejections=throw`.
        report(options, error, true)
      })
  }
}

/**
 * Fastify plugin: an `onRequest` hook doing what the express middleware does,
 * decorating `request.kleora`.
 *
 * `skip-override` is fastify's own marker for "do not encapsulate me" — the
 * same thing `fastify-plugin` sets. Without it the hook would apply only to
 * routes registered inside this plugin, which is never what a caller
 * registering an authentication plugin at the root means, and adding a
 * dependency to set one symbol is not worth it.
 */
export function fastify(options: MiddlewareOptions): FastifyPluginLike {
  assertVerifyOptions(options)
  const plugin = (instance: FastifyLikeInstance): Promise<void> => {
    instance.decorateRequest('kleora', null)
    instance.addHook('onRequest', async (request, reply) => {
      const verdict = await admit(request, reply, options)
      if (verdict.kind === 'internal') {
        report(options, verdict.error, true)
        // Fastify's own error handler turns this into a 500. Answering it
        // here would mean this package choosing a body for somebody else's
        // bug.
        throw asError(verdict.error)
      }
      // Returning the reply is how a fastify 5 hook says "I have answered;
      // stop the lifecycle here". Resolving with `undefined` continues it,
      // which is what an admitted request wants.
      return verdict.kind === 'ok' ? undefined : reply
    })
    return Promise.resolve()
  }
  return Object.assign(plugin, { [Symbol.for('skip-override')]: true })
}

/** Verify and decorate, or answer. */
async function admit(
  request: KleoraRequest,
  response: ProblemResponse,
  options: MiddlewareOptions,
): Promise<Verdict> {
  let claims: Claims
  try {
    claims = await authenticate(request, options)
  } catch (error) {
    const document = refusal(error)
    if (document === null) return { kind: 'internal', error }
    // The reason, once, where an operator can read it — the body says only
    // that the request was refused.
    report(options, error, false)
    try {
      sendProblem(response, document)
    } catch (failure) {
      // The response could not be written: another middleware answered first
      // and called `next()` anyway, or the connection is gone. There is
      // nothing left to say to the client, and throwing from here would only
      // trade a stale response for a dead worker.
      report(options, failure, true)
    }
    return { kind: 'answered' }
  }
  request.kleora = claims
  return { kind: 'ok' }
}

/**
 * Refuse a request whose claims do not carry `name`.
 *
 * Works as an express middleware and as a fastify `preHandler`: both call it
 * with `(request, response, next)`, and `sendProblem` writes through
 * whichever of the two response objects it was handed.
 *
 * A request that reaches this without `request.kleora` is 401, not 403 —
 * an unauthenticated caller is not a caller lacking a permission, and a route
 * that forgot the authentication middleware must not read as a permissions
 * problem.
 */
export function requirePermission(
  name: string,
): (request: KleoraRequest, response: ProblemResponse, next?: Next) => void {
  return (request, response, next) => {
    const claims = request.kleora
    if (claims === undefined || claims === null) {
      sendProblem(response, problem('unauthenticated', 401, UNAUTHENTICATED))
      return
    }
    if (!claims.permissions.includes(name)) {
      sendProblem(
        response,
        problem(
          'insufficient-permission',
          403,
          claims.permissions_truncated === true
            ? `the token does not carry the permission '${name}'. Its permissions claim was ` +
              `truncated at 200 entries, so this may be a permission the user does hold but ` +
              `the token could not carry; coarser roles are the fix.`
            : `the token does not carry the permission '${name}'`,
        ),
      )
      return
    }
    next?.()
  }
}

/** The two members of a fastify instance this plugin uses. */
export interface FastifyLikeInstance {
  decorateRequest(name: string, value: unknown): unknown
  addHook(
    name: 'onRequest',
    hook: (request: KleoraRequest, reply: FastifyLikeReply) => Promise<unknown>,
  ): unknown
}

/** The plugin shape `fastify.register` accepts. */
export type FastifyPluginLike = (
  instance: FastifyLikeInstance,
  options: Record<string, unknown>,
) => Promise<void>

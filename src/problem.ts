/**
 * RFC 9457 problem documents, written rather than parsed.
 *
 * The middlewares protect a *customer's* API, not ours, so nothing here is
 * required by the management API's contract. They use its vocabulary anyway:
 * an application that puts Kleora in
 * front of its own endpoints gets one error shape across both surfaces, and
 * `insufficient-permission` means the same thing on either side of the call.
 */

/** The namespace every problem slug of the management API lives under. */
export const PROBLEM_BASE = 'https://kleora.io/problems/'

export interface Problem {
  type: string
  title: string
  status: number
  detail: string
}

const TITLES: Record<string, string> = {
  unauthenticated: 'Authentication required',
  'insufficient-permission': 'Permission denied',
  'issuer-unavailable': 'Identity provider unavailable',
}

/** The document for one slug. */
export function problem(slug: string, status: number, detail: string): Problem {
  return {
    type: `${PROBLEM_BASE}${slug}`,
    title: TITLES[slug] ?? slug,
    status,
    detail,
  }
}

/**
 * What a framework's response object has to be able to do for this package
 * to answer through it.
 *
 * Two shapes, because express and fastify spell all three of "set a status",
 * "set a header" and "send JSON" differently, and depending on either
 * package's types here would put a framework in this package's published
 * type surface (no web framework at runtime).
 */
export interface ExpressLikeResponse {
  status(code: number): unknown
  setHeader(name: string, value: string): unknown
  json(body: unknown): unknown
}

export interface FastifyLikeReply {
  code(status: number): unknown
  header(name: string, value: string): unknown
  type(value: string): unknown
  send(body: unknown): unknown
}

export type ProblemResponse = ExpressLikeResponse | FastifyLikeReply

const isFastify = (response: ProblemResponse): response is FastifyLikeReply =>
  typeof (response as FastifyLikeReply).code === 'function'

/**
 * Answer with `document`, in whichever framework's dialect `response` speaks.
 *
 * `WWW-Authenticate` on a 401 is RFC 6750 §3, as on the management API;
 * a client that cannot tell "no credential" from "wrong credential" without
 * it will retry the wrong thing.
 */
export function sendProblem(
  response: ProblemResponse,
  document: Problem,
  headers: Record<string, string> = {},
): void {
  const all = {
    'Content-Type': 'application/problem+json',
    ...(document.status === 401 ? { 'WWW-Authenticate': 'Bearer' } : {}),
    ...headers,
  }
  if (isFastify(response)) {
    response.code(document.status)
    for (const [name, value] of Object.entries(all)) {
      if (name === 'Content-Type') response.type(value)
      else response.header(name, value)
    }
    response.send(document)
    return
  }
  response.status(document.status)
  for (const [name, value] of Object.entries(all)) response.setHeader(name, value)
  response.json(document)
}

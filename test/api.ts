/**
 * A stand-in management API: a real HTTP server that records what it was
 * asked and answers what a test tells it to.
 *
 * Real HTTP again, for the same reason as `issuer.ts`: what is being tested
 * is the wire — which headers go out, what a 404 with an RFC 9457 body turns
 * into, whether a 204 has a body — and a stubbed `fetch` would only prove
 * that this package agrees with itself about all three.
 */

import { createServer, type Server } from 'node:http'
import { type AddressInfo } from 'node:net'

export interface RecordedRequest {
  method: string
  path: string
  query: URLSearchParams
  headers: Record<string, string | string[] | undefined>
  body: unknown
}

export interface CannedResponse {
  status?: number
  body?: unknown
  headers?: Record<string, string>
  /** A body that is not JSON, for the parse-failure path. */
  text?: string
  /** Accept the connection and never answer, for the timeout tests. */
  hang?: boolean
}

export class FakeApi {
  /** Every request, in order. */
  requests: RecordedRequest[] = []

  /** What to answer. The default is enough for the environment guard. */
  respond: (request: RecordedRequest) => CannedResponse = (request) =>
    request.path === '/api/v1/me' ? { body: this.me() } : { body: { ok: true } }

  /** The environment `GET /me` reports. Overridden per test. */
  environment: unknown = {
    id: '972fab52-962d-4529-a667-1a2038e45859',
    kind: 'sandbox',
    issuer: 'https://acme-sandbox.kleora.eu',
    app: { id: '54b0b446-da00-441f-9acc-08d9cde2a83d', slug: 'acme' },
  }

  #server: Server | null = null
  #url = ''

  get url(): string {
    return this.#url
  }

  /** The requests that were not the guard's own `GET /me`. */
  get calls(): RecordedRequest[] {
    return this.requests.filter((request) => request.path !== '/api/v1/me')
  }

  me(): Record<string, unknown> {
    return {
      principal: { kind: 'api_key', subject_id: '3311e837-e852-43b9-baa4-07900cb05339' },
      account: null,
      environment: this.environment,
      tenant: null,
      permissions: ['users:read'],
      memberships: [],
    }
  }

  async start(): Promise<void> {
    const server = createServer((request, response) => {
      const chunks: Buffer[] = []
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => {
        const url = new URL(request.url ?? '/', 'http://placeholder')
        const raw = Buffer.concat(chunks).toString()
        const recorded: RecordedRequest = {
          method: request.method ?? 'GET',
          path: url.pathname,
          query: url.searchParams,
          headers: request.headers,
          body: raw === '' ? undefined : (JSON.parse(raw) as unknown),
        }
        this.requests.push(recorded)

        const canned = this.respond(recorded)
        if (canned.hang === true) return
        const status = canned.status ?? 200
        const headers = {
          'Content-Type': canned.text === undefined ? 'application/json' : 'text/html',
          ...canned.headers,
        }
        if (status === 204) {
          response.writeHead(204).end()
          return
        }
        response.writeHead(status, headers)
        response.end(canned.text ?? JSON.stringify(canned.body ?? {}))
      })
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    this.#server = server
    this.#url = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`
  }

  async stop(): Promise<void> {
    const server = this.#server
    if (server === null) return
    await new Promise<void>((resolve) => server.close(() => {
      resolve()
    }))
    this.#server = null
  }
}

/** A running fake, torn down by the caller. */
export async function startApi(): Promise<FakeApi> {
  const api = new FakeApi()
  await api.start()
  return api
}

/** An RFC 9457 document, as the management API writes one. */
export function problemBody(
  slug: string,
  status: number,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    type: `https://kleora.io/problems/${slug}`,
    title: slug,
    status,
    detail: `a ${slug} problem`,
    instance: '/api/v1/whatever',
    request_id: 'req_01J000000000000000000000',
    ...extra,
  }
}

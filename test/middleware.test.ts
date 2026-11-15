/**
 * The express middleware and the fastify plugin, against real servers.
 *
 * Real apps on ephemeral ports rather than hand-built request and response
 * doubles: the whole value of these two exports is that they fit the
 * frameworks' contracts — the express `RequestHandler` signature, fastify's
 * `onRequest` lifecycle and its encapsulation rules — and a double would
 * agree with whatever this package believed those contracts were.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import createExpress from 'express'
import Fastify, { type FastifyInstance } from 'fastify'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'

import { KleoraError } from '../src/errors.js'
import { JwksCache } from '../src/jwks.js'
import {
  express as kleoraExpress,
  fastify as kleoraFastify,
  requirePermission,
  type MiddlewareOptions,
} from '../src/middleware.js'
import { PROBLEM_BASE } from '../src/problem.js'
import { startIssuer, type TestIssuer } from './issuer.js'

let issuer: TestIssuer
let options: MiddlewareOptions
let expressUrl: string
let fastifyUrl: string
let expressServer: Server
let fastifyApp: FastifyInstance

/** A token with the permissions the routes below ask for. */
async function token(overrides: Record<string, unknown> = {}): Promise<string> {
  return issuer.sign(issuer.claims(overrides))
}

const bearer = (value: string): Record<string, string> => ({ Authorization: `Bearer ${value}` })

beforeAll(async () => {
  issuer = await startIssuer()
  options = { issuer: issuer.url, audience: 'test-client', jwks: new JwksCache(issuer.url) }

  const app = createExpress()
  app.use(kleoraExpress(options))
  app.get('/whoami', (request, response) => {
    response.json({ tenant: request.kleora?.tenant, sub: request.kleora?.sub })
  })
  app.get('/invoices', requirePermission('invoices:read'), (request, response) => {
    response.json({ tenant: request.kleora?.tenant })
  })
  app.get('/ledger', requirePermission('ledger:write'), (_request, response) => {
    response.json({ reached: true })
  })
  expressServer = await new Promise<Server>((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      resolve(server)
    })
  })
  expressUrl = `http://127.0.0.1:${String((expressServer.address() as AddressInfo).port)}`

  fastifyApp = Fastify()
  await fastifyApp.register(kleoraFastify(options))
  fastifyApp.get('/whoami', (request) => ({
    tenant: request.kleora?.tenant,
    sub: request.kleora?.sub,
  }))
  fastifyApp.get('/invoices', { preHandler: requirePermission('invoices:read') }, (request) => ({
    tenant: request.kleora?.tenant,
  }))
  fastifyApp.get('/ledger', { preHandler: requirePermission('ledger:write') }, () => ({
    reached: true,
  }))
  fastifyUrl = await fastifyApp.listen({ port: 0, host: '127.0.0.1' })
})

afterAll(async () => {
  await new Promise<void>((resolve) => expressServer.close(() => {
    resolve()
  }))
  await fastifyApp.close()
  await issuer.stop()
})

// The URLs are only known once the servers are listening, and `describe.each`
// runs at collection time — so each case carries a getter, not a string.
const frameworks: [string, () => string][] = [
  ['express', () => expressUrl],
  ['fastify', () => fastifyUrl],
]

describe.each(frameworks)('%s', (_name, url) => {
  const base = (): string => url()

  it('answers a request with no Authorization header with a 401 problem', async () => {
    const response = await fetch(`${base()}/whoami`)

    expect(response.status).toBe(401)
    expect(response.headers.get('content-type')).toContain('application/problem+json')
    expect(response.headers.get('www-authenticate')).toBe('Bearer')
    await expect(response.json()).resolves.toMatchObject({
      type: `${PROBLEM_BASE}unauthenticated`,
      status: 401,
    })
  })

  it('answers a token it cannot verify with a 401 problem', async () => {
    const stale = await token({ exp: Math.floor(Date.now() / 1000) - 3600 })

    const response = await fetch(`${base()}/whoami`, { headers: bearer(stale) })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ type: `${PROBLEM_BASE}unauthenticated` })
  })

  it('exposes the claims on the request when the token verifies', async () => {
    const response = await fetch(`${base()}/whoami`, { headers: bearer(await token()) })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      tenant: 'bfbf3f3d-0e25-48f9-b423-43a6507fa3ce',
      sub: '3e419a39-bace-4bd3-97b7-fa245726a6b9',
    })
  })

  it('lets a permission the token carries through', async () => {
    const response = await fetch(`${base()}/invoices`, { headers: bearer(await token()) })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      tenant: 'bfbf3f3d-0e25-48f9-b423-43a6507fa3ce',
    })
  })

  it('refuses a permission the token does not carry with a 403 problem', async () => {
    const response = await fetch(`${base()}/ledger`, { headers: bearer(await token()) })

    expect(response.status).toBe(403)
    expect(response.headers.get('content-type')).toContain('application/problem+json')
    await expect(response.json()).resolves.toMatchObject({
      type: `${PROBLEM_BASE}insufficient-permission`,
      status: 403,
      detail: expect.stringContaining('ledger:write'),
    })
  })

  it('does not run the route handler when it refuses', async () => {
    const response = await fetch(`${base()}/ledger`, { headers: bearer(await token()) })

    await expect(response.json()).resolves.not.toMatchObject({ reached: true })
  })

  it('sends no WWW-Authenticate on a 403: the credential was accepted', async () => {
    const response = await fetch(`${base()}/ledger`, { headers: bearer(await token()) })

    expect(response.headers.get('www-authenticate')).toBeNull()
  })

  it('says nothing in the 401 body about which check failed', async () => {
    // The slug is the same for an absent header and an expired token
    // deliberately; a `detail` naming `exp`, `aud` or `iss` would hand that
    // difference back to whoever is probing. The reason goes to the logger.
    const stale = await token({ exp: Math.floor(Date.now() / 1000) - 3600 })

    const response = await fetch(`${base()}/whoami`, { headers: bearer(stale) })
    const document = (await response.json()) as { detail: string }

    expect(document.detail).not.toMatch(/exp|aud|iss|expired/i)
  })

  it('explains a 403 that a truncated permissions claim may have caused', async () => {
    const truncated = await token({ permissions_truncated: true })

    const response = await fetch(`${base()}/ledger`, { headers: bearer(truncated) })

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringContaining('truncated'),
    })
  })

})

describe('requirePermission on a route the authentication middleware never reached', () => {
  // The branch that must be 401 and not 403: an application that protected a
  // route with a permission but forgot to protect it with authentication is
  // not looking at a caller who lacks a permission.
  let server: Server
  let url: string
  let app: FastifyInstance
  let fastifyOnly: string

  beforeAll(async () => {
    const express = createExpress()
    express.get('/ledger', requirePermission('ledger:write'), (_request, response) => {
      response.json({ reached: true })
    })
    server = await new Promise<Server>((resolve) => {
      const listening = express.listen(0, '127.0.0.1', () => {
        resolve(listening)
      })
    })
    url = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`

    app = Fastify()
    app.get('/ledger', { preHandler: requirePermission('ledger:write') }, () => ({
      reached: true,
    }))
    fastifyOnly = await app.listen({ port: 0, host: '127.0.0.1' })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => {
      resolve()
    }))
    await app.close()
  })

  it('answers 401 (express)', async () => {
    const response = await fetch(`${url}/ledger`, { headers: bearer(await token()) })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      type: `${PROBLEM_BASE}unauthenticated`,
    })
  })

  it('answers 401 (fastify)', async () => {
    const response = await fetch(`${fastifyOnly}/ledger`, { headers: bearer(await token()) })

    expect(response.status).toBe(401)
  })
})

describe('an issuer that cannot be reached', () => {
  // During a JWKS
  // outage every caller was being told its token was invalid, so every client
  // would discard a good token and re-authenticate against the issuer that is
  // already down. It is a 503 and it says so.
  let server: Server
  let url: string
  let app: FastifyInstance
  let fastifyUnavailable: string

  beforeAll(async () => {
    const options503: MiddlewareOptions = {
      issuer: 'http://127.0.0.1:1',
      audience: 'test-client',
      jwks: new JwksCache('http://127.0.0.1:1', { timeout: 200 }),
      logger: () => undefined,
    }
    const express = createExpress()
    express.use(kleoraExpress(options503))
    express.get('/whoami', (_request, response) => {
      response.json({ reached: true })
    })
    server = await new Promise<Server>((resolve) => {
      const listening = express.listen(0, '127.0.0.1', () => {
        resolve(listening)
      })
    })
    url = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`

    app = Fastify()
    await app.register(kleoraFastify(options503))
    app.get('/whoami', () => ({ reached: true }))
    fastifyUnavailable = await app.listen({ port: 0, host: '127.0.0.1' })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => {
      resolve()
    }))
    await app.close()
  })

  it('answers 503 rather than 401 (express)', async () => {
    const response = await fetch(`${url}/whoami`, { headers: bearer(await token()) })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      type: `${PROBLEM_BASE}issuer-unavailable`,
      status: 503,
    })
  })

  it('answers 503 rather than 401 (fastify)', async () => {
    const response = await fetch(`${fastifyUnavailable}/whoami`, {
      headers: bearer(await token()),
    })

    expect(response.status).toBe(503)
  })
})

describe('a misconfigured service', () => {
  it('refuses to build a middleware it cannot verify with', () => {
    // The README's own snippet is `issuer: process.env.KLEORA_ISSUER!`. With
    // the variable unset this used to 401 every request and log nothing, so
    // the operator saw a fleet of bad credentials rather than a missing
    // environment variable. It now fails at boot.
    expect(() => kleoraExpress({ issuer: undefined as unknown as string, audience: 'a' })).toThrow(
      KleoraError,
    )
    expect(() => kleoraExpress({ issuer: 'not-a-url', audience: 'a' })).toThrow(KleoraError)
    expect(() => kleoraExpress({ issuer: 'https://a.example', audience: '' })).toThrow(
      KleoraError,
    )
    expect(() =>
      kleoraFastify({ issuer: 'https://a.example', audience: 'a', clockTolerance: -1 }),
    ).toThrow(KleoraError)
  })

  it('answers 500 through the application error handler, never 401', async () => {
    // A `jwks` resolver that throws something outside the taxonomy stands in
    // for any non-token failure inside the middleware.
    const logged: unknown[] = []
    const express = createExpress()
    express.use(
      kleoraExpress({
        issuer: issuer.url,
        audience: 'test-client',
        jwks: {
          get: () => Promise.reject(new KleoraError('invalid_configuration', 'boom')),
        },
        logger: (error) => logged.push(error),
      }),
    )
    express.get('/whoami', (_request, response) => {
      response.json({ reached: true })
    })
    const server = await new Promise<Server>((resolve) => {
      const listening = express.listen(0, '127.0.0.1', () => {
        resolve(listening)
      })
    })
    const port = (server.address() as AddressInfo).port

    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/whoami`, {
        headers: bearer(await token()),
      })
      expect(response.status).toBe(500)
    } finally {
      await new Promise<void>((resolve) => server.close(() => {
        resolve()
      }))
    }
  })

  it('survives a response object that cannot be written to', async () => {
    // `ERR_HTTP_HEADERS_SENT` from an earlier middleware that answered and
    // called `next()` anyway. Before the fix the rejection had no handler and
    // Node's default `--unhandled-rejections=throw` killed the worker.
    const logged: unknown[] = []
    const middleware = kleoraExpress({
      issuer: issuer.url,
      audience: 'test-client',
      jwks: new JwksCache(issuer.url),
      logger: (error) => logged.push(error),
    })
    const broken = {
      status: () => {
        throw new Error('ERR_HTTP_HEADERS_SENT')
      },
      setHeader: () => undefined,
      json: () => undefined,
    }
    let nexted = false

    await new Promise<void>((resolve) => {
      middleware({ headers: {} }, broken, () => {
        nexted = true
      })
      setTimeout(resolve, 50)
    })

    expect(nexted).toBe(false)
    // The refusal's reason first — that is where a 401's `detail` no longer
    // says it — and then the failure to write the answer.
    expect(logged).toHaveLength(2)
    expect((logged[1] as Error).message).toBe('ERR_HTTP_HEADERS_SENT')
  })
})

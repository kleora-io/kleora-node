/**
 * A throwaway issuer: a real HTTP server publishing a real JWKS, and real
 * ES256 tokens signed by the keys in it.
 *
 * A real server rather than a stubbed `fetch`, because the cache's rules are
 * about HTTP — the document's `Cache-Control`, a failing endpoint, a key that
 * appears between two requests — and a stub would let the tests agree with
 * this package's idea of HTTP instead of with HTTP. What is faked instead is
 * the clock, which is the only way to walk past a 60 s floor and a 600 s
 * stale window in a suite that has to finish in seconds.
 */

import { createServer, type IncomingHttpHeaders, type Server } from 'node:http'
import { type AddressInfo } from 'node:net'

import { exportJWK, generateKeyPair, SignJWT, type JWK } from 'jose'

/** What `generateKeyPair` hands back; the global `CryptoKey` is a value here. */
type PrivateKey = Awaited<ReturnType<typeof generateKeyPair>>['privateKey']

export interface TestKey {
  kid: string
  jwk: JWK
  privateKey: PrivateKey
}

let counter = 0

/** One ES256 key, public half as a JWK the way the platform publishes it. */
export async function createKey(): Promise<TestKey> {
  const { publicKey, privateKey } = await generateKeyPair('ES256', { extractable: true })
  counter += 1
  const kid = `test-key-${String(counter)}`
  const jwk = { ...(await exportJWK(publicKey)), kid, alg: 'ES256', use: 'sig' }
  return { kid, jwk, privateKey }
}

export class TestIssuer {
  /** Keys the document publishes, in order. */
  keys: TestKey[] = []
  /** How many times `/.well-known/jwks.json` has been asked for. */
  requests = 0
  /** Answer with this status instead of 200. */
  status = 200
  /** `max-age` on the document, or `null` for no `Cache-Control` at all. */
  maxAge: number | null = 300
  /** Answer with this exact body instead of the key set. */
  body: string | null = null
  /** Accept the connection and never answer, for the timeout tests. */
  hang = false
  /**
   * The headers of every request to the document, oldest first.
   *
   * A real server sees what actually went over the wire, which is the only
   * place a missing request header can be proved absent: a stubbed `fetch`
   * would be asserting what this package passes to a function it also owns.
   */
  received: IncomingHttpHeaders[] = []

  #server: Server | null = null
  #url = ''

  get url(): string {
    return this.#url
  }

  async start(): Promise<void> {
    const key = await createKey()
    this.keys.push(key)
    const server = createServer((request, response) => {
      if (request.url !== '/.well-known/jwks.json') {
        response.writeHead(404).end()
        return
      }
      this.requests += 1
      this.received.push(request.headers)
      if (this.hang) return
      if (this.status !== 200) {
        response.writeHead(this.status).end()
        return
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (this.maxAge !== null) {
        headers['Cache-Control'] = `public, max-age=${String(this.maxAge)}`
      }
      response.writeHead(200, headers)
      response.end(this.body ?? JSON.stringify({ keys: this.keys.map((entry) => entry.jwk) }))
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

  /** The headers of the most recent request, or `undefined` if there was none. */
  get lastReceived(): IncomingHttpHeaders | undefined {
    return this.received.at(-1)
  }

  /** The key tokens are signed with unless a test says otherwise. */
  get active(): TestKey {
    const key = this.keys[0]
    if (key === undefined) throw new Error('the issuer has no keys; call start() first')
    return key
  }

  /** Publish another key, as a rotation would. */
  async publish(): Promise<TestKey> {
    const key = await createKey()
    this.keys.push(key)
    return key
  }

  /** A full, valid claim set for this issuer, before a test's overrides. */
  claims(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    const now = Math.floor(Date.now() / 1000)
    return {
      iss: this.url,
      sub: '3e419a39-bace-4bd3-97b7-fa245726a6b9',
      aud: ['test-client'],
      iat: now,
      exp: now + 900,
      jti: '98820ef1-10ef-460c-8c68-6e8049645398',
      client_id: 'test-client',
      scope: 'openid profile email',
      env: 'production',
      tenant: 'bfbf3f3d-0e25-48f9-b423-43a6507fa3ce',
      tenant_slug: 'acme',
      roles: ['owner'],
      permissions: ['invoices:read'],
      email: 'owner@example.test',
      email_verified: true,
      amr: ['pwd'],
      ...overrides,
    }
  }

  /** Sign `claims` with `key` (the active one by default). */
  async sign(claims: Record<string, unknown>, key: TestKey = this.active): Promise<string> {
    return new SignJWT(claims)
      .setProtectedHeader({ alg: 'ES256', kid: key.kid, typ: 'at+jwt' })
      .sign(key.privateKey)
  }
}

/** A running issuer, torn down by the caller. */
export async function startIssuer(): Promise<TestIssuer> {
  const issuer = new TestIssuer()
  await issuer.start()
  return issuer
}

/** A clock a test can move, in milliseconds. */
export function clock(start = Date.now()): { now: () => number; advance: (seconds: number) => void } {
  let value = start
  return {
    now: () => value,
    advance: (seconds: number) => {
      value += seconds * 1000
    },
  }
}

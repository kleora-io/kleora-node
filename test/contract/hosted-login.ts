/**
 * A cookie jar, PKCE and enough of the flow API to walk a sign-in.
 *
 * The contract suite needs a real access token, and the only way to get one
 * is the way a person gets one: `/oauth/authorize` → the hosted pages →
 * tenant resolution → back to `redirect_uri` → `/oauth/token`. Playwright
 * would be the other option, but this package must not grow a browser
 * download to run `pnpm test`.
 *
 * The hosted pages are a static SPA and there is no form to
 * scrape: the browser lands on a route, reads `req` off its own URL, and
 * calls `/flow/*` with JSON. This is that browser, minus the rendering. The
 * flow API's same-origin rule is satisfied the way a browser satisfies it — `Content-Type:
 * application/json` and an `Origin` equal to the issuer's own on every
 * mutating request.
 */

import { createHash, randomBytes } from 'node:crypto'

const MAX_HOPS = 25
const LOGIN = '/login'
const SELECT_TENANT = '/select-tenant'

export class HostedLoginError extends Error {}

export interface Tokens {
  access_token: string
  refresh_token?: string
  id_token?: string
  token_type: string
  expires_in: number
}

interface Envelope {
  step?: string
  redirect_to?: string
  tenants?: { id: string; name: string; slug: string }[]
  code?: string
}

const b64url = (value: Buffer): string => value.toString('base64url')

/** A cookie jar scoped to one issuer, which is all one login talks to. */
export class Jar {
  private readonly cookies = new Map<string, string>()

  absorb(response: Response): void {
    for (const header of response.headers.getSetCookie()) {
      const [pair] = header.split(';')
      const separator = pair?.indexOf('=') ?? -1
      if (pair === undefined || separator <= 0) continue
      const name = pair.slice(0, separator)
      const value = pair.slice(separator + 1)
      if (value === '' || header.includes('Max-Age=0')) this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
  }

  header(): string {
    return [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; ')
  }
}

export interface LoginRequest {
  issuer: string
  clientId: string
  redirectUri: string
  email: string
  password: string
  scope?: string
}

/**
 * Sign in and redeem the code. Returns the token endpoint's response.
 *
 * `jar` is for a caller that goes on to act as the same browser on the issuer
 * — the account portal's `POST /flow/portal/token` exchanges exactly the
 * session cookie this leaves in it.
 */
export async function login(request: LoginRequest, jar: Jar = new Jar()): Promise<Tokens> {
  const verifier = b64url(randomBytes(32))
  const challenge = b64url(createHash('sha256').update(verifier).digest())
  const authorize = new URL('/oauth/authorize', request.issuer)
  authorize.search = new URLSearchParams({
    response_type: 'code',
    client_id: request.clientId,
    redirect_uri: request.redirectUri,
    scope: request.scope ?? 'openid profile email offline_access',
    state: b64url(randomBytes(16)),
    nonce: b64url(randomBytes(16)),
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString()

  const code = await walk(authorize.href, request, jar)
  const response = await fetch(new URL('/oauth/token', request.issuer), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: request.redirectUri,
      client_id: request.clientId,
      code_verifier: verifier,
    }),
  })
  const body = (await response.json()) as Tokens & { error?: string }
  if (!response.ok) {
    throw new HostedLoginError(`/oauth/token answered ${String(response.status)}: ${String(body.error)}`)
  }
  return body
}

/** Follow the hosted pages until the browser is sent to `redirect_uri`. */
async function walk(authorizeUrl: string, request: LoginRequest, jar: Jar): Promise<string> {
  const target = new URL(request.redirectUri)
  let current = authorizeUrl

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const url = new URL(current)
    if (url.origin === target.origin && url.pathname === target.pathname) {
      const code = url.searchParams.get('code')
      if (code === null) {
        throw new HostedLoginError(`the flow returned to ${url.href} without a code`)
      }
      return code
    }

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: jar.header() === '' ? {} : { Cookie: jar.header() },
    })
    jar.absorb(response)

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location')
      if (location === null) throw new HostedLoginError(`${url.href} redirected without a Location`)
      current = new URL(location, url).href
      continue
    }
    if (response.status !== 200) {
      throw new HostedLoginError(`${url.href} answered ${String(response.status)}`)
    }

    await response.arrayBuffer()
    current = await act(url, jar, request)
  }

  throw new HostedLoginError(`the hosted login did not finish in ${String(MAX_HOPS)} hops`)
}

/** What the SPA route at `url` does, and where it sends the browser next. */
async function act(url: URL, jar: Jar, request: LoginRequest): Promise<string> {
  const req = url.searchParams.get('req')
  if (req === null) {
    throw new HostedLoginError(`${url.pathname} carries no req for this helper to continue`)
  }

  if (url.pathname.endsWith(LOGIN)) {
    const envelope = await call(url.origin, 'POST', '/flow/login', jar, {
      req,
      email: request.email,
      password: request.password,
    })
    return navigation(url, envelope)
  }

  if (url.pathname.endsWith(SELECT_TENANT)) {
    const listed = await call(url.origin, 'GET', `/flow/tenants?req=${encodeURIComponent(req)}`, jar)
    const tenant = listed.tenants?.[0]
    if (tenant === undefined) throw new HostedLoginError('the tenant step offered no workspace')
    const envelope = await call(url.origin, 'POST', '/flow/select-tenant', jar, {
      req,
      tenant: tenant.id,
    })
    return navigation(url, envelope)
  }

  throw new HostedLoginError(`unexpected hosted route: ${url.pathname}`)
}

/** One flow call, shaped the way the SPA's `fetch` shapes one. */
async function call(
  origin: string,
  method: 'GET' | 'POST',
  path: string,
  jar: Jar,
  payload?: Record<string, string>,
): Promise<Envelope> {
  const response = await fetch(new URL(path, origin), {
    method,
    redirect: 'manual',
    headers: {
      ...(jar.header() === '' ? {} : { Cookie: jar.header() }),
      ...(payload === undefined ? {} : { 'Content-Type': 'application/json', Origin: origin }),
    },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  })
  jar.absorb(response)

  const body = (await response.json()) as Envelope & { code?: string }
  if (response.status !== 200) {
    throw new HostedLoginError(
      `${method} ${path} answered ${String(response.status)}: ${JSON.stringify(body)}`,
    )
  }
  return body
}

function navigation(url: URL, envelope: Envelope): string {
  if (envelope.redirect_to === undefined) {
    throw new HostedLoginError(`the flow answered "${String(envelope.step)}" with nowhere to go`)
  }
  return new URL(envelope.redirect_to, url).href
}

/**
 * What the contract suite needs from a running stack, and how it makes it.
 *
 * The suite provisions its own App rather than borrowing one in use:
 * rotating signing keys and creating users are both destructive, and doing
 * either to a real App would leave its environment changed by a test run. A fresh App gives a sandbox environment nothing else is using,
 * and `teardown` deletes it again so repeated local runs do not walk into the
 * per-Account App limit.
 *
 * Every value comes from `KLEORA_TEST_*` (README, "Contract tests").
 * Without them `configured` is false and every contract test skips — which is
 * what keeps `pnpm test` green in CI, where there is no environment at all.
 */

import { randomBytes } from 'node:crypto'

import { allowHost } from '../network.js'
import { login, type Tokens } from './hosted-login.js'

export const ISSUER = process.env['KLEORA_TEST_ISSUER']
export const CLIENT_ID = process.env['KLEORA_TEST_CLIENT_ID']
export const API_BASE = process.env['KLEORA_TEST_API_BASE']
// The placeholder only keeps collection from throwing; without the variable
// `configured` is false and nothing uses it.
export const REDIRECT_URI =
  process.env['KLEORA_TEST_REDIRECT_URI'] ?? 'http://localhost/callback'
const USERNAME = process.env['KLEORA_TEST_USERNAME']
const PASSWORD = process.env['KLEORA_TEST_PASSWORD']

/**
 * Whether the caller *promised* an environment. `describe.skipIf(!configured)`
 * is what keeps `pnpm test` green in CI, which has none — and is also what
 * would let this whole suite disappear from a run that meant to exercise it
 * without turning anything red. Set `KLEORA_TEST_REQUIRE_LIVE=1` on such a
 * run, and the suite asserts `configured` under it.
 */
export const required = process.env['KLEORA_TEST_REQUIRE_LIVE'] === '1'

/** Whether there is a stack to talk to. */
export const configured =
  ISSUER !== undefined &&
  CLIENT_ID !== undefined &&
  API_BASE !== undefined &&
  process.env['KLEORA_TEST_REDIRECT_URI'] !== undefined &&
  USERNAME !== undefined &&
  PASSWORD !== undefined

/** The scopes the suite's API key needs, and nothing more. */
const KEY_SCOPES = [
  'clients:read',
  'clients:write',
  'signing_keys:read',
  'signing_keys:write',
  'users:read',
  'users:write',
]

interface Environment {
  id: string
  kind: 'sandbox' | 'production'
  issuer: string
}

interface App {
  id: string
  slug: string
  environments: Environment[]
}

export interface Stack {
  /** The console owner's access token, from the platform `id` App. */
  consoleToken: string
  app: App
  sandbox: Environment
  production: Environment
  /** The sandbox environment's default client, with a redirect URI added. */
  clientId: string
  /** A user of the sandbox environment, and its password. */
  user: { email: string; password: string }
  /** A `kl_test_` key scoped to the sandbox environment. */
  testKey: string
  /** Sign in to the sandbox environment and return fresh tokens. */
  signIn(): Promise<Tokens>
  /** Call the management API as the console owner. */
  admin<T>(method: string, path: string, body?: unknown): Promise<T>
}

/** The management API's base URL, without the `/api/v1` the paths carry. */
export function apiOrigin(): string {
  const base = (API_BASE ?? '').replace(/\/+$/, '')
  return base.endsWith('/api/v1') ? base.slice(0, -'/api/v1'.length) : base
}

class StackError extends Error {}

/** Sign in as the account owner and build an App to test against. */
export async function provision(): Promise<Stack> {
  if (!configured) throw new StackError('provision() called without KLEORA_TEST_*')
  allowHost(ISSUER as string)
  allowHost(apiOrigin())

  const tokens = await login({
    issuer: ISSUER as string,
    clientId: CLIENT_ID as string,
    redirectUri: REDIRECT_URI,
    email: USERNAME as string,
    password: PASSWORD as string,
  })

  const admin = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
    const response = await fetch(apiOrigin() + path, {
      method,
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const text = await response.text()
    if (!response.ok) {
      throw new StackError(`${method} ${path} answered ${String(response.status)}: ${text}`)
    }
    return (text === '' ? undefined : JSON.parse(text)) as T
  }

  // A slug per run: the App namespace is global (the slug is the
  // issuer), so two runs against one stack must not collide.
  const suffix = randomBytes(4).toString('hex')
  const app = await admin<App>('POST', '/api/v1/apps', {
    name: `sdk node ${suffix}`,
    slug: `sdknode${suffix}`,
  })
  const sandbox = app.environments.find((environment) => environment.kind === 'sandbox')
  const production = app.environments.find((environment) => environment.kind === 'production')
  if (sandbox === undefined || production === undefined) {
    throw new StackError('a new App did not come with both environments')
  }
  allowHost(sandbox.issuer)
  allowHost(production.issuer)

  const clients = await admin<{ items: { id: string; client_id: string }[] }>(
    'GET',
    `/api/v1/environments/${sandbox.id}/clients`,
  )
  const client = clients.items[0]
  if (client === undefined) throw new StackError('the sandbox environment has no default client')
  await admin('PATCH', `/api/v1/environments/${sandbox.id}/clients/${client.id}`, {
    redirect_uris: [REDIRECT_URI],
  })

  // A random password, because the environment's breach check refuses a
  // memorable one — which is the point of it.
  const user = {
    email: `sdk-${suffix}@example.test`,
    password: randomBytes(24).toString('base64url'),
  }
  await admin('POST', `/api/v1/environments/${sandbox.id}/users`, {
    ...user,
    email_verified: true,
  })

  const key = await admin<{ key: string }>(
    'POST',
    `/api/v1/environments/${sandbox.id}/api-keys`,
    { name: `sdk contract ${suffix}`, scopes: KEY_SCOPES },
  )

  return {
    consoleToken: tokens.access_token,
    app,
    sandbox,
    production,
    clientId: client.client_id,
    user,
    testKey: key.key,
    admin,
    signIn: () =>
      login({
        issuer: sandbox.issuer,
        clientId: client.client_id,
        redirectUri: REDIRECT_URI,
        email: user.email,
        password: user.password,
      }),
  }
}

/** Delete the App the run created, so the next run starts from the same place. */
export async function teardown(stack: Stack | undefined): Promise<void> {
  if (stack === undefined) return
  await stack.admin('DELETE', `/api/v1/apps/${stack.app.id}`)
}

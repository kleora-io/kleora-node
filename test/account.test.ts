/**
 * `AccountClient`, against a
 * scripted `fetch`. `contract/stack.contract.test.ts` runs it against a stack.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { inspect } from 'node:util'

import { describe, expect, it, vi } from 'vitest'

import { AccountClient, ApiError, KleoraError } from '../src/index.js'

const ISSUER = 'https://acme.kleora.eu'
const BASE = `${ISSUER}/account/v1`

interface Seen {
  url: string
  init: RequestInit | undefined
}

function scripted(answer: (url: string) => Response = () => Response.json({})) {
  const seen: Seen[] = []
  const fetch = vi.fn((input: string | URL, init?: RequestInit) => {
    const url = input instanceof URL ? input.href : input
    seen.push({ url, init })
    return Promise.resolve(answer(url))
  })
  return { fetch: fetch as unknown as typeof globalThis.fetch, seen }
}

const headersOf = (init: RequestInit | undefined): Record<string, string> =>
  (init?.headers ?? {}) as Record<string, string>

const bodyOf = (init: RequestInit | undefined): unknown =>
  typeof init?.body === 'string' ? JSON.parse(init.body) : undefined

type Run = (client: AccountClient) => Promise<unknown>

const operations: [string, Run, string, string, unknown][] = [
  ['getProfile', (c) => c.getProfile(), 'GET', '/profile', undefined],
  ['updateProfile', (c) => c.updateProfile({ name: 'Ada' }), 'PATCH', '/profile', { name: 'Ada' }],
  ['getEmail', (c) => c.getEmail(), 'GET', '/email', undefined],
  ['requestEmailChange', (c) => c.requestEmailChange('n@example.test'), 'POST', '/email', { email: 'n@example.test' }],
  ['confirmEmailChange', (c) => c.confirmEmailChange('tok'), 'POST', '/email/confirm', { token: 'tok' }],
  ['resendVerificationEmail', (c) => c.resendVerificationEmail(), 'POST', '/email/resend', undefined],
  ['getPasswordPolicy', (c) => c.getPasswordPolicy(), 'GET', '/password', undefined],
  ['changePassword', (c) => c.changePassword({ currentPassword: 'old', newPassword: 'new' }), 'POST', '/password', { new_password: 'new', current_password: 'old' }],
  ['getReauthentication', (c) => c.getReauthentication(), 'GET', '/reauth', undefined],
  ['reauthenticate', (c) => c.reauthenticate('pw'), 'POST', '/reauth', { password: 'pw' }],
  ['listSessions', (c) => c.listSessions({ limit: 5, cursor: 'x' }), 'GET', '/sessions?limit=5&cursor=x', undefined],
  ['revokeSession', (c) => c.revokeSession('s1'), 'DELETE', '/sessions/s1', undefined],
  ['revokeOtherSessions', (c) => c.revokeOtherSessions(), 'POST', '/sessions/revoke-others', undefined],
  ['listMfaFactors', (c) => c.listMfaFactors(), 'GET', '/mfa', undefined],
  ['startTotpEnrollment', (c) => c.startTotpEnrollment(), 'POST', '/mfa/enroll/start', undefined],
  ['confirmTotpEnrollment', (c) => c.confirmTotpEnrollment('123456'), 'POST', '/mfa/enroll/confirm', { code: '123456' }],
  ['removeMfaFactor', (c) => c.removeMfaFactor('f1'), 'DELETE', '/mfa/f1', undefined],
  ['regenerateRecoveryCodes', (c) => c.regenerateRecoveryCodes(), 'POST', '/mfa/recovery/regenerate', undefined],
  ['listPasskeys', (c) => c.listPasskeys(), 'GET', '/passkeys', undefined],
  ['removePasskey', (c) => c.removePasskey('p1'), 'DELETE', '/passkeys/p1', undefined],
  ['listIdentities', (c) => c.listIdentities(), 'GET', '/identities', undefined],
  ['unlinkIdentity', (c) => c.unlinkIdentity('i1'), 'DELETE', '/identities/i1', undefined],
  ['listSettings', (c) => c.listSettings(), 'GET', '/settings', undefined],
  ['setSetting', (c) => c.setSetting('theme', 'dark'), 'PUT', '/settings/theme', { value: 'dark' }],
  ['resetSetting', (c) => c.resetSetting('theme'), 'DELETE', '/settings/theme', undefined],
  ['getPortal', (c) => c.getPortal(), 'GET', '/portal', undefined],
  ['requestDeletion', (c) => c.requestDeletion(), 'POST', '/deletion', undefined],
  ['cancelDeletion', (c) => c.cancelDeletion('mailed'), 'DELETE', '/deletion', { token: 'mailed' }],
]

/**
 * No generator carries `x-kleora-sensitive` into this package, so the
 * `**Sensitive.**` notes in `src/account.ts` are hand-written prose and this is
 * the one thing holding them to the committed document. Every doc comment that
 * opens with a backticked route is one operation, and the note is its claim.
 */
const ROUTE_COMMENT = /\/\*\*([\s\S]*?)\*\//g
const ROUTE = /^[\s*]*`(GET|POST|PUT|PATCH|DELETE) (\/[^`]*)`/
const SENSITIVE_NOTE = '**Sensitive.**'
const placeholders = (path: string): string => path.replace(/\{[^}]*\}/g, '{}')

function claimedSensitivity(source: string): Record<string, boolean> {
  const claims: Record<string, boolean> = {}
  for (const [, comment = ''] of source.matchAll(ROUTE_COMMENT)) {
    const route = ROUTE.exec(comment)
    if (route === null) continue
    claims[`${route[1] ?? ''} ${placeholders(route[2] ?? '')}`] = comment.includes(SENSITIVE_NOTE)
  }
  return claims
}

function declaredSensitivity(): Record<string, unknown> {
  const document = JSON.parse(
    readFileSync(resolve(import.meta.dirname, '../openapi/account-v1.json'), 'utf8'),
  ) as { paths: Record<string, Record<string, Record<string, unknown>>> }
  const declared: Record<string, unknown> = {}
  for (const [path, methods] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      declared[`${method.toUpperCase()} ${placeholders(path.replace('/account/v1', ''))}`] =
        operation['x-kleora-sensitive']
    }
  }
  return declared
}

describe('AccountClient', () => {
  it.each(operations)('%s reaches its route with the bearer token', async (name, run, method, path, body) => {
    const { fetch, seen } = scripted()
    await run(new AccountClient({ issuer: `${ISSUER}/`, accessToken: 'tok', fetch }))
    expect(seen[0]?.url).toBe(`${BASE}${path}`)
    expect(seen[0]?.init?.method).toBe(method)
    expect(bodyOf(seen[0]?.init)).toEqual(body)
    expect(headersOf(seen[0]?.init)['User-Agent']).toMatch(/^kleora-node\//)
    expect(headersOf(seen[0]?.init)['Authorization']).toBe(
      name === 'cancelDeletion' ? undefined : 'Bearer tok',
    )
  })

  it('covers every operation the document declares, and nothing else', () => {
    const document = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../openapi/account-v1.json'), 'utf8'),
    ) as { paths: Record<string, Record<string, unknown>> }
    const declared = Object.entries(document.paths).flatMap(([path, methods]) =>
      Object.keys(methods).map((method) => `${method.toUpperCase()} ${path.replace('/account/v1', '')}`),
    )
    const reached = operations.map(([, , method, path]) =>
      `${method} ${path.split('?')[0] ?? ''}`
        .replace(/\/sessions\/s1$/, '/sessions/{session_id}')
        .replace(/\/mfa\/f1$/, '/mfa/{factor_id}')
        .replace(/\/passkeys\/p1$/, '/passkeys/{factor_id}')
        .replace(/\/identities\/i1$/, '/identities/{identity_id}')
        .replace(/\/settings\/theme$/, '/settings/{key}'),
    )
    expect(new Set(reached)).toEqual(new Set(declared))
  })

  it('marks **Sensitive.** on exactly the operations the document marks x-kleora-sensitive', () => {
    const source = readFileSync(resolve(import.meta.dirname, '../src/account.ts'), 'utf8')
    const claimed = claimedSensitivity(source)
    expect(claimed).toEqual(declaredSensitivity())
    // A note that drifted off its route's comment would be counted by nobody.
    expect(source.split(SENSITIVE_NOTE).length - 1).toBe(Object.values(claimed).filter(Boolean).length)
  })

  it('asks a token function per request', async () => {
    const { fetch, seen } = scripted()
    let n = 0
    const client = new AccountClient({ issuer: ISSUER, accessToken: () => `t${String(++n)}`, fetch })
    await client.getProfile()
    await client.getEmail()
    expect(seen.map((call) => headersOf(call.init)['Authorization'])).toEqual(['Bearer t1', 'Bearer t2'])
  })

  it('answers undefined for a 204', async () => {
    const { fetch } = scripted(() => new Response(null, { status: 204 }))
    await expect(new AccountClient({ issuer: ISSUER, accessToken: 't', fetch }).reauthenticate('p')).resolves.toBeUndefined()
  })

  it('surfaces a refusal as ApiError carrying the problem type and code', async () => {
    const { fetch } = scripted(() =>
      Response.json(
        { type: 'https://kleora.io/problems/reauth-required', status: 401, code: 'reauth_required' },
        { status: 401, headers: { 'Content-Type': 'application/problem+json' } },
      ),
    )
    const error = await new AccountClient({ issuer: ISSUER, accessToken: 't', fetch })
      .changePassword({ newPassword: 'x' })
      .catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).type).toBe('https://kleora.io/problems/reauth-required')
    expect((error as ApiError).problem.document['code']).toBe('reauth_required')
  })

  it('refuses an unusable configuration at construction', () => {
    expect(() => new AccountClient({ issuer: 'acme.kleora.eu', accessToken: 't' })).toThrow(KleoraError)
    expect(() => new AccountClient({ issuer: ISSUER, accessToken: '' })).toThrow(KleoraError)
  })

  it('never shows the token', () => {
    const client = new AccountClient({ issuer: ISSUER, accessToken: 'secret-token' })
    expect(String(client)).not.toContain('secret-token')
    expect(JSON.stringify(client)).not.toContain('secret-token')
    expect(inspect(client)).not.toContain('secret-token')
  })
})

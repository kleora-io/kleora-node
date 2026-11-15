/**
 * The account portal's URL and the `returnTo` shape rules —
 * the same cases `@kleora-io/browser`'s `test/portal.test.ts` and the Python
 * package's `tests/test_portal.py` hold, as cross-referenced copies rather than
 * one fixture, because no SDK depends on another.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { KleoraError } from '../src/errors.js'
import { ACCOUNT_PORTAL_SECTIONS, accountPortalUrl } from '../src/index.js'

const ISSUER = 'https://acme-sandbox.kleora.eu'

function refused(run: () => unknown, fragment: string): void {
  let error: unknown
  try {
    run()
  } catch (caught) {
    error = caught
  }
  expect(error).toBeInstanceOf(KleoraError)
  expect((error as KleoraError).code).toBe('invalid_configuration')
  expect((error as KleoraError).message).toContain(fragment)
}

describe('accountPortalUrl', () => {
  it('is {issuer}/account with the client id', () => {
    expect(accountPortalUrl({ issuer: ISSUER, clientId: 'cl_1' })).toBe(
      'https://acme-sandbox.kleora.eu/account?client_id=cl_1',
    )
  })

  it('opens at a section, and carries return_to encoded', () => {
    const url = new URL(
      accountPortalUrl({
        issuer: `${ISSUER}/`,
        clientId: 'cl_1',
        section: 'security',
        returnTo: 'https://app.example.com/settings?tab=a&b=1',
      }),
    )
    expect(url.origin).toBe(ISSUER)
    expect(url.pathname).toBe('/account/security')
    expect(url.searchParams.get('client_id')).toBe('cl_1')
    expect(url.searchParams.get('return_to')).toBe('https://app.example.com/settings?tab=a&b=1')
    expect(url.href).toContain('return_to=https%3A%2F%2Fapp.example.com%2Fsettings%3Ftab%3Da%26b%3D1')
  })

  it('accepts every section the document declares, and nothing else', () => {
    for (const section of ACCOUNT_PORTAL_SECTIONS) {
      expect(new URL(accountPortalUrl({ issuer: ISSUER, clientId: 'c', section })).pathname).toBe(
        `/account/${section}`,
      )
    }
    refused(
      () => accountPortalUrl({ issuer: ISSUER, clientId: 'c', section: 'tenants' as never }),
      'section must be one of',
    )
  })

  it('has the same sections as the PortalSection enum of account-v1.json', () => {
    const document = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../openapi/account-v1.json'), 'utf8'),
    ) as { components: { schemas: { PortalSection: { enum: string[] } } } }
    expect([...ACCOUNT_PORTAL_SECTIONS]).toEqual(document.components.schemas.PortalSection.enum)
  })

  describe('validates the shape of returnTo, never its membership', () => {
    it.each([
      ['a relative path', '/settings', 'absolute'],
      ['a scheme-relative URL', '//app.example.com/', 'absolute'],
      ['another scheme', 'javascript:alert(1)', 'absolute'],
      ['a fragment', 'https://app.example.com/#top', 'fragment'],
      ['an empty fragment', 'https://app.example.com/#', 'fragment'],
      ['userinfo', 'https://user:pw@app.example.com/', 'userinfo'],
      ['a user alone', 'https://user@app.example.com/', 'userinfo'],
    ])('refuses %s', (_, returnTo, fragment) => {
      refused(() => accountPortalUrl({ issuer: ISSUER, clientId: 'c', returnTo }), fragment)
    })

    it('accepts any absolute http(s) URL, registered or not — the issuer decides that', () => {
      for (const returnTo of ['http://localhost:3000/', 'https://app.example.com/a?b=c']) {
        expect(accountPortalUrl({ issuer: ISSUER, clientId: 'c', returnTo })).toContain('return_to=')
      }
    })
  })

  it('refuses an unusable issuer or an empty client id', () => {
    refused(() => accountPortalUrl({ issuer: 'acme.kleora.eu', clientId: 'c' }), 'issuer')
    refused(() => accountPortalUrl({ issuer: ISSUER, clientId: '' }), 'clientId')
  })
})

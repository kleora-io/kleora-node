/**
 * The parts of the package that are facts about the package rather than
 * behaviour: the version it reports, what it redacts, and that the generated
 * document really is what types a call.
 */

import { describe, expect, expectTypeOf, it } from 'vitest'
import { readFileSync } from 'node:fs'

import { classify, classifyKey, redactKey } from '../src/environment.js'
import { ManagementClient } from '../src/management.js'
import type { components } from '../src/generated/management.js'
import { USER_AGENT, VERSION } from '../src/version.js'

const manifest = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as {
  version: string
  engines: { node: string }
  exports: Record<string, Record<string, string>>
  dependencies: Record<string, string>
}

describe('the manifest', () => {
  it('is the version the User-Agent reports', () => {
    // Every SDK sends `kleora-{package}/{version}`. A literal
    // in `version.ts` is what makes the value available to both builds; this
    // is what stops the literal from drifting.
    expect(VERSION).toBe(manifest.version)
    expect(USER_AGENT).toBe(`kleora-node/${manifest.version}`)
  })

  it('ships both module formats', () => {
    expect(manifest.exports['.']?.['import']).toBe('./dist/index.js')
    expect(manifest.exports['.']?.['require']).toBe('./dist/index.cjs')
    expect(manifest.engines.node).toBe('>=20')
  })

  it('depends on a JOSE library and nothing else at runtime', () => {
    // A JOSE library and the generated client only. express and fastify are optional peers.
    expect(Object.keys(manifest.dependencies)).toEqual(['jose'])
  })
})

/**
 * The classification table, one rule for every SDK.
 *
 * **The same hosts and the same verdicts appear in
 * `@kleora-io/browser`'s and the Python SDK's tests.** Three
 * implementations that agree only by coincidence is the defect this table
 * exists to prevent, so a row added here belongs in the other two as well.
 */
const CLASSIFICATION: ReadonlyArray<readonly [string, string, string]> = [
  ['acme.kleora.eu', 'production', 'a production issuer'],
  ['acme-sandbox.kleora.eu', 'sandbox', 'a sandbox issuer'],
  // The shape sandbox issuers had until 2026-11. Minted nowhere now,
  // and no edge serves it: reading it as sandbox would only widen the guard.
  ['acme.sandbox.kleora.eu', 'production', 'the retired two-label shape'],
  // A Kleora under a base domain carrying the suffix mints this *production*
  // issuer; the rule reads the first label only, so the base never reaches it.
  ['acme.corp-sandbox.internal', 'production', 'a base domain that carries the suffix'],
  // A host that once misled the rule, in its base-domain form: a substring test for
  // `.sandbox.` reads it as sandbox and would pair a `kl_test_` key with it.
  ['acme.corp.sandbox.internal', 'production', 'a base domain that carries the label'],
  ['my-sandbox-app.kleora.eu', 'production', 'the word inside a slug, not at its end'],
  ['my-sandbox-app-sandbox.kleora.eu', 'sandbox', 'that slug’s sandbox side'],
  // `sandbox` is a reserved App slug, and the suffix needs a slug before it.
  ['sandbox.kleora.eu', 'production', 'the bare word'],
  ['-sandbox.kleora.eu', 'production', 'the suffix with nothing before it'],
  ['id-sandbox.localhost:8100', 'sandbox', 'development, with a port'],
  ['id.localhost:8100', 'production', 'development, with a port'],
  ['ACME-SANDBOX.kleora.eu', 'sandbox', 'DNS labels are case-insensitive'],
  ['app.example.com', 'production', 'a customer host announces nothing'],
  ['app-sandbox.example.com', 'sandbox', 'a customer host that does announce it'],
  ['localhost', 'production', 'a single label that is not a sandbox'],
]

describe('classification', () => {
  it.each(CLASSIFICATION)('classifies %s as %s (%s)', (host, kind) => {
    expect(classify(host)).toBe(kind)
  })

  it.each([
    ['kl_test_753aypZz0000', 'sandbox'],
    ['kl_live_4Kd9sQx20000', 'production'],
    ['something-else', null],
  ])('reads %s as a %s key', (key, kind) => {
    expect(classifyKey(key)).toBe(kind)
  })

  it('redacts a key to the 16 characters the API stores as its prefix', () => {
    // The literal prefix plus the first 8 random
    // characters, so a redacted value here matches a key listed there.
    expect(redactKey('kl_test_753aypZzrestofthekey')).toBe('kl_test_753aypZz')
    expect(redactKey('kl_test_753aypZzrestofthekey')).toHaveLength(16)
    expect(redactKey('not-a-key')).toBe('[redacted]')
  })
})

describe('the generated document types the calls', () => {
  const client = new ManagementClient({ apiKey: 'kl_test_x', baseUrl: 'https://api.example.test' })

  // Declared, never invoked: these assertions are about types, and calling
  // them would put a request to a host no test declared on the wire.
  const apps = () => client.get('/api/v1/apps')
  const me = () => client.get('/api/v1/me')
  const create = () => client.post('/api/v1/apps', { body: { name: 'Acme', slug: 'acme' } })
  const remove = () => client.delete('/api/v1/apps/{app_id}', { path: { app_id: 'an-id' } })

  it('gives a list its own schema, not an anonymous object', () => {
    expectTypeOf(apps).returns.resolves.toEqualTypeOf<components['schemas']['AppList']>()
    expectTypeOf(me).returns.resolves.toEqualTypeOf<components['schemas']['MeOut']>()
    expectTypeOf(create).returns.resolves.toEqualTypeOf<components['schemas']['AppOut']>()
    expectTypeOf(remove).returns.resolves.toEqualTypeOf<void>()
  })

  it('refuses a path the document does not declare for that method', () => {
    // @ts-expect-error `/api/v1/me` is a GET; the document declares no POST.
    const wrongMethod = () => client.post('/api/v1/me')
    // @ts-expect-error no such path.
    const wrongPath = () => client.get('/api/v1/nope')

    expect(wrongMethod).toBeTypeOf('function')
    expect(wrongPath).toBeTypeOf('function')
  })

  it('requires the path parameters a path declares', () => {
    // @ts-expect-error `{app_id}` is not optional.
    const missing = () => client.get('/api/v1/apps/{app_id}')

    expect(missing).toBeTypeOf('function')
  })
})

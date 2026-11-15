/**
 * Environment classification, shared by the verifier and the management
 * client.
 *
 * An environment is classified from its host alone: the host's **first** DNS
 * label ends in `-sandbox`, or it is production. That is the same rule
 * `@kleora-io/browser` and `kleora` (Python) apply, and it has to
 * be, because the two ends of one deployment must agree about which
 * environment a host names.
 */

import { EnvironmentMismatch, KleoraError } from './errors.js'

export type EnvironmentKind = 'sandbox' | 'production'

/** A sandbox issuer's first label is its App's slug plus this. */
const SANDBOX_SUFFIX = '-sandbox'

/**
 * A `:port` on the end of a host. `URL.host` carries one and `URL.hostname`
 * does not, and both reach `classify`; stripping it here — as
 * the Python SDK does — is what makes `acme-sandbox.example.com`
 * and `acme-sandbox.example.com:8443` the same question.
 */
const PORT_SUFFIX = /:\d+$/

/**
 * `sandbox` when the host's first DNS label ends in `-sandbox`, `production`
 * otherwise. Case-insensitive, and any `:port` is ignored.
 *
 * **The one rule, for every SDK.** `@kleora-io/browser` and
 * `kleora` (Python) implement this same
 * test, and all three carry the same table of boundary cases in their tests.
 *
 * It is the inverse of how the platform mints an issuer: it builds
 * `{slug}.{base}` for production and `{slug}-sandbox.{base}` for sandbox, an
 * App slug is a *single* DNS label, and no slug may end in `-sandbox` — so the first label ends in `-sandbox` if and
 * only if the environment is, for any base domain, scheme or port.
 *
 * Until 2026-11 the rule was "the second label is `sandbox`",
 * because sandbox issuers were `{slug}.sandbox.{base}`; that shape is minted
 * nowhere any more. Before that it was a substring test for
 * `.sandbox.`, which a base domain carrying the label —
 * `corp.sandbox.internal`, say, whose *production* issuer is
 * `acme.corp.sandbox.internal` — reads as sandbox. Anchoring the test to the
 * one label the platform controls is what keeps the guard from relaxing: a
 * base domain never reaches the first label, so `acme.corp-sandbox.internal`
 * is production here.
 */
export function classify(host: string): EnvironmentKind {
  const first = host.toLowerCase().replace(PORT_SUFFIX, '').split('.')[0] ?? ''
  return first.length > SANDBOX_SUFFIX.length && first.endsWith(SANDBOX_SUFFIX)
    ? 'sandbox'
    : 'production'
}

/** Parse and refuse anything that is not an absolute `http`/`https` URL. */
export function parseAbsolute(name: string, value: string): URL {
  const complaint = `${name} must be an absolute http(s) URL, got '${value}'`
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new KleoraError('invalid_configuration', complaint)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new KleoraError('invalid_configuration', complaint)
  }
  return url
}

/** The prefix an API key of this kind carries. */
export const KEY_PREFIXES: Record<EnvironmentKind, string> = {
  production: 'kl_live_',
  sandbox: 'kl_test_',
}

/**
 * The environment an API key belongs to, from its prefix alone.
 *
 * `null` for anything that is neither prefix: the caller reports that as a
 * configuration error rather than guessing, because a key whose environment
 * cannot be read is a key the guard cannot check.
 */
export function classifyKey(apiKey: string): EnvironmentKind | null {
  if (apiKey.startsWith(KEY_PREFIXES.production)) return 'production'
  if (apiKey.startsWith(KEY_PREFIXES.sandbox)) return 'sandbox'
  return null
}

/**
 * The part of an API key that may be written down.
 *
 * The literal prefix plus the first 8 random
 * characters, which is exactly what the API stores as `prefix` and shows in
 * lists — so a redacted value here matches a log line there.
 */
export function redactKey(apiKey: string): string {
  const kind = classifyKey(apiKey)
  if (kind === null) return '[redacted]'
  return apiKey.slice(0, KEY_PREFIXES[kind].length + 8)
}

/**
 * Refuse a key whose prefix names the other environment.
 *
 * A key whose prefix says nothing is refused too, rather than waved through:
 * a guard that no-ops on "I cannot tell" fails open, and this one exists
 * precisely to stop a credential reaching the wrong environment. Unreachable
 * from `ManagementClient`, whose constructor rejects such a key first, but
 * this function is exported and must not be the weak link if it is called
 * from anywhere else.
 */
export function assertKeyMatches(
  apiKey: string,
  kind: EnvironmentKind,
  what: string,
): void {
  const keyKind = classifyKey(apiKey)
  if (keyKind === null) {
    throw new KleoraError(
      'invalid_configuration',
      `the API key does not start with '${KEY_PREFIXES.production}' or ` +
        `'${KEY_PREFIXES.sandbox}', so the environment it belongs to cannot be checked`,
    )
  }
  if (keyKind !== kind) {
    throw new EnvironmentMismatch(
      `the API key ${redactKey(apiKey)} is a ${keyKind} key but ${what} is ` +
        `${kind}; sandbox and production must not be mixed`,
    )
  }
}

/**
 * Every request this suite makes, recorded: no telemetry, and the recorded
 * network traffic of every test contains only the issuer and API base hosts.
 *
 * The check is worth having as a test rather than as a review habit because
 * the failure it guards against is silent: a dependency that phones home, or
 * a well-meant "check for updates", would not fail any other assertion here.
 * `globalThis.fetch` is wrapped once, before any test file loads, so nothing
 * has to opt in — a call from inside a transitive dependency is recorded the
 * same as one this package makes.
 */

/** Hosts a test has declared to be its issuer or its API base. */
const allowed = new Set<string>(['127.0.0.1', 'localhost', '::1'])

/** Every hostname reached, in order. */
export const contacted: string[] = []

/** Declare a host as this suite's issuer or API base. */
export function allowHost(value: string): void {
  allowed.add(value.includes('//') ? new URL(value).hostname : value)
}

/** Hostnames reached that no test declared. */
export function offenders(): string[] {
  return [...new Set(contacted)].filter((host) => !allowed.has(host))
}

/** Wrap `globalThis.fetch`. Idempotent, so a second setup file is harmless. */
export function record(): void {
  const original = globalThis.fetch
  if ((original as { recorded?: boolean }).recorded === true) return
  const wrapper = async (
    input: Parameters<typeof globalThis.fetch>[0],
    init?: Parameters<typeof globalThis.fetch>[1],
  ): Promise<Response> => {
    const href = typeof input === 'string' || input instanceof URL ? String(input) : input.url
    contacted.push(new URL(href).hostname)
    return original(input, init)
  }
  Object.assign(wrapper, { recorded: true })
  globalThis.fetch = wrapper
}

for (const name of ['KLEORA_TEST_ISSUER', 'KLEORA_TEST_API_BASE'] as const) {
  const value = process.env[name]
  if (value !== undefined && value !== '') allowHost(value)
}

/**
 * The version this package reports in `User-Agent`.
 *
 * A literal rather than an import of `package.json`: the package ships an ESM
 * and a CJS build, and a JSON import is spelled differently in each. A unit
 * test asserts it equals the manifest, so the two cannot drift.
 */
export const VERSION = '0.1.0'

/** `kleora-{package}/{version}`, the value every request sends. */
export const USER_AGENT = `kleora-node/${VERSION}`

/**
 * Regenerate the SDK's API types from the OpenAPI documents Kleora serves.
 *
 *   pnpm generate:client
 *
 * Fetches two deployed documents and writes four files, all committed:
 *
 * - The management API (https://api.kleora.io/api/v1/openapi.json,
 *   `MANAGEMENT_OPENAPI_URL` overrides it):
 *   - `openapi/management-v1.json`: the document itself, pretty-printed;
 *   - `src/generated/management.ts`: the document as TypeScript. It is the
 *     whole of what the package knows about the management API's wire. The
 *     hand-written client in `src/management.ts` is a thin typed `fetch`
 *     wrapper over these paths, so a schema change becomes a client that fails
 *     to compile rather than a request that fails in production.
 * - The end-user self-service API
 *   (https://id.kleora.eu/account/v1/openapi.json, `ACCOUNT_OPENAPI_URL`
 *   overrides it):
 *   - `openapi/account-v1.json`: the document itself. The unit tests read it,
 *     so they hold the hand-written wrappers in `src/account.ts` and
 *     `src/portal.ts` to the document without needing the network;
 *   - `src/generated/account.ts`: the document as TypeScript.
 *
 * CI runs this and fails when any file differs from what is committed, so a
 * change to the deployed API surfaces as a red check rather than as a client
 * that silently disagrees with the server.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import openapiTS, { astToString } from 'openapi-typescript'

const MANAGEMENT_URL = 'https://api.kleora.io/api/v1/openapi.json'
const ACCOUNT_URL = 'https://id.kleora.eu/account/v1/openapi.json'

const MANAGEMENT_BANNER = `/**
 * GENERATED — do not edit. \`pnpm generate:client\` writes it from the
 * deployed management API document (${MANAGEMENT_URL}).
 *
 * The management API's OpenAPI document, as TypeScript: every path, every
 * request body, every response envelope and the RFC 9457 problem document.
 * \`src/management.ts\` gives the pieces their names and adds auth, problem
 * parsing and the environment guard; nothing else imports this file.
 */

`

const ACCOUNT_BANNER = `/**
 * GENERATED — do not edit. \`pnpm generate:client\` writes it from the
 * deployed account API document (${ACCOUNT_URL}).
 *
 * The end-user self-service API's OpenAPI document, as TypeScript.
 * \`src/account.ts\` gives the pieces their names and adds the bearer token and
 * problem parsing; nothing else imports this file.
 */

`

const jobs = [
  {
    url: process.env.MANAGEMENT_OPENAPI_URL || MANAGEMENT_URL,
    document: 'openapi/management-v1.json',
    types: 'src/generated/management.ts',
    banner: MANAGEMENT_BANNER,
  },
  {
    url: process.env.ACCOUNT_OPENAPI_URL || ACCOUNT_URL,
    document: 'openapi/account-v1.json',
    types: 'src/generated/account.ts',
    banner: ACCOUNT_BANNER,
  },
]

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Object keys sorted, array order kept: the committed files then change only
// when the API does, never because the server serialised a mapping differently.
const sorted = (value) =>
  Array.isArray(value)
    ? value.map(sorted)
    : value !== null && typeof value === 'object'
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, sorted(value[key])]),
        )
      : value

for (const job of jobs) {
  const response = await globalThis.fetch(job.url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`GET ${job.url} answered ${response.status}`)
  }
  const document = sorted(await response.json())

  const outputs = [
    [job.document, JSON.stringify(document, null, 2) + '\n'],
    [job.types, job.banner + astToString(await openapiTS(document))],
  ]
  for (const [path, text] of outputs) {
    const output = resolve(root, path)
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, text, 'utf8')
    process.stdout.write(`wrote ${relative(root, output)} from ${job.url}\n`)
  }
}

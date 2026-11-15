# `@kleora-io/node`

Access-token verification, the JWKS cache, the `express` and `fastify`
middlewares, and the typed management client.

Node ≥ 20, ESM and CJS. The only runtime dependency is a JOSE library;
`express` and `fastify` are optional peer dependencies, needed only by the
middleware you actually use.

Kleora's documentation, including how to create an App, register a Client and
issue an API key, is at https://kleora.io/en/docs.

## Install

```bash
npm install @kleora-io/node
```

## Verifying a token

```ts
import { verifyAccessToken } from '@kleora-io/node'

const claims = await verifyAccessToken(token, {
  issuer: process.env.KLEORA_ISSUER!,   // https://acme.kleora.eu
  audience: 'https://api.example.com',    // the environment's api_audience, or the client id
})
```

Everything is checked locally, against the keys the issuer publishes at
`/.well-known/jwks.json`: the header's `typ` (`at+jwt`, RFC 9068 §4) and `alg`,
the `ES256` signature, `iss`, `aud`, `exp` and `iat` with 60 s of clock
tolerance, and the `env` claim against the issuer's own classification.
`/oauth/userinfo` is never called. A trailing `/` on the configured `issuer`
is forgiven; the token's own `iss` is matched exactly.

A failure is a `TokenError` whose `code` is one of:

| Code | Meaning |
| --- | --- |
| `invalid_type` | The header's `typ` is not `at+jwt` — an ID token or a DPoP proof, not an access token. |
| `malformed` | Not a compact JWS, not `ES256`, no `kid`, or a payload missing a claim the platform always mints. |
| `invalid_signature` | The signature does not verify against the key the header names. |
| `issuer_mismatch`, `audience_mismatch`, `expired` | The claim says so. |
| `unknown_kid` | The issuer's key set was read and does not list that `kid`. |
| `issuer_unavailable` | The key set could **not** be read: refused, timed out, non-2xx, or unparseable. Not the caller's fault, and the middlewares answer it 503 rather than 401. |

A sandbox token presented to a production issuer (or the reverse) is an
`EnvironmentMismatch`. A configuration this package cannot verify with — no
issuer, a relative URL, an empty audience, a negative `clockTolerance` — is a
`KleoraError('invalid_configuration')`, never a token error.

### The JWKS cache

One cache per issuer, shared across every verification in the process. It
holds the document for the `max-age` the issuer publishes (300 s), refetches
at most once every 60 s when a token names a `kid` it does not know, and keeps
serving a stale set for up to twice the TTL while the endpoint is
unreachable — then fails closed. Rotations need no refetch at all in the
ordinary case: the platform publishes the next key before it signs anything.

Every fetch sends `User-Agent: kleora-node/{version}` — the same header
the management client sends, so an operator reading an issuer's access log can
tell an SDK's key fetch from anything else — and is bounded by a 5 s timeout
(`JwksCacheOptions.timeout`), and concurrent verifications share one request — which is exactly why the timeout
matters: without it a single blackholed issuer would hold every request slot in
your API, not just the first. Intervals are measured on a monotonic clock, so an
NTP correction cannot wedge the refetch floor.

`jwksFor(issuer)` returns the process-wide cache and **only the first call's
options apply**. Construct a `JwksCache` yourself and pass it as
`VerifyOptions.jwks` when you need your own settings.

## Middlewares

```ts
import { express as kleora, requirePermission } from '@kleora-io/node'

app.use(kleora({ issuer: process.env.KLEORA_ISSUER!, audience: 'https://api.example.com' }))
app.get('/invoices', requirePermission('invoices:read'), (req, res) => {
  res.json({ tenant: req.kleora?.tenant })
})
```

```ts
import Fastify from 'fastify'
import { fastify as kleora, requirePermission } from '@kleora-io/node'

const app = Fastify()
await app.register(kleora({ issuer, audience }))
app.get('/invoices', { preHandler: requirePermission('invoices:read') }, (request) => ({
  tenant: request.kleora?.tenant,
}))
```

Both answer RFC 9457 problem documents, and the three causes get three answers:

| Cause | Answer |
| --- | --- |
| No credential, or one that does not verify | 401 `unauthenticated`, with `WWW-Authenticate: Bearer` |
| `requirePermission` and the claim is absent | 403 `insufficient-permission` |
| The issuer's JWKS could not be read at all | 503 `issuer-unavailable` |
| This service is misconfigured, or something else went wrong | 500, through your own error handler (`next(error)` / fastify's handler) |

Answering 401 to all of them is what makes an outage and a missing environment
variable look like a fleet of bad credentials — and tells every client to
discard a good token and re-authenticate against the issuer that is already
down.

`requirePermission` is the same function in both — an express middleware and a
fastify `preHandler`. On a route the authentication middleware never reached it
answers 401, not 403.

The 401 body says only that the request could not be authenticated; naming the
check that failed would hand a prober the difference between "no header" and
"expired". Pass a `logger` to see the reason:

```ts
app.use(kleora({ issuer, audience, logger: (error) => req.log.warn(error) }))
```

`logger` also receives internal failures; without one they still reach
`console.error`, because a 500 nobody logged is worse than a noisy log.

The middlewares validate their options when you **build** them, so a service
started without `KLEORA_ISSUER` fails at boot with a message naming the
problem rather than 401-ing every request.

When the server truncated the `permissions` claim at 200 entries
(`permissions_truncated: true`), a 403 from `requirePermission` may be denying a
permission the user actually holds; the `detail` says so, and coarser roles are
the fix.

### `request.kleora` in TypeScript

**Express needs nothing.** Importing this package declares `kleora?: Claims`
on express's `Request`, so the example above compiles as written. The
declaration costs you no dependency: `Express.Request` is a *global* namespace
that `@types/express` merges from, so with express installed the member appears
on `req`, and without it the declaration is an unused global and nothing more.

It is **optional**, and has to be — a request that never reached the middleware
genuinely carries no claims, and a non-optional declaration would let a route
that forgot `app.use(kleora(...))` compile and then read a property of
`undefined` in production. So `req.kleora?.tenant`, or narrow once:

```ts
if (!req.kleora) return res.status(401).end()
const { tenant, permissions } = req.kleora   // Claims, no `?.` from here on
```

**Fastify needs three lines**, once, in your application:

```ts
import type { Claims } from '@kleora-io/node'

declare module 'fastify' {
  interface FastifyRequest { kleora?: Claims }
}
```

The asymmetry is not an oversight. `declare module 'fastify'` is a module
*augmentation*: TypeScript resolves the name, so shipping it from this package
would put a `TS2664` — "module 'fastify' cannot be found" — into the `.d.ts` of
everyone who installed us without fastify, which is most people. The express
form resolves nothing, so it is safe to ship and is shipped.

## The management client

```ts
import { ManagementClient } from '@kleora-io/node'

const kleora = new ManagementClient({
  apiKey: process.env.KLEORA_API_KEY!,           // kl_live_… or kl_test_…
  issuer: 'https://acme-sandbox.kleora.eu', // optional, and worth setting
})

const users = await kleora.get('/api/v1/environments/{environment_id}/users', {
  path: { environment_id },
  query: { limit: 50 },
})
```

`get`, `post`, `put`, `patch` and `delete` are typed straight off the
generated document: the path has to exist for that method, the path parameters
and body are required when the document says so, and the result is the
response schema. Nothing is hand-written per endpoint.

- **The environment guard.** With `issuer` configured, the key's prefix is
  compared with it **at construction**: a `kl_test_` key aimed at production
  throws `EnvironmentMismatch` from `new ManagementClient(...)`, synchronously,
  before there is an object to call anything on and before any request leaves
  the process. That check needs no network, so it does not wait for one.
  Without `issuer` there is nothing local to compare against, and the guard
  defers to the first call: one `GET /me`, whose `environment.kind` is then
  checked against the prefix and remembered for every later call. Only a
  mismatch is remembered — a transient failure on that `GET /me` is retried on
  the next call rather than poisoning the client. The caller's `requestId`, if
  it supplied one, travels with the guard's request too.
- **Timeouts.** 10 s by default (`timeout`), on every request including the
  guard's. A caller's own `signal` still works alongside it.
- **Errors** are `ApiError`, carrying `type`, `status`, `detail`, `errors[]`
  and `requestId`, with the whole problem document plus `Retry-After` and
  `Idempotency-Replayed` under `problem`. `requestId` is the document's
  `request_id`, falling back to the `X-Request-Id` response header when the
  body has none — a 502 an intermediary wrote still names the request to quote
  at support.
- **The key** is never logged: `toString`, `util.inspect` and `JSON.stringify`
  show only its 16-character prefix.
- `baseUrl` defaults to `https://api.kleora.io`, and must be an
  absolute `http(s)` URL. A value that already ends in `/api/v1` — the way
  `NUXT_PUBLIC_API_BASE` spells it — is accepted and trimmed.

Every request sends `User-Agent: kleora-node/{version}` and forwards
`X-Request-Id` when the caller supplies one. Nothing is sent anywhere but the
configured issuer and API base.

## The account portal and the self-service API

**Both work only for a Client that lists `self_service` in its
`allowed_scopes`** (that list is the consent). For any other Client
the portal opens and says that managing the account there is not offered, and no
token carrying the scope can be issued.

```ts
import { AccountClient, accountPortalUrl } from '@kleora-io/node'

// A link a server renders: a pure function, no request.
const href = accountPortalUrl({ issuer, clientId, section: 'security', returnTo: 'https://app.example.com/' })

// The person's own token — the bearer their request arrived with — not an API key.
const account = new AccountClient({ issuer, accessToken: bearer })
const profile = await account.getProfile()
```

`returnTo` must be an absolute `http`/`https` URL with no fragment and no
userinfo, or `KleoraError('invalid_configuration')`; the portal shows it as its
"back" link only when it equals one of the Client's `post_logout_redirect_uris`.
Link the portal as a new tab, never a frame (it refuses to be framed).
`AccountClient` has one method per `/account/v1/*` operation, named for what it
does; sensitive ones answer `ApiError` `…/reauth-required` until
`reauthenticate(password)` has run in the last five minutes.

## Development

```bash
pnpm install
pnpm test        # unit suite
pnpm lint
pnpm typecheck   # also compiles test/express-example.test-d.ts, the README's express example
pnpm build
```

The unit suite starts its own HTTP servers (an issuer publishing a real JWKS,
a stand-in management API), so it needs nothing running. Every request the
whole suite makes is recorded, and each file asserts that nothing reached a
host it did not declare.

### The generated client

`pnpm generate:client` writes four files from the OpenAPI documents Kleora
serves. Never edit any of them by hand.

| Document | Committed copy | Types |
| --- | --- | --- |
| https://api.kleora.io/api/v1/openapi.json (`MANAGEMENT_OPENAPI_URL` overrides it) | `openapi/management-v1.json` | `src/generated/management.ts` |
| https://id.kleora.eu/account/v1/openapi.json (`ACCOUNT_OPENAPI_URL` overrides it) | `openapi/account-v1.json` | `src/generated/account.ts` |

The unit tests read the committed copies, so they hold the hand-written
wrappers to the documents without needing the network. CI regenerates all four
files and fails when they differ from what is committed, so a change to the
deployed API shows up as a red check: run `pnpm generate:client`, adjust
`src/management.ts` or `src/account.ts` if an operation moved, and commit the
result.

### Contract tests

The contract suite in `test/contract/` provisions an App on a live Kleora
environment, signs a user in through the hosted pages, rotates signing keys and
calls the management and self-service APIs. **It does not run in CI**: it needs
a live environment, an account owner's credentials and a Client with a
registered redirect URI, none of which this repository holds. It skips when any
of the variables below is absent, so `pnpm test` stays green without one:

```bash
KLEORA_TEST_ISSUER=<issuer> \
KLEORA_TEST_API_BASE=<management API base>/api/v1 \
KLEORA_TEST_CLIENT_ID=<client id> \
KLEORA_TEST_REDIRECT_URI=<a registered redirect URI> \
KLEORA_TEST_USERNAME=<an account owner's email> \
KLEORA_TEST_PASSWORD=<their password> \
pnpm test
```

Set `KLEORA_TEST_REQUIRE_LIVE=1` as well to make a missing variable a failure
rather than a skip.

### Releasing

Bump `version` in `package.json` (and the literal in `src/version.ts`, which a
unit test holds equal to it) on `main`, then run the **Release** workflow
(`.github/workflows/release.yml`) by hand. It builds from a clean install of
the committed lockfile and publishes to npm by trusted publishing, with
provenance; no token is stored anywhere.

## Licence

[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) —
the full, unmodified text ships inside this package, so it travels with
whatever you install. Apache-2.0 rather than a shorter permissive licence
because of the explicit patent grant in §3, which is the term a legal review of
a vendor SDK asks about.

**There is no `NOTICE` file**, here or in any other Kleora package, and that
is deliberate. Apache-2.0 §4(d) turns a `NOTICE` into an obligation that
propagates: every downstream redistributor of a work that has one must
reproduce its contents. Kleora is the sole copyright holder of the code in
these packages, so there is nothing to attribute, and a `NOTICE` would place a
requirement on you in exchange for nothing. Third-party dependencies keep their
own licences and their own notices; this package redistributes none of them —
its manifest names them and your installer fetches them.

Apache-2.0 covers what you install and compile into your own product: the
browser, Node, Nuxt and Python SDKs. It does **not** cover the rest of
Kleora — the hosted service, the API servers, the management console and the
hosted authentication pages are proprietary.

/**
 * A **compile-time** test: the README's express example, with nothing added.
 *
 * This file is never executed. `tsc --noEmit` over `test/**` is the assertion —
 * `pnpm typecheck`, which CI runs — and the thing it asserts is that a TypeScript
 * caller who installs this package and follows our own documentation compiles
 * without writing a `declare global` of their own and without an `any`. That
 * depends on the augmentation in `src/middleware.ts`;
 * deleting it makes every `req.kleora` below `TS2339: Property 'kleora'
 * does not exist on type 'Request'`.
 *
 * `.test-d.ts`, not `.test.ts`: vitest's `include` is `test/**\/*.test.ts`, so
 * a runtime runner does not collect a file that has no runtime assertions in
 * it. `test/middleware.test.ts` is where the behaviour is proved against real
 * servers; this is where the *types* are.
 */

import createExpress from 'express'

import { express as kleora, requirePermission, type Claims } from '../src/index.js'

/** `true` only for an exact match — `any` on either side is not one. */
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false

// ─── the README's example, verbatim but for `?.` (see below) ───
const app = createExpress()
app.use(kleora({ issuer: process.env.KLEORA_ISSUER!, audience: 'https://api.example.com' }))
app.get('/invoices', requirePermission('invoices:read'), (req, res) => {
  res.json({ tenant: req.kleora?.tenant })
})

/**
 * The member express's own `Request` carries, checked for shape *and* for not
 * being `any`.
 *
 * An assertion that only read `req.kleora.tenant` would pass just as happily
 * if the property were typed `any`, which is the outcome this file exists to
 * avoid — a caller reaching for `as any` gets no checking and does not know it.
 */
app.get('/whoami', (req, res) => {
  // `= true` is the assertion: `Equal` resolves to `false` — and this line stops
  // compiling — for `any`, for a wider union, or for anything but `Claims`.
  const attachedIsClaims: Equal<typeof req.kleora, Claims | undefined> = true

  // And the claims themselves are typed, not opaque: this line stops compiling
  // if `Claims` ever stops carrying `tenant` as an optional string.
  const tenant: string | undefined = req.kleora?.tenant
  res.json({ tenant, attachedIsClaims })
})

/**
 * `?.` is the one deviation from the documented snippet, which writes
 * `req.kleora.tenant`.
 *
 * The augmentation is **optional** by design — a request that never went
 * through the middleware has no claims — so the documented snippet needs that one
 * character. Declaring it non-optional to save it would let a route that forgot
 * `app.use(kleora(...))` compile and then read a property of `undefined` in
 * production, which is precisely the mistake `requirePermission` answers 401
 * rather than 403 to avoid.
 */
export const specExampleCompiles = true

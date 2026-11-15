/**
 * `request.kleora` for **fastify's** own type, and only fastify's.
 *
 * The express half of this file lives in `src/middleware.ts` and is
 * now shipped with the package: `declare global { namespace Express }` resolves
 * nothing and imports nothing, so it costs a consumer without express exactly
 * one unused global. Deleting it from here is deliberate and load-bearing —
 * `test/middleware.test.ts` reads `request.kleora` off a real express
 * `Request`, so if the shipped augmentation is ever removed these tests stop
 * compiling. A copy kept here would have hidden that.
 *
 * Fastify's stays, because `declare module 'fastify'` is a module
 * *augmentation*: TypeScript resolves the name, and shipping it would put
 * `TS2664` into the `.d.ts` of every consumer who installed this package
 * without fastify. An application using the fastify plugin writes these three
 * lines once — the README has them — and this suite is that application here.
 */

import type { Claims } from '../src/types.js'

declare module 'fastify' {
  interface FastifyRequest {
    kleora?: Claims
  }
}

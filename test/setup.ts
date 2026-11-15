/**
 * Loaded before every test file (`vitest.config.ts` → `setupFiles`).
 *
 * It installs the network recorder and asserts, once the file's tests are
 * done, that nothing reached a host the file did not declare.
 */

import { afterAll, expect } from 'vitest'

import { contacted, offenders, record } from './network.js'

record()

afterAll(() => {
  expect(offenders(), `contacted: ${[...new Set(contacted)].join(', ')}`).toEqual([])
})

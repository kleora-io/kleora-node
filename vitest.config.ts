import { defineConfig } from 'vitest/config'

// The `node` environment, which is the only one that makes sense: this
// package is the backend half and its tests boot real express and fastify
// apps on ephemeral ports.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Every file gets the network recorder and the assertion that nothing
    // reached a host it did not declare.
    setupFiles: ['./test/setup.ts'],
    // The contract suite talks to a running stack; the unit suite does not.
    // 30 s covers a cold JWKS fetch and a hosted login walked by hand.
    testTimeout: 30_000,
  },
})

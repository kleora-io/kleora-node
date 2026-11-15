import { defineConfig } from 'tsup'

// ESM *and* CJS, unlike `@kleora-io/browser` (Node ≥ 20, ESM and CJS
// builds). A backend package cannot pick
// one: a Nuxt or tsx service imports it and an older express service still
// `require`s it, and neither is going to change for an authentication
// library. The dual-package hazard the browser package avoids by shipping one
// format is real here too — an `instanceof ApiError` across the two copies is
// false — but a process loads one format or the other, not both.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node20',
  platform: 'node',
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
})

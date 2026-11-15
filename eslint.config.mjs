// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // `src/generated/` is written by `pnpm generate:client` and never edited by
  // hand, so a lint rule can only ever be satisfied by editing it. `tsc` still
  // covers it; see tsconfig.json.
  { ignores: ['dist/**', 'src/generated/**'] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // The tests build requests and responses by hand and reach into express
    // and fastify objects this package describes only structurally; the
    // package itself must not.
    files: ['test/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['**/*.mjs', '*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // The generation script runs under Node, outside the tsconfig `tsc` reads,
    // so the globals it uses have to be declared rather than inferred.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', URL: 'readonly' },
    },
  },
)

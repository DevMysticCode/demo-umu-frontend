import { defineConfig } from 'vitest/config'

// Composables under test are plain functions that rely on Nuxt's
// auto-import for `$fetch`, `useRuntimeConfig`, and the token helpers
// (useAuthToken.ts) - there are no explicit import statements for them
// in the composable source (Nuxt injects those at build time). Rather
// than pull in the full `@nuxt/test-utils` Nuxt runtime (slow, and this
// app has no SSR-dependent logic in the composables below), tests stub
// those few globals directly - see test/setup.ts.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['composables/**/*.spec.ts', 'test/**/*.spec.ts'],
  },
})

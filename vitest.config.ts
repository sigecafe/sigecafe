import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: ['./tests/setup.ts'],
    environmentOptions: {
      nuxt: {
        mock: {
          // Mock features for tests
        },
      },
    },
    globals: true,
    testTimeout: 20000,
  },
})

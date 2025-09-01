import { setup } from "@nuxt/test-utils/e2e";

/**
 * Setup function for e2e tests
 *
 * This ensures we have the correct URL for test navigation
 */
export default async function setupTests() {
  await setup({
    // Use a stable localhost URL for testing
    rootDir: process.cwd(),
    browser: true,
    browserOptions: {
      type: "chromium",
    },
  });
}

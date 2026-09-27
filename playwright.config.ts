import { defineConfig, devices } from '@playwright/test';

/**
 * Runs against the built site through `astro preview`, not the dev server: the
 * dev toolbar injects its own headings and focusable elements, and a 404 needs
 * the real static output to come back with a real 404 status.
 *
 * Point BASE_URL at a deployment to run the same suite against it:
 *   BASE_URL=https://susnik.dev npm run test:e2e
 */
const external = process.env.BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: external ?? 'http://localhost:4399',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: external
    ? undefined
    : {
        command: 'npm run build && astro preview --port 4399',
        url: 'http://localhost:4399',
        // Never reuse: a preview left running from another branch would be
        // tested instead of this build, and pass or fail for the wrong code.
        // A busy port fails loudly instead.
        reuseExistingServer: false,
        timeout: 120_000,
      },
});

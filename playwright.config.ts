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

// The build under test reads its b-sides from fixtures, so they can be tested
// before a real one exists. Set here, it reaches both the build the web server
// runs and the test workers, which read the same folder to know what to expect.
if (!external) process.env.NOTES_DIR = 'tests/fixtures/notes';

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
        // --ignore-lock keeps the server in the foreground. Astro 7 sends
        // `astro preview` to the background when it detects an AI agent
        // running it, and Playwright then sees its process exit early while
        // an orphaned server keeps the port.
        command: 'npm run build && astro preview --port 4399 --ignore-lock',
        url: 'http://localhost:4399',
        // Never reuse: a preview left running from another branch would be
        // tested instead of this build, and pass or fail for the wrong code.
        // A busy port fails loudly instead.
        reuseExistingServer: false,
        timeout: 120_000,
      },
});

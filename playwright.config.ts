import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the multi-website demo.
 * See docs/CODEBASE_GUIDE.md for conventions.
 *
 * Projects are split by website (and intended to be split by browser later).
 * Each project sets its own baseURL so page objects can call page.goto('/...')
 * rather than hard-coding hosts.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'saucedemo-chromium',
      testDir: './tests/saucedemo',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
        // SauceDemo tags interactive elements with `data-test`, not `data-testid`.
        // This lets page objects use `page.getByTestId('login-button')`.
        testIdAttribute: 'data-test',
      },
    },
    {
      name: 'wdu-chromium',
      testDir: './tests/webdriveruniversity',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://webdriveruniversity.com',
      },
    },

    // Cross-browser coverage — uncomment when you need it.
    // {
    //   name: 'saucedemo-firefox',
    //   testDir: './tests/saucedemo',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     baseURL: 'https://www.saucedemo.com',
    //     testIdAttribute: 'data-test',
    //   },
    // },
    // {
    //   name: 'saucedemo-webkit',
    //   testDir: './tests/saucedemo',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     baseURL: 'https://www.saucedemo.com',
    //     testIdAttribute: 'data-test',
    //   },
    // },
    // {
    //   name: 'wdu-firefox',
    //   testDir: './tests/webdriveruniversity',
    //   use: { ...devices['Desktop Firefox'], baseURL: 'https://webdriveruniversity.com' },
    // },
    // {
    //   name: 'wdu-webkit',
    //   testDir: './tests/webdriveruniversity',
    //   use: { ...devices['Desktop Safari'], baseURL: 'https://webdriveruniversity.com' },
    // },
  ],
});

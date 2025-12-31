import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Xchange Egypt Frontend E2E Tests
 *
 * Features:
 * - Multi-browser testing (Chrome, Firefox, Safari)
 * - Mobile & Tablet device testing
 * - RTL/Arabic language support
 * - Screenshot & video capture on failure
 * - HTML report generation
 * - Vercel preview URL support
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL ||
                process.env.VERCEL_PREVIEW_URL ||
                'http://localhost:3000';

export default defineConfig({
  testDir: './e2e/tests',

  // Test timeout
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // Run tests in parallel for speed
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
        ['github'],
      ]
    : [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
      ],

  // Shared settings for all projects
  use: {
    baseURL,

    // Trace & evidence collection
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    // Locale and timezone for Egypt
    locale: 'ar-EG',
    timezoneId: 'Africa/Cairo',

    // Navigation timeout
    navigationTimeout: 30000,
    actionTimeout: 15000,

    // Ignore HTTPS errors for preview URLs
    ignoreHTTPSErrors: true,

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'ar,en',
    },
  },

  // Test projects for different browsers/devices
  projects: [
    // =====================
    // Desktop Browsers
    // =====================
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // =====================
    // Mobile Devices
    // =====================
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        locale: 'ar-EG',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        locale: 'ar-EG',
      },
    },

    // =====================
    // Tablet Devices
    // =====================
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro 11'],
        locale: 'ar-EG',
      },
    },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Folder for test snapshots
  snapshotDir: './e2e/snapshots',

  // Web server configuration for local development
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});

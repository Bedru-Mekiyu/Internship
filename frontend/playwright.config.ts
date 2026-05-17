import { defineConfig, devices } from '@playwright/test';

const previewHost = '127.0.0.1';
const previewPort = 4173;
const previewUrl = `http://${previewHost}:${previewPort}`;
const reuseDist = process.env.PLAYWRIGHT_REUSE_BUILD === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  
  workers: process.env.CI ? 2 : undefined,
  
  reporter: process.env.CI
    ? [
        ['line'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'playwright-report/test-results.json' }],
      ]
    : 'list',

  use: {
    ...devices['Desktop Chrome'],
    baseURL: previewUrl,
    
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    httpCredentials: {
      username: 'test',
      password: 'test',
    },
    
    ignoreHTTPSErrors: true,
  },

  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.1,
    },
  },

  timeout: 60000,
  
  webServer: {
    command: reuseDist
      ? `npx vite preview --host ${previewHost} --port ${previewPort}`
      : `npm run build && npx vite preview --host ${previewHost} --port ${previewPort}`,
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
    timeout: reuseDist ? 60_000 : 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      timeout: 120000,
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
      timeout: 120000,
    },
  ],
});
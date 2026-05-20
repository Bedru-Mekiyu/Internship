import { defineConfig, devices } from '@playwright/test';

const previewHost = '127.0.0.1';
const previewPort = 4173;
const previewUrl = `http://${previewHost}:${previewPort}`;
const reuseDist = process.env.PLAYWRIGHT_REUSE_BUILD === '1';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: !isCI,
  forbidOnly: isCI,
  
  retries: isCI ? 1 : 0,
  
  workers: isCI ? 2 : undefined,
  
  reporter: isCI
    ? [
        ['line'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'playwright-report/test-results.json' }],
      ]
    : 'list',

  use: {
    ...devices['Desktop Chrome'],
    baseURL: previewUrl,
    
    trace: isCI ? 'on-first-retry' : 'on-demand',
    screenshot: isCI ? 'only-on-failure' : 'off',
    video: isCI ? 'retain-on-failure' : 'off',
    
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
    reuseExistingServer: !isCI,
    timeout: reuseDist ? 60_000 : 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  projects: isCI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] }, timeout: 120000 },
        { name: 'webkit', use: { ...devices['Desktop Safari'] }, timeout: 120000 },
      ],
});
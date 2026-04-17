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
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: previewUrl,
    trace: 'on-first-retry',
  },
  webServer: {
    command: reuseDist
      ? `npx vite preview --host ${previewHost} --port ${previewPort}`
      : `npm run build && npx vite preview --host ${previewHost} --port ${previewPort}`,
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
    timeout: reuseDist ? 60_000 : 120_000,
  },
});

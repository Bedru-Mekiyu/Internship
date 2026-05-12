import { test as base, expect } from '@playwright/test';
import { createMockApp, type MockApp } from './mockApp';

type Fixtures = {
  app: MockApp;
};

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    const app = createMockApp();
    await app.install(page);
    await use(app);
  },
});

export { expect };

import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3456',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3456' },
});

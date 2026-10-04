import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

for (const line of readFileSync(resolve(process.cwd(), '.env.e2e'), 'utf8').split(/\r?\n/)) {
  const separator = line.indexOf('=');
  if (separator > 0 && !line.startsWith('#')) {
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1);
    process.env[key] = value;
  }
}

const baseURL = 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --mode e2e --host 127.0.0.1 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
});

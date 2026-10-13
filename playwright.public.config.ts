/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Public pages read live school data, so they must be tested against the
// real Supabase project (.env) — NOT the e2e fixture project (.env.e2e)
// that phase2.spec.ts signs in to. This file loads .env into process.env
// so specs can also cross-check rendered content against the REST API.
for (const line of readFileSync(resolve(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
  const separator = line.indexOf('=');
  if (separator > 0 && !line.startsWith('#')) {
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1);
    process.env[key] = value;
  }
}

// Default: the local dev server. Override to smoke-test any deployment:
//   BASE_URL=https://jolnhs-website.vercel.app npx playwright test --config playwright.public.config.ts
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const isExternal = !baseURL.includes('127.0.0.1') && !baseURL.includes('localhost');

export default defineConfig({
  testDir: './e2e',
  testMatch: 'public-pages.spec.ts',
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
  // No webServer when targeting a deployed site — there's nothing to boot.
  ...(isExternal
    ? {}
    : {
        webServer: {
          command: 'npm run dev -- --host 127.0.0.1 --strictPort',
          url: baseURL,
          // The developer's own `npm run dev` session doubles as the test
          // target — it's already serving the real project on 5173.
          reuseExistingServer: true,
          timeout: 120000,
        },
      }),
});

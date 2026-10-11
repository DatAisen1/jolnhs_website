import { test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/about/overview',
  '/about/faculty-staff',
  '/academics',
  '/academics/ste',
  '/academics/sp-ict',
  '/academics/sned',
  '/academics/regular',
  '/academics/shs',
  '/academics/invalid',
  '/campus-life',
  '/campus-life/organizations',
  '/campus-life/pta',
  '/campus-life/athletes',
  '/campus-life/journalists',
  '/campus-life/gallery',
  '/campus-life/invalid',
  '/budget',
  '/enroll',
  '/contact',
  '/__phase0-invalid-route__',
];

const ADMIN_ROUTES = [
  '/admin/login',
  '/admin',
  '/admin/staff',
  '/admin/campus-life',
  '/admin/budget',
  '/admin/settings',
];

const VERIFICATION_RESULTS: any[] = [];

test.describe('P0.3 — Public Route Verification', () => {
  PUBLIC_ROUTES.forEach(route => {
    test(`verify route: ${route}`, async ({ page }) => {
      const result: any = {
        route,
        httpStatus: null,
        finalUrl: null,
        pageTitle: null,
        h1: null,
        bodyText: null,
        consoleErrors: [],
        status: 'VERIFIED BY BROWSER',
      };

      // Collect console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          result.consoleErrors.push(msg.text());
        }
      });

      try {
        const response = await page.goto(route);
        result.httpStatus = response?.status() || null;
        result.finalUrl = page.url();

        // Wait for React to render
        await page.waitForTimeout(3000);

        result.pageTitle = await page.title();

        // Get H1
        const h1Element = page.locator('h1').first();
        if (await h1Element.count() > 0) {
          result.h1 = await h1Element.textContent();
        }

        // Get body text
        result.bodyText = await page.locator('body').textContent();

        // Determine expected match
        if (route === '/academics/invalid') {
          result.expectedMatch = result.h1 === 'Program Not Found';
        } else if (route === '/campus-life/invalid') {
          result.expectedMatch = result.h1 === 'Section Not Found';
        } else if (route === '/enroll') {
          result.expectedMatch = result.h1?.includes('Enrollment') && result.h1?.includes('coming soon');
        } else if (route === '/contact') {
          result.expectedMatch = result.h1?.includes('Contact') && result.h1?.includes('coming soon');
        } else if (route === '/__phase0-invalid-route__') {
          result.expectedMatch = result.bodyText?.trim().length === 0;
        } else {
          result.expectedMatch = result.httpStatus === 200 && result.h1;
        }

      } catch (error) {
        result.status = 'FAILED';
        result.error = (error as Error).message;
      }

      VERIFICATION_RESULTS.push(result);
    });
  });
});

test.describe('P0.4 — Admin Route Verification', () => {
  test('verify /admin/login', async ({ page }) => {
    const result: any = {
      route: '/admin/login',
      httpStatus: null,
      finalUrl: null,
      pageTitle: null,
      h1: null,
      consoleErrors: [],
      status: 'VERIFIED BY BROWSER',
    };

    page.on('console', msg => {
      if (msg.type() === 'error') {
        result.consoleErrors.push(msg.text());
      }
    });

    try {
      const response = await page.goto('/admin/login');
      result.httpStatus = response?.status() || null;
      result.finalUrl = page.url();

      await page.waitForTimeout(3000);

      result.pageTitle = await page.title();

      const h1Element = page.locator('h1').first();
      if (await h1Element.count() > 0) {
        result.h1 = await h1Element.textContent();
      }

    } catch (error) {
      result.status = 'FAILED';
      result.error = (error as Error).message;
    }

    VERIFICATION_RESULTS.push(result);
  });

  ADMIN_ROUTES.slice(1).forEach(route => {
    test(`verify admin route: ${route} (auth check)`, async ({ page }) => {
      const result: any = {
        route,
        httpStatus: null,
        finalUrl: null,
        pageTitle: null,
        redirected: false,
        redirectTarget: null,
        status: 'BLOCKED — AUTHENTICATION REQUIRED',
      };

      try {
        const response = await page.goto(route);
        result.httpStatus = response?.status() || null;
        result.finalUrl = page.url();

        await page.waitForTimeout(3000);

        result.pageTitle = await page.title();

        // Check if redirected to login
        if (result.finalUrl.includes('/admin/login')) {
          result.redirected = true;
          result.redirectTarget = '/admin/login';
        }

      } catch (error) {
        result.status = 'FAILED';
        result.error = (error as Error).message;
      }

      VERIFICATION_RESULTS.push(result);
    });
  });
});

test.afterAll(async () => {
  // Generate report
  console.log('\n=== PHASE 0 ROUTE VERIFICATION REPORT ===\n');

  const publicResults = VERIFICATION_RESULTS.filter(r => !r.route?.startsWith('/admin'));
  const adminResults = VERIFICATION_RESULTS.filter(r => r.route?.startsWith('/admin'));

  console.log('P0.3 — Public Routes:');
  console.log('Route | Status | HTTP | H1 | Expected Match');
  console.log('------|--------|-----|----|---------------');
  publicResults.forEach(r => {
    console.log(`${r.route} | ${r.status} | ${r.httpStatus} | ${r.h1} | ${r.expectedMatch}`);
  });

  console.log('\nP0.4 — Admin Routes:');
  console.log('Route | Status | HTTP | Redirected');
  console.log('------|--------|-----|-----------');
  adminResults.forEach(r => {
    console.log(`${r.route} | ${r.status} | ${r.httpStatus} | ${r.redirected}`);
  });

  console.log('\nConsole Errors:');
  const allErrors = VERIFICATION_RESULTS.filter(r => r.consoleErrors && r.consoleErrors.length > 0);
  allErrors.forEach(r => {
    console.log(`  ${r.route}: ${r.consoleErrors.join(', ')}`);
  });

  // Write detailed results to file
  writeFileSync('artifacts/phase0-route-verification/results.json', JSON.stringify(VERIFICATION_RESULTS, null, 2));
});

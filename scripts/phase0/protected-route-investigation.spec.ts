import { test } from '@playwright/test';

const PROTECTED_ROUTES = [
  '/admin',
  '/admin/staff',
  '/admin/campus-life',
  '/admin/budget',
  '/admin/settings',
];

test.describe('ProtectedRoute Behavior Investigation', () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies and storage before each test
    await context.clearCookies();
  });

  PROTECTED_ROUTES.forEach(route => {
    test(`investigate ${route} - unauthenticated access`, async ({ page }) => {
      const result: any = {
        route,
        initialUrl: null,
        httpStatus: null,
        finalUrl: null,
        pageTitle: null,
        mainHeading: null,
        bodyText: null,
        visibleRedirectMessage: null,
        consoleErrors: [],
        status: 'INVESTIGATING',
      };

      // Collect console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          result.consoleErrors.push(msg.text());
        }
      });

      try {
        // Clear localStorage first
        await page.goto('/admin/login');
        await page.evaluate(() => {
          localStorage.clear();
        });

        // Go to the protected route
        const response = await page.goto(route);
        result.initialUrl = route;
        result.httpStatus = response?.status() || null;

        // Wait for the page to stabilize - give React Router time to navigate
        // Also wait for auth loading to complete
        await page.waitForTimeout(8000);

        // Check the URL after navigation
        result.finalUrl = page.url();
        result.pageTitle = await page.title();

        // Get the body text
        result.bodyText = await page.locator('body').textContent();

        // Check for "Checking session…" message (ProtectedRoute loading state)
        const checkingSession = await page.locator('text=Checking session').count();
        result.visibleRedirectMessage = checkingSession > 0 ? 'Checking session...' : null;

        // Get main heading
        const h1Element = page.locator('h1').first();
        if (await h1Element.count() > 0) {
          result.mainHeading = await h1Element.textContent();
        }

        // Check if we're on the login page
        if (result.finalUrl.includes('/admin/login')) {
          result.status = 'REDIRECTED TO LOGIN';
        } else if (result.finalUrl === result.initialUrl) {
          result.status = 'NO REDIRECT - STAYED ON PROTECTED ROUTE';
        } else {
          result.status = 'REDIRECTED ELSEWHERE';
        }

        // Additional check: wait a bit longer to see if redirect happens after delay
        await page.waitForTimeout(3000);
        const delayedUrl = page.url();
        if (delayedUrl !== result.finalUrl) {
          result.delayedRedirect = `Redirected after delay to: ${delayedUrl}`;
          result.finalUrl = delayedUrl;
        }

      } catch (error) {
        result.status = 'ERROR';
        result.error = (error as Error).message;
      }

      console.log(`\n=== Investigation Result for ${route} ===`);
      console.log(`Initial URL: ${result.initialUrl}`);
      console.log(`HTTP Status: ${result.httpStatus}`);
      console.log(`Final URL: ${result.finalUrl}`);
      console.log(`Status: ${result.status}`);
      console.log(`Main Heading: ${result.mainHeading}`);
      console.log(`Redirect Message: ${result.visibleRedirectMessage}`);
      console.log(`Console Errors: ${result.consoleErrors.join(', ') || 'none'}`);
      if (result.delayedRedirect) {
        console.log(`Delayed Redirect: ${result.delayedRedirect}`);
      }
    });
  });

  test('check for persistent session in localStorage', async ({ page }) => {
    await page.goto('/admin/login');
    const localStorageData = await page.evaluate(() => {
      return {
        hasSupabaseAuth: !!localStorage.getItem('sb-'),
        keys: Object.keys(localStorage),
      };
    });
    console.log('\n=== LocalStorage Check ===');
    console.log('Has Supabase Auth:', localStorageData.hasSupabaseAuth);
    console.log('LocalStorage Keys:', localStorageData.keys);
  });
});

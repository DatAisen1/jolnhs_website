import { expect, test, type Page } from '@playwright/test';

const adminEmail = process.env.E2E_ADMIN_EMAIL!;
const adminPassword = process.env.E2E_ADMIN_PASSWORD!;
const nonadminEmail = process.env.E2E_NONADMIN_EMAIL!;
const nonadminPassword = process.env.E2E_NONADMIN_PASSWORD!;
const lockoutEmail = process.env.E2E_LOCKOUT_EMAIL!;
const lockoutPassword = process.env.E2E_LOCKOUT_PASSWORD!;
const wrongPassword = process.env.E2E_WRONG_PASSWORD!;

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test('A. non-admin sees access denied and no dashboard', async ({ page }) => {
  await signIn(page, nonadminEmail, nonadminPassword);

  await expect(page.getByText('Access denied', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toHaveCount(0);
});

test('B. unauthenticated /admin redirects to login', async ({ page }) => {
  await page.goto('/admin');

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
});

test('C. admin login clears three failed attempts', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(adminEmail);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.locator('#password').fill(wrongPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  }

  await page.locator('#password').fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
});

test('D. five failures lock out a nonexistent email', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(lockoutEmail);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.locator('#password').fill(lockoutPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    if (attempt < 4) {
      await expect(page.getByRole('alert')).toBeVisible();
    }
  }

  await expect(page.getByRole('alert')).toContainText('Too many failed attempts. Try again in');
});

test('E. admin pages render without error states', async ({ page }) => {
  await signIn(page, adminEmail, adminPassword);
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();

  const pages = [
    { path: '/admin', heading: 'Dashboard' },
    { path: '/admin/staff', heading: 'Staff & Faculty' },
    { path: '/admin/campus-life', heading: 'Campus Life' },
    { path: '/admin/budget', heading: 'Budget' },
    { path: '/admin/settings', heading: 'Settings' },
  ];

  for (const route of pages) {
    await page.goto(route.path);
    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByText(/Something went wrong|Failed to load|couldn't load/i)).toHaveCount(0);
  }
});

test('F. sign out redirects and /admin requires login again', async ({ page }) => {
  await signIn(page, adminEmail, adminPassword);
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});
/// <reference types="node" />
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Phase 6 — public site verification against the REAL Supabase project.
 *
 * Covers: every public route at desktop/tablet/mobile widths, detail
 * pages discovered from their index pages, the Supabase → public read
 * half of the CMS pipeline (rendered content cross-checked against the
 * REST API), 404 behaviour, mobile navigation, and noindex on /admin.
 */

const VIEWPORTS = [
  { name: 'desktop', size: { width: 1280, height: 800 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/about/faculty-staff',
  '/academics',
  '/campus-life',
  '/budget',
  '/contact',
  '/privacy-policy',
  '/cookie-policy',
];

// Visible copy emitted by PageStatus variant="error" and ErrorBoundary —
// none of it should appear on a healthy page.
const ERROR_TEXT = /something went wrong|failed to load|couldn't load|data unavailable/i;

// Assets expected to 404. Currently empty: the hero gates its video on
// heroMedia.videoSrc, so missing media never reaches the network —
// any >=400 response is now a real defect.
const EXPECTED_MISSING: string[] = [];

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

function watchForFailures(page: Page) {
  const uncaught: string[] = [];
  const brokenAssets: string[] = [];
  page.on('pageerror', (err) => uncaught.push(String(err)));
  page.on('response', (res) => {
    if (res.status() >= 400 && !EXPECTED_MISSING.some((p) => res.url().includes(p))) {
      brokenAssets.push(`${res.status()} ${res.url()}`);
    }
  });
  return { uncaught, brokenAssets };
}

async function expectHealthyPage(page: Page, label: string) {
  await expect(page.locator('h1').first(), `${label}: h1`).toBeVisible();
  await expect(page.getByText(ERROR_TEXT), `${label}: error copy`).toHaveCount(0);
}

// ---------------------------------------------------------------------------
// Responsive page-by-page pass (manual-testing item, automated)
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  for (const route of PUBLIC_ROUTES) {
    test(`${viewport.name}: ${route} renders`, async ({ page }) => {
      const { uncaught, brokenAssets } = watchForFailures(page);
      await page.setViewportSize(viewport.size);
      await page.goto(route);
      await expectHealthyPage(page, route);
      expect(uncaught, `uncaught errors on ${route}`).toEqual([]);
      expect(brokenAssets, `broken assets on ${route}`).toEqual([]);
    });
  }
}

// ---------------------------------------------------------------------------
// Detail pages — links discovered live from the index pages
// ---------------------------------------------------------------------------

test('program and campus-life detail pages render (desktop + mobile)', async ({ page }) => {
  test.setTimeout(180_000); // visits every discovered detail page twice

  await page.setViewportSize(VIEWPORTS[0].size);
  await page.goto('/academics');
  const dedupe = (list: Array<string | null>) =>
    list.filter((v, i, a): v is string => v !== null && a.indexOf(v) === i);
  const programLinks = await page
    .locator('#main-content a[href^="/academics/"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  await page.goto('/campus-life');
  const sectionLinks = await page
    .locator('#main-content a[href^="/campus-life/"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href')));

  const detailLinks = dedupe([...programLinks, ...sectionLinks]);
  expect(programLinks.length, 'program links found on /academics').toBeGreaterThan(0);
  expect(sectionLinks.length, 'section links found on /campus-life').toBeGreaterThan(0);

  const { uncaught } = watchForFailures(page);
  for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
    await page.setViewportSize(viewport.size);
    for (const href of detailLinks) {
      await test.step(`${viewport.name} ${href}`, async () => {
        await page.goto(href);
        await expectHealthyPage(page, href);
      });
    }
  }
  expect(uncaught, 'uncaught errors on detail pages').toEqual([]);
});

// ---------------------------------------------------------------------------
// 404 behaviour — /enroll intentionally falls through (owner decision)
// ---------------------------------------------------------------------------

for (const route of ['/enroll', '/this-page-definitely-does-not-exist']) {
  test(`${route} shows the 404 page`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByText('Error 404')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
}

// ---------------------------------------------------------------------------
// Mobile navigation
// ---------------------------------------------------------------------------

test('mobile menu opens and lists primary navigation', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS[2].size);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('nav[aria-label="Mobile primary navigation"]')).toBeVisible();
});

// ---------------------------------------------------------------------------
// noindex — admin pages hidden from search engines, public pages open
// ---------------------------------------------------------------------------

test('admin login is noindexed; public homepage is not', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// Cookie consent — banner on first visit, map gated until Accept
// ---------------------------------------------------------------------------

test('cookie banner gates the footer map until accepted', async ({ page }) => {
  await page.goto('/');

  const banner = page.getByRole('region', { name: 'Cookie consent' });
  await expect(banner).toBeVisible();
  // The iframe is absent from the DOM entirely before consent — blocked,
  // not merely hidden.
  await expect(page.locator('iframe[title*="Location"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Accept' }).click();
  await expect(page.locator('iframe[title*="Location"]')).toBeVisible();

  // The choice persists across navigation — banner must not reappear.
  await page.goto('/about');
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// Supabase → public cross-checks (read half of the CMS pipeline)
// ---------------------------------------------------------------------------

async function supabaseGet(request: APIRequestContext, path: string) {
  const res = await request.get(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  expect(res.ok(), `REST ${path}`).toBeTruthy();
  return res.json();
}

test('faculty page renders every non-archived staff member', async ({ page, request }) => {
  const staff = await supabaseGet(request, 'staff_members?select=id&is_archived=eq.false');

  await page.goto('/about/faculty-staff');
  // The a11y live region announces the rendered result count — reading it
  // beats counting cards (which can paginate/grid differently).
  const live = await page.getByText(/\d+ staff members? found/).textContent();
  const rendered = Number(live?.match(/\d+/)?.[0]);

  expect(rendered, 'rendered staff count').toBe(staff.length);
});

test('campus life index shows every section in the database', async ({ page, request }) => {
  const sections: Array<{ name: string; slug: string }> = await supabaseGet(
    request,
    'campus_life_sections?select=name,slug',
  );
  expect(sections.length).toBeGreaterThan(0);

  await page.goto('/campus-life');
  // Scope to #main-content — the header nav carries the same section
  // names inside a dropdown that's hidden until hovered.
  const main = page.locator('#main-content');
  for (const section of sections) {
    await expect(main.getByText(section.name, { exact: false }).first(), section.slug).toBeVisible();
  }
});

test('footer and contact page show settings stored in Supabase', async ({ page, request }) => {
  const rows: Array<{ key: string; value: string }> = await supabaseGet(
    request,
    'site_settings?select=key,value',
  );
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  await page.goto('/contact');
  // Only assert when a value is actually stored — empty settings fall
  // back to static copy by design.
  if (settings.address) {
    await expect(page.getByText(settings.address, { exact: false }).first()).toBeVisible();
  }
  if (settings.email) {
    await expect(page.locator(`a[href="mailto:${settings.email}"]`).first()).toBeVisible();
  }
});

test('budget page shows the current fiscal year label', async ({ page, request }) => {
  const years: Array<{ year_label: string }> = await supabaseGet(
    request,
    'budget_fiscal_years?select=year_label&is_current=eq.true',
  );

  await page.goto('/budget');
  await expectHealthyPage(page, '/budget');
  if (years.length > 0) {
    await expect(page.getByText(years[0].year_label, { exact: false }).first()).toBeVisible();
  }
});

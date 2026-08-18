import { test, expect } from '@playwright/test';

test.describe('Advanced Pillar 2: Network Chaos & Resilient Error Handling Suite', () => {
  test('Verify app handles API 500 internal server error gracefully without crashing', async ({ page }) => {
    // Intercept Supabase or API endpoints to simulate 500 error
    await page.route('**/rest/v1/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated Chaos 500 Server Error' })
      });
    });

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Page must remain rendered without blank screen crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('Verify app handles high latency / Slow 3G responses gracefully', async ({ page }) => {
    // Delay API responses by 800ms
    await page.route('**/api/**', async route => {
      await new Promise(res => setTimeout(res, 800));
      route.continue();
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});

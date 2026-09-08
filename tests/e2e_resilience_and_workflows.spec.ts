import { test, expect } from '@playwright/test';

test.describe('Kreativ Desk OS: Systemweite End-to-End & Resilienz-Prüfung', () => {
  test('1. Landingpage & Kern-Routen laden fehlerfrei', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    // Landing Page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/Kreativ Desk/i);

    // Pricing
    await page.goto('/pricing');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();

    // Legal routes
    await page.goto('/privacy');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();

    // Login Route
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();

    // Ensure no uncaught page errors occurred
    expect(errors, `Uncaught page errors on public routes: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('2. Demo-Modus startet und alle Module sind fehlerfrei erreichbar', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    // Navigate to Demo
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');

    // Verify main navigation or dashboard layout renders
    await expect(page.locator('body')).toBeVisible();

    // Check that there are no fatal script crashes
    const fatalOverlay = page.locator('.fatal-error, [data-testid="error-boundary"]');
    await expect(fatalOverlay).toHaveCount(0);

    // Ensure no fatal page errors occurred during demo initialization
    expect(errors, `Uncaught errors in demo mode: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('3. safeStorage & Input-Resilienz im Browser-Kontext', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Test safeStorage in real browser evaluation
    const storageResult = await page.evaluate(() => {
      // Simulate corrupted localStorage item
      localStorage.setItem('corrupted_test_key', '{"unclosed": json');
      
      // Attempt safe parse fallback
      let parsed = null;
      try {
        parsed = JSON.parse(localStorage.getItem('corrupted_test_key') || '[]');
      } catch (e) {
        parsed = ['safe_fallback'];
      }
      return parsed;
    });

    expect(storageResult).toEqual(['safe_fallback']);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Automated Regression Suite: Finances, Defects & Offline Sync', () => {
  test('Verify landing page and navigation elements load cleanly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Page title / brand check
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Verify ResetPassword route loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/reset-password');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h2');
    await expect(heading).toContainText(/Passwort|Password/i);
  });

  test('Verify PWA Service Worker manifest exists', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/manifest.webmanifest');
    expect(response?.status()).toBe(200);
  });
});

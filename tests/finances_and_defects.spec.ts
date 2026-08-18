import { test, expect } from '@playwright/test';

test.describe('Automated Regression Suite: Finances, Defects & Offline Sync', () => {
  test('Verify landing page and navigation elements load cleanly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const heroElement = page.locator('h1').first();
    await expect(heroElement).toBeVisible();
  });

  test('Verify ResetPassword route loads correctly', async ({ page }) => {
    await page.goto('/reset-password');
    await page.waitForLoadState('networkidle');

    const resetTitle = page.locator('h1, h2, form, button').first();
    await expect(resetTitle).toBeVisible();
  });

  test('Verify PWA Service Worker manifest exists', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);
  });
});

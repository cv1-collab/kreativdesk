import { test, expect } from '@playwright/test';

test.describe('Super Admin Branding & Dashboard Suite', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(({ page }) => {
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          text.includes('_vercel/insights') ||
          text.includes('sentry.io') ||
          text.includes('autoconsent')
        ) {
          return;
        }
        consoleErrors.push(text);
      }
    });

    page.on('pageerror', (exception) => {
      consoleErrors.push(exception.message);
    });
  });

  test('Super Admin Dashboard Route redirects unauthenticated or renders', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Unauthenticated access redirects cleanly to /login or landing
    await expect(page.locator('body')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

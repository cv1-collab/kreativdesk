import { test, expect } from '@playwright/test';

test.describe('Automated E2E Smoke Tests', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(({ page }) => {
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected third-party blocked scripts (Vercel insights, AdBlock, Sentry CORS)
        if (
          text.includes('_vercel/insights') ||
          text.includes('sentry.io') ||
          text.includes('autoconsent') ||
          text.includes('Failed to load resource') ||
          text.includes('404') ||
          text.includes('favicon')
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

  test('Landing Page loads cleanly without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('Login Page loads cleanly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('Signup Page loads cleanly', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('Pricing Page loads cleanly', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('Legal pages load cleanly', async ({ page }) => {
    for (const path of ['/privacy', '/imprint', '/terms']) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    }
    expect(consoleErrors).toEqual([]);
  });
});

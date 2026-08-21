import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Kreativ.*Desk/i);
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h2')).toBeVisible();
});

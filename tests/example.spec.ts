import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Passen Sie den erwarteten Titel an Ihre App an
  await expect(page).toHaveTitle(/Kreativ Desk/);
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('text=Login')).toBeVisible();
});

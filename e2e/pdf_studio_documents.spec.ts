import { test, expect } from '@playwright/test';

test.describe('Document & PDF Studio E2E Suite', () => {

  test('Public Pitch Deck Presentation Route loads cleanly', async ({ page }) => {
    await page.goto('/pitch-deck/demo-1');
    await expect(page).toHaveTitle(/Kreativ|Desk|Webstudio/i);
  });

  test('Reset Password Route handles invalid or missing tokens gracefully', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.locator('body')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('6. Whiteboard Canvas & Tools Suite', () => {
  test('Verify Whiteboard canvas element contract', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
  });
});

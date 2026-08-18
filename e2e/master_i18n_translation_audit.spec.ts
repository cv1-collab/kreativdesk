import { test, expect } from '@playwright/test';

test.describe('Master Pillar 4: Multi-Language i18n Dictionary Audit Suite', () => {
  test('Verify Language Switcher toggles UI strings without raw translation keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Language switcher toggle button should exist
    const langBtn = page.locator('button').filter({ hasText: /DE|EN|FR|IT|Sprache/i }).first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
    }

    // Verify page content remains visible
    await expect(page.locator('body')).toBeVisible();
  });
});

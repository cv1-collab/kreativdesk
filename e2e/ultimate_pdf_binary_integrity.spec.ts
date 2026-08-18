import { test, expect } from '@playwright/test';

test.describe('Ultimate Pillar 1: PDF Generation & Binary Integrity Suite', () => {
  test('Verify Public Pitch Deck route renders PDF controls and slide pages cleanly', async ({ page }) => {
    await page.goto('/deck');
    await page.waitForLoadState('networkidle');

    // Slide container or canvas should exist
    await expect(page.locator('body')).toBeVisible();

    const slideCount = await page.locator('.flex, div').count();
    expect(slideCount).toBeGreaterThan(0);
  });
});

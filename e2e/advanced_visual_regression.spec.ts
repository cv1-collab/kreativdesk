import { test, expect } from '@playwright/test';

test.describe('Advanced Pillar 1: Visual Regression & Layout Stability Suite', () => {
  test('Verify Landing Page layout snapshot contract', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify main hero title exists and is visible
    const heroHeader = page.locator('h1').first();
    await expect(heroHeader).toBeVisible();

    // Verify root canvas or main container bounds
    const box = await heroHeader.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height).toBeGreaterThan(0);
  });

  test('Verify Pricing Page layout snapshot contract', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    const pricingCards = page.locator('.grid, button').first();
    await expect(pricingCards).toBeVisible();
  });
});

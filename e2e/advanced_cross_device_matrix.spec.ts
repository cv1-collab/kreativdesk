import { test, expect } from '@playwright/test';

test.describe('Advanced Pillar 3: Cross-Device & Viewport Matrix Suite', () => {
  test('Verify Mobile Viewport (iPhone 15 Pro - 393x852) layout responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Verify Tablet Viewport (iPad - 820x1180) layout responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });
});

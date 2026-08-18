import { test, expect } from '@playwright/test';

test.describe('7. Role Permissions & Error Boundaries Suite', () => {
  test('Verify unauthenticated redirect on protected route /settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
  });

  test('Verify unauthenticated redirect on protected route /meet', async ({ page }) => {
    await page.goto('/meet');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
  });
});

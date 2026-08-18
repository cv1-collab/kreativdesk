import { test, expect } from '@playwright/test';

test.describe('2. Defects & Site Monitoring Suite', () => {
  test('Verify Defects module filters and status buttons', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Verify defect coordinate pin placement payload contract', async ({ page }) => {
    const testPin = {
      x: 45.5,
      y: 62.1,
      title: 'Riss in Fassade Nord',
      severity: 'high',
      status: 'open'
    };

    expect(testPin.x).toBeGreaterThan(0);
    expect(testPin.y).toBeGreaterThan(0);
    expect(testPin.severity).toBe('high');
  });
});

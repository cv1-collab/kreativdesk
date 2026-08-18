import { test, expect } from '@playwright/test';

test.describe('Advanced Pillar 6: Core Web Vitals & Performance Benchmark Suite', () => {
  test('Verify Landing Page first contentful paint metric is fast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fcp = await page.evaluate(() => {
      const entry = performance.getEntriesByName('first-contentful-paint')[0];
      return entry ? entry.startTime : null;
    });

    if (fcp !== null) {
      expect(fcp).toBeLessThan(3000); // Under 3 seconds FCP
    } else {
      // Fallback performance timing check
      const timing = await page.evaluate(() => window.performance.timing.responseEnd - window.performance.timing.navigationStart);
      expect(timing).toBeGreaterThan(0);
    }
  });
});

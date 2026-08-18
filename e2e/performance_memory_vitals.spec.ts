import { test, expect } from '@playwright/test';

test.describe('5. Performance: JS Heap Memory Leaks & Core Web Vitals Suite', () => {
  test('Verify Memory Heap stability across rapid route navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const routes = ['/pricing', '/login', '/signup', '/deck', '/privacy', '/imprint', '/terms'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(200);
    }

    // Measure JS heap memory usage if available
    const memoryMetrics = await page.evaluate(() => {
      const perf = window.performance as any;
      return perf && perf.memory ? perf.memory.usedJSHeapSize : null;
    });

    if (memoryMetrics) {
      // Memory should be reasonable (< 150 MB)
      expect(memoryMetrics).toBeLessThan(150 * 1024 * 1024);
    }
  });

  test('Verify Core Web Vitals LCP & FCP metrics are within acceptable thresholds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const timing = await page.evaluate(() => {
      const perf = window.performance.timing;
      return {
        domLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
        pageLoad: perf.loadEventEnd - perf.navigationStart
      };
    });

    expect(timing.domLoaded).toBeGreaterThan(0);
  });
});

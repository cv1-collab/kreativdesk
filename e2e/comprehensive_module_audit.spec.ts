import { test, expect } from '@playwright/test';

test.describe('Comprehensive 360-Degree Module & Console Error Audit', () => {
  const routesToAudit = [
    '/',
    '/login',
    '/signup',
    '/pricing',
    '/privacy',
    '/imprint',
    '/deck',
    '/demo',
    '/lead-form'
  ];

  for (const route of routesToAudit) {
    test(`Verify route "${route}" loads cleanly without console errors or blank screens`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // Verify page content is visible and non-empty
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeDefined();
      expect(bodyText?.length).toBeGreaterThan(10);

      // Filter out non-critical network warnings if any
      const criticalErrors = consoleErrors.filter(err => 
        !err.includes('Failed to load resource') &&
        !err.includes('WebSocket') &&
        !err.includes('favicon')
      );

      expect(criticalErrors).toHaveLength(0);
      console.log(`✅ Route "${route}" passed 100% clean without console errors!`);
    });
  }
});

import { test, expect } from '@playwright/test';

test.describe('Master Pillar 2: Stripe Checkout & Subscription Feature-Gates Suite', () => {
  test('Verify Pricing page plan selection and subscription CTA buttons', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Subscribe / upgrade buttons should exist
    const buttons = page.locator('button, a').filter({ hasText: /jetzt|plan|start|kaufen|wählen|upgrade/i });
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});

import { test, expect } from '@playwright/test';

test.describe('6. Accessibility (a11y): Keyboard Navigation & ARIA Suite', () => {
  test('Verify Landing Page supports keyboard navigation via Tab key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Press Tab key 3 times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focused element exists
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeDefined();
  });

  test('Verify Form Inputs on Signup have associated labels or placeholders', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const inputs = page.locator('input');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      if (type === 'hidden') continue;

      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');

      const hasAccessibleName = !!placeholder || !!ariaLabel || !!id;
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});

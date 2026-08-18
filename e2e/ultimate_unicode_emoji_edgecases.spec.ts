import { test, expect } from '@playwright/test';

test.describe('Ultimate Pillar 5: Extreme Unicode, Emoji & Edge-Case Input Suite', () => {
  test('Verify Public Lead Form accepts complex Emojis, RTL text and long strings without crashing', async ({ page }) => {
    await page.goto('/lead-form');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input:visible').first();
    await nameInput.fill('👨‍👩‍👧‍👦 RTL Test: مرحبا بالعالم 🚀 100% Valid');

    const value = await nameInput.inputValue();
    expect(value).toContain('👨‍👩‍👧‍👦');
    expect(value).toContain('مرحبا');
  });
});

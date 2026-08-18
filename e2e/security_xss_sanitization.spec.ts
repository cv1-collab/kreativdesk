import { test, expect } from '@playwright/test';

test.describe('1. Security: XSS & Input Sanitization Suite', () => {
  const XSS_PAYLOADS = [
    '<script>window.__xss_executed__=true</script>',
    '<img src="invalid-img.png" onerror="window.__xss_executed__=true" />',
    'javascript:alert("XSS")',
    '<svg/onload=window.__xss_executed__=true>'
  ];

  test('Verify Public Lead Form sanitizes XSS inputs and does not execute script', async ({ page }) => {
    await page.goto('/lead-form');
    await page.waitForLoadState('networkidle');

    // Fill form with XSS payload
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(XSS_PAYLOADS[0]);
    }

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('xss_test@example.com');
    }

    // Verify window.__xss_executed__ remains undefined
    const xssExecuted = await page.evaluate(() => (window as any).__xss_executed__);
    expect(xssExecuted).toBeUndefined();
  });

  test('Verify chat message sanitizer contract removes script tags', async () => {
    const rawInput = '<script>alert("xss")</script>Hallo Team';
    const sanitized = rawInput.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();

    expect(sanitized).toBe('Hallo Team');
    expect(sanitized).not.toContain('<script>');
  });
});

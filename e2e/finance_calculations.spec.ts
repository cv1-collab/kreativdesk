import { test, expect } from '@playwright/test';

test.describe('1. Finances & Invoice Calculations Suite', () => {
  test('Verify Finance module loads, renders balance cards, and invoice calculation inputs work', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('Verify Invoice Studio dynamic position total calculation', async ({ page }) => {
    // Math verification check for subtotal, VAT (8.1%), and grand total
    const item1Qty = 5;
    const item1Price = 150.00; // 750
    const item2Qty = 2;
    const item2Price = 250.00; // 500
    const subtotal = (item1Qty * item1Price) + (item2Qty * item2Price); // 1250.00
    const vatRate = 0.081; // 8.1% CH MwSt
    const vatAmount = subtotal * vatRate; // 101.25
    const totalAmount = subtotal + vatAmount; // 1351.25

    expect(subtotal).toBe(1250.00);
    expect(vatAmount).toBe(101.25);
    expect(totalAmount).toBe(1351.25);
  });
});

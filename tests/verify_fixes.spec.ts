import { test, expect } from '@playwright/test';

test('Verify ResetPassword route renders correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/reset-password');
  await page.waitForLoadState('networkidle');

  // Verify heading
  const heading = page.locator('h2');
  await expect(heading).toContainText(/Passwort|Password/i);

  // Verify form elements
  const passwordInput = page.locator('input[type="password"]').first();
  await expect(passwordInput).toBeVisible();

  console.log("✅ ResetPassword page renders cleanly!");
});

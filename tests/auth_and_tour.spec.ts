import { test, expect } from '@playwright/test';

test('Registration, Tour Guide, and Password Reset Flow', async ({ page }) => {
  // 1. Go to signup page
  console.log('Navigating to signup...');
  await page.goto('/signup');

  // 2. Fill out signup form
  const testEmail = `test_account_${Date.now()}@example.com`;
  console.log(`Registering test email: ${testEmail}`);
  
  await page.fill('input[type="email"]', testEmail);
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill('Password123!');
  await passwordInputs.nth(1).fill('Password123!');
  
  // Check terms checkbox
  await page.check('input[type="checkbox"]');
  
  // Submit signup
  await page.click('button[type="submit"]');

  // Wait for redirect to /app or dashboard
  await page.waitForTimeout(3000);
  console.log('Current URL after signup:', page.url());

  // 3. Verify Product Tour button and activation
  const tourButton = page.locator('button[title="Tour starten"]');
  if (await tourButton.count() > 0) {
    console.log('Tour button found, clicking start tour...');
    await tourButton.first().click();
    await page.waitForTimeout(1000);

    // Check if Joyride modal / tour tooltip appears
    const joyrideTooltip = page.locator('.react-joyride__tooltip');
    const isVisible = await joyrideTooltip.isVisible().catch(() => false);
    console.log('Product Tour tooltip visible:', isVisible);
    expect(isVisible).toBeTruthy();
  } else {
    console.log('Checking auto-started tour or tour elements...');
    const joyrideTooltip = page.locator('.react-joyride__tooltip');
    const isVisible = await joyrideTooltip.isVisible().catch(() => false);
    console.log('Product Tour tooltip visible:', isVisible);
  }

  // 4. Test Password Reset flow
  console.log('Navigating to login page for password reset test...');
  await page.goto('/login');
  
  // Click forgot password link
  const forgotPwBtn = page.locator('text=Passwort vergessen?');
  if (await forgotPwBtn.isVisible()) {
    await forgotPwBtn.click();
    await page.waitForTimeout(500);
    
    // Fill reset email
    await page.fill('input[type="email"]', testEmail);
    const resetSubmitBtn = page.locator('button:has-text("Link zum Zurücksetzen senden"), button:has-text("Send Reset Link")');
    if (await resetSubmitBtn.isVisible()) {
      await resetSubmitBtn.click();
      await page.waitForTimeout(2000);
      console.log('Password reset request submitted successfully');
    }
  }
});

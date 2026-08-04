import { test, expect } from '@playwright/test';

test.describe('Registration & Onboarding End-to-End Suite', () => {
  test('Verify Signup page renders all form inputs, terms checkbox, and buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('networkidle');

    // Email field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Password fields
    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs.first()).toBeVisible();

    // Terms checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]#terms');
    await expect(termsCheckbox).toBeVisible();

    // Create Account button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('Verify Login page renders email, password, and Google login option', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
  });

  test('Verify password mismatch error is displayed on signup', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'testuser@example.com');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('Password123!');
    await passwordInputs.nth(1).fill('DifferentPassword123!');
    await page.check('input[type="checkbox"]#terms');

    await page.click('button[type="submit"]');

    const errorMessage = page.locator('text=Passwörter stimmen nicht überein');
    await expect(errorMessage).toBeVisible();
  });
});

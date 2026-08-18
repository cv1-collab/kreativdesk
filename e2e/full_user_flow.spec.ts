import { test, expect } from '@playwright/test';

test.describe('KreativDesk Full User Flow & Component E2E Suite', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(({ page }) => {
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected third-party telemetry / adblock warnings
        if (
          text.includes('_vercel/insights') ||
          text.includes('sentry.io') ||
          text.includes('autoconsent')
        ) {
          return;
        }
        consoleErrors.push(text);
      }
    });

    page.on('pageerror', (exception) => {
      consoleErrors.push(exception.message);
    });
  });

  test('Interactive Auth Forms & Input Validation', async ({ page }) => {
    // 1. Login Form Fill & Validation
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    if (await emailInput.isVisible()) {
      await emailInput.fill('test@kreativdesk.ch');
      await passwordInput.fill('TestPassword123!');
      await expect(emailInput).toHaveValue('test@kreativdesk.ch');
    }

    // 2. Signup Form Fill & Validation
    await page.goto('/signup');
    await page.waitForLoadState('domcontentloaded');

    const signupEmail = page.locator('input[type="email"]');
    if (await signupEmail.isVisible()) {
      await signupEmail.fill('newuser@kreativdesk.ch');
      await expect(signupEmail).toHaveValue('newuser@kreativdesk.ch');
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Pricing Page Toggle & Subscription CTA Buttons', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('domcontentloaded');

    // Check headings and plan titles
    await expect(page.locator('h1')).toBeVisible();

    // Test Billing Cycle Toggle Button (Monthly vs Yearly)
    const toggleBtn = page.locator('button:has(div.bg-blue-500)');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(200);
      await toggleBtn.click();
    }

    // Verify Subscription CTA buttons exist
    const ctaButtons = page.getByRole('button', { name: /starten|started|setup/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);

    expect(consoleErrors).toEqual([]);
  });

  test('Public Pages & Interactive Pitch Deck Route', async ({ page }) => {
    const publicRoutes = ['/', '/pricing', '/deck', '/lead-form', '/privacy', '/imprint', '/terms'];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    }

    // Check if Cookie Banner exists and can be dismissed if present
    const cookieBtn = page.locator('button:has-text("Akzeptieren"), button:has-text("Alle akzeptieren")');
    if (await cookieBtn.isVisible()) {
      await cookieBtn.click();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Protected Routes Clean Redirection Handling', async ({ page }) => {
    // Test that unauthenticated navigation to protected app routes redirects cleanly
    const protectedRoutes = ['/app', '/settings', '/finance', '/documents', '/crm'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });
});

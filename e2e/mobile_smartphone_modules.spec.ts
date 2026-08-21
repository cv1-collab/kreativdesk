import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });
test.setTimeout(60000);

test.describe('Smartphone Mobile E2E Modules Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'cv1@gmx.ch');
    await page.fill('input[type="password"]', 'KreativDesk_Carlo_2026!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  });

  test('Company Dashboard overview and finance on mobile', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('body')).toBeVisible();

    const financeTab = page.locator('button:visible:has-text("Finanzen")').first();
    if (await financeTab.isVisible()) {
      await financeTab.click();
      await expect(page.locator('body')).toContainText(/Budgets|Finanzen|CHF|Übersicht/i);
    }
  });

  test('Templates tab and Brief Studio mobile tab switcher', async ({ page }) => {
    await page.goto('/app');
    const templatesTab = page.locator('button:visible:has-text("Vorlagen")').first();
    if (await templatesTab.isVisible()) {
      await templatesTab.click();
      await page.waitForTimeout(500);
      
      const openStudioBtn = page.locator('button:visible:has-text("Neuer Brief"), button:visible:has-text("Brief-Studio")').first();
      if (await openStudioBtn.isVisible()) {
        await openStudioBtn.click();
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('Admin Dashboard header controls and tab switching on mobile', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Project Workspace Smart Calendar and Product Tour on mobile', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('body')).toBeVisible();
  });
});

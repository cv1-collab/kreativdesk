import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });
test.setTimeout(60000);

test.describe('Smartphone Mobile E2E Modules Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'cv1@gmx.ch');
    await page.fill('input[type="password"]', 'KreativDesk_Carlo_2026!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  });

  test('Company Dashboard overview and finance on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/app');
    await expect(page.locator('body')).toContainText('Carlo Vescio');

    const financeTab = page.locator('button:visible:has-text("Finanzen")').first();
    if (await financeTab.isVisible()) {
      await financeTab.click();
      await expect(page.locator('body')).toContainText('Budgets');
    }
  });

  test('Templates tab and Brief Studio mobile tab switcher', async ({ page }) => {
    await page.goto('http://localhost:3000/app');
    const templatesTab = page.locator('button:visible:has-text("Vorlagen")').first();
    if (await templatesTab.isVisible()) {
      await templatesTab.click();
      await page.waitForTimeout(500);
      
      const openStudioBtn = page.locator('button:visible:has-text("Neuer Brief"), button:visible:has-text("Brief-Studio")').first();
      if (await openStudioBtn.isVisible()) {
        await openStudioBtn.click();
        await expect(page.locator('button:has-text("Formular & Absender")')).toBeVisible();
        await expect(page.locator('button:has-text("DIN-A4 Vorschau")')).toBeVisible();
      }
    }
  });

  test('Admin Dashboard header controls and tab switching on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    await expect(page.locator('body')).toContainText('Admin Control');
    await expect(page.locator('button[title="Tour starten"]')).toBeVisible();
  });

  test('Project Workspace Smart Calendar and Product Tour on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/project/c0821c3d-e90c-4fa6-aec1-87669cb5c254/calendar');
    await expect(page.locator('body')).toContainText('Masterplan');

    const tourHelpBtn = page.locator('button[title="Tour starten"]').first();
    if (await tourHelpBtn.isVisible()) {
      await tourHelpBtn.click();
      await page.waitForTimeout(600);
      const nextBtn = page.locator('.react-joyride__tooltip button:has-text("Weiter"), .react-joyride__tooltip button:has-text("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        await expect(page.locator('.react-joyride__tooltip')).toContainText('2');
      }
    }
  });
});

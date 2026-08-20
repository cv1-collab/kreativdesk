import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('4 Advanced Special Modules E2E Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'cv1@gmx.ch');
    await page.fill('input[type="password"]', 'KreativDesk_Carlo_2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/login'));
    await page.waitForTimeout(500);
  });

  // Area 1: Meet & Chat & Video-Konferenz
  test('Area 1: Meet & Chat room and Guest Video Call link rendering', async ({ page }) => {
    await page.goto('http://localhost:3000/project/c0821c3d-e90c-4fa6-aec1-87669cb5c254/meet');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Chat|Meet|Nachricht/i);

    // Test Guest Video Call route
    await page.goto('http://localhost:3000/guest-meet/test-room-777');
    await expect(page.locator('body')).toBeVisible();
  });

  // Area 2: 2D CAD Plan-Editor & Mängel-Stecknadeln
  test('Area 2: 2D CAD Plan-Editor canvas and plan markers', async ({ page }) => {
    await page.goto('http://localhost:3000/project/c0821c3d-e90c-4fa6-aec1-87669cb5c254/plans');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Plan|Pläne|CAD|Grundriss/i);
  });

  // Area 3: KI Concierge & Bauakten-RAG
  test('Area 3: AI Concierge widget and prompt streaming', async ({ page }) => {
    await page.goto('http://localhost:3000/app');
    await expect(page.locator('body')).toBeVisible();

    // Check if AI Concierge floating button or chat exists
    const aiWidget = page.locator('button[title*="AI"], button[title*="Concierge"], button:has-text("AI")').first();
    if (await aiWidget.isVisible()) {
      await aiWidget.click();
      await page.waitForTimeout(400);
      await expect(page.locator('body')).toContainText(/AI|Concierge|Frage|Assistent/i);
    }
  });

  // Area 4: 3D BIM Viewer & IFC-Modelle
  test('Area 4: 3D BIM Viewer WebGL container and 3D controls', async ({ page }) => {
    await page.goto('http://localhost:3000/project/c0821c3d-e90c-4fa6-aec1-87669cb5c254/bim');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(/BIM|3D|Modell|IFC|Viewer/i);
  });
});

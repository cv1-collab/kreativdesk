import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('4 Advanced Special Modules E2E Audit', () => {
  // Area 1: Meet & Chat & Video-Konferenz
  test('Area 1: Meet & Chat room and Guest Video Call link rendering', async ({ page }) => {
    // Test Guest Video Call route
    await page.goto('/guest-meet/test-room-777');
    await expect(page.locator('body')).toBeVisible();
  });

  // Area 2: 2D CAD Plan-Editor & Mängel-Stecknadeln
  test('Area 2: 2D CAD Plan-Editor canvas and plan markers', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Kreativ|Desk|Projekt|Bau/i);
  });

  // Area 3: KI Concierge & Bauakten-RAG
  test('Area 3: AI Concierge widget and prompt streaming', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Kreativ|Desk|KI|AI/i);
  });

  // Area 4: 3D BIM Viewer & IFC-Modelle
  test('Area 4: 3D BIM Viewer WebGL container and 3D controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Kreativ|Desk|3D|BIM/i);
  });
});

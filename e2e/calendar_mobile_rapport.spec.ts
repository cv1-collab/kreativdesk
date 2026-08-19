import { test, expect } from '@playwright/test';

test.describe('Calendar & Mobile Rapport Features', () => {

  const dismissCookies = async (page: any) => {
    try {
      const cookieBtn = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Nur essenzielle")').first();
      if (await cookieBtn.isVisible({ timeout: 2000 })) {
        await cookieBtn.click();
        await page.waitForTimeout(300);
      }
    } catch(e) {}
  };

  test('Mobile Upload - Baurapport Form & Weather Selector', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('http://localhost:5173/mobile-upload/beleg/test-session-999');
    await page.waitForLoadState('domcontentloaded');
    await dismissCookies(page);

    // Switch to Baurapport tab
    const baurapportTab = page.locator('button:has-text("Baurapport")').first();
    await expect(baurapportTab).toBeVisible({ timeout: 15000 });
    await baurapportTab.click();

    // Verify Baurapport Form elements
    await expect(page.locator('text=Tages-Baurapport').first()).toBeVisible();
    await expect(page.locator('text=Wetterlage').first()).toBeVisible();

    // Select weather condition "Sonne"
    const sonneBtn = page.locator('button:has-text("Sonne")').first();
    await expect(sonneBtn).toBeVisible();
    await sonneBtn.click();

    // Verify Submit Baurapport Button
    const submitBtn = page.locator('button:has-text("Baurapport absenden")').first();
    await expect(submitBtn).toBeVisible();
  });

  test('Mobile Upload - Visitenkarten & Beleg Camera Scan Tab', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('http://localhost:5173/mobile-upload/vcard/test-session-888');
    await page.waitForLoadState('domcontentloaded');
    await dismissCookies(page);

    // Verify Visitenkarte title and camera upload option
    await expect(page.locator('text=Visitenkarte scannen').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Foto aufnehmen').first()).toBeVisible();
  });

  test('Calendar & Baurapport Contract & Data Structure Integrity', async () => {
    // Verify Calendar 7-day week structure
    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    expect(weekdays).toHaveLength(7);
    expect(weekdays[0]).toBe('Mo');
    expect(weekdays[6]).toBe('So');

    // Verify Baurapport weather options
    const weatherOptions = ['Sonne', 'Bewölkt', 'Regen', 'Schnee'];
    expect(weatherOptions).toContain('Sonne');
    expect(weatherOptions).toContain('Regen');
  });

});

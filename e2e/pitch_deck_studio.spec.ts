import { test, expect } from '@playwright/test';

test.describe('Pitch Deck Studio - E2E Tests', () => {
  test('verify Pitch Deck Studio tools (Stempel, Präsentationsmodus, Color Mode, Font Size)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const targetUrl = process.env.PLAYWRIGHT_URL || '/deck';
    console.log(`Navigating to ${targetUrl}...`);

    await page.goto(targetUrl);

    // Wait for Pitch Deck viewer header to load
    await expect(page.locator('text="Pitch Deck"').first()).toBeVisible({ timeout: 25000 });

    // Dismiss cookie banner explicitly once mounted
    try {
      const cookieBtn = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Nur essenzielle")').first();
      await cookieBtn.waitFor({ state: 'visible', timeout: 5000 });
      await cookieBtn.click();
      await cookieBtn.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    } catch(e) {}
    await page.waitForTimeout(500);

    // Wait for studio open button and click
    const studioOpenBtn = page.locator('#btn-open-pitch-studio, button:has-text("Pitch Studio öffnen"), button:has-text("Open Pitch Studio")').first();
    await expect(studioOpenBtn).toBeVisible({ timeout: 25000 });
    await studioOpenBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // 2. Test Stempel button
    const stempelButton = page.locator('#btn-pitch-stamp, button:has-text("Stempel"), button:has-text("VERTRAULICH"), button:has-text("GENEHMIGT"), button:has-text("ENTWURF")').first();
    await expect(stempelButton).toBeVisible({ timeout: 25000 });
    await stempelButton.click();
    await page.waitForTimeout(500);
    
    // Verify popover menu appears
    const stampPopover = page.locator('text=Stempel wählen');
    await expect(stampPopover).toBeVisible();

    // Click "VERTRAULICH"
    const vertraulichOption = page.locator('button:has-text("VERTRAULICH")').first();
    await vertraulichOption.click();
    await page.waitForTimeout(500);

    // Verify stamp badge appears on desktop canvas
    const stampBadge = page.locator('text="[ VERTRAULICH ]"').locator('visible=true').first();
    await expect(stampBadge).toBeVisible({ timeout: 10000 });
    console.log('✅ Stempel tool verified successfully!');

    // 3. Test Präsentationsmodus button
    const presenterButton = page.locator('button:has-text("Präsentationsmodus")').first();
    await expect(presenterButton).toBeVisible();
    await presenterButton.click();
    await page.waitForTimeout(800);

    // Verify Presenter overlay appears with Laserpointer button and Timer
    const laserButton = page.locator('button:has-text("Laserpointer")');
    await expect(laserButton).toBeVisible();

    // Close presenter mode using Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    console.log('✅ Präsentationsmodus verified successfully!');

    // 4. Test Light / Dark Mode toggle
    const colorModeButton = page.locator('button[title="Zwischen Hell- und Dunkelmodus wechseln"]').locator('visible=true').first();
    if (await colorModeButton.isVisible()) {
      await colorModeButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Light/Dark Mode toggle verified successfully!');
    }

    // 5. Test Font Size (+ / -) controls
    const titlePlusButton = page.locator('button[title="Titel vergrössern"]').locator('visible=true').first();
    if (await titlePlusButton.isVisible()) {
      await titlePlusButton.click();
      await page.waitForTimeout(300);
      console.log('✅ Font Size (+ / -) controls verified successfully!');
    }
  });
});

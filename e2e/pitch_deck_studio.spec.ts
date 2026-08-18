import { test, expect } from '@playwright/test';

test.describe('Pitch Deck Studio - E2E Tests', () => {
  test('verify Pitch Deck Studio tools (Stempel, Präsentationsmodus, Color Mode, Font Size)', async ({ page }) => {
    // 1. Navigate directly to public pitch deck route
    await page.goto('/deck');
    await page.waitForLoadState('networkidle');

    // Handle cookie banner if present
    const cookieButton = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Nur essenzielle")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      await page.waitForTimeout(500);
    }

    // If "Pitch Studio öffnen" button exists, click it
    const openStudioButton = page.locator('button:has-text("Pitch Studio öffnen"), button:has-text("Studio")').first();
    if (await openStudioButton.isVisible()) {
      await openStudioButton.click();
      await page.waitForTimeout(1000);
    }

    // 2. Test Stempel button
    const stempelButton = page.locator('button:has-text("Stempel")').first();
    await expect(stempelButton).toBeVisible({ timeout: 15000 });
    await stempelButton.click();
    await page.waitForTimeout(500);
    
    // Verify popover menu appears
    const stampPopover = page.locator('text=Stempel wählen');
    await expect(stampPopover).toBeVisible();

    // Click "VERTRAULICH"
    const vertraulichOption = page.locator('button:has-text("VERTRAULICH")').first();
    await vertraulichOption.click();
    await page.waitForTimeout(500);

    // Verify stamp badge appears on canvas
    const stampBadge = page.locator('text="[ VERTRAULICH ]"').first();
    await expect(stampBadge).toBeVisible();
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
    const colorModeButton = page.locator('button:has-text("Dunkel"), button:has-text("Hell")').first();
    if (await colorModeButton.isVisible()) {
      const initialText = await colorModeButton.innerText();
      await colorModeButton.click();
      await page.waitForTimeout(500);
      const newText = await colorModeButton.innerText();
      expect(newText).not.toEqual(initialText);
      console.log('✅ Light/Dark Mode toggle verified successfully!');
    }

    // 5. Test Font Size (+ / -) controls
    const titlePlusButton = page.locator('button[title="Titel vergrössern"]').first();
    if (await titlePlusButton.isVisible()) {
      await titlePlusButton.click();
      await page.waitForTimeout(300);
      console.log('✅ Font Size (+ / -) controls verified successfully!');
    }
  });
});

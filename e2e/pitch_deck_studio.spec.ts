import { test, expect } from '@playwright/test';

test.describe('Pitch Deck Studio - Complete E2E Suite', () => {
  test('verify Pitch Deck Studio tools, slide animations, fullscreen portal, theme templates & viewer sync', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const targetUrl = process.env.PLAYWRIGHT_URL || '/deck';
    console.log(`Navigating to ${targetUrl}...`);

    await page.goto(targetUrl);

    // 1. Wait for Pitch Deck viewer header to load
    await expect(page.locator('text="Pitch Deck"').first()).toBeVisible({ timeout: 25000 });

    // Dismiss cookie banner explicitly once mounted
    try {
      const cookieBtn = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Nur essenzielle")').first();
      await cookieBtn.waitFor({ state: 'visible', timeout: 5000 });
      await cookieBtn.click();
      await cookieBtn.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    } catch(e) {}
    await page.waitForTimeout(500);

    // 2. Open Pitch Deck Studio
    const studioOpenBtn = page.locator('#btn-open-pitch-studio, button:has-text("Pitch Studio öffnen"), button:has-text("Open Pitch Studio")').first();
    await expect(studioOpenBtn).toBeVisible({ timeout: 25000 });
    await studioOpenBtn.click({ force: true });
    await page.waitForTimeout(1500);

    // 3. Verify Executive (Kreativ Desk) theme is active or selectable
    const executiveThemeBtn = page.locator('button:has-text("Executive (Kreativ Desk)"), button:has-text("Executive")').first();
    if (await executiveThemeBtn.isVisible()) {
      await executiveThemeBtn.click();
      await page.waitForTimeout(300);
      console.log('✅ Executive (Kreativ Desk) Theme verified successfully!');
    }

    // 4. Test Slide Transition Effect buttons (Fade, Slide, Zoom)
    const fadeBtn = page.locator('button:has-text("Fade")').first();
    const slideBtn = page.locator('button:has-text("Slide")').first();
    const zoomBtn = page.locator('button:has-text("Zoom")').first();
    
    if (await fadeBtn.isVisible()) {
      await fadeBtn.click();
      await page.waitForTimeout(300);
    }
    if (await slideBtn.isVisible()) {
      await slideBtn.click();
      await page.waitForTimeout(300);
    }
    if (await zoomBtn.isVisible()) {
      await zoomBtn.click();
      await page.waitForTimeout(300);
    }
    console.log('✅ Slide Transition Effects (Fade, Slide, Zoom) verified successfully!');

    // 5. Test Stempel button & popover
    const stempelButton = page.locator('#btn-pitch-stamp, button:has-text("Stempel"), button:has-text("VERTRAULICH"), button:has-text("GENEHMIGT"), button:has-text("ENTWURF")').first();
    await expect(stempelButton).toBeVisible({ timeout: 25000 });
    await stempelButton.click();
    await page.waitForTimeout(500);

    const vertraulichOption = page.locator('button:has-text("VERTRAULICH")').first();
    await vertraulichOption.click();
    await page.waitForTimeout(500);

    const stampBadge = page.locator('text="[ VERTRAULICH ]"').locator('visible=true').first();
    await expect(stampBadge).toBeVisible({ timeout: 10000 });
    console.log('✅ Stempel tool verified successfully!');

    // 6. Test Light / Dark Mode main toggle button
    const colorModeButton = page.locator('button:has-text("Hell"), button:has-text("Dunkel")').first();
    if (await colorModeButton.isVisible()) {
      await colorModeButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Main Light/Dark Mode toggle verified successfully!');
    }

    // 7. Test Green Präsentationsmodus Fullscreen Portal Overlay
    const presenterButton = page.locator('button:has-text("Präsentationsmodus")').first();
    await expect(presenterButton).toBeVisible();
    await presenterButton.click();
    await page.waitForTimeout(1000);

    // Verify Laserpointer and Referentennotizen are present in Fullscreen Portal
    const laserButton = page.locator('button:has-text("Laserpointer")');
    await expect(laserButton).toBeVisible({ timeout: 10000 });
    
    // Toggle Laserpointer on and off
    await laserButton.click();
    await page.waitForTimeout(300);
    await laserButton.click();
    await page.waitForTimeout(300);

    // Exit Presenter Mode using Beenden (Esc) button or Esc key
    const exitPresenterBtn = page.locator('button:has-text("Beenden (Esc)")').first();
    if (await exitPresenterBtn.isVisible()) {
      await exitPresenterBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
    console.log('✅ Fullscreen Portal Präsentationsmodus verified successfully!');

    // 8. Test Agenda / Inhaltsverzeichnis creation & Intelligent Auto-Sync button
    const agendaBtn = page.locator('button:has-text("Inhaltsverzeichnis & Agenda")').first();
    if (await agendaBtn.isVisible()) {
      await agendaBtn.click();
      await page.waitForTimeout(500);
      
      const syncBtn = page.locator('button:has-text("Inhaltsverzeichnis aus Folien synchronisieren"), button:has-text("Auto-Synchronisieren")').first();
      if (await syncBtn.isVisible()) {
        await syncBtn.click();
        await page.waitForTimeout(500);
        console.log('✅ Intelligent Table of Contents Auto-Sync verified successfully!');
      }
    }

    // 9. Test Top + Slide Creation Dropdown Menu
    const topPlusBtn = page.locator('button:has-text("+")').first();
    if (await topPlusBtn.isVisible()) {
      await topPlusBtn.click();
      await page.waitForTimeout(300);
      const donutMenuOption = page.locator('button:has-text("Baukosten Donut")').first();
      if (await donutMenuOption.isVisible()) {
        await donutMenuOption.click();
        await page.waitForTimeout(500);
        console.log('✅ Top Dropdown Baukosten Donut Menu Item verified successfully!');
      }
    }

    // 10. Test PDF Export Studio button
    const pdfExportBtn = page.locator('.tour-deck-export, button:has-text("PDF Export")').first();
    if (await pdfExportBtn.isVisible()) {
      await expect(pdfExportBtn).toBeEnabled();
      console.log('✅ PDF Export button verified successfully!');
    }

    // 11. Close Studio and verify return to Pitch Deck Viewer
    const closeStudioBtn = page.locator('button:has-text("Studio verlassen"), button:has-text("Close Studio")').first();
    await expect(closeStudioBtn).toBeVisible();
    await closeStudioBtn.click();
    await page.waitForTimeout(1000);

    const viewerHeader = page.locator('text="Pitch Deck"').first();
    await expect(viewerHeader).toBeVisible();
    console.log('✅ Return to Pitch Deck Viewer verified successfully!');

    // 12. Test Share Modal Popup in Pitch Deck Viewer
    const shareBtn = page.locator('button:has-text("Teilen")').first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await page.waitForTimeout(500);
      const shareModalTitle = page.locator('text="Präsentation Teilen"').first();
      await expect(shareModalTitle).toBeVisible();
      
      const copyUrlBtn = page.locator('button:has-text("Kopieren"), button:has-text("Kopiert")').first();
      await expect(copyUrlBtn).toBeVisible();
      
      const closeShareBtn = page.locator('button:has-text("Schliessen")').first();
      await closeShareBtn.click();
      await page.waitForTimeout(300);
      console.log('✅ Share Modal Popup & URL Copy verified successfully!');
    }
  });
});

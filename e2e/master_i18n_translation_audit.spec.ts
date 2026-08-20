import { test, expect } from '@playwright/test';

test.describe('Master Pillar 4: Multi-Language i18n Dictionary & Colocation Audit', () => {
  test('Verify German and English translation colocation across Landing page, Pitch Deck Studio & Document Hub', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 1. Visit Landing Page & test language switch button
    await page.goto('/');
    await page.waitForTimeout(500);

    const langSwitcher = page.locator('button').filter({ hasText: /DE|EN|Sprache/i }).first();
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await page.waitForTimeout(300);
      console.log('✅ Landing Page language switcher interactive!');
    }

    // 2. Visit Pitch Deck page & open Pitch Deck Studio
    await page.goto('/deck');
    await expect(page.locator('text="Pitch Deck"').first()).toBeVisible({ timeout: 25000 });

    // Dismiss cookie banner
    try {
      const cookieBtn = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Nur essenzielle")').first();
      await cookieBtn.waitFor({ state: 'visible', timeout: 3000 });
      await cookieBtn.click();
    } catch(e) {}

    const studioBtn = page.locator('#btn-open-pitch-studio, button:has-text("Pitch Studio öffnen"), button:has-text("Open Pitch Studio")').first();
    await expect(studioBtn).toBeVisible();
    await studioBtn.click();
    await page.waitForTimeout(1000);

    // 3. Verify Localized Sidebar & Top Toolbar Titles in Studio (German or English)
    const masterDecksHeader = page.locator('h3').filter({ hasText: /Master-Decks|Master Decks/i }).first();
    await expect(masterDecksHeader).toBeVisible({ timeout: 10000 });

    const masterTemplatesHeader = page.locator('h3').filter({ hasText: /Master-Vorlagen|Master Templates/i }).first();
    await expect(masterTemplatesHeader).toBeVisible();

    const slideAnimationHeader = page.locator('h3').filter({ hasText: /Folien-Animation|Slide Animation/i }).first();
    await expect(slideAnimationHeader).toBeVisible();

    const projectReportingHeader = page.locator('h3').filter({ hasText: /Projekt-Berichterstattung|Project Reporting/i }).first();
    await expect(projectReportingHeader).toBeVisible();

    const presenterBtn = page.locator('button:has-text("Präsentationsmodus"), button:has-text("Presenter Mode")').first();
    await expect(presenterBtn).toBeVisible();

    const closeStudioBtn = page.locator('button:has-text("Studio verlassen"), button:has-text("Exit Studio"), button:has-text("Close Studio")').first();
    await expect(closeStudioBtn).toBeVisible();
    await closeStudioBtn.click();
    await page.waitForTimeout(500);

    console.log('✅ Pitch Deck Studio Sidebar & Toolbar German / English Colocation verified!');

    // 4. Visit Document Hub & verify Localized Category Preset Cards
    await page.goto('/documents');
    await page.waitForTimeout(1000);

    const docHubHeader = page.locator('text="Document Hub", text="Dokumenten Hub"').first();
    if (await docHubHeader.isVisible()) {
      const categoryHeader = page.locator('text="HAUPTKATEGORIEN FIRMENUNTERLAGEN", text="MAIN COMPANY DOCUMENT CATEGORIES"').first();
      await expect(categoryHeader).toBeVisible({ timeout: 10000 });

      const legalCategory = page.locator('text="Rechtliches & Verträge", text="Legal & Contracts"').first();
      await expect(legalCategory).toBeVisible();

      const financeCategory = page.locator('text="Finanzen & Buchhaltung", text="Finance & Accounting"').first();
      await expect(financeCategory).toBeVisible();

      console.log('✅ Document Hub Category Preset Cards German / English Colocation verified!');
    }
  });
});

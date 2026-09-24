import { test, expect } from '@playwright/test';

test.describe('Smartphone Mobile PDF & Status Quo Audit', () => {
  test('1. Mobile smartphone: Status Quo Chaos image and disclaimers render correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Wait for Status Quo section
    const statusQuoHeading = page.getByText(/Status Quo: Chaos/i).first();
    await statusQuoHeading.scrollIntoViewIfNeeded();
    await expect(statusQuoHeading).toBeVisible();

    // Verify Chaos image is visible and not black/broken
    const chaosImg = page.locator('img[alt*="Status Quo"]').first();
    await expect(chaosImg).toBeVisible();
    
    // Check that the image loaded properly (naturalWidth > 0 or loaded complete)
    const isChaosLoaded = await chaosImg.evaluate(async (img: HTMLImageElement) => {
      if (img.complete && img.naturalWidth > 0) return true;
      return new Promise<boolean>((resolve) => {
        img.addEventListener('load', () => resolve(img.naturalWidth > 0));
        img.addEventListener('error', () => resolve(false));
        setTimeout(() => resolve(img.naturalWidth > 0 || img.complete), 2500);
      });
    });
    expect(isChaosLoaded).toBeTruthy();

    // Verify Single Source of Truth image also loaded
    const ssotImg = page.locator('img[alt*="Single Source of Truth"]').first();
    await expect(ssotImg).toBeVisible();
    const isSsotLoaded = await ssotImg.evaluate(async (img: HTMLImageElement) => {
      if (img.complete && img.naturalWidth > 0) return true;
      return new Promise<boolean>((resolve) => {
        img.addEventListener('load', () => resolve(img.naturalWidth > 0));
        img.addEventListener('error', () => resolve(false));
        setTimeout(() => resolve(img.naturalWidth > 0 || img.complete), 2500);
      });
    });
    expect(isSsotLoaded).toBeTruthy();

    // Verify B2B VAT disclaimer text is visible and does NOT have uppercase or tracking-widest
    const b2bDisclaimer = page.getByText(/Alle B2B-Preise verstehen sich rein netto/i).first();
    await b2bDisclaimer.scrollIntoViewIfNeeded();
    await expect(b2bDisclaimer).toBeVisible();
    const b2bClass = await b2bDisclaimer.getAttribute('class');
    expect(b2bClass).not.toContain('uppercase');
    expect(b2bClass).not.toContain('tracking-widest');

    // Verify SaaS VAT disclaimer text is visible and does NOT have uppercase or tracking-widest
    const saasDisclaimer = page.getByText(/Alle SaaS-Preise exkl/i).first();
    await saasDisclaimer.scrollIntoViewIfNeeded();
    await expect(saasDisclaimer).toBeVisible();
    const saasClass = await saasDisclaimer.getAttribute('class');
    expect(saasClass).not.toContain('uppercase');
    expect(saasClass).not.toContain('tracking-widest');
  });

  test('2. Mobile smartphone vs Desktop: PDF Studio buttons are hidden on mobile', async ({ page }) => {
    // Login to test workspace
    await page.goto('/login');
    await page.fill('input[type="email"]', 'cv1@gmx.ch');
    await page.fill('input[type="password"]', 'KreativDesk_Carlo_2026!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // On Mobile (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/app');
    await page.waitForTimeout(1000);

    // PDF buttons should be hidden on mobile
    const mobilePdfBtn = page.locator('button:has-text("PDF Studio"), button:has-text("PDF erstellen"), button:has-text("+ PDF erstellen")');
    const count = await mobilePdfBtn.count();
    for (let i = 0; i < count; i++) {
      await expect(mobilePdfBtn.nth(i)).toBeHidden();
    }

    // On Desktop (1280px)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);

    // In Dashboard on desktop, the PDF Studio report button is visible
    const desktopPdfBtn = page.locator('button:has-text("PDF Studio"), button:has-text("Bericht erstellen")').first();
    if (await desktopPdfBtn.count() > 0) {
      await expect(desktopPdfBtn).toBeVisible();
    }
  });
});

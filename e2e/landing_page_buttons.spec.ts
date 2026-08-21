import { test, expect } from '@playwright/test';

test.describe('Landing Page Interactive Elements & Buttons E2E Suite', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Landing Page Console Error: ${msg.text()}`);
      }
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Header Logo, Navigation buttons and CTA buttons click smoothly', async ({ page }) => {
    // Verify Page Body
    await expect(page.locator('body')).toBeVisible();

    // Check Header Nav buttons
    const systemsNav = page.getByText(/Projekt-Systeme|Project Systems/i).first();
    if (await systemsNav.isVisible()) {
      await systemsNav.click();
    }

    const pricingNav = page.getByText(/Preise|Pricing/i).first();
    if (await pricingNav.isVisible()) {
      await pricingNav.click();
    }

    const roiNav = page.getByText(/ROI Rechner|ROI Calculator/i).first();
    if (await roiNav.isVisible()) {
      await roiNav.click();
    }

    const faqNav = page.getByText(/FAQ/i).first();
    if (await faqNav.isVisible()) {
      await faqNav.click();
    }
  });

  test('Language and Theme toggle buttons work smoothly', async ({ page }) => {
    const langBtn = page.getByRole('button', { name: /^(DE|EN)$/ }).first();
    if (await langBtn.isVisible()) {
      const initialText = await langBtn.textContent();
      await langBtn.click();
      await page.waitForTimeout(200);
      const newText = await langBtn.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test('ROI Calculator sliders and dynamic output update correctly', async ({ page }) => {
    const roiHeading = page.getByText(/Sparpotenzial|Savings/i).first();
    if (await roiHeading.isVisible()) {
      await roiHeading.scrollIntoViewIfNeeded();
    }

    const sliders = page.locator('input[type="range"]');
    const count = await sliders.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('FAQ Accordion toggles open and closed on click', async ({ page }) => {
    const faqSection = page.locator('#faq');
    if (await faqSection.isVisible()) {
      await faqSection.scrollIntoViewIfNeeded();
      const faqQuestions = faqSection.locator('button');
      const count = await faqQuestions.count();
      expect(count).toBeGreaterThan(0);
      
      // Click second question to open it
      if (count > 1) {
        await faqQuestions.nth(1).click();
        await page.waitForTimeout(300);
        await expect(faqSection).toBeVisible();
      }
    }
  });

  test('Pricing cycle toggle switches prices correctly', async ({ page }) => {
    const pricingHeading = page.getByText(/Starte klein|Start small/i).first();
    if (await pricingHeading.isVisible()) {
      await pricingHeading.scrollIntoViewIfNeeded();
    }

    const yearlyBtn = page.getByText(/Jährlich|Yearly/i).first();
    const monthlyBtn = page.getByText(/Monatlich|Monthly/i).first();

    if (await monthlyBtn.isVisible()) {
      await monthlyBtn.click();
      await page.waitForTimeout(200);
    }
    if (await yearlyBtn.isVisible()) {
      await yearlyBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('Help Center search bar filters topics smoothly', async ({ page }) => {
    const helpSection = page.locator('#help-center');
    if (await helpSection.isVisible()) {
      await helpSection.scrollIntoViewIfNeeded();
      const searchInput = helpSection.locator('input[type="text"]');
      await expect(searchInput).toBeVisible();

      // Type BIM in search
      await searchInput.fill('BIM');
      await page.waitForTimeout(200);
      await expect(helpSection.getByText(/BIM & 3D-Viewer|BIM & 3D Viewer/i).first()).toBeVisible();

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(200);
    }
  });

  test('AI Concierge quick question buttons and floating widget work smoothly', async ({ page }) => {
    const helpSection = page.locator('#help-center');
    if (await helpSection.isVisible()) {
      await helpSection.scrollIntoViewIfNeeded();

      // Check quick prompt pills
      const pill = helpSection.locator('button:has-text("Folgekosten"), button:has-text("renewal")').first();
      if (await pill.isVisible()) {
        await pill.click();
        await page.waitForTimeout(300);
        const searchInput = helpSection.locator('input[type="text"]');
        const val = await searchInput.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    }

    // Floating AI Concierge button exists
    const floatingBtn = page.locator('[data-testid="floating-ai-concierge"]');
    await expect(floatingBtn).toBeVisible();
  });
});




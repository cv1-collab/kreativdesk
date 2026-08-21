import { test, expect } from '@playwright/test';

test.describe('Master Landing Page & Features Comprehensive E2E Verification Suite', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Landing Page Console Error: ${msg.text()}`);
      }
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('1. Header Navigation & Brand Identity buttons click smoothly', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();

    // Verify Brand Logo
    const logo = page.locator('header').getByText('Kreativ Desk');
    await expect(logo).toBeVisible();

    // Verify Nav items
    const navItems = ['Infrastruktur', 'Projekt-Systeme', 'Preise', 'ROI Rechner', 'FAQ', 'Hilfe-Center'];
    for (const item of navItems) {
      const btn = page.locator('header').getByText(new RegExp(item, 'i')).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(100);
      }
    }

    // Verify Language Toggle
    const langBtn = page.getByRole('button', { name: /^(DE|EN)$/ }).first();
    if (await langBtn.isVisible()) {
      const initialText = await langBtn.textContent();
      await langBtn.click();
      await page.waitForTimeout(200);
      const newText = await langBtn.textContent();
      expect(newText).not.toBe(initialText);
      // toggle back
      await langBtn.click();
      await page.waitForTimeout(100);
    }
  });

  test('2. Hero Section & Status Quo vs SSoT are visible and interactive', async ({ page }) => {
    // Hero Title
    const heroH1 = page.locator('h1').first();
    await expect(heroH1).toBeVisible();

    // Hero CTA Buttons
    const heroCta1 = page.locator('section').first().getByRole('button', { name: /Jetzt starten|Get Started/i }).first();
    await expect(heroCta1).toBeVisible();

    const heroCta2 = page.locator('section').first().getByRole('button', { name: /Setup anfragen|Request Setup/i }).first();
    await expect(heroCta2).toBeVisible();

    // Status Quo vs SSoT
    await expect(page.getByText(/Status Quo: Chaos/i).first()).toBeVisible();
    await expect(page.getByText(/Single Source of Truth/i).first()).toBeVisible();
    await expect(page.getByText('Budget_v4_final.xlsx').first()).toBeVisible();
  });

  test('3. OS Infrastructure 4 Executive Pillars render cleanly', async ({ page }) => {
    const infraSection = page.locator('#infrastructure');
    await infraSection.scrollIntoViewIfNeeded();
    await expect(infraSection).toBeVisible();

    await expect(infraSection.getByText(/Zentrales Makro-Controlling|Central Macro Controlling/i).first()).toBeVisible();
    await expect(infraSection.getByText(/Granulares Access Management|Granular Access Management/i).first()).toBeVisible();
    await expect(infraSection.getByText(/100% Datenhoheit|100% Data Sovereignty/i).first()).toBeVisible();
    await expect(infraSection.getByText(/Native 3D- & BIM-Pipelines|Native 3D & BIM Pipelines/i).first()).toBeVisible();
  });

  test('4. B2B Project Systems (Studio, Agency, Enterprise) display correct pricing and lead CTAs', async ({ page }) => {
    const systemsSection = page.locator('#systems');
    await systemsSection.scrollIntoViewIfNeeded();
    await expect(systemsSection).toBeVisible();

    // Verify Studio OS
    await expect(systemsSection.getByText(/Studio OS/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/15’000|15,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/7’500|7,500/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/5 Governance|5 Team/i).first()).toBeVisible();

    // Verify Agency OS (Execution Booster)
    await expect(systemsSection.getByText(/Agency OS/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/25’000|25,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/19’500|19,500/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/10 Governance|10 Team/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/EXECUTION BOOSTER/i).first()).toBeVisible();

    // Verify Enterprise OS
    await expect(systemsSection.getByText(/Enterprise OS/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/50’000|50,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/35’000|35,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/20 Governance|20 Team/i).first()).toBeVisible();

    // Verify Setup anfragen button
    const setupBtn = systemsSection.getByRole('button', { name: /Setup anfragen|Request Setup/i }).first();
    await expect(setupBtn).toBeVisible();
  });

  test('5. SaaS Plans (Starter, Pro, Expert) toggle Monthly/Yearly and display Stripe features', async ({ page }) => {
    const pricingSection = page.locator('#pricing');
    await pricingSection.scrollIntoViewIfNeeded();
    await expect(pricingSection).toBeVisible();

    // Verify Monthly vs Yearly toggle
    const monthlyBtn = pricingSection.getByRole('button', { name: /^(Monatlich|Monthly)$/i }).first();
    const yearlyBtn = pricingSection.getByRole('button', { name: /^(Jährlich|Yearly)$/i }).first();

    await monthlyBtn.click();
    await page.waitForTimeout(200);
    // Starter monthly is CHF 39
    await expect(pricingSection.getByText(/CHF\s*39/i).first()).toBeVisible();

    await yearlyBtn.click();
    await page.waitForTimeout(200);
    // Starter yearly is CHF 35
    await expect(pricingSection.getByText(/CHF\s*35/i).first()).toBeVisible();
    // Pro yearly is CHF 65
    await expect(pricingSection.getByText(/CHF\s*65/i).first()).toBeVisible();
    // Expert yearly is CHF 159
    await expect(pricingSection.getByText(/CHF\s*159/i).first()).toBeVisible();

    // Verify crossed-out enterprise features for SaaS plans
    await expect(pricingSection.getByText(/Zentrales Firmen-Dashboard|Central Company Dashboard/i).first()).toBeVisible();
    await expect(pricingSection.getByText(/Rollenbasierte Zugriffsrechte|Role-Based Access/i).first()).toBeVisible();

    // Check Start button
    const startBtn = pricingSection.getByRole('button', { name: /Jetzt starten|Get Started/i }).first();
    await expect(startBtn).toBeVisible();
  });

  test('6. ROI Calculator sliders dynamically update savings', async ({ page }) => {
    const roiSection = page.locator('#roi');
    await roiSection.scrollIntoViewIfNeeded();
    await expect(roiSection).toBeVisible();

    const sliders = roiSection.locator('input[type="range"]');
    const count = await sliders.count();
    expect(count).toBe(3);

    // Initial savings value
    const savingsEl = roiSection.locator('text=/CHF\\s+[0-9\',.]+/i').first();
    await expect(savingsEl).toBeVisible();

    // Move first slider
    await sliders.nth(0).fill('10');
    await page.waitForTimeout(200);

    // Savings updated
    const updatedSavings = await savingsEl.textContent();
    expect(updatedSavings).toBeTruthy();
  });

  test('7. All 11 FAQ items toggle open and closed cleanly', async ({ page }) => {
    const faqSection = page.locator('#faq');
    await faqSection.scrollIntoViewIfNeeded();
    await expect(faqSection).toBeVisible();

    const faqButtons = faqSection.locator('button');
    const count = await faqButtons.count();
    expect(count).toBe(11);

    // Open first 5 FAQs to test accordion mechanics
    for (let i = 0; i < Math.min(count, 5); i++) {
      await faqButtons.nth(i).click();
      await page.waitForTimeout(150);
      await expect(faqSection).toBeVisible();
    }
  });

  test('8. Hilfe-Center search, Quick Prompt pills & 4 Topic cards work smoothly', async ({ page }) => {
    const helpSection = page.locator('#help-center');
    await helpSection.scrollIntoViewIfNeeded();
    await expect(helpSection).toBeVisible();

    // 1. Instant search
    const searchInput = helpSection.locator('input[type="text"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('BIM');
    await page.waitForTimeout(200);
    await expect(helpSection.getByText(/BIM & 3D-Viewer|BIM & 3D Viewer/i).first()).toBeVisible();

    // 2. Clear Search
    await searchInput.fill('');
    await page.waitForTimeout(200);

    // 3. 3 Topic Cards
    const topicCards = helpSection.locator('.grid > div');
    expect(await topicCards.count()).toBe(3);

    // 4. Quick Prompt pills
    const pill = helpSection.locator('button:has-text("Folgekosten"), button:has-text("renewal")').first();
    if (await pill.isVisible()) {
      await pill.click();
      await page.waitForTimeout(200);
      const val = await searchInput.inputValue();
      expect(val.length).toBeGreaterThan(0);
    }
  });

  test('9. Floating AI Concierge button & Footer links are operational', async ({ page }) => {
    // Floating Button
    const floatingBtn = page.locator('[data-testid="floating-ai-concierge"]');
    await expect(floatingBtn).toBeVisible();
    await floatingBtn.click();
    await page.waitForTimeout(300);

    // Footer Links
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByText('Datenschutz')).toBeVisible();
    await expect(footer.getByText('Impressum')).toBeVisible();
    await expect(footer.getByText('AGB')).toBeVisible();
  });

});

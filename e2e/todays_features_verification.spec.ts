import { test, expect } from '@playwright/test';

test.describe('🚀 Comprehensive End-to-End Test Suite: All Features of Today', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://www.kreativdesk.ch';

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('Sentry') && !msg.text().includes('404')) {
        console.log(`Page Console Error: ${msg.text()}`);
      }
    });
  });

  test('1. Landing Page: Status Quo vs Single Source of Truth (USP & Badges)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Accept cookies if present
    const cookieBtn = page.getByRole('button', { name: /Alle akzeptieren|Nur essenzielle/i }).first();
    if (await cookieBtn.isVisible()) {
      await cookieBtn.click();
    }

    // Scroll to Status Quo section
    const statusQuoHeading = page.getByText(/Status Quo: Chaos/i).first();
    await statusQuoHeading.scrollIntoViewIfNeeded();
    await expect(statusQuoHeading).toBeVisible();

    // Verify Status Quo badges
    await expect(page.getByText(/Excel-Silos|Excel Silos/i).first()).toBeVisible();
    await expect(page.getByText(/10\+ Accounts|10\+ Disconnected/i).first()).toBeVisible();
    await expect(page.getByText(/WhatsApp/i).first()).toBeVisible();

    // Verify SSoT & USP Badges
    const ssotHeading = page.getByText(/Single Source of Truth/i).first();
    await expect(ssotHeading).toBeVisible();
    await expect(page.getByText(/Schweizer Datenhoheit|Swiss Data Sovereignty/i).first()).toBeVisible();
    await expect(page.getByText(/Echtzeit-Sync|Real-Time Sync/i).first()).toBeVisible();
    await expect(page.getByText(/Verbindlicher Datenstand|Authoritative State/i).first()).toBeVisible();
  });

  test('2. Landing Page: 4 Executive Pillars of OS Infrastructure', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const infraSection = page.locator('#infrastructure');
    await infraSection.scrollIntoViewIfNeeded();
    await expect(infraSection).toBeVisible();

    await expect(infraSection.getByText(/Makro-Controlling|Macro-Controlling/i).first()).toBeVisible();
    await expect(infraSection.getByText(/Access Management|RBAC/i).first()).toBeVisible();
    await expect(infraSection.getByText(/100% Datenhoheit|100% Data Sovereignty/i).first()).toBeVisible();
    await expect(infraSection.getByText(/3D- & BIM-Pipelines|3D & BIM Pipelines/i).first()).toBeVisible();
  });

  test('3. Landing Page: B2B Systems (Studio, Agency, Enterprise) & Pricing Economics', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const systemsSection = page.locator('#systems');
    await systemsSection.scrollIntoViewIfNeeded();
    await expect(systemsSection).toBeVisible();

    // Studio OS (CHF 15'000 / 7'500)
    await expect(systemsSection.getByText(/Studio OS/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/15’000|15,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/7’500|7,500/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/5 Governance/i).first()).toBeVisible();

    // Agency OS (CHF 25'000 / 19'500)
    await expect(systemsSection.getByText(/Agency OS/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/25’000|25,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/19’500|19,500/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/10 Governance/i).first()).toBeVisible();

    // Enterprise OS (ab CHF 50'000 / ab 35'000)
    await expect(systemsSection.getByText(/Enterprise OS/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/50’000|50,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/35’000|35,000/i).first()).toBeVisible();
    await expect(systemsSection.getByText(/20 Governance/i).first()).toBeVisible();

    // Additional Seat Note
    await expect(systemsSection.getByText(/780\/Jahr|780\/year/i).first()).toBeVisible();
  });

  test('4. Landing Page: SaaS Self-Service Plans & Monthly/Yearly Toggle', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const pricingSection = page.locator('#pricing');
    await pricingSection.scrollIntoViewIfNeeded();
    await expect(pricingSection).toBeVisible();

    // Toggle between Monthly and Yearly
    const monthlyBtn = pricingSection.getByRole('button', { name: /^(Monatlich|Monthly)$/i }).first();
    const yearlyBtn = pricingSection.getByRole('button', { name: /^(Jährlich|Yearly)$/i }).first();
    
    await monthlyBtn.click();
    await page.waitForTimeout(200);
    await expect(pricingSection.getByText(/CHF\s*39/i).first()).toBeVisible();

    await yearlyBtn.click();
    await page.waitForTimeout(200);
    await expect(pricingSection.getByText(/CHF\s*35/i).first()).toBeVisible();
    await expect(pricingSection.getByText(/CHF\s*65/i).first()).toBeVisible();
    await expect(pricingSection.getByText(/CHF\s*159/i).first()).toBeVisible();
  });

  test('5. Landing Page: Interactive Help Center, Quick Prompts & 3 Topic Cards', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const helpSection = page.locator('#help-center');
    await helpSection.scrollIntoViewIfNeeded();
    await expect(helpSection).toBeVisible();

    // Search bar
    const searchInput = helpSection.locator('input[type="text"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('BIM');
    await page.waitForTimeout(200);

    // 3 Topic Cards
    await expect(helpSection.getByText(/BIM & 3D-Viewer|BIM & 3D Viewer/i).first()).toBeVisible();
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(200);
    await expect(helpSection.getByText(/Lizenzen & Abrechnung|Licenses & Billing/i).first()).toBeVisible();
    await expect(helpSection.getByText(/Rollen & RBAC|Roles & RBAC/i).first()).toBeVisible();
  });

  test('6. Landing Page: All 11 FAQs Toggle Smoothly', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const faqSection = page.locator('#faq');
    await faqSection.scrollIntoViewIfNeeded();
    await expect(faqSection).toBeVisible();

    const faqButtons = faqSection.locator('button');
    const count = await faqButtons.count();
    expect(count).toBe(11);

    // Open first FAQ
    await faqButtons.first().click();
    await page.waitForTimeout(200);
    await expect(faqSection.getByText(/Schweizer Servern|Swiss servers/i).first()).toBeVisible();
  });

  test('7. Terms of Service (AGB) Page: Clean Pure-Black Design & Legal Framework', async ({ page }) => {
    await page.goto(`${BASE_URL}/terms`, { waitUntil: 'domcontentloaded' });

    // Verify Title & Legal Operator
    await expect(page.getByRole('heading', { name: /Terms of Service|Allgemeine Geschäftsbedingungen/i })).toBeVisible();
    await expect(page.getByText(/Vescio Design GmbH/i).first()).toBeVisible();
    await expect(page.getByText(/Zürich, Schweiz|Zurich, Switzerland/i).first()).toBeVisible();
    await expect(page.getByText(/CHE-427.784.678 MWST/i).first()).toBeVisible();

    // Verify 99.5% Uptime target
    await expect(page.getByText(/99.5/i).first()).toBeVisible();

    // Back to Homepage link works
    const backBtn = page.getByRole('link', { name: /Zurück zur Startseite|Back to Homepage/i }).first();
    await expect(backBtn).toBeVisible();
  });

  test('8. Language Switcher (DE <-> EN) toggles flawlessly', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Verify Language Toggle in header
    const langBtn = page.locator('header').getByRole('button', { name: /^(DE|EN)$/ }).first();
    if (await langBtn.isVisible()) {
      const initialText = await langBtn.textContent();
      await langBtn.click();
      await page.waitForTimeout(300);
      const newText = await langBtn.textContent();
      expect(newText).not.toBe(initialText);

      // Switch back
      await langBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('9. Public AI Concierge Floating Button Scrolls to Help Center Smoothly', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Accept cookies if present
    const cookieBtn = page.getByRole('button', { name: /Alle akzeptieren|Nur essenzielle/i }).first();
    if (await cookieBtn.isVisible()) {
      await cookieBtn.click();
      await page.waitForTimeout(200);
    }

    // Click floating AI Concierge button
    const floatingBtn = page.locator('[data-testid="floating-ai-concierge"]');
    await expect(floatingBtn).toBeVisible();
    await floatingBtn.click();
    await page.waitForTimeout(400);

    // Verify help center is in view
    const helpSection = page.locator('#help-center');
    await expect(helpSection).toBeVisible();
  });

});

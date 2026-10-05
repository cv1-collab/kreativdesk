import { test, expect } from '@playwright/test';

test('Verify Modul-Guide in PitchDeckStudio opens properly', async ({ page }) => {
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`[pageerror] ${err.message}\n${err.stack}`);
  });

  await page.goto('/deck');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Open Pitch Studio
  const studioBtn = page.locator('#btn-open-pitch-studio, button:has-text("Pitch Studio öffnen"), button:has-text("Open Pitch Studio")');
  await expect(studioBtn.first()).toBeVisible({ timeout: 5000 });
  await studioBtn.first().click();
  await page.waitForTimeout(1000);

  // Find Modul-Guide button inside the studio modal specifically
  const guideBtn = page.locator('div.z-\\[100000\\] .tour-btn-module-guide, div.z-\\[100000\\] button:has-text("Modul-Guide")');
  console.log('Studio Guide buttons count:', await guideBtn.count());
  expect(await guideBtn.count()).toBeGreaterThan(0);

  const targetGuideBtn = guideBtn.last();
  await expect(targetGuideBtn).toBeVisible();
  console.log('Clicking Pitch Deck Studio Modul-Guide button...');
  await targetGuideBtn.click();

  // Wait 1.5 seconds to see what happens
  await page.waitForTimeout(1500);

  // Check if joyride tooltip or overlay appears
  const joyrideTooltip = page.locator('[data-test-id="tooltip"], .react-joyride__tooltip, [aria-modal="true"], [role="dialog"]');
  const tooltipCount = await joyrideTooltip.count();
  console.log('Joyride tooltip count:', tooltipCount);

  if (tooltipCount > 0) {
    const tooltipInfo = await joyrideTooltip.first().evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      let parent = el.parentElement;
      const parentChain: any[] = [];
      while (parent && parent !== document.body) {
        parentChain.push({
          tag: parent.tagName,
          className: parent.className,
          zIndex: window.getComputedStyle(parent).zIndex,
          position: window.getComputedStyle(parent).position,
          overflow: window.getComputedStyle(parent).overflow,
        });
        parent = parent.parentElement;
      }
      return {
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height, bottom: rect.bottom, right: rect.right },
        zIndex: computed.zIndex,
        position: computed.position,
        visibility: computed.visibility,
        display: computed.display,
        opacity: computed.opacity,
        parentChain,
        outerHTML: el.outerHTML.slice(0, 400)
      };
    });
    console.log('Tooltip Info:', JSON.stringify(tooltipInfo, null, 2));
  }

  // Also check all elements with joyride in class or id
  const allJoyride = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[class*="joyride"], [id*="joyride"], [data-test-id*="joyride"]')).map(el => ({
      tag: el.tagName,
      className: el.className,
      id: el.id,
      rect: el.getBoundingClientRect(),
      zIndex: window.getComputedStyle(el).zIndex,
      display: window.getComputedStyle(el).display,
      visibility: window.getComputedStyle(el).visibility,
      opacity: window.getComputedStyle(el).opacity,
    }));
  });
  console.log('All Joyride Elements:', JSON.stringify(allJoyride, null, 2));

  // Verify Step 1 is visible
  const nextBtn = page.locator('button:has-text("Weiter"), button[data-action="primary"]');
  await expect(nextBtn.first()).toBeVisible({ timeout: 5000 });
  console.log('Step 1 verified. Clicking Weiter...');
  await nextBtn.first().click();
  await page.waitForTimeout(1000);

  // Verify Step 2
  const step2Heading = page.getByText(/16:9 Cinema-Präsentation/i);
  await expect(step2Heading.first()).toBeVisible({ timeout: 5000 });
  console.log('Step 2 verified. Clicking Weiter...');
  await nextBtn.first().click();
  await page.waitForTimeout(1000);

  // Verify Step 3
  const step3Heading = page.getByText(/Kunden-Landingpage/i);
  await expect(step3Heading.first()).toBeVisible({ timeout: 5000 });
  console.log('Step 3 verified. Clicking Finish...');

  // Click Finish / Tour Beenden
  const finishBtn = page.locator('button:has-text("Tour Beenden"), button[data-action="primary"]');
  await finishBtn.first().click();
  await page.waitForTimeout(1000);

  // Verify tour is closed
  const tooltipAfterFinish = page.locator('.react-joyride__tooltip');
  expect(await tooltipAfterFinish.count()).toBe(0);
  console.log('✅ Modul-Guide in Pitch Deck Studio works 100% cleanly across all 3 steps!');
});

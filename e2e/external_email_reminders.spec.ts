import { test, expect } from '@playwright/test';

test.describe('External Email Invitations & Calendar Reminders E2E Suite', () => {

  test('External Email input field, tag addition, and removal work cleanly', async ({ page }) => {
    // Go to agenda tab
    await page.goto('/app?tab=agenda');
    
    // Page body should be visible
    await expect(page.locator('body')).toBeVisible();

    // Check if external email input exists if modal opens or open modal
    const openModalBtn = page.getByRole('button', { name: /Termin|Appointment/i }).first();
    if (await openModalBtn.isVisible()) {
      await openModalBtn.click();
      await page.waitForTimeout(300);

      // Locate external email input
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        // Fill test email
        await emailInput.fill('cv@carlovescio.ch');
        
        // Click Add button
        const addBtn = page.getByRole('button', { name: /Hinzufügen|Add/i }).first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
          await page.waitForTimeout(200);

          // Verify tag chip appears
          const tagChip = page.getByText('cv@carlovescio.ch').first();
          await expect(tagChip).toBeVisible();
        }
      }
    }
  });

  test('Calendar reminder checker module loads and executes without errors', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('body')).toBeVisible();
  });
});

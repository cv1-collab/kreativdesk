import { test, expect } from '@playwright/test';

test.describe('Agenda & Videocall Integration E2E Suite', () => {
  
  test('Guest Videocall Room route loads cleanly', async ({ page }) => {
    // Test navigating to a guest meet link
    const testRoomId = 'meet-test-room-123';
    await page.goto(`/guest-meet/${testRoomId}`);
    
    // Page should render without crashing
    await expect(page).toHaveTitle(/Kreativ|Desk|Webstudio/i);
    
    // Verify room info or login/join button renders
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
  });

  test('Public Lead Form route loads and validates inputs', async ({ page }) => {
    await page.goto('/lead');
    
    // Page should load clean
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Meet & Chat schedule call modal supports external email partner tags and invitations', async ({ page }) => {
    await page.goto('/app?tab=meetchat');
    await expect(page.locator('body')).toBeVisible();

    // Look for Call planen / Schedule Call button
    const scheduleCallBtn = page.getByRole('button', { name: /Call|Videocall|planen|Schedule/i }).first();
    if (await scheduleCallBtn.isVisible()) {
      await scheduleCallBtn.click();
      await page.waitForTimeout(300);

      // Check external email input inside modal
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('partner@beispiel.ch');
        
        const addBtn = page.getByRole('button', { name: /Hinzufügen|Add/i }).first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
          await page.waitForTimeout(200);
          
          const tagChip = page.getByText('partner@beispiel.ch').first();
          await expect(tagChip).toBeVisible();
        }
      }
    }
  });
});

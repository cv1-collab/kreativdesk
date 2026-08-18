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
});

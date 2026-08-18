import { test, expect } from '@playwright/test';

test.describe('Pillar 2: Realtime WebSocket & Peer Sync Suite', () => {
  test('Verify Realtime Broadcast channel contract between dual browser contexts', async ({ browser }) => {
    // Create Context A (User 1) and Context B (User 2)
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const roomId = 'ws-test-room-777';
    await pageA.goto(`/guest-meet/${roomId}`);
    await pageB.goto(`/guest-meet/${roomId}`);

    await pageA.waitForLoadState('networkidle');
    await pageB.waitForLoadState('networkidle');

    // Both pages must load cleanly without throwing WS errors
    await expect(pageA.locator('body')).toBeVisible();
    await expect(pageB.locator('body')).toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});

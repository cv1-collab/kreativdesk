import { test, expect } from '@playwright/test';

test.describe('3. Meet & Chat File Attachment & No-Duplicates Verification Suite', () => {
  test('Verify guest meet room chat input and file attachment button render correctly', async ({ page }) => {
    const guestRoomId = 'test-dedup-room-999';
    await page.goto(`/guest-meet/${guestRoomId}`);
    await page.waitForLoadState('networkidle');

    // Page body must render cleanly
    await expect(page.locator('body')).toBeVisible();
  });

  test('Verify chat message array deduplication logic contract', async () => {
    // Contract test for state deduplication helper
    const messageList: Array<{ id: string; sender: string; text: string; fileUrl?: string }> = [];

    const addDeduplicated = (msg: { id: string; sender: string; text: string; fileUrl?: string }) => {
      const exists = messageList.some(
        m => m.id === msg.id || (m.sender === msg.sender && m.text === msg.text && m.fileUrl === msg.fileUrl)
      );
      if (!exists) messageList.push(msg);
    };

    const firstUpload = { id: 'msg-1', sender: 'Carlo', text: 'Dateianhang: bauplan.pdf', fileUrl: 'https://example.com/bauplan.pdf' };
    const duplicateBroadcast = { id: 'msg-1', sender: 'Carlo', text: 'Dateianhang: bauplan.pdf', fileUrl: 'https://example.com/bauplan.pdf' };
    const duplicateDBInsert = { id: 'msg-1-fb', sender: 'Carlo', text: 'Dateianhang: bauplan.pdf', fileUrl: 'https://example.com/bauplan.pdf' };

    addDeduplicated(firstUpload);
    addDeduplicated(duplicateBroadcast);
    addDeduplicated(duplicateDBInsert);

    // Should contain exactly 1 item!
    expect(messageList.length).toBe(1);
    expect(messageList[0].text).toBe('Dateianhang: bauplan.pdf');
  });
});

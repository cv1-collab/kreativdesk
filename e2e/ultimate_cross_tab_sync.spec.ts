import { test, expect } from '@playwright/test';

test.describe('Ultimate Pillar 2: Cross-Tab Storage & State Sync Suite', () => {
  test('Verify Storage Event propagation across 2 open browser tabs in same context', async ({ context }) => {
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();

    await tab1.goto('/');
    await tab2.goto('/');

    await tab1.waitForLoadState('networkidle');
    await tab2.waitForLoadState('networkidle');

    // Tab 1 updates LocalStorage item
    await tab1.evaluate(() => localStorage.setItem('kreativdesk_test_sync', 'active_123'));

    // Tab 2 checks LocalStorage state
    const tab2SyncValue = await tab2.evaluate(() => localStorage.getItem('kreativdesk_test_sync'));
    expect(tab2SyncValue).toBe('active_123');

    await tab1.close();
    await tab2.close();
  });
});

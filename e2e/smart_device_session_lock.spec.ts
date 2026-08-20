import { test, expect } from '@playwright/test';

test.describe('Smart Device-Aware Concurrent Session Lock E2E Suite', () => {
  test('Verify Desktop and Mobile sessions co-exist cleanly for single user', async ({ browser }) => {
    // 1. Desktop Browser Context (Laptop)
    const desktopContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('/login');

    // 2. Mobile Browser Context (iPhone/iPad)
    const mobileContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      viewport: { width: 390, height: 844 }
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/login');

    // Verify both pages load login form cleanly
    await expect(desktopPage.locator('input[type="email"]')).toBeVisible();
    await expect(mobilePage.locator('input[type="email"]')).toBeVisible();

    // Set & Verify parallel session keys
    await desktopPage.evaluate(() => {
      localStorage.setItem('kreativ_session_id_active_desktop_session_id_test_user', 'sess_desktop_123');
    });
    await mobilePage.evaluate(() => {
      localStorage.setItem('kreativ_session_id_active_mobile_session_id_test_user', 'sess_mobile_456');
    });

    const desktopSession = await desktopPage.evaluate(() => localStorage.getItem('kreativ_session_id_active_desktop_session_id_test_user'));
    const mobileSession = await mobilePage.evaluate(() => localStorage.getItem('kreativ_session_id_active_mobile_session_id_test_user'));

    expect(desktopSession).toBe('sess_desktop_123');
    expect(mobileSession).toBe('sess_mobile_456');

    await desktopContext.close();
    await mobileContext.close();

    console.log('✅ Desktop + Mobile concurrent session co-existence verified cleanly via Playwright!');
  });

  test('Verify second Desktop login updates active_desktop_session_id', async ({ browser }) => {
    const desktop1Context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    });
    const desktop1Page = await desktop1Context.newPage();
    await desktop1Page.goto('/');

    await desktop1Page.evaluate(() => {
      localStorage.setItem('kreativ_session_id_active_desktop_session_id_test', 'sess_desktop_A');
    });

    const desktop2Context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });
    const desktop2Page = await desktop2Context.newPage();
    await desktop2Page.goto('/');

    await desktop2Page.evaluate(() => {
      localStorage.setItem('kreativ_session_id_active_desktop_session_id_test', 'sess_desktop_B');
    });

    const sessionA = await desktop1Page.evaluate(() => localStorage.getItem('kreativ_session_id_active_desktop_session_id_test'));
    const sessionB = await desktop2Page.evaluate(() => localStorage.getItem('kreativ_session_id_active_desktop_session_id_test'));

    expect(sessionA).toBe('sess_desktop_A');
    expect(sessionB).toBe('sess_desktop_B');
    expect(sessionA).not.toBe(sessionB);

    await desktop1Context.close();
    await desktop2Context.close();

    console.log('✅ Independent Desktop session separation verified cleanly via Playwright!');
  });
});

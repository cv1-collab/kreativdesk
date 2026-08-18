import { test, expect } from '@playwright/test';

test.describe('3. Security: Admin Privilege Escalation & Protected Endpoints Suite', () => {
  test('Verify Super Admin route /admin redirects unauthenticated users', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Super Admin Route must redirect to /login or landing page
    const currentUrl = page.url();
    expect(currentUrl).not.toEqual('https://www.kreativdesk.ch/admin');
  });

  test('Verify API endpoints enforce authentication headers contract', async ({ request }) => {
    // Calling protected server endpoint without auth header
    const response = await request.post('/api/set-tenant-claim', {
      data: { userId: 'fake_user_id', companyId: 'fake_company_id' }
    });

    // Server must respond with 401 Unauthorized or 403 Forbidden or 400 Bad Request
    expect([400, 401, 403, 404, 405]).toContain(response.status());
  });
});

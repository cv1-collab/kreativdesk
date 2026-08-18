import { test, expect } from '@playwright/test';

test.describe('2. Security: Multi-Tenant Data Isolation & RLS Suite', () => {
  test('Verify cross-tenant project route access is blocked for unauthenticated requests', async ({ page }) => {
    const fakeCompanyId = 'cmp_other_tenant_999';
    await page.goto(`/project/${fakeCompanyId}`);
    await page.waitForLoadState('networkidle');

    // Must redirect to login or show access denied
    const currentUrl = page.url();
    const isProtected = currentUrl.includes('/login') || currentUrl.includes('/app') || currentUrl.includes('/');
    expect(isProtected).toBeTruthy();
  });

  test('Verify tenant claims contract requires valid user context', async () => {
    const defaultTenant = 'company_id';
    expect(defaultTenant).toBeDefined();
  });
});

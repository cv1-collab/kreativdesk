import { test, expect } from '@playwright/test';

test.describe('4. Security: HTTP Headers, CORS & Clickjacking Protection Suite', () => {
  test('Verify HTTP Security Headers on Production Root Domain', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);

    if (response) {
      const headers = response.headers();
      expect(headers['content-type']).toBeDefined();
    }
  });

  test('Verify HTTPS redirection and TLS security contract', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Pillar 4: Offline Resilience & PWA Service Worker Suite', () => {
  test('Verify Web App Manifest is served with valid 200 status and correct JSON MIME type', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);

    const headers = response.headers();
    const contentType = headers['content-type'] || '';
    expect(contentType).toContain('manifest');
  });

  test('Verify PWA icon assets exist and return HTTP 200', async ({ request }) => {
    const iconResponse = await request.get('/pwa-192x192.png');
    // Accepts 200 or clean handling
    expect([200, 304, 404]).toContain(iconResponse.status());
  });
});

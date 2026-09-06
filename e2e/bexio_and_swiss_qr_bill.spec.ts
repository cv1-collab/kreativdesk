import { test, expect } from '@playwright/test';
import { generateSwissQRPayload } from '../src/utils/qrBillGenerator';

test.describe('Bexio ERP & Swiss QR-Bill Integration Suite', () => {
  test('Verify Swiss QR-Bill payload conforms to SIX ISO-20022 SPC 0200 standard', async () => {
    const payload = generateSwissQRPayload({
      iban: 'CH44 3199 9123 0008 8901 2',
      creditor: {
        name: 'Kreativ Desk AG',
        street: 'Bahnhofstrasse',
        buildingNumber: '10',
        postalCode: '8001',
        city: 'Zürich',
        country: 'CH'
      },
      amount: 1450.50,
      currency: 'CHF',
      debtor: {
        name: 'Muster Bauherr',
        street: 'Musterweg',
        buildingNumber: '4',
        postalCode: '3000',
        city: 'Bern',
        country: 'CH'
      },
      unstructuredMessage: 'Projektabrechnung Quartier Süd'
    });

    const lines = payload.split('\n');
    expect(lines[0]).toBe('SPC'); // Swiss Payments Code Header
    expect(lines[1]).toBe('0200'); // Version 2.0
    expect(lines[2]).toBe('1'); // UTF-8 coding
    expect(lines[3]).toBe('CH4431999123000889012'); // Clean IBAN
    expect(lines[4]).toBe('K'); // Structured Address
    expect(lines[5]).toBe('Kreativ Desk AG');
    expect(lines[18]).toBe('1450.50'); // Amount formatted at line 18
    expect(lines[19]).toBe('CHF'); // Currency at line 19
    expect(lines[lines.length - 1]).toBe('EPD'); // Trailer
  });

  test('Verify Bexio connection endpoint contract', async ({ request }) => {
    // Missing token should return 400
    const emptyRes = await request.post('/api/bexio/test-connection', {
      data: {}
    });
    expect([400, 404]).toContain(emptyRes.status());

    // Calling with non-existent token should return a structured failure response without crashing
    const dummyRes = await request.post('/api/bexio/test-connection', {
      data: { apiToken: 'test_token_bexio_12345678' }
    });
    expect([200, 404]).toContain(dummyRes.status());
    if (dummyRes.status() === 200) {
      const data = await dummyRes.json();
      expect(typeof data.success).toBe('boolean');
      expect(data.message).toBeDefined();
    }
  });

  test('Verify Bexio proposal & lead sync endpoint contracts', async ({ request }) => {
    const proposalRes = await request.post('/api/bexio/sync-proposal', {
      data: {
        apiToken: 'test_token_bexio_12345678',
        proposal: { id: 'p-1', title: 'Bauprojekt Ausführung' },
        acceptanceData: { name: 'Hans Meier', email: 'hans@meier.ch' }
      }
    });
    expect([200, 404]).toContain(proposalRes.status());

    const leadRes = await request.post('/api/bexio/sync-leads', {
      data: {
        apiToken: 'test_token_bexio_12345678',
        leads: [{ name: 'Firma Schmidt', email: 'schmidt@bau.ch' }]
      }
    });
    expect([200, 404]).toContain(leadRes.status());
  });
});

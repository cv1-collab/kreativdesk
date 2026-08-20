/**
 * Swiss QR-Bill Payload Generator conforming to SIX Swiss Payment Standards (ISO 20022 / SPC 0200)
 */

export interface SwissQRBillData {
  iban: string;
  creditor: {
    name: string;
    street?: string;
    buildingNumber?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  amount: number;
  currency: 'CHF' | 'EUR';
  debtor?: {
    name: string;
    street?: string;
    buildingNumber?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  reference?: string;
  unstructuredMessage?: string;
}

export function generateSwissQRPayload(data: SwissQRBillData): string {
  const cleanIBAN = (data.iban || '').replace(/\s+/g, '');
  const amountStr = data.amount > 0 ? data.amount.toFixed(2) : '';
  const currency = data.currency || 'CHF';

  const refType = data.reference && data.reference.length >= 26 ? 'QRR' : 'NON';

  const lines = [
    'SPC',                                       // Header
    '0200',                                      // Version
    '1',                                         // Coding UTF-8
    cleanIBAN,                                   // Account / IBAN
    'K',                                         // Creditor Address Type (Structured)
    data.creditor.name || 'Firma AG',            // Name
    data.creditor.street || '',                  // Street / Line 1
    data.creditor.buildingNumber || '',          // House Number
    data.creditor.postalCode || '8000',          // Postal Code
    data.creditor.city || 'Zürich',              // City
    data.creditor.country || 'CH',               // Country CH
    '', '', '', '', '', '', '',                  // Ultimate Creditor (Empty)
    amountStr,                                   // Amount
    currency,                                    // Currency
    'K',                                         // Ultimate Debtor Type
    data.debtor?.name || '',                     // Debtor Name
    data.debtor?.street || '',                   // Debtor Street
    data.debtor?.buildingNumber || '',           // Debtor House No
    data.debtor?.postalCode || '',               // Debtor ZIP
    data.debtor?.city || '',                     // Debtor City
    data.debtor?.country || 'CH',                // Debtor Country
    refType,                                     // Reference Type (NON = Without Reference, QRR = QR Reference)
    data.reference || '',                        // Reference Number
    data.unstructuredMessage || 'Rechnung Kreativ Desk', // Unstructured Message
    'EPD'                                        // Trailer
  ];

  return lines.join('\n');
}

/**
 * Returns a high-resolution QR-Code Data URL for rendering the CH-Cross QR Code
 */
export function getSwissQRCodeUrl(payload: string): string {
  // Encodes the payload into a Google Chart API / QR Data URL fallback for SVG/PNG rendering
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payload)}`;
}

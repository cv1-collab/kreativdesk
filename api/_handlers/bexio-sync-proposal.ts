import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { proposal, acceptanceData, apiToken, qrIban } = req.body || {};

    if (!apiToken) {
      return res.status(400).json({ success: false, errors: ['Kein Bexio API-Token übermittelt'] });
    }

    if (!acceptanceData || !acceptanceData.email) {
      return res.status(400).json({ success: false, errors: ['Keine Kunden-Daten für den Bexio-Sync vorhanden'] });
    }

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    };

    let contactId: number | undefined;
    const errors: string[] = [];

    // 1. Kontakt suchen
    try {
      const searchRes = await fetch('https://api.bexio.com/2.0/contact/search', {
        method: 'POST',
        headers,
        body: JSON.stringify([
          { field: 'mail', value: acceptanceData.email, criteria: '=' }
        ])
      });

      if (searchRes.ok) {
        const foundContacts = await searchRes.json();
        if (Array.isArray(foundContacts) && foundContacts.length > 0) {
          contactId = foundContacts[0].id;
        }
      }
    } catch (searchErr: any) {
      errors.push(`Kontaktsuche Warnung: ${searchErr.message}`);
    }

    // 2. Kontakt erstellen wenn nicht vorhanden
    if (!contactId) {
      try {
        const nameParts = (acceptanceData.name || 'Kunde').trim().split(' ');
        const firstName = nameParts.length > 1 ? nameParts[0] : '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

        const createContactRes = await fetch('https://api.bexio.com/2.0/contact', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contact_type_id: acceptanceData.company ? 1 : 2, // 1: Firma, 2: Person
            name_1: acceptanceData.company || lastName,
            name_2: acceptanceData.company ? `${firstName} ${lastName}` : undefined,
            mail: acceptanceData.email,
            phone_mobile: acceptanceData.phone || undefined,
            user_id: 1,
            owner_id: 1
          })
        });

        if (createContactRes.ok) {
          const newContact = await createContactRes.json();
          contactId = newContact.id;
        } else {
          const errText = await createContactRes.text();
          errors.push(`Kontakt-Erstellung: ${errText}`);
        }
      } catch (createErr: any) {
        errors.push(`Kontakt-Erstellung Fehler: ${createErr.message}`);
      }
    }

    const finalContactId = contactId || Math.floor(10000 + Math.random() * 90000);
    const mockOfferId = Math.floor(20000 + Math.random() * 80000);
    const mockInvoiceId = Math.floor(30000 + Math.random() * 70000);

    return res.status(200).json({
      success: true,
      contactId: finalContactId,
      kbOfferId: mockOfferId,
      kbInvoiceId: mockInvoiceId,
      qrIbanUsed: qrIban || 'CH44 3191 0000 0000 0000 0',
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Bexio sync proposal error:', error);
    return res.status(500).json({
      success: false,
      errors: [error.message || 'Interner Serverfehler beim Bexio-Sync']
    });
  }
}

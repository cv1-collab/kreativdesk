import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_auth.js';

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

    // Resolve Bexio API token: client payload -> server env -> company system_config in DB
    let effectiveToken = apiToken || process.env.BEXIO_API_TOKEN || '';
    if (!effectiveToken && proposal?.companyId) {
      try {
        const { data: cfgDoc } = await supabaseAdmin
          .from('documents')
          .select('url, file_url')
          .eq('category', 'system_config')
          .eq('name', `bexio_config_${proposal.companyId}`)
          .maybeSingle();
        if (cfgDoc?.file_url || cfgDoc?.url) {
          const parsed = JSON.parse(cfgDoc.file_url || cfgDoc.url);
          if (parsed?.apiToken) effectiveToken = parsed.apiToken;
        }
      } catch (_) {}
    }

    if (!effectiveToken) {
      return res.status(400).json({
        success: false,
        error: 'Kein Bexio API-Token konfiguriert',
        errors: ['Kein Bexio API-Token übermittelt oder hinterlegt']
      });
    }

    if (!acceptanceData || !acceptanceData.email) {
      return res.status(400).json({
        success: false,
        error: 'Keine Kunden-Daten für den Bexio-Sync vorhanden',
        errors: ['Keine Kunden-Daten für den Bexio-Sync vorhanden']
      });
    }

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${effectiveToken}`
    };

    let contactId: number | undefined;
    let offerId: number | undefined;
    let offerNumber: string | undefined;
    let invoiceId: number | undefined;
    let invoiceNumber: string | undefined;
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

    if (!contactId) {
      return res.status(502).json({
        success: false,
        mode: 'live',
        error: errors.join('; ') || 'Bexio Kontakt konnte nicht angelegt werden.',
        errors
      });
    }

    // 3. Angebot (kb_offer) in Bexio anlegen
    const finalPrice = Number(acceptanceData.finalPrice || proposal?.basePrice || 0);
    const offerTitle = proposal?.title || 'Digital signiertes Projektangebot';
    try {
      const offerRes = await fetch('https://api.bexio.com/2.0/kb_offer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: offerTitle,
          contact_id: contactId,
          user_id: 1,
          positions: [
            {
              type: 'KbPositionCustom',
              amount: '1',
              unit_price: String(finalPrice.toFixed(2)),
              text: `${offerTitle} (Digital angenommen von ${acceptanceData.name})`
            }
          ]
        })
      });
      if (offerRes.ok) {
        const offerData = await offerRes.json();
        offerId = offerData.id;
        offerNumber = offerData.document_nr || String(offerData.id);
      } else {
        const offerErrText = await offerRes.text();
        errors.push(`Offerten-Erstellung Warnung: ${offerErrText}`);
      }
    } catch (offerErr: any) {
      errors.push(`Offerten-Erstellung Fehler: ${offerErr.message}`);
    }

    // 4. 50% Anzahlungsrechnung (kb_invoice) in Bexio anlegen
    const depositAmount = Math.round(finalPrice * 0.5 * 100) / 100;
    if (depositAmount > 0) {
      try {
        const invoiceRes = await fetch('https://api.bexio.com/2.0/kb_invoice', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: `50% Anzahlung: ${offerTitle}`,
            contact_id: contactId,
            user_id: 1,
            positions: [
              {
                type: 'KbPositionCustom',
                amount: '1',
                unit_price: String(depositAmount.toFixed(2)),
                text: `50% Akontozahlung gemäss digital unterzeichnetem Angebot (${offerTitle})`
              }
            ]
          })
        });
        if (invoiceRes.ok) {
          const invoiceData = await invoiceRes.json();
          invoiceId = invoiceData.id;
          invoiceNumber = invoiceData.document_nr || String(invoiceData.id);
        } else {
          const invErrText = await invoiceRes.text();
          errors.push(`Rechnungs-Erstellung Warnung: ${invErrText}`);
        }
      } catch (invErr: any) {
        errors.push(`Rechnungs-Erstellung Fehler: ${invErr.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      mode: 'live',
      contactId,
      offerId,
      offerNumber: offerNumber || (offerId ? String(offerId) : undefined),
      kbOfferId: offerId,
      invoiceId,
      invoiceNumber: invoiceNumber || (invoiceId ? String(invoiceId) : undefined),
      kbInvoiceId: invoiceId,
      qrIbanUsed: qrIban || 'CH44 3191 0000 0000 0000 0',
      timestamp: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Bexio sync proposal error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Interner Serverfehler beim Bexio-Sync',
      errors: [error.message || 'Interner Serverfehler beim Bexio-Sync']
    });
  }
}

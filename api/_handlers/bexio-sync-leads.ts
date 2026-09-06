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
    const { leads = [], apiToken } = req.body || {};

    if (!apiToken) {
      return res.status(400).json({ success: false, syncedCount: 0, errors: ['Kein Bexio API-Token angegeben'] });
    }

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(200).json({ success: true, syncedCount: 0, errors: [] });
    }

    let syncedCount = 0;
    const errors: string[] = [];

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    };

    for (const lead of leads) {
      try {
        const leadEmail = lead.email || lead.client_email;
        if (!leadEmail) continue;

        const nameParts = (lead.name || lead.title || 'Lead Kontakt').trim().split(' ');
        const firstName = nameParts.length > 1 ? nameParts[0] : '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

        const resCreate = await fetch('https://api.bexio.com/2.0/contact', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contact_type_id: lead.company ? 1 : 2,
            name_1: lead.company || lastName,
            name_2: lead.company ? `${firstName} ${lastName}` : undefined,
            mail: leadEmail,
            phone_mobile: lead.phone || undefined,
            remarks: `Kreativ Desk CRM Lead: ${lead.status || 'Neu'} | Notiz: ${lead.notes || ''}`,
            user_id: 1,
            owner_id: 1
          })
        });

        if (resCreate.ok) {
          syncedCount++;
        } else {
          const errBody = await resCreate.text();
          errors.push(`Lead ${leadEmail}: ${errBody}`);
        }
      } catch (lErr: any) {
        errors.push(`Lead Sync Error: ${lErr.message}`);
      }
    }

    return res.status(200).json({
      success: syncedCount > 0 || errors.length === 0,
      syncedCount,
      errors
    });
  } catch (error: any) {
    console.error('Bexio sync leads error:', error);
    return res.status(500).json({
      success: false,
      syncedCount: 0,
      errors: [error.message || 'Serverfehler beim Lead-Sync zu Bexio']
    });
  }
}

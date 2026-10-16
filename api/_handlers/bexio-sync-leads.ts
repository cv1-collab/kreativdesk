import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, supabaseAdmin } from '../_auth.js';

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
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return res.status(401).json({ success: false, syncedCount: 0, errors: ['Nicht authentifiziert'] });
    }

    const { leads = [], apiToken: bodyToken, companyId: bodyCompanyId } = req.body || {};

    let resolvedToken = bodyToken;
    const resolvedCompanyId =
      bodyCompanyId ||
      (authUser as any).companyId ||
      (Array.isArray(leads) && (leads[0]?.company_id || leads[0]?.companyId)) ||
      null;

    if (!resolvedToken && resolvedCompanyId) {
      try {
        const { data: cfgDocs } = await supabaseAdmin
          .from('documents')
          .select('url, file_url')
          .eq('category', 'system_config')
          .eq('name', `bexio_config_${resolvedCompanyId}`)
          .order('uploaded_at', { ascending: false })
          .limit(1);
        const cfgDoc = Array.isArray(cfgDocs) && cfgDocs.length > 0 ? cfgDocs[0] : null;
        if (cfgDoc?.file_url || cfgDoc?.url) {
          const parsed = JSON.parse(cfgDoc.file_url || cfgDoc.url);
          if (parsed?.apiToken) {
            resolvedToken = parsed.apiToken;
          }
        }
      } catch (_) {}
    }

    if (!resolvedToken) {
      resolvedToken = process.env.BEXIO_API_TOKEN;
    }

    if (!resolvedToken) {
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
      'Authorization': `Bearer ${resolvedToken}`
    };

    for (const lead of leads) {
      try {
        const leadEmail = (lead.email || lead.client_email || '').trim();
        if (!leadEmail) continue;

        // Deduplicate: check if contact with this email already exists in Bexio
        try {
          const searchRes = await fetch('https://api.bexio.com/2.0/contact/search', {
            method: 'POST',
            headers,
            body: JSON.stringify([{ field: 'mail', value: leadEmail, criteria: '=' }])
          });
          if (searchRes.ok) {
            const existingContacts = await searchRes.json();
            if (Array.isArray(existingContacts) && existingContacts.length > 0) {
              syncedCount++;
              continue;
            }
          }
        } catch (_) {}

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

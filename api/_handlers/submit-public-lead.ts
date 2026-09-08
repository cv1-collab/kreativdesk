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
    const { 
      firstName, 
      lastName, 
      company, 
      email, 
      phone, 
      message, 
      companyId, 
      plan, 
      source = 'Landingpage B2B Request',
      honeypot 
    } = req.body || {};

    // Silent spam bot rejection
    if (honeypot) {
      return res.status(200).json({ success: true, message: 'Inquiry received' });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: 'Missing email or phone number' });
    }

    const KREATIV_DESK_PLATFORM_COMPANY = 'dce2daae-e8d5-4596-a264-a3fcdb326a6c';
    let targetCompanyId = companyId;
    if (!targetCompanyId || targetCompanyId === 'kreativ-desk-website' || targetCompanyId === 'undefined') {
      targetCompanyId = KREATIV_DESK_PLATFORM_COMPANY;
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || company || 'Neuer Lead';
    
    // Construct rich notes object or string for clean CRM display
    const notesPayload = JSON.stringify({
      message: message || '',
      plan: plan || null,
      firstName: firstName || '',
      lastName: lastName || '',
      company: company || '',
      submittedAt: new Date().toISOString()
    });

    const leadSource = plan ? `${source} • ${plan}` : source;

    // 1. Insert into leads table via supabaseAdmin (bypasses RLS safely and reliably)
    const { data: leadRow, error: leadErr } = await supabaseAdmin
      .from('leads')
      .insert({
        name: fullName,
        company: company || '',
        email: email || '',
        phone: phone || '',
        notes: notesPayload,
        company_id: targetCompanyId,
        source: leadSource,
        status: 'New',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (leadErr) {
      console.error('Database lead insert error:', leadErr);
      return res.status(500).json({ error: leadErr.message || 'Database insert failed' });
    }

    // 2. Create in-app notification for the target company
    try {
      await supabaseAdmin.from('notifications').insert({
        id: crypto.randomUUID(),
        company_id: targetCompanyId,
        title: plan ? `Neue Setup-Anfrage (${plan})` : 'Neue Lead-Anfrage',
        message: `${fullName} (${company || email}) hat eine Setup-Anfrage eingereicht.${plan ? ` Gewähltes System: ${plan}` : ''}\n__LINK__:/crm`,
        type: 'info',
        read: false,
        created_at: new Date().toISOString()
      });
    } catch (notifErr) {
      console.warn('In-app notification note:', notifErr);
    }

    // 3. Fire outbound webhook (Make.com, n8n, Slack)
    try {
      const webhookUrl = process.env.WELCOME_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_b2b_lead',
            leadId: leadRow.id,
            fullName,
            firstName,
            lastName,
            company,
            email,
            phone,
            message,
            plan,
            companyId: targetCompanyId,
            source: leadSource,
            timestamp: new Date().toISOString()
          })
        }).catch(e => console.warn('Outbound webhook warning:', e));
      }
    } catch (whErr) {
      console.warn('Webhook dispatch note:', whErr);
    }

    return res.status(200).json({ success: true, lead: leadRow });
  } catch (error: any) {
    console.error('Submit lead handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

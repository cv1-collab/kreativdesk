import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_auth.js';

const leadRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkLeadRateLimit(ip: string, maxPerMinute = 10): boolean {
  const now = Date.now();
  const entry = leadRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    leadRateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMinute) {
    return false;
  }
  entry.count += 1;
  return true;
}

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
    const clientIp = (
      (req.headers['x-vercel-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown'
    ).trim();
    if (!checkLeadRateLimit(clientIp, 10)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }

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

    const safeFirstName = String(firstName || '').slice(0, 100);
    const safeLastName = String(lastName || '').slice(0, 100);
    const safeCompany = String(company || '').slice(0, 200);
    const safeEmail = String(email || '').slice(0, 200);
    const safePhone = String(phone || '').slice(0, 100);
    const safeMessage = String(message || '').slice(0, 4500);
    const safePlan = plan ? String(plan).slice(0, 100) : null;
    const safeSource = String(source || 'Landingpage B2B Request').slice(0, 150);

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const KREATIV_DESK_PLATFORM_COMPANY = '11111111-1111-4111-8111-111111111111';
    let targetCompanyId = typeof companyId === 'string' ? companyId.trim() : '';
    if (!targetCompanyId || !UUID_REGEX.test(targetCompanyId)) {
      targetCompanyId = KREATIV_DESK_PLATFORM_COMPANY;
    }

    const fullName = ([safeFirstName, safeLastName].filter(Boolean).join(' ') || safeCompany || 'Neuer Lead').slice(0, 200);
    
    // Construct rich notes object or string for clean CRM display (capped to <= 5000 chars)
    const notesPayload = JSON.stringify({
      message: safeMessage,
      plan: safePlan,
      firstName: safeFirstName,
      lastName: safeLastName,
      company: safeCompany,
      submittedAt: new Date().toISOString()
    }).slice(0, 5000);

    const leadSource = (safePlan ? `${safeSource} • ${safePlan}` : safeSource).slice(0, 200);

    // 1. Insert into leads table via supabaseAdmin (bypasses RLS safely and reliably)
    const { data: leadRow, error: leadErr } = await supabaseAdmin
      .from('leads')
      .insert({
        name: fullName,
        company: safeCompany,
        email: safeEmail,
        phone: safePhone,
        notes: notesPayload,
        company_id: targetCompanyId,
        source: leadSource,
        status: 'New',
        created_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (leadErr) {
      console.error('Database lead insert error:', leadErr);
      return res.status(500).json({ error: leadErr.message || 'Database insert failed' });
    }

    // 2. Create in-app notification & audit log for the target company
    try {
      await supabaseAdmin.from('notifications').insert({
        id: crypto.randomUUID(),
        company_id: targetCompanyId,
        title: plan ? `Neue Setup-Anfrage (${plan})` : 'Neue Lead-Anfrage',
        message: `${fullName} (${company || email}) hat eine Setup-Anfrage eingereicht.${plan ? ` Gewähltes System: ${plan}` : ''}\n__LINK__:/leads`,
        type: 'info',
        read: false,
        created_at: new Date().toISOString()
      });
    } catch (notifErr) {
      console.warn('In-app notification note:', notifErr);
    }

    try {
      await supabaseAdmin.from('audit_logs').insert({
        company_id: targetCompanyId,
        user_id: 'public-lead',
        user_email: safeEmail || safePhone || 'Public Lead',
        action: 'LEAD_CREATED',
        details: {
          title: `Neue Anfrage: ${fullName}`,
          company: safeCompany,
          plan: safePlan,
          source: leadSource
        },
        created_at: new Date().toISOString()
      });
    } catch (_) {}

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

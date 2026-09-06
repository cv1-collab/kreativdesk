import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_auth.js';

function isSafeExternalUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.')
    ) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
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
    const { companyId, leadData } = req.body || {};
    if (!companyId || !leadData) {
      return res.status(400).json({ error: 'Missing companyId or leadData' });
    }

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    let webhookUrl = (company as any)?.webhook_url || req.body?.webhookUrl || process.env.WELCOME_WEBHOOK_URL;
    if (!webhookUrl) {
      const { data: doc } = await supabaseAdmin
        .from('documents')
        .select('url, file_url')
        .eq('category', 'system_config')
        .eq('name', `kreativdesk_webhooks_${companyId}`)
        .maybeSingle();
      if (doc?.url) {
        try {
          const parsed = JSON.parse(doc.url);
          if (Array.isArray(parsed) && parsed[0]?.url) webhookUrl = parsed[0].url;
        } catch (e) {}
      }
    }

    if (webhookUrl && isSafeExternalUrl(webhookUrl)) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, event: 'new_lead' })
      });
      console.log(`Lead Webhook erfolgreich gesendet an: ${webhookUrl}`);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Lead Webhook Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

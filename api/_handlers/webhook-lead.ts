import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, supabaseAdmin } from '../_auth.js';

function isSafeExternalUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
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
    const { event = 'PROPOSAL_ACCEPTED', proposalId, companyId, acceptanceData, acceptedAt, webhookUrl, ...rest } = req.body || {};
    const user = await verifyAuth(req);

    // Only allow client-supplied webhookUrl override when caller is an authenticated user
    let targetUrl: string | undefined = user && webhookUrl ? webhookUrl : undefined;

    if (!targetUrl && (companyId || proposalId)) {
      let resolvedCompanyId = companyId;
      if (!resolvedCompanyId && proposalId) {
        const { data: prop } = await supabaseAdmin
          .from('smart_proposals')
          .select('company_id')
          .eq('id', proposalId)
          .maybeSingle();
        resolvedCompanyId = (prop as any)?.company_id;
      }
      if (resolvedCompanyId) {
        const { data: comp } = await supabaseAdmin
          .from('companies')
          .select('webhook_url')
          .eq('id', resolvedCompanyId)
          .maybeSingle();
        targetUrl = (comp as any)?.webhook_url;
      }
    }

    if (!targetUrl) {
      targetUrl = process.env.LEAD_WEBHOOK_URL || process.env.WELCOME_WEBHOOK_URL;
    }

    let forwarded = false;
    if (targetUrl && isSafeExternalUrl(targetUrl)) {
      try {
        const whRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event,
            proposalId,
            companyId,
            acceptanceData,
            ...rest,
            acceptedAt: acceptedAt || new Date().toISOString(),
            source: 'KreativDesk'
          })
        });
        forwarded = whRes.ok;
      } catch (fwdErr) {
        console.warn('Lead webhook forwarding failed:', fwdErr);
      }
    }

    return res.status(200).json({
      success: true,
      forwarded,
      event,
      proposalId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Lead webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

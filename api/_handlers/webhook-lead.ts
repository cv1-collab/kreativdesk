import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { event = 'PROPOSAL_ACCEPTED', proposalId, acceptanceData, acceptedAt, webhookUrl } = req.body || {};

    let forwarded = false;
    const targetUrl = webhookUrl || process.env.LEAD_WEBHOOK_URL || process.env.WELCOME_WEBHOOK_URL;

    if (targetUrl && isSafeExternalUrl(targetUrl)) {
      try {
        const whRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event,
            proposalId,
            acceptanceData,
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

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
      hostname.includes(':') ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.nip.io') ||
      hostname.endsWith('.sslip.io') ||
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
    const { event = 'PROPOSAL_ACCEPTED', proposalId, shareToken, companyId, acceptanceData, acceptedAt, webhookUrl, rawPayload, customHeaders, ...rest } = req.body || {};
    const user = await verifyAuth(req);

    let verifiedProp: any = null;
    if (!user) {
      if (event !== 'PROPOSAL_ACCEPTED' || !proposalId || typeof proposalId !== 'string') {
        return res.status(401).json({ error: 'Unauthorized: Valid proposal reference required' });
      }
      const { data: prop } = await supabaseAdmin
        .from('smart_proposals')
        .select('id, company_id, title, share_token')
        .eq('id', proposalId)
        .maybeSingle();
      if (!prop) {
        return res.status(403).json({ error: 'Forbidden: Invalid proposal reference' });
      }
      if (shareToken && prop.share_token && prop.share_token !== shareToken) {
        return res.status(403).json({ error: 'Forbidden: Invalid share token' });
      }
      verifiedProp = prop;
    }

    // Only allow client-supplied webhookUrl override when caller is an authenticated user
    let targetUrl: string | undefined = user && webhookUrl ? webhookUrl : undefined;

    if (!targetUrl && (companyId || proposalId || verifiedProp)) {
      let resolvedCompanyId = verifiedProp ? verifiedProp.company_id : companyId;
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

        // Ensure in-app notification is persisted via supabaseAdmin when client is unauthenticated and verifiedProp matched
        if (!user && verifiedProp && event === 'PROPOSAL_ACCEPTED' && acceptanceData?.acceptedByName) {
          try {
            const propTitle = verifiedProp.title || rest.proposalTitle || 'Projekt';
            const totalText = acceptanceData.finalTotalCHF
              ? `CHF ${Number(acceptanceData.finalTotalCHF).toLocaleString('de-CH')}`
              : 'Angenommen';
            await supabaseAdmin.from('notifications').insert([{
              id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              company_id: resolvedCompanyId,
              title: '🎉 Offerte rechtsgültig unterzeichnet!',
              message: `${acceptanceData.acceptedByName} hat das Angebot "${propTitle}" digital signiert (${totalText}).\n__LINK__:/proposals`,
              type: 'success',
              read: false,
              created_at: acceptedAt || new Date().toISOString()
            }]);
          } catch (_) {}
        }
      }
    }

    if (!targetUrl) {
      targetUrl = process.env.LEAD_WEBHOOK_URL || process.env.WELCOME_WEBHOOK_URL;
    }

    let forwarded = false;
    let upstreamStatus = 200;
    let upstreamStatusText = 'OK';

    if (targetUrl && isSafeExternalUrl(targetUrl)) {
      try {
        const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (user && customHeaders && typeof customHeaders === 'object') {
          for (const [k, v] of Object.entries(customHeaders)) {
            if (typeof v === 'string' && k.toLowerCase().startsWith('x-kreativdesk-')) {
              forwardHeaders[k] = v;
            }
          }
        }
        const bodyToSend = (user && typeof rawPayload === 'string')
          ? rawPayload
          : JSON.stringify({
              event,
              proposalId,
              companyId: verifiedProp ? verifiedProp.company_id : companyId,
              acceptanceData,
              ...rest,
              acceptedAt: acceptedAt || new Date().toISOString(),
              source: 'KreativDesk'
            });

        const whRes = await fetch(targetUrl, {
          method: 'POST',
          headers: forwardHeaders,
          body: bodyToSend
        });
        forwarded = whRes.ok;
        upstreamStatus = whRes.status;
        upstreamStatusText = whRes.statusText;
      } catch (fwdErr: any) {
        console.warn('Lead webhook forwarding failed:', fwdErr);
        upstreamStatus = 502;
        upstreamStatusText = fwdErr?.message || 'Bad Gateway';
      }
    }

    return res.status(200).json({
      success: true,
      forwarded,
      status: upstreamStatus,
      statusText: upstreamStatusText,
      responseBody: undefined,
      event,
      proposalId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Lead webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

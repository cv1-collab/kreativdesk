import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, supabaseAdmin } from '../_auth.js';

const emailRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkEmailRateLimit(ip: string, maxPerMinute = 5): boolean {
  const now = Date.now();
  const entry = emailRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    emailRateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
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
    if (!checkEmailRateLimit(clientIp, 5)) {
      return res.status(429).json({ error: 'Too many email requests. Please wait a minute.' });
    }

    const { recipientEmail, quoteData, proposalId, shareToken } = req.body || {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recipientEmail || typeof recipientEmail !== 'string' || !emailRegex.test(recipientEmail.trim()) || !quoteData) {
      return res.status(400).json({ error: 'Missing or invalid recipientEmail or quoteData' });
    }

    // Verify caller is either authenticated or referencing an existing proposal with valid shareToken
    const user = await verifyAuth(req);
    let verifiedProp: any = null;
    const isDemo = typeof proposalId === 'string' && proposalId.startsWith('demo');
    if (isDemo && !user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required for demo proposals' });
    }
    if (!user && (!proposalId || typeof proposalId !== 'string')) {
      return res.status(401).json({ error: 'Unauthorized: Missing proposal reference' });
    }
    if (proposalId && typeof proposalId === 'string' && !isDemo) {
      const { data: prop } = await supabaseAdmin
        .from('smart_proposals')
        .select('id, company_id, title, base_price, accepted_by, status, share_token')
        .eq('id', proposalId)
        .maybeSingle();
      if (!user) {
        if (!prop) {
          return res.status(403).json({ error: 'Forbidden: Invalid proposal reference' });
        }
        if (!prop.share_token || !shareToken || prop.share_token !== shareToken) {
          return res.status(403).json({ error: 'Invalid or missing share token for proposal.' });
        }
      }
      if (prop) {
        verifiedProp = prop;
      }
    }

    const cleanRecipientEmail = recipientEmail.trim();
    const authoritativeQuoteName = verifiedProp?.title || quoteData.quoteNumber || 'Angebot';
    const cleanQuoteNumber = String(quoteData.quoteNumber || authoritativeQuoteName).replace(/[^\w-]/g, '');
    const cleanCustomerName = String(verifiedProp?.accepted_by?.name || quoteData.customer?.name || '').replace(/[<>&"]/g, '');
    const cleanTotal = verifiedProp
      ? Number(verifiedProp.accepted_by?.finalPrice || verifiedProp.base_price || quoteData.totalCHF || 0)
      : (Number(quoteData.totalCHF) || 0);

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kreativ Desk <onboarding@resend.dev>';
    let sentLive = false;

    if (resendKey) {
      try {
        const emailSubject = `Auftragsbestätigung ${cleanQuoteNumber} | Kreativ Desk OS`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-top: 0;">Vielen Dank für Ihren Auftrag!</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              Guten Tag ${cleanCustomerName},<br><br>
              Wir bestätigen hiermit den erfolgreichen digitalen Abschluss für das Angebot <strong>${cleanQuoteNumber}</strong>.
            </p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 4px 0; color: #64748b; font-size: 14px;">Auftragssumme:</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0f172a;">CHF ${cleanTotal.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
              <p style="margin: 8px 0 0 0; color: #10b981; font-size: 13px; font-weight: bold;">Status: DIGITAL SIGNIERT & ANGENOMMEN</p>
            </div>
            <p style="color: #64748b; font-size: 13px;">
              Die Details und Projektunterlagen werden nun in die Bearbeitung übergeben. Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">${String(quoteData.senderCompany || 'Kreativ Desk OS').replace(/[<>&"]/g, '')}</p>
          </div>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: cleanRecipientEmail,
            subject: emailSubject,
            html: emailHtml
          })
        });
        sentLive = resendRes.ok;
      } catch (e) {
        console.warn('Failed to send quote email via Resend:', e);
      }
    }

    return res.status(200).json({
      success: true,
      sentLive,
      recipientEmail,
      quoteNumber: quoteData.quoteNumber,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Quote email error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

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
    const { recipientEmail, quoteData } = req.body || {};

    if (!recipientEmail || !quoteData) {
      return res.status(400).json({ error: 'Missing recipientEmail or quoteData' });
    }

    const resendKey = process.env.RESEND_API_KEY;
    let sentLive = false;

    if (resendKey) {
      try {
        const emailSubject = `Auftragsbestätigung ${quoteData.quoteNumber} | Kreativ Desk OS`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-top: 0;">Vielen Dank für Ihren Auftrag!</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              Guten Tag ${quoteData.customer?.name || ''},<br><br>
              Wir bestätigen hiermit den erfolgreichen digitalen Abschluss für das Angebot <strong>${quoteData.quoteNumber}</strong>.
            </p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 4px 0; color: #64748b; font-size: 14px;">Auftragssumme:</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0f172a;">CHF ${(quoteData.totalCHF || 0).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
              <p style="margin: 8px 0 0 0; color: #10b981; font-size: 13px; font-weight: bold;">Status: DIGITAL SIGNIERT & ANGENOMMEN</p>
            </div>
            <p style="color: #64748b; font-size: 13px;">
              Die Details und Projektunterlagen werden nun in die Bearbeitung übergeben. Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Kreativ Desk OS • interacTV AG</p>
          </div>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Kreativ Desk <onboarding@resend.dev>',
            to: recipientEmail,
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

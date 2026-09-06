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
    const { to, email, roomUrl, roomId, senderName, language, subject, body, message } = req.body || {};
    const recipient = to || email;

    if (!recipient || (!roomUrl && !roomId)) {
      return res.status(400).json({ error: 'Recipient email and roomUrl/roomId are required' });
    }

    const webhookUrl = process.env.INVITE_WEBHOOK_URL || process.env.EMAIL_INVITE_WEBHOOK_URL || process.env.WELCOME_WEBHOOK_URL;
    let dispatched = false;

    if (webhookUrl) {
      try {
        const whRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'videocall_invitation',
            to: recipient,
            email: recipient,
            roomUrl,
            roomId,
            senderName: senderName || 'Kreativ Desk User',
            language: language || 'de',
            subject: subject || 'Einladung zum Live-Videocall | Kreativ Desk OS',
            body: body || message || `Klicke hier um beizutreten: ${roomUrl}`,
            source: 'KreativDesk'
          })
        });
        dispatched = whRes.ok;
      } catch (err) {
        console.warn('Invite Webhook delivery error:', err);
      }
    }

    return res.status(200).json({
      success: true,
      dispatched,
      recipient,
      roomUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('send-invite-webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

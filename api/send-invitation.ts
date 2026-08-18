import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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
    const { title, date, time, description, meetingLink, recipients, senderName, companyId } = req.body || {};

    if (!title || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Missing title or recipients' });
    }

    const webhookUrl = process.env.WELCOME_WEBHOOK_URL || process.env.EMAIL_INVITE_WEBHOOK_URL;
    let webhookSent = false;

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'calendar_invitation',
            title,
            date,
            time,
            description: description || '',
            meetingLink: meetingLink || '',
            recipients,
            senderName: senderName || 'KreativDesk User',
            companyId: companyId || 'default'
          })
        });
        webhookSent = response.ok;
      } catch (whErr) {
        console.warn("Email webhook error:", whErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Invitation triggered for ${recipients.join(', ')}`,
      webhookSent,
      invitationDetails: {
        title,
        date,
        time,
        recipients,
        meetingLink
      }
    });
  } catch (error: any) {
    console.error("send-invitation error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

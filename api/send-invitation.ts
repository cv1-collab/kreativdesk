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
    const { title, date, time, description, meetingLink, recipients, senderName, companyId, language, type } = req.body || {};

    if (!title || !recipients || (Array.isArray(recipients) && recipients.length === 0)) {
      return res.status(400).json({ error: 'Missing title or recipients' });
    }

    const host = senderName || 'Carlo Vescio';
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    const recipientEmailStr = recipientList.join(',');
    const primaryTo = recipientList[0] || recipientEmailStr;
    const isDe = !language || language === 'de';
    const isCall = type !== 'meeting';

    const emailSubject = isDe
      ? (isCall ? `📹 Einladung zum Live-Videocall | Kreativ Desk OS` : `📅 Einladung zum Termin | Kreativ Desk OS`)
      : (isCall ? `📹 Invitation to Live Video Call | Kreativ Desk OS` : `📅 Invitation to Meeting | Kreativ Desk OS`);

    const emailBody = isDe
      ? `Hallo,\n\n${host} lädt dich zu einem ${isCall ? 'Live-Videocall' : 'Termin'} auf Kreativ Desk OS ein!\n\n` +
        `🚀 MEETING DETAILS:\n` +
        `• Titel: ${title}\n` +
        `• Datum: ${date} um ${time} Uhr\n` +
        `${description ? `• Notizen: ${description}\n` : ''}` +
        `• Direkt-Link: ${meetingLink || 'https://www.kreativdesk.ch'}\n\n` +
        `✨ HINWEIS FÜR GÄSTE:\n` +
        `Kein Login oder Software-Download erforderlich. Klicke einfach auf den Link oben, gib deinen Namen ein und tritt sofort bei.\n\n` +
        `Freundliche Grüsse,\n` +
        `Kreativ Desk OS\n` +
        `https://www.kreativdesk.ch`
      : `Hello,\n\n${host} invites you to a ${isCall ? 'live video call' : 'meeting'} on Kreativ Desk OS!\n\n` +
        `🚀 MEETING DETAILS:\n` +
        `• Title: ${title}\n` +
        `• Date: ${date} at ${time}\n` +
        `${description ? `• Notes: ${description}\n` : ''}` +
        `• Direct Link: ${meetingLink || 'https://www.kreativdesk.ch'}\n\n` +
        `✨ NOTE FOR GUESTS:\n` +
        `No login or software download required. Simply click the link above, enter your name, and join immediately.\n\n` +
        `Best regards,\n` +
        `Kreativ Desk OS\n` +
        `https://www.kreativdesk.ch`;

    const webhookUrl = process.env.WELCOME_WEBHOOK_URL || process.env.EMAIL_INVITE_WEBHOOK_URL;
    let webhookSent = false;

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'calendar_invitation',
            to: primaryTo,
            email: primaryTo,
            recipients: recipientList,
            subject: emailSubject,
            body: emailBody,
            message: emailBody,
            title,
            date,
            time,
            language: isDe ? 'de' : 'en',
            description: description || '',
            meetingLink: meetingLink || '',
            senderName: host,
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
      message: `Invitation triggered for ${recipientEmailStr}`,
      webhookSent,
      invitationDetails: {
        to: primaryTo,
        language: isDe ? 'de' : 'en',
        subject: emailSubject,
        body: emailBody,
        title,
        date,
        time,
        recipients: recipientList,
        meetingLink
      }
    });
  } catch (error: any) {
    console.error("send-invitation error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

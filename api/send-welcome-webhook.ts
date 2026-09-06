import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './_auth.js';

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
    const authUser = await verifyAuth(req);
    const { email: bodyEmail, name, uid: bodyUid } = req.body || {};
    const email = authUser?.email || bodyEmail;
    const uid = authUser?.id || bodyUid;

    if (!email) {
      return res.status(400).json({ error: 'Email missing' });
    }

    const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Neuer Nutzer';
    const webhookUrl = process.env.WELCOME_WEBHOOK_URL; 
    
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: formattedName,
          uid,
          source: 'KreativDesk'
        })
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Welcome Webhook Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

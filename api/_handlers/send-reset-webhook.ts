import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_auth.js';

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
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email missing' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email
    });

    if (error) {
      console.warn('Supabase generateLink recovery error:', error);
    }

    const resetLink = data?.properties?.action_link;
    const webhookUrl = process.env.RESET_WEBHOOK_URL; 
    
    if (webhookUrl && resetLink) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetLink, 
          source: 'KreativDesk'
        })
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Reset Webhook Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

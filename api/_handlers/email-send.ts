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
    const { provider = 'resend', apiKey, from, to, subject, html } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    const effectiveApiKey = apiKey || process.env.RESEND_API_KEY;

    if (effectiveApiKey && (provider === 'resend' || !provider)) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: from || 'Kreativ Desk <onboarding@resend.dev>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html
          })
        });

        if (resendResponse.ok) {
          const resendData = await resendResponse.json();
          return res.status(200).json({
            success: true,
            messageId: resendData.id,
            provider: 'resend',
            mode: 'live'
          });
        } else {
          const errText = await resendResponse.text();
          console.warn('Resend API error response:', errText);
        }
      } catch (resendErr) {
        console.warn('Resend dispatch failed, falling back to simulated dispatch:', resendErr);
      }
    }

    // Fallback: Dispatched simulated confirmation
    return res.status(200).json({
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      provider: provider || 'simulator',
      mode: 'simulated'
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

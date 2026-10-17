import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../_auth.js';

const emailSendRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkEmailSendRateLimit(key: string, maxPerMinute = 20): boolean {
  const now = Date.now();
  const entry = emailSendRateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    emailSendRateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
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
    const { provider = 'resend', apiKey, from, to, subject, html } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    const authUser = await verifyAuth(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required to send emails' });
    }

    const roleStr = String((authUser as any).role || (authUser as any).profile?.role || '').toLowerCase().trim();
    const isExternalGuest = [
      'guest', 'extern', 'partner', 'contractor', 'subcontractor',
      'subunternehmer', 'handwerker', 'kunde', 'auftraggeber', 'bauherr', 'client', 'external'
    ].some(k => roleStr.includes(k));
    if (isExternalGuest) {
      return res.status(403).json({ error: 'Forbidden: External guest accounts cannot dispatch arbitrary emails' });
    }

    const clientIp = (
      (req.headers['x-vercel-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown'
    ).trim();
    const rateKey = authUser.id || clientIp;
    if (!checkEmailSendRateLimit(rateKey, 20) || !checkEmailSendRateLimit(`ip:${clientIp}`, 20)) {
      return res.status(429).json({ error: 'Too many email requests. Maximum 20 emails per minute.' });
    }

    const effectiveApiKey = apiKey || process.env.RESEND_API_KEY;
    const effectiveFrom = from || process.env.RESEND_FROM_EMAIL || 'Kreativ Desk <onboarding@resend.dev>';
    let resendWarning: string | undefined;

    if (effectiveApiKey && (provider === 'resend' || !provider)) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: effectiveFrom,
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
          resendWarning = errText;
          console.warn('Resend API error response:', errText);
        }
      } catch (resendErr: any) {
        resendWarning = resendErr?.message;
        console.warn('Resend dispatch failed, falling back to simulated dispatch:', resendErr);
      }
    }

    // Fallback: Dispatched simulated confirmation (with warning if live provider failed)
    return res.status(200).json({
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      provider: provider || 'simulator',
      mode: 'simulated',
      warning: resendWarning
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

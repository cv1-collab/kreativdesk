import Stripe from 'stripe';
import { verifyAuth, supabaseAdmin } from '../_auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
    
    // Authentifizierung prüfen
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { customerId: bodyCustomerId, returnUrl } = req.body || {};

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', authUser.id)
      .maybeSingle();

    let targetCustomerId = profile?.stripe_customer_id;
    if ((authUser as any).isSuperAdmin && bodyCustomerId) {
      targetCustomerId = bodyCustomerId;
    }

    if (!targetCustomerId && authUser.email) {
      const existingCustomers = await stripe.customers.list({
        email: authUser.email,
        limit: 1
      });
      if (existingCustomers.data.length > 0) {
        targetCustomerId = existingCustomers.data[0].id;
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: targetCustomerId })
          .eq('id', authUser.id);
      }
    }

    if (!targetCustomerId) {
      return res.status(400).json({ error: 'Kein aktives Stripe-Kundenkonto gefunden. Bitte wähle zuerst ein Abo aus.' });
    }

    const domainURL = req.headers.origin || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.kreativdesk.ch'));
    const validReturnUrl = typeof returnUrl === 'string' && (returnUrl.startsWith('https://') || returnUrl.startsWith('http://'))
      ? returnUrl
      : `${domainURL}/app`;

    const session = await stripe.billingPortal.sessions.create({
      customer: targetCustomerId,
      return_url: validReturnUrl, 
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Portal Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
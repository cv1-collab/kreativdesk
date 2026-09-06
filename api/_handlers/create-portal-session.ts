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
    const { customerId: bodyCustomerId, returnUrl } = req.body || {};

    let targetCustomerId = bodyCustomerId;

    if (authUser) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile?.stripe_customer_id) {
        targetCustomerId = profile.stripe_customer_id;
      }
    }

    if (!targetCustomerId) {
      return res.status(400).json({ error: 'Stripe customer ID missing on account' });
    }

    const domainURL = req.headers.origin || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: targetCustomerId,
      return_url: returnUrl || `${domainURL}/app`, 
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Portal Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
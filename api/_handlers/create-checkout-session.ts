import Stripe from 'stripe';
import { verifyAuth } from '../_auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
    
    // 1. Authentifizierten User aus Token verifizieren
    const authUser = await verifyAuth(req);
    
    const { planName = 'Pro', priceId } = req.body || {};
    const uid = authUser?.id || (authUser as any)?.uid || req.body?.uid;
    const email = authUser?.email || req.body?.email;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized: User ID required for subscription' });
    }

    const domainURL = req.headers.origin || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], 
      mode: 'subscription',
      customer_email: email || undefined,
      client_reference_id: uid,
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}`,
      cancel_url: `${domainURL}/pricing?canceled=true`,
      metadata: {
        supabaseUID: uid,
        plan: planName
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
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
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required to create checkout session' });
    }

    const { priceId } = req.body || {};
    const uid = authUser.id;
    const email = authUser.email;

    if (!priceId || typeof priceId !== 'string') {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    const PRICING_MATRIX: Record<string, { name: string; seats: number; unitAmount: number; interval: 'month' | 'year' }> = {
      // Aktuelle Tarife
      'price_1UJ7wAQTfAtOGrggmwM9ctT7': { name: 'Starter', seats: 1, unitAmount: 5900, interval: 'month' },
      'price_1UJ7wBQTfAtOGrgg0W8idkBn': { name: 'Starter', seats: 1, unitAmount: 58800, interval: 'year' },
      'price_1UJ7wBQTfAtOGrggIHnw7NFO': { name: 'Pro', seats: 1, unitAmount: 10900, interval: 'month' },
      'price_1UJ7wBQTfAtOGrggKhnjecz8': { name: 'Pro', seats: 1, unitAmount: 106800, interval: 'year' },
      'price_1UJ7wCQTfAtOGrggtc8sK2NT': { name: 'Team Starter', seats: 3, unitAmount: 29000, interval: 'month' },
      'price_1UJ7wCQTfAtOGrgg5jYFVujy': { name: 'Team Starter', seats: 3, unitAmount: 288000, interval: 'year' },
      // Vorherige Tarife (Abwärtskompatibilität)
      'price_1TdyXhQTfAtOGrggdoSEPjWr': { name: 'Starter', seats: 1, unitAmount: 5900, interval: 'month' },
      'price_1TdyYYQTfAtOGrggNecH3ItP': { name: 'Starter', seats: 1, unitAmount: 58800, interval: 'year' },
      'price_1TcizpQTfAtOGrggKGYLMG4c': { name: 'Pro', seats: 1, unitAmount: 10900, interval: 'month' },
      'price_1TdyU4QTfAtOGrggIvnyXe2j': { name: 'Pro', seats: 1, unitAmount: 106800, interval: 'year' },
      'price_1TdyaEQTfAtOGrggpbWcVles': { name: 'Expert', seats: 3, unitAmount: 29000, interval: 'month' },
      'price_1TdyaxQTfAtOGrggbeJBPDFY': { name: 'Expert', seats: 3, unitAmount: 288000, interval: 'year' },
    };

    const resolvedTier = PRICING_MATRIX[priceId];
    if (!resolvedTier) {
      return res.status(400).json({ error: 'Invalid or unsupported priceId' });
    }

    const resolvedPlan = resolvedTier.name;
    const resolvedSeats = resolvedTier.seats;

    const domainURL = req.headers.origin || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.kreativdesk.ch'));

    const sessionMetadata = {
      supabaseUID: uid,
      userId: uid,
      plan: resolvedPlan,
      planName: resolvedPlan,
      seats: String(resolvedSeats),
      maxSeats: String(resolvedSeats),
      priceId
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
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
        success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(resolvedPlan)}`,
        cancel_url: `${domainURL}/pricing?canceled=true`,
        metadata: sessionMetadata,
        subscription_data: {
          metadata: sessionMetadata
        }
      });
    } catch (stripePriceErr: any) {
      // Fallback to inline price_data if priceId does not exist in the current Stripe environment (e.g. test vs live key)
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email || undefined,
        client_reference_id: uid,
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: 'chf',
              unit_amount: resolvedTier.unitAmount,
              recurring: { interval: resolvedTier.interval },
              product_data: {
                name: `Kreativ Desk OS — ${resolvedPlan} (${resolvedSeats} ${resolvedSeats === 1 ? 'Seat' : 'Seats'})`,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(resolvedPlan)}`,
        cancel_url: `${domainURL}/pricing?canceled=true`,
        metadata: sessionMetadata,
        subscription_data: {
          metadata: sessionMetadata
        }
      });
    }

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
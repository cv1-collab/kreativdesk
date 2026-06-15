import Stripe from 'stripe';

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
    
    // FIX 1: Wir extrahieren jetzt 'priceId' aus dem Body, 'amount' wird gelöscht
    const { email, planName, uid, priceId, interval } = req.body;
    const domainURL = req.headers.origin || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], 
      mode: 'subscription',
      customer_email: email,
      client_reference_id: uid,
      allow_promotion_codes: true, // Gutscheine bleiben wie gewünscht aktiv!
      
      // FIX 2: Der line_items Block ist nun massiv vereinfacht und feuert keinen NaN-Fehler mehr
      line_items: [
        {
          price: priceId, // Stripe zieht sich Preis, Währung und Intervall nun direkt aus dem Dashboard
          quantity: 1,
        },
      ],
      
      success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}`,
      cancel_url: `${domainURL}/pricing?canceled=true`,
      
      metadata: {
        firebaseUID: uid,
        plan: planName
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const stripe = new Stripe(key!, { apiVersion: '2025-02-24.acacia' as any });
    const { customerId, returnUrl } = req.body;

    // NEU: Kurzer Check, ob die ID auch wirklich da ist
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID missing' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      // GEÄNDERT: Schickt den User auf /app oder die mitgegebene URL zurück
      return_url: returnUrl || `${req.headers.origin}/app`, 
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Portal Error:", error);
    res.status(500).json({ error: error.message });
  }
}
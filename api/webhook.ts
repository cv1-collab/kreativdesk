import Stripe from 'stripe';
import { supabaseAdmin } from './_auth.js';

export const config = {
  api: { bodyParser: false },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !endpointSecret) {
    return res.status(500).send('Stripe keys missing');
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // --- 1. LOGIK BEI KAUF / NEUEM ABO ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.client_reference_id || session.metadata?.supabaseUID || session.metadata?.firebaseUID;
    const planName = session.metadata?.plan || 'Pro';

    if (uid) {
      try {
        await supabaseAdmin.from('profiles').update({
          has_active_subscription: true,
          stripe_customer_id: session.customer as string,
          plan: planName,
          updated_at: new Date().toISOString()
        }).eq('id', uid);

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('company_id')
          .eq('id', uid)
          .single();

        if (profile?.company_id) {
          let newMaxSeats = 1;
          const planLower = planName.toLowerCase();
          if (planLower.includes('studio')) newMaxSeats = 5;
          else if (planLower.includes('agency')) newMaxSeats = 15;
          else if (planLower.includes('enterprise')) newMaxSeats = 30;

          await supabaseAdmin.from('companies').update({
            plan: planName,
            max_seats: newMaxSeats
          }).eq('id', profile.company_id);
        }
      } catch (error) {
        console.error(`Supabase Write Error:`, error);
      }
    }
  } 
  
  // --- 2. LOGIK BEI KÜNDIGUNG ---
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('stripe_customer_id', customerId);

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];

        await supabaseAdmin.from('profiles').update({
          has_active_subscription: false,
          plan: 'Free Trial',
          updated_at: new Date().toISOString()
        }).eq('id', profile.id);

        if (profile.company_id) {
          await supabaseAdmin.from('companies').update({
            plan: 'Free Trial',
            max_seats: 1
          }).eq('id', profile.company_id);
        }
      }
    } catch (error) {
      console.error(`Supabase Write Error bei Kündigung:`, error);
    }
  }

  // --- 3. LOGIK BEI PLAN-ÄNDERUNGEN ---
  else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      const priceId = subscription.items.data[0]?.price?.id;
      let planName = 'Starter';
      let maxSeats = 1;
      
      const PRICING_MATRIX: Record<string, {name: string, seats: number}> = {
        'price_1TdyXhQTfAtOGrggdoSEPjWr': {name: 'Starter', seats: 1},
        'price_1TdyYYQTfAtOGrggNecH3ItP': {name: 'Starter', seats: 1},
        'price_1TcizpQTfAtOGrggKGYLMG4c': {name: 'Pro', seats: 1},
        'price_1TdyU4QTfAtOGrggIvnyXe2j': {name: 'Pro', seats: 1},
        'price_1TdyaEQTfAtOGrggpbWcVles': {name: 'Expert', seats: 1},
        'price_1TdyaxQTfAtOGrggbeJBPDFY': {name: 'Expert', seats: 1},
      };

      if (priceId && PRICING_MATRIX[priceId]) {
        planName = PRICING_MATRIX[priceId].name;
        maxSeats = PRICING_MATRIX[priceId].seats;
      }

      const isSubActive = subscription.status === 'active' || subscription.status === 'trialing';

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('stripe_customer_id', customerId);

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];

        await supabaseAdmin.from('profiles').update({
          has_active_subscription: isSubActive,
          plan: planName,
          updated_at: new Date().toISOString()
        }).eq('id', profile.id);

        if (profile.company_id) {
          await supabaseAdmin.from('companies').update({
            plan: planName,
            max_seats: maxSeats
          }).eq('id', profile.company_id);
        }
      }
    } catch (error) {
      console.error(`Supabase Write Error bei Subscription Update:`, error);
    }
  }

  res.json({ received: true });
}
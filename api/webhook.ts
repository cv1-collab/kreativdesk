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

  const PRICING_MATRIX: Record<string, { name: string; seats: number }> = {
    // Neue Tarife
    'price_1UJ7wAQTfAtOGrggmwM9ctT7': { name: 'Starter', seats: 1 },
    'price_1UJ7wBQTfAtOGrgg0W8idkBn': { name: 'Starter', seats: 1 },
    'price_1UJ7wBQTfAtOGrggIHnw7NFO': { name: 'Pro', seats: 1 },
    'price_1UJ7wBQTfAtOGrggKhnjecz8': { name: 'Pro', seats: 1 },
    'price_1UJ7wCQTfAtOGrggtc8sK2NT': { name: 'Team Starter', seats: 3 },
    'price_1UJ7wCQTfAtOGrgg5jYFVujy': { name: 'Team Starter', seats: 3 },
    // Vorherige Tarife (Abwärtskompatibilität)
    'price_1TdyXhQTfAtOGrggdoSEPjWr': { name: 'Starter', seats: 1 },
    'price_1TdyYYQTfAtOGrggNecH3ItP': { name: 'Starter', seats: 1 },
    'price_1TcizpQTfAtOGrggKGYLMG4c': { name: 'Pro', seats: 1 },
    'price_1TdyU4QTfAtOGrggIvnyXe2j': { name: 'Pro', seats: 1 },
    'price_1TdyaEQTfAtOGrggpbWcVles': { name: 'Expert', seats: 3 },
    'price_1TdyaxQTfAtOGrggbeJBPDFY': { name: 'Expert', seats: 3 },
    // Current Monthly Price IDs
    'price_1UJ7w2RwN4c1cHbcI2cdB5qI': { name: 'Starter', seats: 1 },
    'price_1UJ7w3RwN4c1cHbcK8m3L9pQ': { name: 'Pro', seats: 1 },
    'price_1UJ7w3RwN4c1cHbcW1d9V3sT': { name: 'Team Starter', seats: 3 },
    'price_1UJ7w4RwN4c1cHbcZ6v2N8yR': { name: 'Expert', seats: 3 },
    // Current Yearly Price IDs
    'price_1TdyDPRwN4c1cHbc92bM5G2v': { name: 'Starter', seats: 1 },
    'price_1TdyEDRwN4c1cHbcK8jL3P1x': { name: 'Pro', seats: 1 },
    'price_1TdyEWRwN4c1cHbcQ4wE6R8t': { name: 'Team Starter', seats: 3 },
    'price_1UJ7w4RwN4c1cHbcM4p7X1kB': { name: 'Expert', seats: 3 },
    // Legacy Price IDs
    'price_1TC00JRwN4c1cHbcL61aR7N6': { name: 'Starter', seats: 1 },
    'price_1TC00cRwN4c1cHbcE2f3W1aP': { name: 'Starter', seats: 1 },
    'price_1TC00uRwN4c1cHbcW0s7T2xM': { name: 'Pro', seats: 1 },
    'price_1TC01BRwN4c1cHbcX8v4K9yQ': { name: 'Pro', seats: 1 },
    'price_1TC01SRwN4c1cHbcZ1m5N3pL': { name: 'Enterprise', seats: 999 },
    'price_1TC01jRwN4c1cHbcB7c2D4fG': { name: 'Enterprise', seats: 999 },
    'price_1TAMt9RwN4c1cHbc92bM5G2v': { name: 'Team Starter', seats: 3 },
    'price_1TAMtdRwN4c1cHbcK8jL3P1x': { name: 'Studio OS', seats: 10 },
    'price_1TAMtxRwN4c1cHbcQ4wE6R8t': { name: 'Agency OS', seats: 30 },
  };

  // --- 1. LOGIK BEI KAUF / NEUEM ABO ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.client_reference_id || session.metadata?.supabaseUID || session.metadata?.userId || session.metadata?.firebaseUID;
    const metaPriceId = session.metadata?.priceId;
    const resolvedFromPrice = metaPriceId ? PRICING_MATRIX[metaPriceId] : undefined;
    const allowedPlans = ['Starter', 'Pro', 'Team Starter', 'Expert', 'Studio', 'Studio OS', 'Agency', 'Agency OS', 'Enterprise', 'Enterprise OS'];
    const rawMetaPlan = session.metadata?.plan || session.metadata?.planName || 'Pro';
    const planName = resolvedFromPrice?.name || (allowedPlans.includes(rawMetaPlan) ? rawMetaPlan : 'Pro');

    if (uid) {
      try {
        await supabaseAdmin.from('profiles').update({
          has_active_subscription: true,
          stripe_customer_id: session.customer as string,
          plan: planName,
          trial_ends_at: null,
          updated_at: new Date().toISOString()
        }).eq('id', uid);

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('company_id')
          .eq('id', uid)
          .maybeSingle();

        if (profile?.company_id) {
          let newMaxSeats = Math.max(
            resolvedFromPrice?.seats || 1,
            Number(session.metadata?.maxSeats || session.metadata?.seats || 1)
          );
          const planLower = planName.toLowerCase();
          if (planLower.includes('team') || planLower.includes('expert')) newMaxSeats = Math.max(newMaxSeats, 3);
          else if (planLower.includes('studio')) newMaxSeats = Math.max(newMaxSeats, 10);
          else if (planLower.includes('agency')) newMaxSeats = Math.max(newMaxSeats, 30);
          else if (planLower.includes('enterprise')) newMaxSeats = Math.max(newMaxSeats, 999);

          const { data: existingComp } = await supabaseAdmin
            .from('companies')
            .select('max_seats')
            .eq('id', profile.company_id)
            .maybeSingle();

          const finalMaxSeats = Math.max(newMaxSeats, Number(existingComp?.max_seats || 1));

          await supabaseAdmin.from('companies').update({
            plan: planName,
            max_seats: finalMaxSeats
          }).eq('id', profile.company_id);
        }

        // Log subscription payment in transactions for Super-Admin Sales Analytics
        const paidAmount = typeof session.amount_total === 'number' ? session.amount_total / 100 : 0;
        const txCurrency = (session.currency || 'chf').toUpperCase();
        if (paidAmount > 0) {
          try {
            await supabaseAdmin.from('transactions').insert({
              company_id: profile?.company_id || null,
              owner_id: uid,
              type: 'subscription',
              category: 'Subscription',
              status: 'Paid',
              amount: paidAmount,
              description: `Stripe Abo: ${planName} (${txCurrency})`,
              date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString()
            });
          } catch (txErr) {
            console.warn('Could not log subscription transaction:', txErr);
          }
        }

        try {
          await supabaseAdmin.from('audit_logs').insert({
            action: 'subscription.checkout_completed',
            user_id: uid,
            company_id: profile?.company_id || 'system',
            details: {
              userEmail: session.customer_details?.email || session.customer_email || 'stripe-customer',
              plan: planName,
              amount: paidAmount,
              currency: txCurrency,
              stripeCustomerId: session.customer
            },
            created_at: new Date().toISOString()
          });
        } catch {}
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

        try {
          await supabaseAdmin.from('audit_logs').insert({
            action: 'subscription.canceled',
            user_id: profile.id,
            company_id: profile.company_id || 'system',
            details: {
              userEmail: profile.email || 'stripe-customer',
              previousPlan: profile.plan || 'Pro',
              stripeCustomerId: customerId,
              subscriptionId: subscription.id
            },
            created_at: new Date().toISOString()
          });
        } catch {}
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
      const itemQty = subscription.items.data[0]?.quantity || 1;
      let planName = subscription.metadata?.plan || subscription.metadata?.planName || '';
      let maxSeats = 1;

      if (priceId && PRICING_MATRIX[priceId]) {
        planName = PRICING_MATRIX[priceId].name;
        maxSeats = PRICING_MATRIX[priceId].seats;
      } else if (!planName) {
        planName = 'Pro';
      }

      const planLower = planName.toLowerCase();
      if (planLower.includes('team') || planLower.includes('expert')) maxSeats = 3;
      else if (planLower.includes('studio')) maxSeats = 10;
      else if (planLower.includes('agency')) maxSeats = 30;
      else if (planLower.includes('enterprise')) maxSeats = 999;

      if (itemQty > maxSeats) {
        maxSeats = itemQty;
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
          const { data: existingComp } = await supabaseAdmin
            .from('companies')
            .select('max_seats')
            .eq('id', profile.company_id)
            .maybeSingle();

          const finalSeats = itemQty > 1
            ? maxSeats
            : Math.max(maxSeats, Number(existingComp?.max_seats || 1));

          await supabaseAdmin.from('companies').update({
            plan: planName,
            max_seats: finalSeats
          }).eq('id', profile.company_id);
        }

        try {
          await supabaseAdmin.from('audit_logs').insert({
            action: 'subscription.updated',
            user_id: profile.id,
            company_id: profile.company_id || 'system',
            details: {
              userEmail: profile.email || 'stripe-customer',
              plan: planName,
              status: subscription.status,
              maxSeats,
              stripeCustomerId: customerId
            },
            created_at: new Date().toISOString()
          });
        } catch {}
      }
    } catch (error) {
      console.error(`Supabase Write Error bei Subscription Update:`, error);
    }
  }

  // --- 4. LOGIK BEI WIEDERKEHRENDEN ABO-ZAHLUNGEN ---
  else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any;
    const customerId = invoice.customer as string;
    const billingReason = invoice.billing_reason;

    if (customerId && billingReason === 'subscription_cycle') {
      try {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('stripe_customer_id', customerId);

        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          const planName = profile.plan || 'Pro';

          await supabaseAdmin.from('profiles').update({
            has_active_subscription: true,
            updated_at: new Date().toISOString()
          }).eq('id', profile.id);

          const paidAmount = typeof invoice.amount_paid === 'number' ? invoice.amount_paid / 100 : 0;
          const txCurrency = (invoice.currency || 'chf').toUpperCase();
          if (paidAmount > 0) {
            await supabaseAdmin.from('transactions').insert({
              company_id: profile.company_id || null,
              owner_id: profile.id,
              type: 'subscription',
              category: 'Subscription',
              status: 'Paid',
              amount: paidAmount,
              description: `Stripe Abo-Verlängerung: ${planName} (${txCurrency})`,
              date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString()
            });
          }

          try {
            await supabaseAdmin.from('audit_logs').insert({
              action: 'subscription.renewed',
              user_id: profile.id,
              company_id: profile.company_id || 'system',
              details: {
                userEmail: profile.email || 'stripe-customer',
                plan: planName,
                amount: paidAmount,
                currency: txCurrency,
                stripeCustomerId: customerId
              },
              created_at: new Date().toISOString()
            });
          } catch {}
        }
      } catch (err) {
        console.warn('Could not process invoice.payment_succeeded:', err);
      }
    }
  }

  res.json({ received: true });
}
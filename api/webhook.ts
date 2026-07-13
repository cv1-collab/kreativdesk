// webhook.ts
import Stripe from 'stripe';
import admin from 'firebase-admin';

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

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing individual Firebase credentials');
      return null;
    }

    try {
      privateKey = privateKey.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        })
      });
      console.log('Firebase initialized perfectly!');
    } catch (error) {
      console.error('Error initializing Firebase with individual keys:', error);
      return null;
    }
  }
  return admin;
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

  const db = getFirebaseAdmin()?.firestore();
  if (!db) return res.status(500).send('Firebase Admin Error');

  // --- 1. LOGIK BEI KAUF / NEUEM ABO ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.client_reference_id || session.metadata?.firebaseUID;
    const planName = session.metadata?.plan || 'Pro';

    if (uid) {
      try {
        // User-Status aktivieren
        await db.collection('users').doc(uid).set({
          hasActiveSubscription: true,
          subscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          plan: planName,
          subscriptionStatus: 'active',
          updatedAt: new Date()
        }, { merge: true });

        // Company-Seats aktualisieren
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData?.companyId) {
            let newMaxSeats = 1;
            const planLower = planName.toLowerCase();

            if (planLower.includes('studio')) {
              newMaxSeats = 5;
            } else if (planLower.includes('agency')) {
              newMaxSeats = 15;
            } else if (planLower.includes('enterprise')) {
              newMaxSeats = 30;
            } else if (planLower.includes('starter') || planLower.includes('pro') || planLower.includes('expert')) {
              newMaxSeats = 1;
            }

            await db.collection('companies').doc(userData.companyId).set({
              plan: planName,
              maxSeats: newMaxSeats,
              updatedAt: new Date()
            }, { merge: true });
          }
        }
        console.log(`Success! Updated user ${uid} and company seats`);
      } catch (error) {
        console.error(`Firebase Write Error:`, error);
      }
    }
  } 
  
  // --- 2. LOGIK BEI KÜNDIGUNG / ZAHLUNGSAUSFALL (DER FIX!) ---
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      // User anhand der Stripe Customer ID suchen
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Zugang sofort sperren
        await userDoc.ref.update({
          hasActiveSubscription: false,
          subscriptionStatus: 'canceled',
          plan: 'Free Trial',
          updatedAt: new Date()
        });

        // Team-Sitze der Firma wieder auf 1 reduzieren
        if (userData.companyId) {
          await db.collection('companies').doc(userData.companyId).update({
            plan: 'Free Trial',
            maxSeats: 1,
            updatedAt: new Date()
          });
        }
        console.log(`Abo-Kündigung erfolgreich verarbeitet. User & Company für Customer ${customerId} gesperrt.`);
      } else {
        console.warn(`Kündigung empfangen, aber kein User mit CustomerID ${customerId} gefunden.`);
      }
    } catch (error) {
      console.error(`Firebase Write Error bei Kündigung:`, error);
    }
  }

  // --- 3. LOGIK BEI PLAN-ÄNDERUNGEN (UPGRADE/DOWNGRADE IM PORTAL) ---
  else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // Wir holen uns die erste Price-ID aus den Items, um herauszufinden, welcher Plan das ist.
    // Dafür rufen wir die Stripe API auf, um das Product zu inspizieren (falls nicht im metadata).
    try {
      const priceId = subscription.items.data[0]?.price?.id;
      let planName = 'Starter';
      let maxSeats = 1;
      
      // Das Mapping von Price IDs (Wie in stripeClient.ts) zu Plan-Namen
      const PRICING_MATRIX: Record<string, {name: string, seats: number}> = {
        'price_1TdyXhQTfAtOGrggdoSEPjWr': {name: 'Starter', seats: 1}, // Monthly
        'price_1TdyYYQTfAtOGrggNecH3ItP': {name: 'Starter', seats: 1}, // Yearly
        'price_1TcizpQTfAtOGrggKGYLMG4c': {name: 'Pro', seats: 1}, // Monthly
        'price_1TdyU4QTfAtOGrggIvnyXe2j': {name: 'Pro', seats: 1}, // Yearly
        'price_1TdyaEQTfAtOGrggpbWcVles': {name: 'Expert', seats: 1}, // Monthly
        'price_1TdyaxQTfAtOGrggbeJBPDFY': {name: 'Expert', seats: 1}, // Yearly
      };

      if (priceId && PRICING_MATRIX[priceId]) {
        planName = PRICING_MATRIX[priceId].name;
        maxSeats = PRICING_MATRIX[priceId].seats;
      }

      // Falls die Subscription gekündigt wird (cancel_at_period_end = true), Status auf 'active' lassen, bis sie deleted wird
      const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status;
      
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        await userDoc.ref.update({
          hasActiveSubscription: status === 'active',
          subscriptionStatus: status,
          plan: planName,
          updatedAt: new Date()
        });

        if (userData.companyId) {
          await db.collection('companies').doc(userData.companyId).update({
            plan: planName,
            maxSeats: maxSeats,
            updatedAt: new Date()
          });
        }
        console.log(`Subscription Updated für Customer ${customerId} zu Plan ${planName}.`);
      }
    } catch (error) {
      console.error(`Firebase Write Error bei Subscription Update:`, error);
    }
  }

  res.json({ received: true });
}
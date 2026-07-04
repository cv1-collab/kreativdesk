import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// 1. Stripe initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any, // Aktuelle Version nutzen
});

// 2. Firebase Admin initialisieren (Singleton-Pattern)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Wichtig: Vercel maskiert Zeilenumbrüche in ENV-Variablen
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

// 3. Vercel Config: Body-Parser deaktivieren, um den Raw-Body für die Signatur zu erhalten
export const config = {
  api: {
    bodyParser: false,
  },
};

// Hilfsfunktion, um den Stream in einen Buffer umzuwandeln
async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) throw new Error('Missing Stripe Signature or Webhook Secret');
    // Kryptografische Verifizierung des Requests
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Webhook Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Die Firebase-UID, die beim Checkout als client_reference_id übergeben wurde
        const userId = session.client_reference_id; 
        const customerId = session.customer as string;

        if (userId) {
          // Status in Firestore aktualisieren
          await db.collection('users').doc(userId).set({
            stripeCustomerId: customerId,
            hasActiveSubscription: true,
            plan: session.metadata?.planName || 'Pro',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          console.log(`Subscription aktiviert für User: ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // User anhand der Stripe-Customer-ID suchen
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

        if (!snapshot.empty) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          
          const batch = db.batch();
          snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
              hasActiveSubscription: isActive,
              stripeSubscriptionStatus: subscription.status,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          });
          await batch.commit();

          console.log(`Abo-Status aktualisiert auf ${isActive} für Customer: ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Fehler bei der Webhook-Verarbeitung:', error);
    res.status(500).send('Internal Server Error');
  }
}
import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// 1. Stripe initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

// 2. Firebase Admin initialisieren
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();
const auth = admin.auth();

async function deleteQueryBatch(query: admin.firestore.Query, resolve: any) {
  const snapshot = await query.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function deleteCollectionByCompanyId(collectionName: string, companyId: string) {
  const q = db.collection(collectionName).where('companyId', '==', companyId).limit(500);
  return new Promise((resolve, reject) => {
    deleteQueryBatch(q, resolve).catch(reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const { stripeCustomerId, role, companyId } = userData || {};

    // 1. STRIPE: Cancel any active subscriptions
    if (stripeCustomerId) {
      console.log(`Canceling subscriptions for customer: ${stripeCustomerId}`);
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
      });
      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
        console.log(`Canceled subscription ${sub.id}`);
      }
      
      const trialingSubs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'trialing',
      });
      for (const sub of trialingSubs.data) {
        await stripe.subscriptions.cancel(sub.id);
        console.log(`Canceled trialing subscription ${sub.id}`);
      }
    }

    // 2. ORPHANED DATA: Cascading delete if user is owner
    if ((role === 'owner' || role === 'Owner') && companyId) {
      console.log(`User is owner of company ${companyId}. Deleting all associated data...`);
      
      const collectionsToDelete = [
        'projects',
        'projectMembers',
        'companyUsers',
        'timeEntries',
        'defects',
        'documents',
        'leads',
        'temp_receipts',
        'invites'
      ];

      for (const coll of collectionsToDelete) {
        await deleteCollectionByCompanyId(coll, companyId);
      }
      
      // Delete the company document itself
      await db.collection('companies').doc(companyId).delete();
    }

    // 3. FIREBASE: Delete user document and auth record
    console.log(`Deleting user document and auth for ${uid}`);
    await userRef.delete();
    await auth.deleteUser(uid);

    return res.status(200).json({ success: true, message: 'Account and associated data deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

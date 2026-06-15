import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, companyId } = req.body;

  if (!uid || !companyId) {
    return res.status(400).json({ error: 'Missing uid or companyId' });
  }

  try {
    const auth = getAuth();
    
    // Hole bestehende Claims, um nichts zu überschreiben
    const userRecord = await auth.getUser(uid);
    const currentClaims = userRecord.customClaims || {};

    // Brenne die companyId in das Token
    await auth.setCustomUserClaims(uid, {
      ...currentClaims,
      companyId: companyId
    });

    return res.status(200).json({ success: true, message: `Tenant claim ${companyId} set for user ${uid}` });
  } catch (error: any) {
    console.error("Custom Claim Error:", error);
    return res.status(500).json({ error: 'Failed to set custom claims', details: error.message });
  }
}
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  const auth = getAuth();
  const db = getFirestore();
  let decodedToken;
  
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }

  const SUPER_ADMIN_EMAILS = [
    'cv1@gmx.ch',
    'carlo@vesciodesign.ch'
  ];

  if (decodedToken.uid !== uid && !SUPER_ADMIN_EMAILS.includes(decodedToken.email?.toLowerCase() || '')) {
    return res.status(403).json({ error: 'Forbidden: You can only set your own tenant claims' });
  }

  // ++ SICHERHEITSLOGIK ++
  let assignedRole = 'owner'; // Default: Wenn er seiner EIGENEN Firma beitritt, ist er Owner.

  if (decodedToken.uid === uid && !SUPER_ADMIN_EMAILS.includes(decodedToken.email?.toLowerCase() || '')) {
    if (companyId !== `comp_${uid}`) {
      // Er versucht einer fremden Firma beizutreten. Hat er ein Invite?
      const invitesSnapshot = await db.collection('invites')
        .where('email', '==', decodedToken.email)
        .where('companyId', '==', companyId)
        .where('status', '==', 'pending')
        .get();
        
      if (invitesSnapshot.empty) {
        console.error(`Sicherheitsverletzung: Nutzer ${uid} versuchte ohne Invite der Firma ${companyId} beizutreten.`);
        return res.status(403).json({ error: 'Forbidden: Invalid or missing invite for this company' });
      } else {
        // Invite existiert, Rolle übernehmen
        assignedRole = invitesSnapshot.docs[0].data().role || 'Mitarbeiter';
      }
    }
  }

  try {
    // Hole bestehende Claims, um nichts zu überschreiben
    const userRecord = await auth.getUser(uid);
    const currentClaims = userRecord.customClaims || {};

    // Brenne die companyId und die role in das Token
    await auth.setCustomUserClaims(uid, {
      ...currentClaims,
      companyId: companyId,
      role: assignedRole
    });

    return res.status(200).json({ success: true, message: `Tenant claim ${companyId} and role ${assignedRole} set for user ${uid}` });
  } catch (error: any) {
    console.error("Custom Claim Error:", error);
    return res.status(500).json({ error: 'Failed to set custom claims', details: error.message });
  }
}
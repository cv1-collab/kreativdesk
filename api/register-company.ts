import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

import { demoTemplates } from '../src/utils/demoTemplates.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, email, inviteToken, enterpriseData } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'Missing uid or email' });
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

  if (decodedToken.uid !== uid) {
    return res.status(403).json({ error: 'Forbidden: UID mismatch' });
  }

  try {
    const now = new Date().toISOString();
    let assignedCompanyId = `comp_${uid}`;
    let assignedRole = 'owner';
    let isInvite = false;

    const batch = db.batch();

    // 1. Process Invite if present
    if (inviteToken) {
      const inviteRef = db.collection('invites').doc(inviteToken);
      const inviteSnap = await inviteRef.get();
      if (inviteSnap.exists) {
        const inviteData = inviteSnap.data();
        if (inviteData?.status === 'pending' && inviteData.email === email) {
          assignedCompanyId = inviteData.companyId;
          assignedRole = inviteData.role || 'Mitarbeiter';
          isInvite = true;
          
          batch.update(inviteRef, {
            status: 'accepted',
            acceptedBy: uid,
            acceptedAt: now
          });
          
          // Increment seats
          const companyRef = db.collection('companies').doc(assignedCompanyId);
          batch.update(companyRef, {
            usedSeats: FieldValue.increment(1)
          });
        }
      }
    }

    const trialEndDate = new Date((new Date()).getTime() + (30 * 24 * 60 * 60 * 1000));
    const isEnterprise = !!enterpriseData;
    const plan = isEnterprise ? 'Enterprise' : 'Expert Trial';
    const maxSeats = isEnterprise ? 50 : 1;
    const companyName = enterpriseData?.companyName || `${email.split('@')[0] || 'User'}s Workspace`;

    // 2. Create User
    batch.set(db.collection('users').doc(uid), {
      email: email, createdAt: now, role: assignedRole, companyId: assignedCompanyId,
      hasActiveSubscription: true, plan: plan, trialEndsAt: trialEndDate.toISOString(), hasSeenTour: false 
    });

    // 3. If NOT an invite, create company and onboarding data
    if (!isInvite) {
      const newCompanyId = assignedCompanyId;
      const newProjectId = `proj_${Date.now()}`;
      const tpl = demoTemplates.construction;

      batch.set(db.collection('companies').doc(newCompanyId), {
        id: newCompanyId, name: companyName, plan: plan,
        maxSeats: maxSeats, usedSeats: 1, ownerId: uid, trialEndsAt: trialEndDate.toISOString(), createdAt: now
      });

    }

    // Commit all batched writes
    await batch.commit();

    // 4. Set Custom Claims
    const userRecord = await auth.getUser(uid);
    const currentClaims = userRecord.customClaims || {};

    await auth.setCustomUserClaims(uid, {
      ...currentClaims,
      companyId: assignedCompanyId,
      role: assignedRole
    });

    return res.status(200).json({ success: true, companyId: assignedCompanyId, role: assignedRole });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: 'Failed to register', details: error.message });
  }
}

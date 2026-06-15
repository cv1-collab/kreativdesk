import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

const db = getFirestore();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, email, inviteToken } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID missing' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      let targetCompanyId = `comp_${uid}`;
      let targetRole = 'owner';
      let isInvitedUser = false;

      // Token Validierung (Server Side)
      if (inviteToken) {
        const inviteRef = db.collection('invites').doc(inviteToken);
        const inviteSnap = await inviteRef.get();
        
        if (inviteSnap.exists && inviteSnap.data()?.status === 'pending') {
          targetCompanyId = inviteSnap.data()?.companyId;
          targetRole = 'Internal';
          isInvitedUser = true;

          // Token als genutzt markieren
          await inviteRef.update({
            status: 'used',
            usedBy: uid,
            usedAt: new Date().toISOString()
          });
        }
      }

      // +++ NEU: 30 Tage Trial Logik +++
      const timestamp = new Date();
      const trialEndDate = new Date(timestamp.getTime() + (30 * 24 * 60 * 60 * 1000));

      const newUserData = {
        email: email || '',
        name: email?.split('@')[0] || 'Teammitglied',
        role: targetRole,
        companyId: targetCompanyId,
        hasActiveSubscription: true, // Im Trial ist er aktiv
        plan: isInvitedUser ? 'Team Member' : 'Expert Trial',
        trialEndsAt: trialEndDate.toISOString(),
        createdAt: timestamp.toISOString()
      };
      await userRef.set(newUserData);

      if (!isInvitedUser) {
        // Neues Silo erstellen
        await db.collection('companies').doc(targetCompanyId).set({
          id: targetCompanyId,
          name: `${email?.split('@')[0] || 'User'}'s Workspace`,
          plan: 'Expert Trial',
          maxSeats: 1,
          usedSeats: 1,
          ownerId: uid,
          trialEndsAt: trialEndDate.toISOString(),
          createdAt: timestamp.toISOString()
        });
      } else {
        // Seat +1 beim Mandanten buchen
        const compRef = db.collection('companies').doc(targetCompanyId);
        const compSnap = await compRef.get();
        if (compSnap.exists) {
           await compRef.update({ usedSeats: (compSnap.data()?.usedSeats || 0) + 1 });
        }
      }

      const auth = getAuth();
      const userRecord = await auth.getUser(uid);
      await auth.setCustomUserClaims(uid, {
        ...(userRecord.customClaims || {}),
        companyId: targetCompanyId
      });

      return res.status(200).json(newUserData);
    }

    return res.status(200).json(docSnap.data());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
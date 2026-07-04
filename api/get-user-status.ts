import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import Stripe from 'stripe'; // NEU: Wir brauchen Stripe hier für den Live-Sync!

// 1. Firebase Admin Initialisierung
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

// 2. Stripe Initialisierung
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any, // <--- DAS IST DER FIX
});

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

    // ==========================================
    // SZENARIO A: NEUER USER (ONBOARDING)
    // ==========================================
    if (!docSnap.exists) {
      let targetCompanyId = `comp_${uid}`;
      let targetRole = 'owner';
      let isInvitedUser = false;

      // Token Validierung für Einladungen
      if (inviteToken) {
        const inviteRef = db.collection('invites').doc(inviteToken);
        const inviteSnap = await inviteRef.get();
        
        if (inviteSnap.exists && inviteSnap.data()?.status === 'pending') {
          const inviteData = inviteSnap.data();
          targetCompanyId = inviteData?.companyId;
          targetRole = inviteData?.role || 'employee';
          isInvitedUser = true;

          await inviteRef.update({
            status: 'accepted',
            acceptedBy: uid,
            acceptedAt: new Date().toISOString()
          });
        }
      }

      const timestamp = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(timestamp.getDate() + 30);

      const newUserData = {
        id: uid,
        uid: uid,
        email: email,
        displayName: email?.split('@')[0] || 'Teammitglied',
        role: targetRole,
        companyId: targetCompanyId,
        hasActiveSubscription: true, // Im Trial ist er aktiv
        plan: isInvitedUser ? 'Team Member' : 'Expert Trial',
        trialEndsAt: trialEndDate.toISOString(),
        createdAt: timestamp.toISOString(),
        updatedAt: timestamp.toISOString()
      };
      await userRef.set(newUserData);

      if (!isInvitedUser) {
        // Neues Silo (Company) erstellen
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

      // Claim ins Token brennen
      const auth = getAuth();
      const userRecord = await auth.getUser(uid);
      await auth.setCustomUserClaims(uid, {
        ...(userRecord.customClaims || {}),
        companyId: targetCompanyId,
        role: targetRole
      });

      return res.status(200).json(newUserData);
    }

    // ==========================================
    // SZENARIO B: BESTEHENDER USER (LIVE-SYNC)
    // ==========================================
    const userData = docSnap.data();
    let hasActiveSub = userData?.hasActiveSubscription || false;
    let currentPlan = userData?.plan || 'Free Trial';
    let needsDbUpdate = false;

    // 1. Stripe Live-Check (Silo aufbrechen)
    if (userData?.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripeCustomerId,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          hasActiveSub = true;
          // (Optional) Plan-Namen aus Stripe holen, falls er dynamisch sein soll
        } else {
          // Abo ist abgelaufen oder gekündigt!
          hasActiveSub = false;
          currentPlan = 'Free Trial';
        }

        if (hasActiveSub !== userData.hasActiveSubscription || currentPlan !== userData.plan) {
          needsDbUpdate = true;
        }
      } catch (stripeError) {
        console.error("Stripe Sync Error in get-user-status:", stripeError);
        // Wir lassen es fail-safe durchlaufen, damit der Login nicht crasht
      }
    }

    // 2. Custom Claims sicherstellen (Falls Rolle geändert wurde)
    try {
      const auth = getAuth();
      const userRecord = await auth.getUser(uid);
      const currentClaims = userRecord.customClaims || {};
      
      if (currentClaims.role !== userData?.role || currentClaims.companyId !== userData?.companyId) {
        await auth.setCustomUserClaims(uid, {
          ...currentClaims,
          companyId: userData?.companyId,
          role: userData?.role || 'employee'
        });
      }
    } catch (claimError) {
      console.error("Claim Update Error in get-user-status:", claimError);
    }

    // 3. Wenn sich der Stripe-Status geändert hat, Firebase aktualisieren
    if (needsDbUpdate) {
      await userRef.update({
        hasActiveSubscription: hasActiveSub,
        plan: currentPlan,
        updatedAt: new Date().toISOString()
      });
    }

    // 4. Frisches Datenpaket an das Frontend senden (TrialGuard & Notifications greifen sofort!)
    return res.status(200).json({
      ...userData,
      hasActiveSubscription: hasActiveSub,
      plan: currentPlan,
      role: userData?.role || 'employee'
    });

  } catch (error) {
    console.error("Get User Status Error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
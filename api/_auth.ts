import admin from 'firebase-admin';

export function getFirebaseAdmin() {
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
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return null;
    }
  }
  return admin;
}

export async function verifyAuth(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split('Bearer ')[1];
  const adminInstance = getFirebaseAdmin();
  if (!adminInstance) return null;

  try {
    const decodedToken = await adminInstance.auth().verifyIdToken(token);
    
    const SUPER_ADMINS = ['cv1@gmx.ch', 'carlo@vesciodesign.ch'];
    if (SUPER_ADMINS.includes(decodedToken.email?.toLowerCase() || '')) {
      return decodedToken;
    }

    const db = adminInstance.firestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      console.error('User not found in database');
      return null;
    }

    const userData = userDoc.data();
    if (userData?.hasActiveSubscription === false) {
      console.error('Active subscription required');
      return null;
    }

    return { ...decodedToken, plan: userData?.plan };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

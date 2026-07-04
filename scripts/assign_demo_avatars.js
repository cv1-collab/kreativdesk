import 'dotenv/config';
import admin from 'firebase-admin';

// Initialisiere Firebase Admin
function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Fehler: Firebase Admin API keys fehlen in der .env Datei.');
      process.exit(1);
    }

    privateKey = privateKey.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      })
    });
    console.log('Firebase Admin initialisiert.');
  }
  return admin;
}

const firebaseAdmin = getFirebaseAdmin();
const db = firebaseAdmin.firestore();

const DEMO_AVATARS = [
  '/demo-assets/avatar_sarah.jpg',
  '/demo-assets/avatar_michael.jpg',
  '/demo-assets/avatar_elena.jpg'
];

async function assignAvatars() {
  try {
    console.log('Suche nach CRM Kontakten ohne Avatar...');
    const usersRef = db.collection('companyUsers');
    const snapshot = await usersRef.get();
    
    let updatedCount = 0;
    let avatarIndex = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Wenn kein Foto vorhanden ist, fügen wir eins der Demo-Bilder hinzu
      if (!data.photoURL && !data.avatar) {
        const assignedAvatar = DEMO_AVATARS[avatarIndex % DEMO_AVATARS.length];
        await doc.ref.update({
          photoURL: assignedAvatar,
          avatar: assignedAvatar
        });
        console.log(`- Avatar zugewiesen für: ${data.name || 'Unbekannt'} -> ${assignedAvatar}`);
        avatarIndex++;
        updatedCount++;
      }
    }

    console.log(`\nFertig! Es wurden ${updatedCount} Kontakte mit Demo-Avataren aktualisiert.`);
    process.exit(0);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Avatare:', error);
    process.exit(1);
  }
}

assignAvatars();

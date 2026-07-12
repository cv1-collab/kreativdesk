import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, or, and, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
});
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  const cred = await signInWithEmailAndPassword(auth, 'test.agent.123@example.com', 'SecurePassword123!');
  const companyId = `comp_${cred.user.uid}`;
  
  const q = query(
    collection(db, 'documents'),
    and(
      where('companyId', '==', companyId),
      or(
        where('visibility', 'in', ['public', 'company']),
        where('ownerId', '==', cred.user.uid)
      )
    )
  );
  try {
    const snap = await getDocs(q);
    console.log(`Found ${snap.docs.length} docs`);
  } catch (e) {
    console.log("Query failed:", e.message);
  }
  process.exit();
}
test();

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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
  
  const q = query(collection(db, 'documents'), where('companyId', '==', companyId));
  try {
    const snap = await getDocs(q);
    console.log(`Found ${snap.docs.length} docs`);
    snap.docs.forEach(d => {
      console.log(d.id, "visibility:", d.data().visibility, "owner:", d.data().ownerId);
    });
  } catch (e) {
    console.log("Query failed:", e.message);
  }
  process.exit();
}
test();

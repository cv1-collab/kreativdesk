import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'test.agent.123@example.com', 'SecurePassword123!');
    console.log("Logged in as", cred.user.uid);
    // Let's use getDocs on documents with companyId
    const q = query(collection(db, 'documents'), where('companyId', '==', `comp_${cred.user.uid}`));
    const snap = await getDocs(q);
    console.log(`Success! Found ${snap.docs.length} documents.`);
  } catch (e) {
    console.error("Firestore Error:", e.message);
  }
  process.exit();
}
test();

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  console.log("UID:", cred.user.uid);
  
  // Try to read a known private document created by the other script: MusUzeu02B5g5dAxjBuy
  const docRef = doc(db, 'documents', 'MusUzeu02B5g5dAxjBuy');
  try {
    const snap = await getDoc(docRef);
    console.log("Read success! Document exists?", snap.exists(), snap.data());
  } catch (e) {
    console.log("Read failed:", e.message);
  }
  process.exit();
}
test();

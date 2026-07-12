import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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
    const companyId = `comp_${cred.user.uid}`;
    
    // Create a document owned by someone else that is private
    const otherUserDoc = await addDoc(collection(db, 'documents'), {
      name: 'Secret File',
      companyId: companyId,
      ownerId: 'some-other-user',
      visibility: 'private'
    });
    console.log("Created private doc:", otherUserDoc.id);

    // Now try to query all documents in the company as test.agent.123
    console.log("Querying...");
    const q = query(collection(db, 'documents'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    console.log(`Success! Found ${snap.docs.length} documents.`);
  } catch (e) {
    console.error("Firestore Error:", e.message);
  }
  process.exit();
}
test();

import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; // <-- NEU HINZUGEFÜGT
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Deine Firebase Konfiguration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isConfigured = !!firebaseConfig.apiKey;

// App initialisieren
const app = initializeApp(firebaseConfig);

// App Check initialisieren (Security)
// Nutzt einen unsichtbaren ReCAPTCHA v3 Token im Hintergrund
if (typeof window !== "undefined" && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

// Moderne Art den Offline-Speicher (inkl. Multi-Tab Support) zu aktivieren
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Auth, Storage & Functions initialisieren
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'europe-west1'); // <-- NEU HINZUGEFÜGT

// Exportieren, damit MobileUpload.tsx und Co. darauf zugreifen können
export { auth, db, storage, functions };
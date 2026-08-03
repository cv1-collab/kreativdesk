// Mock file for legacy firebase imports during build transition to Supabase

export const initializeApp = () => ({});
export const getApp = () => ({});
export const getApps = () => [];

export const getAuth = () => ({});
export const onAuthStateChanged = () => (() => {});
export const signOut = async () => {};
export const signInWithEmailAndPassword = async () => {};
export const createUserWithEmailAndPassword = async () => {};
export const sendPasswordResetEmail = async () => {};
export const updateProfile = async () => {};
export const signInWithPopup = async () => {};
export const sendEmailVerification = async () => {};
export const deleteUser = async () => {};
export class GoogleAuthProvider {}

export const initializeFirestore = () => ({});
export const persistentLocalCache = () => ({});
export const persistentMultipleTabManager = () => ({});
export const doc = () => ({});
export const getDoc = async () => ({ exists: () => false, data: () => ({}) });
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const collection = () => ({});
export const getDocs = async () => ({ docs: [], empty: true, forEach: () => {} });
export const onSnapshot = () => (() => {});
export const query = () => ({});
export const where = () => ({});
export const orderBy = () => ({});
export const limit = () => ({});
export const addDoc = async () => ({ id: 'mock-id' });
export const writeBatch = () => ({ delete: () => {}, update: () => {}, commit: async () => {} });
export const serverTimestamp = () => new Date().toISOString();
export const increment = (v: number) => v;
export const arrayUnion = (...items: any[]) => items;
export const arrayRemove = (...items: any[]) => items;
export const and = () => ({});
export const or = () => ({});

export class Timestamp {
  static now() { return new Timestamp(); }
  toDate() { return new Date(); }
  toISOString() { return new Date().toISOString(); }
}

export const getStorage = () => ({});
export const ref = () => ({});
export const uploadBytes = async () => ({});
export const getDownloadURL = async () => '';
export const deleteObject = async () => {};
export const getMetadata = async () => ({});

export const getFunctions = () => ({});
export const httpsCallable = () => async () => ({ data: {} });

export const initializeAppCheck = () => ({});
export class ReCaptchaV3Provider { constructor() {} }

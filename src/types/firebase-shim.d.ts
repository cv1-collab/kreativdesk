declare module 'firebase/app' {
  export function initializeApp(...args: any[]): any;
  export function getApp(...args: any[]): any;
  export function getApps(): any[];
}

declare module 'firebase/auth' {
  export function getAuth(...args: any[]): any;
  export function onAuthStateChanged(...args: any[]): any;
  export function signOut(...args: any[]): any;
  export function signInWithEmailAndPassword(...args: any[]): any;
  export function createUserWithEmailAndPassword(...args: any[]): any;
  export function sendPasswordResetEmail(...args: any[]): any;
  export function updateProfile(...args: any[]): any;
  export function signInWithPopup(...args: any[]): any;
  export function sendEmailVerification(...args: any[]): any;
  export function deleteUser(...args: any[]): any;
  export class GoogleAuthProvider {}
  export interface User {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    emailVerified?: boolean;
    getIdToken?: (forceRefresh?: boolean) => Promise<string>;
  }
}

declare module 'firebase/firestore' {
  export function initializeFirestore(...args: any[]): any;
  export function persistentLocalCache(...args: any[]): any;
  export function persistentMultipleTabManager(...args: any[]): any;
  export function doc(...args: any[]): any;
  export function getDoc(...args: any[]): any;
  export function setDoc(...args: any[]): any;
  export function updateDoc(...args: any[]): any;
  export function deleteDoc(...args: any[]): any;
  export function collection(...args: any[]): any;
  export function getDocs(...args: any[]): any;
  export function onSnapshot(...args: any[]): any;
  export function query(...args: any[]): any;
  export function where(...args: any[]): any;
  export function orderBy(...args: any[]): any;
  export function limit(...args: any[]): any;
  export function addDoc(...args: any[]): any;
  export function writeBatch(...args: any[]): any;
  export function serverTimestamp(): any;
  export function increment(...args: any[]): any;
  export function arrayUnion(...args: any[]): any;
  export function arrayRemove(...args: any[]): any;
  export function and(...args: any[]): any;
  export function or(...args: any[]): any;
  export class Timestamp {
    static now(): Timestamp;
    toDate(): Date;
    toISOString(): string;
  }
}

declare module 'firebase/storage' {
  export function getStorage(...args: any[]): any;
  export function ref(...args: any[]): any;
  export function uploadBytes(...args: any[]): any;
  export function getDownloadURL(...args: any[]): any;
  export function deleteObject(...args: any[]): any;
  export function getMetadata(...args: any[]): any;
}

declare module 'firebase/functions' {
  export function getFunctions(...args: any[]): any;
  export function httpsCallable(...args: any[]): any;
}

declare module 'firebase/app-check' {
  export function initializeAppCheck(...args: any[]): any;
  export class ReCaptchaV3Provider {
    constructor(...args: any[]);
  }
}

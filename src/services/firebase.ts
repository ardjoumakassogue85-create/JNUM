import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Environment variables or fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('PLACEHOLDER')
  );
};

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

export function getFirebaseDb(): Firestore | null {
  if (!db) {
    const fApp = getFirebaseApp();
    if (fApp) {
      db = getFirestore(fApp);
    }
  }
  return db;
}

export function getFirebaseAuth(): Auth | null {
  if (!auth) {
    const fApp = getFirebaseApp();
    if (fApp) {
      auth = getAuth(fApp);
      setPersistence(auth, browserLocalPersistence).catch((err) => {
        console.warn('Auth persistence initialization warning:', err);
      });
    }
  }
  return auth;
}


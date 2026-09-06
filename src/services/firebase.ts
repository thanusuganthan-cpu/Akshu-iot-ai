import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const isFirebaseConfigured = Boolean(apiKey && projectId);

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization error, continuing with local store:', err);
  }
}

export { app, auth, db };

export async function loginWithEmail(email: string, pass: string) {
  if (auth) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }
  // Local fallback
  return {
    uid: 'user_' + btoa(email).slice(0, 10),
    email,
    displayName: email.split('@')[0],
  };
}

export async function registerWithEmail(email: string, pass: string, name?: string) {
  if (auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }
  return {
    uid: 'user_' + btoa(email).slice(0, 10),
    email,
    displayName: name || email.split('@')[0],
  };
}

export async function loginWithGoogle() {
  if (auth) {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  }
  return {
    uid: 'google_user_' + Date.now().toString(36),
    email: 'operator@akshu.ai',
    displayName: 'Google Operator',
  };
}

export async function logoutUser() {
  if (auth) {
    await fbSignOut(auth);
  }
}

export async function resetPassword(email: string) {
  if (auth) {
    await sendPasswordResetEmail(auth, email);
    return true;
  }
  return true;
}

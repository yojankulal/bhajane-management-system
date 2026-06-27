import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  CollectionReference,
  DocumentReference,
  collection,
  doc
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import config from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
});

// Since we have a custom database id, initialize with it if specified
const db = (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)' && config.firestoreDatabaseId !== '')
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Standard login helper
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error during Google Sign-In with popup:", error);
    // If popups are blocked (e.g. inside sandboxed iframe wrappers), fall back to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      try {
        console.log("Popup blocked or duplicate login request. Requesting fallback redirect...");
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectError) {
        console.error("Failed to initialize Google redirect login:", redirectError);
        throw redirectError;
      }
    }
    throw error;
  }
};

// Standard logout helper
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export { db, auth };

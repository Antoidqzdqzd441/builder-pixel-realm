import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Real Firebase configuration for systeme-39fb9 project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDC5ffaxC4ljwWDFSkSXVz2g7yc_nMYN1U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "systeme-39fb9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "systeme-39fb9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "systeme-39fb9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "441120667998",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:441120667998:web:0679ebd9033209a70ab7cf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FGWJSLWNMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add scopes for profile information
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;

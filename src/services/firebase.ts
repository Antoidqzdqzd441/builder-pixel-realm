import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5YeX8m2J9nF3vR4hQ6W8L9dE2sA7bN1cO",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "systeme-39fb9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "systeme-39fb9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "systeme-39fb9.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "111479440206739914658",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:111479440206739914658:web:8f3c2d4e5a6b7c9e1f2a3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

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

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBX4W8V4H4jQ6K1HtY2sK9dL7xN3rE8mF0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "systeme-39fb9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "systeme-39fb9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "systeme-39fb9.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "484851885756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:484851885756:web:c8f5d2e4a6b9f1e2d4e5f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;

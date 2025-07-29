import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Development configuration that works without real API keys
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

const firebaseConfig = {
  apiKey: isDevelopment ? "demo-api-key" : import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5YeX8m2J9nF3vR4hQ6W8L9dE2sA7bN1cO",
  authDomain: isDevelopment ? "demo-project.firebaseapp.com" : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "systeme-39fb9.firebaseapp.com",
  projectId: isDevelopment ? "demo-project" : import.meta.env.VITE_FIREBASE_PROJECT_ID || "systeme-39fb9",
  storageBucket: isDevelopment ? "demo-project.appspot.com" : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "systeme-39fb9.appspot.com",
  messagingSenderId: isDevelopment ? "123456789" : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "111479440206739914658",
  appId: isDevelopment ? "1:123456789:web:demo-app-id" : import.meta.env.VITE_FIREBASE_APP_ID || "1:111479440206739914658:web:8f3c2d4e5a6b7c9e1f2a3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// In development, use Firebase emulators or create a mock
if (isDevelopment) {
  // Use demo mode for Firestore
  try {
    if (window.location.hostname === 'localhost') {
      // Connect to local emulators if running on localhost
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    // Emulators not available, continue with demo mode
    console.log('Firebase emulators not available, using demo mode');
  }
}

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

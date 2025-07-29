import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

export interface UserRole {
  role: 'member' | 'admin' | 'founder';
  points: number;
  credits: number;
  displayName: string;
  description?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userRole: null,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data() as UserRole;
        setAuthState({
          user,
          userRole: userData || null,
          loading: false
        });
      } else {
        setAuthState({
          user: null,
          userRole: null,
          loading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string, description?: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      const userData: UserRole = {
        role: 'member',
        points: 25, // Default 25 points
        credits: 0,
        displayName,
        description: description || '',
        photoURL: user.photoURL || '',
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Add a timeout to prevent hanging
      const signInPromise = signInWithPopup(auth, googleProvider);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign-in timeout')), 30000)
      );

      const { user } = await Promise.race([signInPromise, timeoutPromise]) as any;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Create user document for new Google users
        const userData: UserRole = {
          role: 'member',
          points: 25,
          credits: 0,
          displayName: user.displayName || 'User',
          description: '',
          photoURL: user.photoURL || '',
          createdAt: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          createdAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);

      // Provide more specific error messages
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Erreur de connexion réseau. Vérifiez votre connexion internet.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Connexion annulée par l\'utilisateur.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up bloqué par le navigateur. Autorisez les pop-ups pour ce site.');
      } else if (error.message === 'Sign-in timeout') {
        throw new Error('Délai de connexion dépassé. Veuillez réessayer.');
      } else {
        throw new Error('Erreur lors de la connexion avec Google. Veuillez réessayer.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout
  };
};

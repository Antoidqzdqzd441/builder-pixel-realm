import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
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
      const { user } = await signInWithPopup(auth, googleProvider);
      
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
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
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

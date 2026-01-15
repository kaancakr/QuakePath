/**
 * Authentication Context
 * Manages user authentication and role-based access
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/FirebaseConfig';

export type UserRole = 'civilian' | 'rescue_team';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isRescueTeam: boolean;
  isCivilian: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          uid,
          ...userDoc.data(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('[Auth] Error fetching user profile:', error);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(userCredential.user.uid);
      setUserProfile(profile);
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    }
  };

  // Sign up with email, password, and role
  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        role,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      setUserProfile(userProfile);
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('[Auth] Password reset error:', error);
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    isRescueTeam: userProfile?.role === 'rescue_team',
    isCivilian: userProfile?.role === 'civilian' || !userProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

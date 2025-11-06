'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebaseConfig';
import { UserProfile, OrganizationType } from '@/types/firebase/schema';
import { ensureOrganizationType } from '@/utils/organizationTypeMapping';

// Auto-login control - disabled to prevent auto-login
const DISABLE_AUTO_LOGIN = false; // Enable auto-login

// Define the shape of our auth context
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<User>;
  updateOrganizationType: (orgType: OrganizationType) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Simplified auth state interface
interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Provider component that wraps your app and makes auth available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });
  
  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);
  
  // Set error state
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);
  
  // Set user state
  const setCurrentUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  // Sign in with email/password - simplified version
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setCurrentUser]);

  // Sign out - simplified version
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    }
  }, [setCurrentUser, setError]);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to sign up. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setCurrentUser]);

    // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AUTH] Auth state changed:', user ? 'User signed in' : 'No user');
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          // Get user profile data and ensure it has an organizationType
          const profileData = userDoc.data() as UserProfile;
          const updatedProfile = ensureOrganizationType(profileData);
          
          // If the profile needed to be updated with an organizationType, save it back
          if (profileData.organizationType !== updatedProfile.organizationType) {
            try {
              await updateDoc(userDocRef, {
                organizationType: updatedProfile.organizationType
              });
              console.log(`[AUTH] Updated user ${user.uid} with organization type: ${updatedProfile.organizationType}`);
            } catch (error) {
              console.error('[AUTH] Error updating organization type:', error);
            }
          }
          
          setState(prev => ({ ...prev, user: user, profile: updatedProfile, loading: false }));
        } else {
          // Handle case where user exists in Auth but not in Firestore
          setState(prev => ({ ...prev, user: user, profile: null, loading: false }));
        }
      } else {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

    // Update user's organization type
  const updateOrganizationType = useCallback(async (orgType: OrganizationType) => {
    if (!state.user) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      const userDocRef = doc(db, 'users', state.user.uid);
      await updateDoc(userDocRef, {
        organizationType: orgType
      });
      
      // Update local state
      if (state.profile) {
        setState(prev => ({
          ...prev, 
          profile: {
            ...prev.profile as UserProfile,
            organizationType: orgType
          }
        }));
      }
      
      return;
    } catch (error) {
      console.error('Error updating organization type:', error);
      throw new Error('Failed to update organization type');
    }
  }, [state.user, state.profile]);

  // Context value
  const contextValue = {
    currentUser: state.user,
    userProfile: state.profile,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
    signUp,
    updateOrganizationType,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

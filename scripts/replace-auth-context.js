/**
 * Replace AuthContext.tsx with a fixed version
 * 
 * This script completely replaces the AuthContext.tsx file with a fixed version
 * that has the correct structure and no syntax errors.
 */

const fs = require('fs');
const path = require('path');

// Path to AuthContext.tsx
const authContextPath = path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx');

// Check if the file exists
if (!fs.existsSync(authContextPath)) {
  console.error('AuthContext.tsx not found at path:', authContextPath);
  process.exit(1);
}

// Create a backup of the original file
const backupPath = authContextPath + '.backup';
fs.copyFileSync(authContextPath, backupPath);
console.log(`Created backup at ${backupPath}`);

// The fixed content for AuthContext.tsx
const fixedContent = `'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, db, isValidConfig } from '@/lib/firebase/firebaseConfig';
import { safeGetDocument, safeUpdateDocument } from '@/lib/firebase/dataAccess';

// COGNITO DISABLED - Using Firebase authentication only
let isCognitoEnabled = false;
let cognitoAvailabilityChecked = true;

// Force Firebase authentication
const AUTH_PROVIDER = 'firebase';
const USE_COGNITO = false;

// Explicitly disable Cognito credentials check
const hasCognitoCredentials = false;

// Cognito availability check - always returns false since Cognito is disabled
const checkCognitoAvailability = async () => {
  // Always return false - Cognito is disabled
  return false;
};


// Force disable auto-login
const DISABLE_AUTO_LOGIN = true;

// Import CognitoUser type
import type { CognitoUser } from '@/lib/auth/cognitoAuth';

// Define the shape of our auth context
interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User | CognitoUser>;
  signInWithGoogle: () => Promise<User>;
  signUp: (email: string, password: string, displayName: string, role: string) => Promise<User | any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  authProvider: string;
  firebaseError: boolean;
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

// Provider component that wraps your app and makes auth available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string>('firebase');
  const [firebaseError, setFirebaseError] = useState(false);
  
  // Handle session timeout
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  
  const setupSessionExpiration = () => {
    // Clear any existing timeout
    if (window.sessionTimeoutId) {
      clearTimeout(window.sessionTimeoutId);
    }
    
    // Set new timeout
    window.sessionTimeoutId = setTimeout(() => {
      console.log('Session expired');
      signOut();
    }, sessionTimeout);
    
    // Reset timeout on user activity
    const resetTimeout = () => {
      if (currentUser) {
        setupSessionExpiration();
      }
    };
    
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);
    
    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  };
  
  // Check user approval with timeout protection
  const checkUserApproval = async (user: User) => {
    if (!user) return;
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('User approval check timed out')), 5000);
    });
    
    try {
      // Race between the actual operation and the timeout
      const result = await Promise.race([
        safeGetDocument('users', user.uid),
        timeoutPromise
      ]) as any;
      
      if (result && result.success && result.data) {
        const userData = result.data;
        setUserProfile(userData);
        
        // If user is not approved, sign them out
        if (userData.approved === false) {
          setError('Your account is pending approval. Please contact an administrator.');
          await signOut();
        }
      }
    } catch (error) {
      console.error('Error checking user approval:', error);
      // On timeout or error, just continue without user profile
      // This prevents the app from locking up
    }
  };
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    // Debug logging
    console.log('Auth credentials:', email, password);
    setLoading(true);
    setError(null);
    
    try {
      // Check if Cognito is available
      const useCognito = await checkCognitoAvailability();
      
      if (useCognito) {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        const user = await cognitoAuth.signIn(email, password);
        setAuthProvider('cognito');
        return user;
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        const result = await signInWithEmailAndPassword(auth, email, password);
        setAuthProvider('firebase');
        return result.user;
      }
    } catch (error: any) {
      console.error('Sign in error:', error.code, error.message, error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setAuthProvider('firebase');
      return result.user;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string, role: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Cognito is available
      const useCognito = await checkCognitoAvailability();
      
      if (useCognito) {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        const user = await cognitoAuth.signUp(email, password, { given_name: displayName, role });
        setAuthProvider('cognito');
        
        // Create user profile
        await safeUpdateDocument('users', user.uid, {
          email,
          displayName,
          role,
          approved: false,
          createdAt: new Date().toISOString()
        });
        
        return user;
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        await firebaseUpdateProfile(result.user, { displayName });
        
        // Create user profile
        await safeUpdateDocument('users', result.user.uid, {
          email,
          displayName,
          role,
          approved: false,
          createdAt: new Date().toISOString()
        });
        
        return result.user;
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (authProvider === 'cognito') {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        await cognitoAuth.signOut();
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        await firebaseSignOut(auth);
      }
      
      setCurrentUser(null);
      setUserProfile(null);
      
      // Clear session timeout
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Cognito is available
      const useCognito = await checkCognitoAvailability();
      
      if (useCognito) {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        await cognitoAuth.forgotPassword(email);
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        await sendPasswordResetEmail(auth, email);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!currentUser) {
        throw new Error('No user is signed in');
      }
      
      await safeUpdateDocument('users', currentUser.uid, data);
      
      // Update local user profile
      setUserProfile(prev => ({
        ...prev,
        ...data
      }));
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Listen for Firebase auth state changes with timeout protection
  useEffect(() => {
    let isMounted = true;
    let authTimeoutId: NodeJS.Timeout | null = null;
    
    const handleFirebaseError = (error: any) => {
      console.error('Firebase auth error:', error);
      if (isMounted) setFirebaseError(true);
    };
    
    // Set a timeout to prevent infinite loading
    authTimeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth state change timed out, continuing without authentication');
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        // Emergency fix: Prevent auto-login
        if (DISABLE_AUTO_LOGIN && user && window.location.pathname === "/") {
          console.log("Auto-login prevented by emergency fix");
          await firebaseSignOut(auth);
          return;
        }

        // Clear timeout since we got a response
        if (authTimeoutId) clearTimeout(authTimeoutId);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        // Reset Firebase error state
        setFirebaseError(false);
        
        if (user) {
          setCurrentUser(user);
          // Don't await checkUserApproval to prevent blocking
          checkUserApproval(user).catch(err => console.warn('User approval check failed:', err));
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      },
      handleFirebaseError
    );
    
    // Check if Cognito is available
    checkCognitoAvailability().then(available => {
      if (available) {
        // Set up Cognito auth listener
        import('@/lib/auth/cognitoAuth').then(({ cognitoAuth }) => {
          // Check for existing Cognito session
          cognitoAuth.getCurrentUser().then(user => {
            if (user) {
              setCurrentUser(user as unknown as User);
              setAuthProvider('cognito');
            }
            setLoading(false);
          });
        });
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
      
      // Clear timeouts
      if (authTimeoutId) clearTimeout(authTimeoutId);
      if (window.sessionTimeoutId) clearTimeout(window.sessionTimeoutId);
    };
  }, []);
  
  // Set up session expiration with throttling
  useEffect(() => {
    if (!currentUser) return;
    
    // Use throttled event handlers to prevent excessive function calls
    let lastActivity = Date.now();
    const activityThreshold = 5000; // 5 seconds between checks
    
    const throttledResetTimeout = () => {
      const now = Date.now();
      if (now - lastActivity > activityThreshold) {
        lastActivity = now;
        setupSessionExpiration();
      }
    };
    
    // Set up initial timeout
    const cleanup = setupSessionExpiration();
    
    // Use passive event listeners for better performance
    window.addEventListener('mousemove', throttledResetTimeout, { passive: true });
    window.addEventListener('keypress', throttledResetTimeout, { passive: true });
    
    return () => {
      cleanup();
      window.removeEventListener('mousemove', throttledResetTimeout);
      window.removeEventListener('keypress', throttledResetTimeout);
    };
  }, [currentUser]);
  
  // Check user approval when user changes
  useEffect(() => {
    if (currentUser) {
      checkUserApproval(currentUser);
    }
  }, [currentUser]);
  
  // Context provider value
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    authProvider,
    firebaseError
  };
  
  // Provide fallback UI for Firebase errors
  if (firebaseError) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a365d' }}>
          Authentication Service Unavailable
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#64748b', maxWidth: '600px' }}>
          We&apos;re experiencing issues with our authentication service. Please try again later.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#1a365d', 
            color: 'white', 
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Declare global window type
declare global {
  interface Window {
    sessionTimeoutId: NodeJS.Timeout | undefined;
  }
}`;

// Write the fixed content to the file
fs.writeFileSync(authContextPath, fixedContent);

console.log('Successfully replaced AuthContext.tsx with fixed version');
console.log('Please restart your development server for changes to take effect.');

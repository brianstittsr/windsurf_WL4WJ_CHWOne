'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebaseConfig';
import { safeGetDocument, safeUpdateDocument } from '@/lib/firebase/dataAccess';

// Import Cognito auth dynamically to make it optional
let isCognitoEnabled = false;
let cognitoAvailabilityChecked = false;

// Check if Cognito is configured
const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'firebase';
const USE_COGNITO = AUTH_PROVIDER === 'cognito';

// Check if required Cognito credentials are available
const hasCognitoCredentials = !!(process.env.NEXT_PUBLIC_USER_POOL_ID && 
                              process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID);

// We'll check if Cognito is available at runtime
const checkCognitoAvailability = async () => {
  // Skip if already checked or not configured to use Cognito
  if (cognitoAvailabilityChecked || !USE_COGNITO) {
    return isCognitoEnabled;
  }
  
  // Skip if credentials are missing
  if (!hasCognitoCredentials) {
    console.warn('Cognito credentials missing. Using Firebase instead.');
    cognitoAvailabilityChecked = true;
    isCognitoEnabled = false;
    return false;
  }
  
  try {
    // Try to dynamically import Cognito
    const { checkCognitoAvailability } = await import('@/lib/auth/cognitoAuth');
    const available = await checkCognitoAvailability();
    
    isCognitoEnabled = available;
    cognitoAvailabilityChecked = true;
    
    if (available) {
      console.log('Cognito auth is available');
    } else {
      console.warn('Cognito auth is not available. Using Firebase instead.');
    }
    
    return available;
  } catch (error) {
    console.error('Error checking Cognito availability:', error);
    cognitoAvailabilityChecked = true;
    isCognitoEnabled = false;
    return false;
  }
};

// Define the shape of our auth context
interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signUp: (email: string, password: string, displayName: string, role: string) => Promise<User>;
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
  
  // Check if user is approved
  const checkUserApproval = async (user: User) => {
    if (!user) return;
    
    try {
      const result = await safeGetDocument('users', user.uid);
      
      if (result.success && result.data) {
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
      // Don't sign out on error - just let them proceed
      // This prevents issues when Firebase is unavailable
    }
  };
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Cognito is available
      const useCognito = await checkCognitoAvailability();
      
      if (useCognito) {
        // Use Cognito auth
        const { signIn: cognitoSignIn } = await import('@/lib/auth/cognitoAuth');
        const user = await cognitoSignIn(email, password);
        setAuthProvider('cognito');
        return user;
      } else {
        // Use Firebase auth
        const result = await signInWithEmailAndPassword(auth, email, password);
        setAuthProvider('firebase');
        return result.user;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
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
        const { signUp: cognitoSignUp } = await import('@/lib/auth/cognitoAuth');
        const user = await cognitoSignUp(email, password, displayName);
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
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setAuthProvider('firebase');
        
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
        const { signOut: cognitoSignOut } = await import('@/lib/auth/cognitoAuth');
        await cognitoSignOut();
      } else {
        // Use Firebase auth
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
        const { resetPassword: cognitoResetPassword } = await import('@/lib/auth/cognitoAuth');
        await cognitoResetPassword(email);
      } else {
        // Use Firebase auth
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
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const handleFirebaseError = (error: any) => {
      console.error('Firebase auth error:', error);
      setFirebaseError(true);
    };
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (user) => {
        // Reset Firebase error state
        setFirebaseError(false);
        
        if (user) {
          setCurrentUser(user);
          await checkUserApproval(user);
          setupSessionExpiration();
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
        import('@/lib/auth/cognitoAuth').then(({ setupCognitoAuthListener }) => {
          setupCognitoAuthListener(setCurrentUser, setLoading);
        });
      }
    });
    
    return () => {
      unsubscribe();
      
      // Clear session timeout
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }
    };
  }, []);
  
  // Set up session expiration
  useEffect(() => {
    if (currentUser) {
      return setupSessionExpiration();
    }
  }, [currentUser, sessionTimeout]);
  
  // Check user approval when user changes
  useEffect(() => {
    if (currentUser) {
      checkUserApproval(currentUser);
    }
  }, [currentUser]);
  
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
          We're experiencing issues with our authentication service. Please try again later.
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
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Declare global window type
declare global {
  interface Window {
    sessionTimeoutId: number;
  }
}

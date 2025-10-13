'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cognitoAuth, CognitoUser, AuthState, checkCognitoAvailability } from '@/lib/auth/cognitoAuth';
import { UserRole } from '@/types/firebase/schema';
import { useAuth as useFirebaseAuth } from '@/contexts/AuthContext';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, attributes?: Record<string, string>) => Promise<void>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  updateUserAttributes: (attributes: Record<string, string>) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function CognitoAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });
  const [isCognitoAvailable, setIsCognitoAvailable] = useState<boolean>(false);

  // Check if Cognito is available
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await checkCognitoAvailability();
      setIsCognitoAvailable(available);
      
      // If Cognito is not available, set loading to false
      if (!available) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Cognito authentication is not available'
        }));
      }
    };
    
    checkAvailability();
  }, []);

  useEffect(() => {
    // Only check auth state if Cognito is available
    if (isCognitoAvailable) {
      checkAuthState();
    }
  }, [isCognitoAvailable]);

  const checkAuthState = async () => {
    try {
      const user = await cognitoAuth.getCurrentUser();
      setAuthState({
        isAuthenticated: !!user,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed'
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if Cognito is available
    if (!isCognitoAvailable) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Cognito authentication is not available'
      });
      throw new Error('Cognito authentication is not available');
    }
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await cognitoAuth.signIn(email, password);
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, attributes: Record<string, string> = {}) => {
    // Check if Cognito is available
    if (!isCognitoAvailable) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Cognito authentication is not available'
      });
      throw new Error('Cognito authentication is not available');
    }
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await cognitoAuth.signUp(email, password, attributes);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      }));
      throw error;
    }
  };

  const signOut = async () => {
    // Check if Cognito is available
    if (!isCognitoAvailable) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null // No error on sign out if Cognito is not available
      });
      return; // Just return success since we're already signed out
    }
    
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await cognitoAuth.signOut();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
      throw error;
    }
  };

  // Helper function to check Cognito availability
  const checkCognitoAvailabilityOrThrow = () => {
    if (!isCognitoAvailable) {
      const error = 'Cognito authentication is not available';
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error
      });
      throw new Error(error);
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    // Check if Cognito is available
    checkCognitoAvailabilityOrThrow();
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await cognitoAuth.confirmSignUp(email, code);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Confirmation failed'
      }));
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    // Check if Cognito is available
    checkCognitoAvailabilityOrThrow();
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await cognitoAuth.forgotPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      }));
      throw error;
    }
  };

  const confirmPassword = async (email: string, code: string, newPassword: string) => {
    // Check if Cognito is available
    checkCognitoAvailabilityOrThrow();
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await cognitoAuth.confirmPassword(email, code, newPassword);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Password confirmation failed'
      }));
      throw error;
    }
  };

  const updateUserAttributes = async (attributes: Record<string, string>) => {
    // Check if Cognito is available
    checkCognitoAvailabilityOrThrow();
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await cognitoAuth.updateUserAttributes(attributes);
      // Refresh user data
      await checkAuthState();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Update failed'
      }));
      throw error;
    }
  };

  const resendConfirmationCode = async (email: string) => {
    // Check if Cognito is available
    checkCognitoAvailabilityOrThrow();
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await cognitoAuth.resendConfirmationCode(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Resend failed'
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    forgotPassword,
    confirmPassword,
    updateUserAttributes,
    resendConfirmationCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Move useContext outside of conditional blocks
export function useCognitoAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCognitoAuth must be used within a CognitoAuthProvider');
  }
  return context;
}

// Configuration to switch between Firebase and Cognito
// Default to Firebase if not specified or if Cognito is not available
const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'firebase';
const USE_COGNITO = AUTH_PROVIDER === 'cognito';

// Legacy compatibility - create a Firebase-like interface
export function useAuth() {
  // Use Cognito only if explicitly enabled AND available
  if (USE_COGNITO) {
    try {
      const cognitoAuth = useCognitoAuth();
      
      // If Cognito is not available (error state), fall back to Firebase
      if (cognitoAuth.error === 'Cognito authentication is not available') {
        console.warn('Falling back to Firebase authentication');
        return useFirebaseAuth();
      }

      // Transform Cognito auth to Firebase-like interface
      return {
        currentUser: cognitoAuth.user ? {
          uid: cognitoAuth.user.username,
          email: cognitoAuth.user.email,
          displayName: cognitoAuth.user.givenName
            ? `${cognitoAuth.user.givenName} ${cognitoAuth.user.familyName || ''}`.trim()
            : cognitoAuth.user.email,
          emailVerified: cognitoAuth.user.emailVerified,
          phoneNumber: cognitoAuth.user.phoneNumber,
          role: UserRole.CHW, // Default role - would be determined by custom attributes
          chwProfile: {
            firstName: cognitoAuth.user.givenName || '',
            lastName: cognitoAuth.user.familyName || '',
            primaryPhone: cognitoAuth.user.phoneNumber || '',
            languages: [],
            serviceArea: [],
            zipCodes: [],
            skills: [],
            specializations: [],
            availability: {
              monday: [],
              tuesday: [],
              wednesday: [],
              thursday: [],
              friday: [],
              saturday: [],
              sunday: []
            },
            resources: [],
            equipment: [],
            profileVisible: false,
            allowContactSharing: true,
            completedTrainings: 0,
            activeClients: 0,
            totalEncounters: 0
          },
          ...cognitoAuth.user.customAttributes
        } : null,
        loading: cognitoAuth.loading,
        signIn: async (email: string, password: string) => {
          await cognitoAuth.signIn(email, password);
        },
        signUp: async (email: string, password: string, attributes?: Record<string, string>) => {
          await cognitoAuth.signUp(email, password, attributes);
        },
        signOut: cognitoAuth.signOut,
        confirmSignUp: cognitoAuth.confirmSignUp,
        forgotPassword: cognitoAuth.forgotPassword,
        confirmPassword: cognitoAuth.confirmPassword,
        updateUserAttributes: cognitoAuth.updateUserAttributes,
        resendConfirmationCode: cognitoAuth.resendConfirmationCode
      };
    } catch (error) {
      // If there's an error with Cognito, fall back to Firebase
      console.warn('Error using Cognito auth, falling back to Firebase:', error);
      return useFirebaseAuth();
    }
  } else {
    // Use Firebase as default
    return useFirebaseAuth();
  }
}

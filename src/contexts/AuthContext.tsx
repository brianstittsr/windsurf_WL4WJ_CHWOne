'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock user for testing
const mockUser = {
  uid: 'test-user-123',
  email: 'test@chwone.org',
  displayName: 'Test User',
  emailVerified: true,
} as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we're in testing mode
  const isTestMode = process.env.NODE_ENV === 'development' && 
                     process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  async function login(email: string, password: string) {
    if (isTestMode) {
      // Check for admin credentials
      if (email === 'admin@example.com' && password === 'admin123') {
        const adminUser = {
          uid: 'admin-user-456',
          email: 'admin@example.com',
          displayName: 'Admin User',
          emailVerified: true,
        } as User;
        setCurrentUser(adminUser);
        return;
      }
      // Default test user for any other credentials in test mode
      setCurrentUser(mockUser);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string) {
    if (isTestMode) {
      // Bypass authentication in test mode
      setCurrentUser(mockUser);
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (isTestMode) {
      setCurrentUser(null);
      return;
    }
    await signOut(auth);
  }

  useEffect(() => {
    if (isTestMode) {
      // Auto-login with default test user in test mode
      setCurrentUser(mockUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [isTestMode]);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

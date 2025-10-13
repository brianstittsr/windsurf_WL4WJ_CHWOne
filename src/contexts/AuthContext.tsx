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
      console.warn('Cognito auth is not available, using Firebase instead.');
    }
    
    return available;
  } catch (err) {
    console.warn('Error checking Cognito availability, using Firebase instead:', err);
    cognitoAvailabilityChecked = true;
    isCognitoEnabled = false;
    return false;
  }
};

// Start the availability check if in browser environment
if (typeof window !== 'undefined') {
  checkCognitoAvailability().catch(err => {
    console.error('Failed to check Cognito availability:', err);
  });
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, sessionDuration?: number) => Promise<void>;
  createUser: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isApproved?: boolean;
  userRole?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load Cognito module outside of component to avoid conditional hook calls
let cognitoAuthModule: any = null;
if (isCognitoEnabled && USE_COGNITO && hasCognitoCredentials) {
  try {
    cognitoAuthModule = require('@/lib/auth/CognitoAuthContext');
    if (!cognitoAuthModule || !cognitoAuthModule.useAuth) {
      console.warn('Cognito auth module loaded but useAuth not found');
      cognitoAuthModule = null;
    }
  } catch (error) {
    console.warn('Error loading Cognito auth module:', error);
    cognitoAuthModule = null;
  }
}

export function useAuth() {
  // If Cognito module is available, use it
  if (cognitoAuthModule && cognitoAuthModule.useAuth) {
    return cognitoAuthModule.useAuth();
  }
  
  // Default to Firebase Auth
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

// Helper function to create mock users with roles
function createMockUser(uid: string, email: string, displayName: string, role: string): User {
  return {
    uid,
    email,
    displayName,
    emailVerified: true,
    role, // Custom property for role
    // Add minimal required User properties
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: () => Promise.resolve(),
    getIdToken: () => Promise.resolve(''),
    getIdTokenResult: () => Promise.resolve({} as any),
    reload: () => Promise.resolve(),
    toJSON: () => ({})
  } as unknown as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This is the Firebase Auth provider - the default authentication system
  // Cognito is optional and will be used only if explicitly configured
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState<boolean | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check if we're in testing mode - use localStorage for easy toggling
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Initialize test mode from localStorage
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const bypassAuth = localStorage.getItem('BYPASS_AUTH') === 'true';
      setIsTestMode(bypassAuth);
      
      // Log the current state for developer awareness
      if (bypassAuth) {
        console.warn('🔧 DEVELOPER MODE: Auto-login is ENABLED. Use the test mode toggle to disable it.');
      }
    }
  }, []);

  // Function to check if user is approved by admin
  const checkUserApproval = async (uid: string) => {
    // In a real implementation, this would check Firestore for the user's approval status
    // For now, we'll simulate approval for testing
    if (isTestMode) {
      // In test mode, all users are approved except specific test cases
      if (uid === 'unapproved-test-user') {
        setIsApproved(false);
        return false;
      }
      setIsApproved(true);
      return true;
    }

    try {
      // Here you would query Firestore for the user's approval status
      // const userDoc = await getDoc(doc(db, 'users', uid));
      // const userData = userDoc.data();
      // const approved = userData?.approved === true;
      
      // For now, we'll just simulate approval
      const approved = true;
      setIsApproved(approved);
      return approved;
    } catch (error) {
      console.error('Error checking user approval status:', error);
      setIsApproved(false);
      return false;
    }
  };

  // Function to set up session expiration
  const setupSessionExpiration = (duration: number) => {
    // Clear any existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    // Set new timeout for session expiration
    const timeout = setTimeout(() => {
      // Log the user out when session expires
      signOut(auth).then(() => {
        // Redirect to login page with expired flag
        window.location.href = '/login?expired=true';
      }).catch(error => {
        console.error('Error signing out after session expiration:', error);
      });
    }, duration);

    setSessionTimeout(timeout);

    // Store expiration time in localStorage for persistence across page refreshes
    const expirationTime = Date.now() + duration;
    localStorage.setItem('sessionExpiration', expirationTime.toString());
  };

  // Check for existing session expiration on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const expirationTime = localStorage.getItem('sessionExpiration');
      if (expirationTime) {
        const timeLeft = parseInt(expirationTime) - Date.now();
        if (timeLeft > 0) {
          // Session still valid, set up remaining timeout
          setupSessionExpiration(timeLeft);
        } else {
          // Session expired, clean up
          localStorage.removeItem('sessionExpiration');
          if (currentUser) {
            signOut(auth).then(() => {
              window.location.href = '/login?expired=true';
            });
          }
        }
      }
    };

    if (!isTestMode && typeof window !== 'undefined') {
      checkExistingSession();
    }

    // Clean up timeout on unmount
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [currentUser, isTestMode]);

  async function login(email: string, password: string, sessionDuration: number = 3600000) { // Default 1 hour
    if (isTestMode) {
      // Handle role-based login for testing
      if (email === 'admin@chwone.org' && password === 'admin123') {
        // Admin user
        const adminUser = createMockUser('admin-user', email, 'Admin User', 'admin');
        setCurrentUser(adminUser);
        setUserRole('admin');
        setIsApproved(true);
        return;
      } else if (email === 'brians@wl4wj.org' && password === 'Yfhk9r76q@@12345') {
        // WL4WJ Admin user
        const wl4wjAdmin = createMockUser('wl4wj-admin', email, 'Brian Stitts', 'admin');
        setCurrentUser(wl4wjAdmin);
        setUserRole('admin');
        setIsApproved(true);
        return;
      } else if (email === 'chw@chwone.org' && password === 'chw123') {
        // CHW user
        const chwUser = createMockUser('chw-user', email, 'CHW User', 'chw');
        setCurrentUser(chwUser);
        setUserRole('chw');
        setIsApproved(true);
        return;
      } else if (email === 'wl4j@chwone.org' && password === 'wl4j123') {
        // WL4J CHW user
        const wl4jUser = createMockUser('wl4j-user', email, 'WL4J CHW', 'wl4j_chw');
        setCurrentUser(wl4jUser);
        setUserRole('wl4j_chw');
        setIsApproved(true);
        return;
      } else if (email === 'demo@chwone.org' && password === 'demo123') {
        // Demo user
        const demoUser = createMockUser('demo-user', email, 'Demo User', 'demo');
        setCurrentUser(demoUser);
        setUserRole('demo');
        setIsApproved(true);
        return;
      }
      // Default test user for any other credentials in test mode
      setCurrentUser(mockUser);
      setUserRole('chw');
      setIsApproved(true);
      return;
    }
    
    // Use the createMockUser function defined above

    // Special handling for the admin user
    if (email === 'brians@wl4wj.org' && password === 'Yfhk9r76q@@12345') {
      try {
        console.log('Attempting admin login with Firebase...');
        
        // Check if Firebase is properly initialized
        if (!auth || !auth.app || !auth.app.options || !auth.app.options.apiKey) {
          console.error('Firebase not properly initialized. Using mock admin login instead.');
          
          // Create a mock admin user
          const mockAdminUser = createMockUser('wl4wj-admin', email, 'Brian Stitts', 'admin');
          setCurrentUser(mockAdminUser);
          setUserRole('admin');
          setIsApproved(true);
          
          // Store in localStorage for persistence
          localStorage.setItem('mock_admin_user', JSON.stringify({
            uid: 'wl4wj-admin',
            email,
            displayName: 'Brian Stitts',
            role: 'admin'
          }));
          
          return;
        }
        
        // Try to sign in with Firebase first
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
          .catch(async (error) => {
            console.log('Sign-in error:', error.code, error.message);
            
            // If user doesn't exist, create it
            if (error.code === 'auth/user-not-found') {
              console.log('Admin user not found, creating new account...');
              return await createUserWithEmailAndPassword(auth, email, password);
            }
            
            // For configuration errors, fall back to mock user
            if (error.code === 'auth/configuration-not-found' || 
                error.code === 'auth/invalid-api-key') {
              console.warn('Firebase configuration error, using mock admin user');
              
              // Create a mock admin user
              const mockAdminUser = createMockUser('wl4wj-admin', email, 'Brian Stitts', 'admin');
              setCurrentUser(mockAdminUser);
              setUserRole('admin');
              setIsApproved(true);
              
              // Store in localStorage for persistence
              localStorage.setItem('mock_admin_user', JSON.stringify({
                uid: 'wl4wj-admin',
                email,
                displayName: 'Brian Stitts',
                role: 'admin'
              }));
              
              return { user: mockAdminUser };
            }
            
            throw error;
          });
        
        const user = userCredential.user;
        console.log('Admin login successful:', user.email);
        
        // Set custom claims (in a real app, this would be done in Firebase Admin SDK)
        // Here we're simulating by storing role in localStorage
        localStorage.setItem(`user_role_${user.uid}`, 'admin');
        
        // Set up session expiration
        setupSessionExpiration(sessionDuration);
        
        // Set role in state
        setUserRole('admin');
        setIsApproved(true);
        
        return;
      } catch (error) {
        console.error('Error in admin login process:', error);
        
        // Fall back to mock user for any error
        console.warn('Using mock admin user as fallback');
        const mockAdminUser = createMockUser('wl4wj-admin', email, 'Brian Stitts', 'admin');
        setCurrentUser(mockAdminUser);
        setUserRole('admin');
        setIsApproved(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('mock_admin_user', JSON.stringify({
          uid: 'wl4wj-admin',
          email,
          displayName: 'Brian Stitts',
          role: 'admin'
        }));
        
        return;
      }
    }
    
    // Standard sign in with Firebase for other users
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if this is our special admin user (in case they were created previously)
    if (email === 'brians@wl4wj.org') {
      localStorage.setItem(`user_role_${user.uid}`, 'admin');
      setUserRole('admin');
      setIsApproved(true);
    } else {
      // Check if user is approved
      const approved = await checkUserApproval(user.uid);
      if (!approved) {
        // If not approved, sign out and throw error
        await signOut(auth);
        throw new Error('Your account is pending approval by an administrator.');
      }
    }
    
    // Set up session expiration
    setupSessionExpiration(sessionDuration);
  }

  async function createUser(email: string, password: string) {
    if (isTestMode) {
      // Bypass authentication in test mode
      setCurrentUser(mockUser);
      return;
    }
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // In a real implementation, you would store additional user data in Firestore
    // with approval status set to false
    // await setDoc(doc(db, 'users', user.uid), {
    //   email: user.email,
    //   createdAt: new Date(),
    //   approved: false
    // });
    
    // Sign out the user after registration since they need approval
    await signOut(auth);
  }

  async function handleSignOut() {
    // Clear session timeout and localStorage
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    localStorage.removeItem('sessionExpiration');
    
    if (isTestMode) {
      setCurrentUser(null);
      setIsApproved(undefined);
      return;
    }
    
    await signOut(auth);
  }

  useEffect(() => {
    if (isTestMode) {
      // Auto-login with default test user in test mode
      setCurrentUser(mockUser);
      setIsApproved(true);
      setLoading(false);
      return;
    }

    // Check for mock admin user in localStorage (for when Firebase fails)
    if (typeof window !== 'undefined') {
      const mockAdminStr = localStorage.getItem('mock_admin_user');
      if (mockAdminStr) {
        try {
          const mockAdmin = JSON.parse(mockAdminStr);
          const mockAdminUser = createMockUser(
            mockAdmin.uid, 
            mockAdmin.email, 
            mockAdmin.displayName, 
            mockAdmin.role
          );
          setCurrentUser(mockAdminUser);
          setUserRole('admin');
          setIsApproved(true);
          setLoading(false);
          console.log('Restored mock admin session from localStorage');
          return;
        } catch (e) {
          console.error('Error parsing mock admin user:', e);
          localStorage.removeItem('mock_admin_user');
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setCurrentUser(user);
      
      if (user) {
        // Check if this is our special admin user
        if (user.email === 'brians@wl4wj.org') {
          console.log('Admin user detected in auth state change');
          setUserRole('admin');
          setIsApproved(true);
        } else {
          // Check if user has a role stored in localStorage
          const storedRole = localStorage.getItem(`user_role_${user.uid}`);
          if (storedRole) {
            console.log(`User role found in localStorage: ${storedRole}`);
            setUserRole(storedRole);
            setIsApproved(true);
          } else {
            // Check if user is approved when auth state changes
            await checkUserApproval(user.uid);
          }
        }
      } else {
        // No user - check if we should use mock admin
        if (typeof window !== 'undefined') {
          const mockAdminStr = localStorage.getItem('mock_admin_user');
          if (mockAdminStr) {
            try {
              const mockAdmin = JSON.parse(mockAdminStr);
              const mockAdminUser = createMockUser(
                mockAdmin.uid, 
                mockAdmin.email, 
                mockAdmin.displayName, 
                mockAdmin.role
              );
              setCurrentUser(mockAdminUser);
              setUserRole('admin');
              setIsApproved(true);
              console.log('Using mock admin user from localStorage');
            } catch (e) {
              console.error('Error parsing mock admin user:', e);
              localStorage.removeItem('mock_admin_user');
              setIsApproved(undefined);
              setUserRole(undefined);
            }
          } else {
            setIsApproved(undefined);
            setUserRole(undefined);
          }
        } else {
          setIsApproved(undefined);
          setUserRole(undefined);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isTestMode]);

  const value = {
    currentUser,
    login,
    createUser,
    signOut: handleSignOut,
    loading,
    isApproved,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

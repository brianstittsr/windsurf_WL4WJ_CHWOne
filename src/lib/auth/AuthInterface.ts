// AuthInterface.ts
// Unified interface for authentication providers (Firebase and Cognito)

import { User as FirebaseUser } from 'firebase/auth';
import { CognitoUser } from './cognitoAuth';
import { UserRole } from '@/types/firebase/schema';

// Unified user type that works with both Firebase and Cognito
export interface UnifiedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  phoneNumber?: string | null;
  role?: UserRole;
  chwProfile?: {
    firstName: string;
    lastName: string;
    primaryPhone: string;
    languages: string[];
    serviceArea: string[];
    zipCodes: string[];
    skills: string[];
    specializations: string[];
    availability: {
      monday: string[];
      tuesday: string[];
      wednesday: string[];
      thursday: string[];
      friday: string[];
      saturday: string[];
      sunday: string[];
    };
    resources: string[];
    equipment: string[];
    profileVisible: boolean;
    allowContactSharing: boolean;
    completedTrainings: number;
    activeClients: number;
    totalEncounters: number;
  };
  [key: string]: any; // For custom attributes
}

// Unified auth interface that both providers implement
export interface AuthInterface {
  currentUser: UnifiedUser | null;
  loading: boolean;
  error?: string | null;
  
  // Core auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, attributes?: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  
  // Optional methods (may only be available in Cognito)
  confirmSignUp?: (email: string, code: string) => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  confirmPassword?: (email: string, code: string, newPassword: string) => Promise<void>;
  updateUserAttributes?: (attributes: Record<string, string>) => Promise<void>;
  resendConfirmationCode?: (email: string) => Promise<void>;
}

// Helper function to convert Firebase User to UnifiedUser
export function firebaseUserToUnified(user: FirebaseUser | null): UnifiedUser | null {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    // Additional fields would be populated from Firestore if needed
  };
}

// Helper function to convert Cognito User to UnifiedUser
export function cognitoUserToUnified(user: CognitoUser | null): UnifiedUser | null {
  if (!user) return null;
  
  return {
    uid: user.username,
    email: user.email,
    displayName: user.givenName 
      ? `${user.givenName} ${user.familyName || ''}`.trim() 
      : user.email,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    // Additional fields from custom attributes
    ...(user.customAttributes || {})
  };
}

// Get the current auth provider name
export function getAuthProviderName(): 'firebase' | 'cognito' {
  return (process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'cognito') ? 'cognito' : 'firebase';
}

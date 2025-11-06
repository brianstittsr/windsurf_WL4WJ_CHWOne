import { Timestamp } from 'firebase/firestore';

// Common base types
export interface BaseEntity {
  id: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isActive: boolean;
}

export type CreateEntity<T> = Omit<T, keyof BaseEntity> & { isActive?: boolean; id?: string };

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  address?: Address;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TimeRange {
  start: string; // Format: HH:MM in 24h format
  end: string;   // Format: HH:MM in 24h format
}

// State Entity
export interface State extends BaseEntity {
  name: string;
  abbreviation: string;
  region?: string; // Optional regional grouping (Northeast, Midwest, etc.)
  contactInfo: ContactInfo;
}

export type ClaimStatus = 'unclaimed' | 'claim-pending' | 'claimed' | 'verified';

export interface ClaimAttempt {
  requestId: string; // Unique identifier for this claim attempt
  requestedBy: string; // User ID
  requestedAt: Date | Timestamp;
  requestorName: string;
  requestorTitle: string;
  requestorEmail: string;
  requestorPhone?: string;
  verificationDocuments?: string[]; // URLs to uploaded documents
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // Admin User ID
  reviewedAt?: Date | Timestamp;
  reviewNotes?: string;
}

// Community Health Worker Association Entity
export interface CHWAssociation extends BaseEntity {
  name: string;
  abbreviation: string; // Common abbreviation (e.g., AzCHOW)
  stateId: string; // Reference to parent State
  description?: string;
  contactInfo: ContactInfo;
  logo?: string; // URL to logo image
  primaryColor?: string; // For UI customization
  administrators: string[]; // Array of admin user IDs
  approvalStatus?: ApprovalStatus; // For new associations
  
  // Association claiming fields
  claimStatus: ClaimStatus;
  claimToken?: string; // Unique token for verification
  claimHistory?: ClaimAttempt[];
}

// Nonprofit Organization Entity
export interface NonprofitOrganization extends BaseEntity {
  name: string;
  chwAssociationId: string; // Reference to parent CHW Association
  stateId: string; // Derived from parent Association for quick access
  ein?: string; // Employer Identification Number
  mission?: string;
  contactInfo: ContactInfo;
  logo?: string; // URL to logo image
  serviceAreas: string[]; // List of service area names
  administrators: string[]; // Array of admin user IDs
  approvalStatus?: ApprovalStatus; // For new organizations
}

// Community Health Worker Entity
export interface CommunityHealthWorker extends BaseEntity {
  userId: string; // Reference to User account
  nonprofitId: string; // Reference to parent Nonprofit
  chwAssociationId: string; // Derived from Nonprofit for quick access
  stateId: string; // Derived from Association for quick access
  profile: CHWProfile;
  contactInfo: {
    email: string;
    phone?: string;
    alternatePhone?: string;
  };
  serviceArea?: GeoRegion;
  availability?: Availability;
  supervisor?: {
    userId: string;
    name: string;
  };
  approvalStatus?: ApprovalStatus; // For new CHWs
}

export interface CHWProfile {
  firstName: string;
  lastName: string;
  title?: string;
  bio?: string;
  photo?: string;
  languages: string[];
  specialties: string[];
  certifications: Certification[];
}

export interface Certification {
  name: string;
  issuer: string;
  dateObtained: Timestamp | Date;
  expirationDate?: Timestamp | Date;
  verificationStatus: 'pending' | 'verified' | 'expired';
}

export interface Availability {
  schedule: {
    monday: TimeRange[];
    tuesday: TimeRange[];
    wednesday: TimeRange[];
    thursday: TimeRange[];
    friday: TimeRange[];
    saturday: TimeRange[];
    sunday: TimeRange[];
  };
  maxClientsPerWeek?: number;
}

export interface GeoRegion {
  name: string;
  zipCodes: string[];
  radius?: number; // miles from center point
  centerPoint?: {
    latitude: number;
    longitude: number;
  };
}

// User Profile - Extended from existing one
export interface UserProfile extends BaseEntity {
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  chwAssociationId?: string;
  nonprofitId?: string;
  stateId?: string;
  chwId?: string; // If the user is a CHW
  permissions: Record<string, boolean>;
  phoneNumber?: string;
  photoURL?: string;
  pendingApproval?: boolean;
}

// Helper type to convert Firestore Timestamp to Date
export type WithDate<T> = {
  [K in keyof T]: T[K] extends Timestamp ? Date : T[K];
};

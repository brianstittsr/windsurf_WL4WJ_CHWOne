import { Timestamp } from 'firebase/firestore';

export type OrganizationType = 'nonprofit' | 'chw_association' | 'other';

export interface BaseEntity {
  id: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export type CreateEntity<T> = Omit<T, keyof BaseEntity>;

export interface State extends BaseEntity {
  name: string;
  code: string; 
  chwAssociationId: string;
}

export interface ChwAssociation extends BaseEntity {
  name: string;
  stateId: string;
  contactEmail: string;
  contactPhone: string;
  regionIds: string[];
}

export interface Region extends BaseEntity {
  name: string;
  stateId: string;
  chwAssociationId: string;
  nonprofitIds: string[];
}

export interface Organization extends BaseEntity {
  name: string;
  type: OrganizationType;
  regionId?: string;
  chwAssociationId?: string;
  // Add other organization fields as needed
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface UserProfile extends BaseEntity {
  email: string;
  displayName?: string;
  role: string;
  chwAssociationId?: string;
  regionId?: string;
  nonprofitId?: string;
  isActive: boolean;
  // Add other user profile fields as needed
}

// Helper type to convert Firestore Timestamp to Date
export type WithDate<T> = {
  [K in keyof T]: T[K] extends Timestamp ? Date : T[K];
};

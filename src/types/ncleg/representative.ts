/**
 * NC Legislature Representative Schema
 * For storing NC House Representatives data for search and AI chat discovery
 */

export interface NCRepresentative {
  // Core identifiers
  id: string; // Member ID from ncleg.gov (e.g., "697")
  chamber: 'H' | 'S'; // House or Senate
  
  // Basic info
  name: string;
  firstName: string;
  lastName: string;
  suffix?: string; // Jr., IV, etc.
  title?: string; // MD, etc.
  party: 'R' | 'D' | 'I'; // Republican, Democrat, Independent
  district: number;
  counties: string[];
  
  // Session info
  session: string; // e.g., "2025-2026"
  termsInHouse: number;
  termsInSenate: number;
  status: 'active' | 'resigned' | 'appointed';
  statusDate?: string; // Date of resignation or appointment
  
  // Contact information
  contact: NCRepresentativeContact;
  
  // Biography
  biography: NCRepresentativeBiography;
  
  // Legislative activity
  introducedBills: NCBillReference[];
  votes: NCVoteRecord[];
  committees: NCCommitteeMembership[];
  
  // Image data
  photoUrl?: string;
  photoBase64?: string; // Base64 encoded image
  photoMimeType?: string; // e.g., "image/jpeg"
  
  // Metadata for search and AI
  searchKeywords: string[];
  lastUpdated: string; // ISO date string
  createdAt: string; // ISO date string
  
  // AI-friendly summary
  aiSummary?: string;
}

export interface NCRepresentativeContact {
  // Legislative office
  legislativeOffice: {
    address: string;
    room: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Mailing address
  mailingAddress?: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Phone numbers
  mainPhone: string;
  fax?: string;
  
  // Email
  email?: string;
  emailProtected?: boolean; // If email is protected/obfuscated
  
  // Staff
  legislativeAssistant?: {
    name: string;
    email?: string;
  };
  
  // Website and social
  website?: string;
  twitter?: string;
  facebook?: string;
}

export interface NCRepresentativeBiography {
  occupation?: string;
  education?: string[];
  militaryService?: string;
  professionalExperience?: string[];
  communityInvolvement?: string[];
  personalInfo?: string; // Family, etc.
  rawBiographyText?: string; // Full biography text for AI processing
}

export interface NCBillReference {
  billId: string; // e.g., "HB123"
  session: string;
  title: string;
  shortTitle?: string;
  status: string;
  introducedDate: string;
  lastActionDate?: string;
  lastAction?: string;
  url: string;
  isPrimarySponsor: boolean;
}

export interface NCVoteRecord {
  billId: string;
  session: string;
  voteDate: string;
  vote: 'Aye' | 'No' | 'Absent' | 'Excused' | 'Not Voting';
  rollCallNumber?: number;
  billTitle?: string;
  url?: string;
}

export interface NCCommitteeMembership {
  committeeId: string;
  committeeName: string;
  chamber: 'H' | 'S' | 'Joint';
  role: 'Chair' | 'Vice Chair' | 'Member' | 'Ex Officio';
  session: string;
  url?: string;
}

// Collection structure for Firestore
export interface NCLegislatureCollections {
  representatives: NCRepresentative[];
  bills: NCBill[];
  committees: NCCommittee[];
  votes: NCVoteSession[];
}

export interface NCBill {
  id: string; // e.g., "HB123-2025"
  billNumber: string;
  session: string;
  chamber: 'H' | 'S';
  title: string;
  shortTitle?: string;
  sponsors: {
    memberId: string;
    name: string;
    isPrimary: boolean;
  }[];
  status: string;
  introducedDate: string;
  lastActionDate?: string;
  lastAction?: string;
  url: string;
  fullText?: string;
  summary?: string;
}

export interface NCCommittee {
  id: string;
  name: string;
  chamber: 'H' | 'S' | 'Joint';
  session: string;
  description?: string;
  members: {
    memberId: string;
    name: string;
    role: string;
  }[];
  url?: string;
}

export interface NCVoteSession {
  id: string;
  billId: string;
  session: string;
  date: string;
  rollCallNumber: number;
  result: 'Passed' | 'Failed' | 'Other';
  yeas: number;
  nays: number;
  notVoting: number;
  votes: {
    memberId: string;
    vote: string;
  }[];
}

// Search index structure for AI discovery
export interface NCRepresentativeSearchIndex {
  id: string;
  name: string;
  party: string;
  district: number;
  counties: string[];
  occupation?: string;
  committees: string[];
  keywords: string[];
  summary: string;
}

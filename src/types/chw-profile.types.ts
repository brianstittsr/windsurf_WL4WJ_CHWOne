/**
 * CHW Profile Types
 * Comprehensive type definitions for Community Health Worker profiles
 * including networking, certification, and directory features
 */

/**
 * Contact preferences for privacy control
 */
export interface ContactPreferences {
  allowDirectMessages: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
}

/**
 * Social media links
 */
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
}

/**
 * Certification details
 */
export interface CertificationInfo {
  certificationNumber: string;
  certificationStatus: 'certified' | 'pending' | 'expired' | 'not_certified';
  certificationExpiration?: string;
  scctCompletion?: boolean;
  scctCompletionDate?: string;
  scctInstructor?: string;
  scctScore?: number;
  scctProofOfCompletion?: string;
}

/**
 * Training and education information
 */
export interface TrainingInfo {
  college?: string;
  collegeOtherDetails?: string;
  trainingPrograms: string[];
  ceuCredits?: number;
}

/**
 * Work and service area information
 */
export interface ServiceAreaInfo {
  countiesWorkedIn: string[];
  countyResideIn: string;
  region: string;
  sector?: string;
  currentOrganization?: string;
  role?: string;
}

/**
 * Professional profile information
 */
export interface ProfessionalInfo {
  headline?: string;
  bio?: string;
  expertise: string[];
  additionalExpertise?: string;      // Free-form text for additional skills/experiences
  languages: string[];
  availableForOpportunities: boolean;
  yearsOfExperience?: number;
  specializations: string[];
  currentOrganization?: string;
  currentPosition?: string;
}

/**
 * Membership information
 */
export interface MembershipInfo {
  memberNumber?: string;
  memberType?: string;
  dateRegistered: string;
  lastRenewal?: string;
  renewalDate?: string;
  includeInDirectory: boolean;
}

/**
 * Tool access permissions for individual user
 */
export interface UserToolAccess {
  forms: boolean;
  datasets: boolean;
  reports: boolean;
  aiAssistant: boolean;
  grants: boolean;
  referrals: boolean;
  projects: boolean;
}

/**
 * Complete CHW Profile
 */
export interface CHWProfile {
  // Basic Information
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  
  // Profile Display
  profilePicture?: string;
  displayName?: string;
  
  // Professional Information
  professional: ProfessionalInfo;
  
  // Service Area
  serviceArea: ServiceAreaInfo;
  
  // Certification
  certification?: CertificationInfo;
  
  // Training
  training?: TrainingInfo;
  
  // Membership
  membership: MembershipInfo;
  
  // Privacy & Contact
  contactPreferences: ContactPreferences;
  socialLinks?: SocialLinks;
  
  // Tool Access
  toolAccess?: UserToolAccess;
  
  // Additional Preferences
  languagePreference?: string;
  contactMethodPreference?: 'email' | 'phone' | 'text' | 'any';
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastActive?: string;
  
  // Internal Notes (admin only)
  internalNotes?: string;
  applicationStatus?: string;
  applicationVerification?: string;
  feeWaiver?: boolean;
}

/**
 * Profile for directory display (public view)
 */
export interface CHWDirectoryProfile {
  id: string;
  displayName: string;
  profilePicture?: string;
  headline?: string;
  bio?: string;
  expertise: string[];
  languages: string[];
  region: string;
  countiesWorkedIn: string[];
  currentOrganization?: string;
  availableForOpportunities: boolean;
  certificationStatus?: string;
  yearsOfExperience?: number;
  
  // Contact (based on preferences)
  email?: string;
  phone?: string;
  socialLinks?: SocialLinks;
  allowDirectMessages: boolean;
}

/**
 * Profile search filters
 */
export interface ProfileSearchFilters {
  searchTerm?: string;
  expertise?: string[];
  languages?: string[];
  counties?: string[];
  region?: string;
  availableForOpportunities?: boolean;
  certificationStatus?: string[];
}

/**
 * Profile update request
 */
export interface ProfileUpdateRequest {
  section: 'basic' | 'professional' | 'certification' | 'training' | 'serviceArea' | 'privacy' | 'social';
  data: Partial<CHWProfile>;
}

/**
 * Skill endorsement
 */
export interface SkillEndorsement {
  id: string;
  profileId: string;
  skill: string;
  endorsedBy: string;
  endorsedByName: string;
  endorsedAt: string;
}

/**
 * Connection request
 */
export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

/**
 * Direct message
 */
export interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  subject: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

/**
 * Collaboration record
 */
export interface CollaborationRecord {
  id: string;
  participants: string[];
  projectName: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed';
}

/**
 * Default values for new profiles
 */
export const DEFAULT_CHW_PROFILE: Partial<CHWProfile> = {
  professional: {
    expertise: [],
    languages: ['English'],
    availableForOpportunities: false,
    specializations: []
  },
  serviceArea: {
    countiesWorkedIn: [],
    countyResideIn: '',
    region: 'Region 5'
  },
  membership: {
    dateRegistered: new Date().toISOString().split('T')[0],
    includeInDirectory: false
  },
  contactPreferences: {
    allowDirectMessages: true,
    showEmail: false,
    showPhone: false,
    showAddress: false
  },
  toolAccess: {
    forms: true,
    datasets: true,
    reports: true,
    aiAssistant: true,
    grants: true,
    referrals: true,
    projects: true
  }
};

/**
 * Expertise options for CHWs
 */
export const EXPERTISE_OPTIONS = [
  'Chronic Disease Management',
  'Maternal & Child Health',
  'Mental Health',
  'Substance Abuse',
  'Health Education',
  'Care Coordination',
  'Community Outreach',
  'Health Navigation',
  'Home Visits',
  'Group Facilitation',
  'Cultural Mediation',
  'Resource Connection',
  'Health Screening',
  'Case Management',
  'Patient Advocacy',
  'Health Promotion',
  'Disease Prevention',
  'Social Determinants of Health',
  'Nutrition & Wellness',
  'Elder Care'
];

/**
 * Language options
 */
export const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'Arabic',
  'Chinese (Mandarin)',
  'Chinese (Cantonese)',
  'Vietnamese',
  'Korean',
  'Tagalog',
  'Russian',
  'Portuguese',
  'Haitian Creole',
  'Hindi',
  'Urdu',
  'Other'
];

/**
 * Region 5 counties
 */
export const REGION5_COUNTIES = [
  'Bladen',
  'Brunswick',
  'Columbus',
  'Cumberland',
  'Harnett',
  'Hoke',
  'Lee',
  'Montgomery',
  'Moore',
  'New Hanover',
  'Pender',
  'Richmond',
  'Robeson',
  'Sampson',
  'Scotland'
];

/**
 * Helper function to convert full profile to directory profile
 */
export function toDirectoryProfile(profile: CHWProfile): CHWDirectoryProfile {
  return {
    id: profile.id || '',
    displayName: profile.displayName || `${profile.firstName} ${profile.lastName}`,
    profilePicture: profile.profilePicture,
    headline: profile.professional.headline,
    bio: profile.professional.bio,
    expertise: profile.professional.expertise,
    languages: profile.professional.languages,
    region: profile.serviceArea.region,
    countiesWorkedIn: profile.serviceArea.countiesWorkedIn,
    currentOrganization: profile.serviceArea.currentOrganization,
    availableForOpportunities: profile.professional.availableForOpportunities,
    certificationStatus: profile.certification?.certificationStatus,
    yearsOfExperience: profile.professional.yearsOfExperience,
    email: profile.contactPreferences.showEmail ? profile.email : undefined,
    phone: profile.contactPreferences.showPhone ? profile.phone : undefined,
    socialLinks: profile.socialLinks,
    allowDirectMessages: profile.contactPreferences.allowDirectMessages
  };
}

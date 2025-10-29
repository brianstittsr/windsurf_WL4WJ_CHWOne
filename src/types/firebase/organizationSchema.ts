/**
 * Organization Schema Types
 * 
 * This file defines the TypeScript interfaces for the nonprofit organization
 * registration and referral system database schema.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Organization address structure
 */
export interface OrganizationAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Organization operating hours structure
 */
export interface OperatingHours {
  monday: { open: string; close: string; closed: boolean; };
  tuesday: { open: string; close: string; closed: boolean; };
  wednesday: { open: string; close: string; closed: boolean; };
  thursday: { open: string; close: string; closed: boolean; };
  friday: { open: string; close: string; closed: boolean; };
  saturday: { open: string; close: string; closed: boolean; };
  sunday: { open: string; close: string; closed: boolean; };
}

/**
 * Organization social media links
 */
export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

/**
 * Organization capacity information
 */
export interface OrganizationCapacity {
  currentCapacity: number;      // Current available slots
  maxCapacity: number;          // Maximum capacity
  waitlistLength?: number;      // Current waitlist length
  acceptingReferrals: boolean;  // Whether accepting new referrals
}

/**
 * Organization verification status
 */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

/**
 * Organization legal status
 */
export type LegalStatus = 'nonprofit' | 'government' | 'forProfit' | 'other';

/**
 * Organization size category
 */
export type OrganizationSize = 'small' | 'medium' | 'large';

/**
 * Organization budget range
 */
export type BudgetRange = 'under100k' | '100k-500k' | '500k-1m' | '1m-5m' | 'over5m';

/**
 * Main Organization interface
 */
export interface Organization {
  id: string;                     // Firestore document ID
  name: string;                   // Organization name
  slug: string;                   // URL-friendly name
  description: string;            // Organization description
  mission: string;                // Mission statement
  logo: string;                   // Logo URL
  coverImage: string;             // Cover image URL
  website: string;                // Website URL
  email: string;                  // Primary contact email
  phone: string;                  // Primary contact phone
  address: OrganizationAddress;
  socialMedia: SocialMediaLinks;
  operatingHours: OperatingHours;
  serviceAreas: string[];         // Counties or regions served
  serviceCategories: string[];    // Categories of services provided
  eligibilityCriteria: string;    // Who is eligible for services
  applicationProcess: string;     // How to apply for services
  capacity: OrganizationCapacity;
  verificationStatus: VerificationStatus;
  verificationDate?: Timestamp;   // When verification was completed
  verifiedBy?: string;            // Admin user ID who verified
  taxId: string;                  // EIN/Tax ID (encrypted)
  legalStatus: LegalStatus;
  foundingYear: number;           // Year founded
  size: OrganizationSize;         // Organization size
  budget: BudgetRange;
  primaryLanguages: string[];     // Languages supported
  accessibilityOptions: string[]; // Accessibility features
  insuranceAccepted: string[];    // Insurance plans accepted
  paymentOptions: string[];       // Payment methods accepted
  tags: string[];                 // Searchable tags
  adminUsers: string[];           // User IDs with admin access
  staffUsers: string[];           // User IDs with staff access
  createdAt: Timestamp;           // Creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
  lastActivityAt: Timestamp;      // Last activity timestamp
  isActive: boolean;              // Whether organization is active
}

/**
 * Service location information
 */
export interface ServiceLocation {
  onsite: boolean;              // Available at organization location
  remote: boolean;              // Available remotely
  mobile: boolean;              // Mobile service
  serviceAreas: string[];       // Areas where service is available
}

/**
 * Contact person information
 */
export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
}

/**
 * Organization Service interface
 */
export interface OrganizationService {
  id: string;                     // Firestore document ID
  organizationId: string;         // Reference to organization
  name: string;                   // Service name
  description: string;            // Service description
  category: string;               // Service category
  subcategories: string[];        // Service subcategories
  eligibilityCriteria: string;    // Who is eligible
  applicationProcess: string;     // How to apply
  requiredDocuments: string[];    // Documents needed to apply
  cost: string;                   // Cost information
  fundingSources: string[];       // How the service is funded
  capacity: OrganizationCapacity;
  location: ServiceLocation;
  contactPerson: ContactPerson;
  operatingHours: OperatingHours; // Can differ from organization hours
  isActive: boolean;              // Whether service is active
  createdAt: Timestamp;           // Creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
}

/**
 * Job location information
 */
export interface JobLocation {
  remote: boolean;             // Remote work option
  onsite: boolean;             // Onsite work required
  address?: {                  // If onsite
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }
}

/**
 * Salary information
 */
export interface SalaryInfo {
  range: {
    min: number;
    max: number;
  };
  isHourly: boolean;           // Hourly vs. annual
  benefits: string[];          // Benefits offered
}

/**
 * Employment type
 */
export type EmploymentType = 'fullTime' | 'partTime' | 'contract' | 'temporary' | 'volunteer';

/**
 * Job status
 */
export type JobStatus = 'draft' | 'published' | 'filled' | 'closed';

/**
 * Organization Job interface
 */
export interface OrganizationJob {
  id: string;                    // Firestore document ID
  organizationId: string;        // Reference to organization
  title: string;                 // Job title
  description: string;           // Job description
  responsibilities: string[];    // Key responsibilities
  qualifications: string[];      // Required qualifications
  preferredQualifications: string[]; // Preferred qualifications
  employmentType: EmploymentType;
  location: JobLocation;
  salary: SalaryInfo;
  applicationUrl?: string;       // External application URL
  applicationEmail?: string;     // Application email
  applicationPhone?: string;     // Application phone
  applicationDeadline: Timestamp; // Application deadline
  startDate?: Timestamp;         // Expected start date
  department?: string;           // Department
  reportsTo?: string;            // Position reports to
  status: JobStatus;
  tags: string[];                // Searchable tags
  createdAt: Timestamp;          // Creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
  publishedAt?: Timestamp;       // When job was published
  views: number;                 // View count
  applications: number;          // Application count
}

/**
 * Event location information
 */
export interface EventLocation {
  virtual: boolean;            // Virtual event flag
  address?: {                  // If not virtual
    name?: string;             // Venue name
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  virtualLink?: string;        // Virtual event link
  virtualPlatform?: string;    // Virtual platform name
}

/**
 * Event status
 */
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

/**
 * Organization Event interface
 */
export interface OrganizationEvent {
  id: string;                    // Firestore document ID
  organizationId: string;        // Reference to organization
  title: string;                 // Event title
  description: string;           // Event description
  startDate: Timestamp;          // Event start date and time
  endDate: Timestamp;            // Event end date and time
  timezone: string;              // Event timezone
  location: EventLocation;
  category: string;              // Event category
  tags: string[];                // Searchable tags
  featuredImage?: string;        // Featured image URL
  cost: number | 'free';         // Event cost
  registrationRequired: boolean; // Registration required flag
  registrationUrl?: string;      // Registration URL
  registrationDeadline?: Timestamp; // Registration deadline
  maxAttendees?: number;         // Maximum attendees
  currentRegistrations?: number; // Current registration count
  contactPerson: ContactPerson;
  accessibility: string[];       // Accessibility features
  languageSupport: string[];     // Languages supported
  status: EventStatus;
  isPublic: boolean;             // Public or private event
  isFeatured: boolean;           // Featured event flag
  createdAt: Timestamp;          // Creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
  publishedAt?: Timestamp;       // When event was published
  views: number;                 // View count
}

/**
 * Attachment information
 */
export interface Attachment {
  name: string;
  url: string;
  type: string;
  uploadedAt: Timestamp;
}

/**
 * Feedback information
 */
export interface ReferralFeedback {
  fromOrganization?: {
    rating: number;            // 1-5 rating
    comments: string;          // Comments
    submittedAt: Timestamp;    // When feedback was submitted
    submittedBy: string;       // User who submitted feedback
  };
  fromClient?: {
    rating: number;            // 1-5 rating
    comments: string;          // Comments
    submittedAt: Timestamp;    // When feedback was submitted
  };
}

/**
 * Status history entry
 */
export interface StatusHistoryEntry {
  status: string;
  changedAt: Timestamp;
  changedBy: string;
  notes?: string;
}

/**
 * Referral priority
 */
export type ReferralPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Referral status
 */
export type ReferralStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

/**
 * Referral interface
 */
export interface Referral {
  id: string;                    // Firestore document ID
  clientId: string;              // Client being referred
  fromOrganizationId?: string;   // Referring organization (optional)
  fromUserId: string;            // Referring user
  toOrganizationId: string;      // Receiving organization
  toServiceId?: string;          // Specific service (optional)
  status: ReferralStatus;
  priority: ReferralPriority;
  referralDate: Timestamp;       // When referral was made
  needByDate?: Timestamp;        // When service is needed by
  appointmentDate?: Timestamp;   // Scheduled appointment
  reason: string;                // Reason for referral
  notes: string;                 // Additional notes
  clientConsent: boolean;        // Client consent obtained
  consentDocumentUrl?: string;   // Consent document URL
  clientNeeds: string[];         // Client needs
  clientEligibilityNotes?: string; // Notes on eligibility
  attachments: Attachment[];     // Attached documents
  feedback?: ReferralFeedback;   // Feedback after completion
  statusHistory: StatusHistoryEntry[]; // History of status changes
  createdAt: Timestamp;          // Creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}

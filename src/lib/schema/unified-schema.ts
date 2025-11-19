import { Timestamp } from 'firebase/firestore';

// ============================================================================
// COLLECTION CONSTANTS
// ============================================================================

export const COLLECTIONS = {
  // User Management
  USERS: 'users',                       // All user accounts
  CHW_PROFILES: 'chwProfiles',          // CHW-specific profile data
  ORGANIZATIONS: 'organizations',        // Organizations (Region 5, WL4WJ, etc.)
  
  // Content Management
  FORMS: 'forms',                       // Form templates
  FORM_SUBMISSIONS: 'formSubmissions',   // Submitted form data
  RESOURCES: 'resources',               // Shared resources and materials
  FILES: 'files',                       // Uploaded documents and media
  
  // Program Management
  PROJECTS: 'projects',                 // Projects and initiatives
  GRANTS: 'grants',                     // Funding and grants
  CLIENTS: 'clients',                   // Client information
  REFERRALS: 'referrals',               // Service referrals
  
  // Analytics & Reporting
  DASHBOARD_METRICS: 'dashboardMetrics', // Aggregated metrics
  DATASETS: 'datasets',                 // Research and survey datasets
  ACTIVITY_LOGS: 'activityLogs',        // User activity tracking
  NOTIFICATIONS: 'notifications'        // System notifications
};

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

// Base user account (authentication)
export interface User {
  uid: string;                          // Firebase Auth UID
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  roles: UserRole[];                    // Multiple roles supported (e.g., CHW + Nonprofit)
  primaryRole: UserRole;                // Default/active role
  organizationIds: string[];            // Multiple organization memberships
  primaryOrganizationId: string;        // Primary organization
  isActive: boolean;
  isApproved: boolean;                  // Admin approval status
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  hipaaTrainingCompleted?: boolean;     // HIPAA compliance
  hipaaTrainingDate?: Timestamp;
  
  // Profile references for multi-role support
  chwProfileId?: string;                // Reference to CHW profile if user is a CHW
  nonprofitProfileId?: string;          // Reference to nonprofit profile if user owns/works for nonprofit
  associationProfileId?: string;        // Reference to association profile
}

// Comprehensive user roles
export enum UserRole {
  ADMIN = 'admin',                      // System administrator
  CHW = 'chw',                          // Community health worker
  CHW_COORDINATOR = 'chw_coordinator',  // CHW supervisor/manager
  NONPROFIT_STAFF = 'nonprofit_staff',  // Partner organization staff
  CHW_ASSOCIATION = 'chw_association',    // Community Health Worker Association
  WL4WJ_CHW = 'wl4wj_chw',              // WL4WJ-specific CHW
  CLIENT = 'client',                    // Service recipient
  VIEWER = 'viewer',                    // Limited read-only access
  DEMO = 'demo'                         // Demo account
}

// Role-based permissions
export interface UserPermissions {
  canManageUsers: boolean;
  canManageCHWs: boolean;
  canCreateForms: boolean;
  canEditForms: boolean;
  canDeleteForms: boolean;
  canViewAnalytics: boolean;
  canManageProjects: boolean;
  canManageGrants: boolean;
  canUploadFiles: boolean;
  canAccessAllOrganizations: boolean;
}

// ============================================================================
// CHW-SPECIFIC SCHEMA
// ============================================================================

// CHW Profile (detailed information about community health workers)
// Aligned with chw-profile.types.ts for consistency across the application
export interface CHWProfile {
  // Basic Information
  id?: string;
  userId: string;                       // Links to User.uid
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
  
  // Professional Information (nested object matching form structure)
  professional: {
    headline?: string;
    bio?: string;
    expertise: string[];                // Selected expertise areas
    additionalExpertise?: string;       // Free-form text for additional skills/experiences
    languages: string[];                // Languages spoken
    availableForOpportunities: boolean;
    yearsOfExperience?: number;
    specializations: string[];
    currentOrganization?: string;
    currentPosition?: string;
  };
  
  // Service Area (nested object)
  serviceArea: {
    region: string;                     // Geographic region
    countiesWorkedIn: string[];         // Counties/areas served
    countyResideIn: string;             // Primary county of residence
    primaryCounty: string;
    currentOrganization?: string;
    role?: string;
  };
  
  // Certification (nested object)
  certification?: {
    certificationNumber: string;
    certificationStatus: 'certified' | 'pending' | 'expired' | 'not_certified';
    certificationExpiration?: string;
    expirationDate?: string;
    scctCompletion?: boolean;
    scctCompletionDate?: string;
    scctInstructor?: string;
    scctScore?: number;
    scctProofOfCompletion?: string;
  };
  
  // Training
  training?: {
    college?: string;
    collegeOtherDetails?: string;
    trainingPrograms: string[];
    ceuCredits?: number;
  };
  
  // Membership
  membership: {
    memberNumber?: string;
    memberType?: string;
    dateRegistered: Timestamp | string;
    lastRenewal?: string;
    renewalDate?: string;
    includeInDirectory: boolean;
  };
  
  // Privacy & Contact Preferences (nested object)
  contactPreferences: {
    allowDirectMessages: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
  };
  
  // Social Links
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  
  // Tool Access
  toolAccess?: {
    forms: boolean;
    datasets: boolean;
    reports: boolean;
    aiAssistant: boolean;
    grants: boolean;
    referrals: boolean;
    projects: boolean;
  };
  
  // Additional Preferences
  languagePreference?: string;
  contactMethodPreference?: 'email' | 'phone' | 'text' | 'any';
  
  // Status
  status?: 'active' | 'pending' | 'inactive';
  
  // Timestamps
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastActive?: string;
  
  // Internal Notes (admin only)
  internalNotes?: string;
  applicationStatus?: string;
  applicationVerification?: string;
  feeWaiver?: boolean;
}

export interface TimeSlot {
  start: string;                        // Format: "HH:MM" (24h)
  end: string;                          // Format: "HH:MM" (24h)
}

export interface CHWResource {
  id: string;
  title: string;
  description: string;
  category: 'document' | 'link' | 'contact' | 'tool' | 'guide';
  url?: string;
  fileUrl?: string;
  tags: string[];
  isPublic: boolean;
  sharedWith: string[]; // User IDs
  createdAt: Timestamp;
}

// ============================================================================
// ORGANIZATION MODEL
// ============================================================================

export interface Organization {
  id: string;                           // Unique identifier (e.g., 'region5', 'wl4wj')
  name: string;                         // Full name (e.g., 'Region 5 Health Department')
  shortName: string;                    // Display name (e.g., 'Region 5')
  description: string;
  type: 'health_department' | 'nonprofit' | 'community_org' | 'government';
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  website?: string;
  address: Address;
  
  // Branding
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;                 // Hex color code
  secondaryColor: string;               // Hex color code
  fontFamily?: string;
  
  // Settings
  settings: {
    allowPublicForms: boolean;
    requireApprovalForNewUsers: boolean;
    defaultUserRole: UserRole;
    maxFileSize: number;                // In MB
    allowedFileTypes: string[];
    emailTemplates: {
      welcomeMessage: string;
      formSubmissionNotification: string;
      passwordReset: string;
    };
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
}

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

export interface Client {
  id: string;
  assignedCHWId: string;                // UID of assigned CHW
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  gender?: string;
  
  // Contact Information
  phoneNumber?: string;
  email?: string;
  address: Address;
  preferredContactMethod: 'phone' | 'email' | 'text' | 'mail';
  
  // Consent & Privacy
  consentGiven: boolean;
  consentDate?: Timestamp;
  hipaaFormSigned: boolean;
  hipaaSignedDate?: Timestamp;
  
  // Demographics
  demographics: {
    race?: string[];
    ethnicity?: string;
    preferredLanguage: string;
    householdSize: number;
    householdIncome?: string;
    insuranceStatus: string;
    insuranceProvider?: string;
    primaryCareProvider?: string;
  };
  
  // Health Information
  healthConditions: string[];
  medications?: string[];
  allergies?: string[];
  
  // Social Determinants
  socialDeterminants: {
    housingStatus: string;
    employmentStatus: string;
    transportationAccess: boolean;
    foodSecurity: string;
    socialSupport: string;
    educationLevel: string;
    internetAccess: boolean;
  };
  
  // Case Management
  status: 'active' | 'inactive' | 'completed' | 'lost_to_followup';
  enrollmentDate: Timestamp;
  dischargeDate?: Timestamp;
  dischargeReason?: string;
  goals: ClientGoal[];
  notes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastContactDate?: Timestamp;
}

export interface ClientGoal {
  id: string;
  description: string;
  category: 'health' | 'housing' | 'employment' | 'education' | 'financial' | 'other';
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  targetDate?: Timestamp;
  completionDate?: Timestamp;
  notes?: string;
}

// ============================================================================
// REFERRAL SYSTEM
// ============================================================================

export interface ReferralResource {
  id: string;
  name: string;
  organization: string;
  category: ResourceCategory;
  description: string;
  
  // Contact Information
  contactInfo: {
    phone: string;
    email?: string;
    website?: string;
    fax?: string;
  };
  address: Address;
  
  // Service Details
  serviceHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    notes?: string;
  };
  eligibilityCriteria: string[];
  servicesOffered: string[];
  applicationProcess?: string;
  requiredDocuments?: string[];
  
  // Status
  isActive: boolean;
  region5Certified: boolean;
  ncCare360Id?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastVerifiedDate: Timestamp;
}

export enum ResourceCategory {
  HEALTHCARE = 'healthcare',
  MENTAL_HEALTH = 'mental_health',
  HOUSING = 'housing',
  FOOD_ASSISTANCE = 'food_assistance',
  TRANSPORTATION = 'transportation',
  EMPLOYMENT = 'employment',
  EDUCATION = 'education',
  CHILDCARE = 'childcare',
  LEGAL_SERVICES = 'legal_services',
  FINANCIAL_ASSISTANCE = 'financial_assistance'
}

export interface Referral {
  id: string;
  clientId: string;
  resourceId: string;
  chwId: string;
  
  // Referral Details
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  notes?: string;
  
  // Tracking
  referralDate: Timestamp;
  followUpDate?: Timestamp;
  completedDate?: Timestamp;
  outcomeNotes?: string;
  barriers?: string[];
  successFactors?: string[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// PROJECT & GRANT MANAGEMENT
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  grantId?: string;                     // Associated grant
  organizationId: string;
  
  // Project Details
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: Timestamp;
  endDate?: Timestamp;
  assignedCHWs: string[];               // UIDs of assigned CHWs
  targetPopulation: string;
  goals: string[];
  
  // Budget
  budget: number;
  spentAmount: number;
  
  // Outcomes
  outcomes: {
    metric: string;
    target: number;
    current: number;
    unit: string;
    measurementDate: Timestamp;
  }[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Grant {
  id: string;
  title: string;
  description: string;
  fundingSource: string;
  amount: number;
  organizationId: string;
  
  // Grant Timeline
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  
  // Grant Details
  projectIds: string[];                 // Associated projects
  requirements: string[];
  reportingSchedule: {
    type: 'monthly' | 'quarterly' | 'annual' | 'final';
    dueDate: Timestamp;
    completed: boolean;
    submittedDate?: Timestamp;
  }[];
  contactPerson: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// FORMS & DATA COLLECTION
// ============================================================================

export interface Form {
  id: string;
  title: string;
  description: string;
  category: 'intake' | 'health' | 'training' | 'evaluation' | 'followup' | 'assessment' | 'survey';
  tags: string[];
  organizationId: string;
  
  // Form Status
  status: 'draft' | 'published' | 'archived';
  version: number;
  
  // Form Structure
  fields: FormField[];
  
  // Form Settings
  settings: {
    allowAnonymous: boolean;
    requireLogin: boolean;
    allowMultipleSubmissions: boolean;
    submissionLimit?: number;
    autoSave: boolean;
    showProgress: boolean;
    confirmationMessage?: string;
    redirectUrl?: string;
    emailNotifications: {
      notifyOnSubmission: boolean;
      recipientEmails: string[];
      includeResponses: boolean;
      customSubject?: string;
      customMessage?: string;
    };
  };
  
  // Ownership & Timestamps
  createdBy: string;                    // UID of creator
  updatedBy: string;                    // UID of last editor
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  archivedAt?: Timestamp;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'time' | 
         'datetime' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 
         'file' | 'signature' | 'rating' | 'yesno';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  
  // Validation
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  
  // Options for select/radio/checkbox
  options?: {
    value: string;
    label: string;
    isDefault?: boolean;
  }[];
  
  // Conditional Logic
  conditionalLogic?: {
    field: string;                      // Field ID to check
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
    action: 'show' | 'hide' | 'require' | 'disable';
  };
  
  order: number;                        // Display order
}

export interface FormSubmission {
  id: string;
  formId: string;
  formVersion: number;
  submittedBy?: string;                 // UID (null for anonymous)
  submittedAt: Timestamp;
  
  // Submission Status
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reviewedBy?: string;                  // UID of reviewer
  reviewedAt?: Timestamp;
  reviewNotes?: string;
  
  // Responses
  responses: {
    fieldId: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    value: any;
    isValid: boolean;
    validationErrors?: string[];
  }[];
  
  // Metadata
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    deviceInfo?: {
      platform: string;
      browser?: string;
      version?: string;
      screenResolution?: string;
      timezone?: string;
    };
    sessionId?: string;
    timeToComplete?: number;            // In seconds
    submissionSource: 'web' | 'mobile' | 'api';
  };
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export interface DashboardMetrics {
  id: string;
  organizationId: string;
  date: string;                         // YYYY-MM-DD
  
  // CHW Metrics
  totalCHWs: number;
  activeCHWs: number;
  chwCaseloadUtilization: number;       // Percentage
  chwsByRegion: {
    region: string;
    count: number;
  }[];
  
  // Client Metrics
  totalClients: number;
  activeClients: number;
  clientsByStatus: {
    status: string;
    count: number;
  }[];
  
  // Referral Metrics
  totalReferrals: number;
  referralsByStatus: {
    status: string;
    count: number;
  }[];
  referralsByCategory: {
    category: string;
    count: number;
  }[];
  
  // Project & Grant Metrics
  activeProjects: number;
  activeGrants: number;
  totalGrantAmount: number;
  grantUtilization: number;             // Percentage
  
  // Form Metrics
  totalFormSubmissions: number;
  submissionsThisMonth: number;
  formCompletionRate: number;           // Percentage
  averageCompletionTime: number;        // In seconds
  
  // Time Series Data
  submissionTrends: {
    date: string;                       // YYYY-MM-DD
    count: number;
  }[];
  referralTrends: {
    date: string;                       // YYYY-MM-DD
    count: number;
  }[];
  
  // Timestamp
  updatedAt: Timestamp;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  projectId?: string;
  organizationId: string;
  
  // Dataset Details
  type: 'survey_results' | 'client_data' | 'outcome_metrics' | 
        'resource_utilization' | 'empower_survey';
  source: string;
  collectionMethod: string;
  
  // Data Points
  dataPoints: {
    id: string;
    timestamp: Timestamp;
    value: any;
    metadata?: Record<string, any>;
  }[];
  
  // Privacy & Access
  isHIPAAProtected: boolean;
  accessLevel: 'public' | 'internal' | 'restricted' | 'confidential';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastModifiedBy: string;               // UID of last editor
}

// ============================================================================
// ACTIVITY TRACKING & NOTIFICATIONS
// ============================================================================

export interface ActivityLog {
  id: string;
  userId?: string;                      // UID (null for system actions)
  action: 'create' | 'read' | 'update' | 'delete' | 'publish' | 'archive' | 
          'submit' | 'approve' | 'reject' | 'upload' | 'download' | 
          'share' | 'login' | 'logout';
  resourceType: 'form' | 'submission' | 'file' | 'user' | 'organization' | 
                'dashboard' | 'report' | 'chw' | 'client' | 'referral' | 
                'project' | 'grant';
  resourceId: string;
  description: string;
  metadata?: Record<string, any>;
  
  // Request Details
  ipAddress?: string;
  userAgent?: string;
  
  // Timestamp
  timestamp: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;                       // Recipient UID
  type: 'form_submitted' | 'form_approved' | 'form_rejected' | 
        'file_uploaded' | 'user_joined' | 'system_maintenance' | 
        'security_alert' | 'general' | 'referral_update' | 
        'certification_expiring';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

// ============================================================================
// SCHEMA VERSION TRACKING
// ============================================================================

export interface SchemaVersion {
  id: string;
  version: string;
  appliedAt: Timestamp;
  description: string;
  changes: string[];
}

// Current schema version
export const CURRENT_SCHEMA_VERSION = '1.0.0';

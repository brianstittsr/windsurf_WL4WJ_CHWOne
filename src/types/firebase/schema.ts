// Firebase Schema Types for CHWOne Platform
// Defines all collections, documents, and their structures

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  organization: 'general' | 'region1' | 'region2' | 'region3' | 'region4' | 'region5' | 'region6' | 'wl4wj';
  // Organization type for role-based navigation and permissions
  organizationType?: OrganizationType;
  permissions: UserPermissions;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  // CHW-specific fields
  chwProfile?: CHWProfile;
}

export interface CHWProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth?: Timestamp;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';

  // Contact Information
  primaryPhone: string;
  secondaryPhone?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Professional Information
  chwId?: string;
  certificationLevel?: 'entry' | 'intermediate' | 'advanced' | 'lead';
  hireDate?: Timestamp;
  supervisor?: string;
  languages: string[];

  // Location & Service Area
  serviceArea: string[];
  zipCodes: string[];
  travelRadius?: number; // miles

  // Skills & Specializations
  skills: string[];
  specializations: string[];

  // Availability
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };

  // Resources & Assets
  resources: CHWResource[];
  equipment: string[];

  // Profile Settings
  profileVisible: boolean; // Visible in directory
  allowContactSharing: boolean;
  bio?: string;
  profilePictureUrl?: string;

  // Performance & Metrics
  completedTrainings: number;
  activeClients: number;
  totalEncounters: number;
  lastActivityDate?: Timestamp;
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

export enum UserRole {
  ADMIN = 'ADMIN',
  CHW_COORDINATOR = 'CHW_COORDINATOR',
  CHW = 'CHW',
  NONPROFIT_STAFF = 'NONPROFIT_STAFF'
}

/**
 * Organization types for role-based navigation and permissions
 */
export enum OrganizationType {
  CHW = 'CHW',
  NONPROFIT = 'Nonprofit',
  CHW_ASSOCIATION = 'CHWAssociation',
  STATE = 'State',
  ADMIN = 'Admin'
}

export interface UserPermissions {
  canCreateForms: boolean;
  canEditForms: boolean;
  canDeleteForms: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canUploadFiles: boolean;
  canAccessAllOrganizations: boolean;
}

// ============================================================================
// FORMS & FORM MANAGEMENT
// ============================================================================

export interface Form {
  id: string;
  title: string;
  description: string;
  category: FormCategory;
  tags: string[];
  organization: 'general' | 'region1' | 'region2' | 'region3' | 'region4' | 'region5' | 'region6' | 'wl4wj';
  status: FormStatus;
  version: number;
  fields: FormField[];
  settings: FormSettings;
  createdBy: string; // User UID
  updatedBy: string; // User UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  archivedAt?: Timestamp;
}

export enum FormCategory {
  INTAKE = 'intake',
  HEALTH = 'health',
  TRAINING = 'training',
  EVALUATION = 'evaluation',
  FOLLOWUP = 'followup',
  ASSESSMENT = 'assessment',
  SURVEY = 'survey'
}

export enum FormStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  validation?: FieldValidation;
  options?: SelectOption[];
  conditionalLogic?: ConditionalLogic;
  order: number;
}

export enum FormFieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  FILE = 'file',
  SIGNATURE = 'signature',
  RATING = 'rating',
  YESNO = 'yesno'
}

export interface SelectOption {
  value: string;
  label: string;
  isDefault?: boolean;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface ConditionalLogic {
  field: string; // Field ID to check
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface FormSettings {
  allowAnonymous: boolean;
  requireLogin: boolean;
  allowMultipleSubmissions: boolean;
  submissionLimit?: number;
  autoSave: boolean;
  showProgress: boolean;
  confirmationMessage?: string;
  redirectUrl?: string;
  emailNotifications: EmailNotificationSettings;
}

export interface EmailNotificationSettings {
  notifyOnSubmission: boolean;
  recipientEmails: string[];
  includeResponses: boolean;
  customSubject?: string;
  customMessage?: string;
}

// ============================================================================
// FORM SUBMISSIONS & RESPONSES
// ============================================================================

export interface FormSubmission {
  id: string;
  formId: string;
  formVersion: number;
  submittedBy?: string; // User UID (null for anonymous)
  submittedAt: Timestamp;
  status: SubmissionStatus;
  responses: FormResponse[];
  metadata: SubmissionMetadata;
  reviewedBy?: string; // User UID
  reviewedAt?: Timestamp;
  reviewNotes?: string;
}

export enum SubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export interface FormResponse {
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: FormFieldType;
  value: any;
  isValid: boolean;
  validationErrors?: string[];
}

export interface SubmissionMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: GeolocationCoordinates;
  deviceInfo?: DeviceInfo;
  sessionId?: string;
  timeToComplete?: number; // in seconds
  submissionSource: 'web' | 'mobile' | 'api';
}

export interface DeviceInfo {
  platform: string;
  browser?: string;
  version?: string;
  screenResolution?: string;
  timezone?: string;
}

// ============================================================================
// FILES & DOCUMENTS
// ============================================================================

export interface FileDocument {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  url: string;
  storagePath: string;
  thumbnailUrl?: string;
  category: FileCategory;
  tags: string[];
  organization: 'general' | 'region1' | 'region2' | 'region3' | 'region4' | 'region5' | 'region6' | 'wl4wj';
  uploadedBy: string; // User UID
  uploadedAt: Timestamp;
  lastModified: Timestamp;
  permissions: FilePermissions;
  metadata: FileMetadata;
  version: number;
  previousVersions?: string[]; // Array of file IDs
}

export enum FileCategory {
  DOCUMENTS = 'documents',
  FORMS = 'forms',
  TRAINING = 'training',
  REPORTS = 'reports',
  IMAGES = 'images',
  VIDEOS = 'videos',
  AUDIO = 'audio',
  OTHER = 'other'
}

export interface FilePermissions {
  isPublic: boolean;
  allowedUsers?: string[]; // User UIDs
  allowedRoles?: UserRole[];
  allowDownload: boolean;
  allowSharing: boolean;
}

export interface FileMetadata {
  width?: number; // for images
  height?: number; // for images
  duration?: number; // for audio/video
  pages?: number; // for PDFs
  checksum: string;
  encoding?: string;
  language?: string;
}

// ============================================================================
// ANALYTICS & DASHBOARD DATA
// ============================================================================

export interface DashboardMetrics {
  id: string;
  organization: 'general' | 'region1' | 'region2' | 'region3' | 'region4' | 'region5' | 'region6' | 'wl4wj';
  date: string; // YYYY-MM-DD
  metrics: OrganizationMetrics;
  updatedAt: Timestamp;
}

export interface OrganizationMetrics {
  totalUsers: number;
  activeUsers: number;
  totalForms: number;
  publishedForms: number;
  totalSubmissions: number;
  submissionsThisMonth: number;
  averageCompletionTime: number;
  formCompletionRate: number;
  userEngagementScore: number;
  topFormCategories: CategoryMetric[];
  submissionTrends: TimeSeriesData[];
  userActivityTrends: TimeSeriesData[];
}

export interface CategoryMetric {
  category: FormCategory;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string; // YYYY-MM-DD
  value: number;
}

// ============================================================================
// ORGANIZATIONS & SETTINGS
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Address;
  settings: OrganizationSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrganizationSettings {
  allowPublicForms: boolean;
  requireApprovalForNewUsers: boolean;
  defaultUserRole: UserRole;
  maxFileSize: number; // in MB
  allowedFileTypes: string[];
  emailTemplates: EmailTemplates;
  branding: BrandingSettings;
}

export interface EmailTemplates {
  welcomeMessage?: string;
  formSubmissionNotification?: string;
  passwordReset?: string;
}

export interface BrandingSettings {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
}

// ============================================================================
// ACTIVITIES & AUDIT LOGS
// ============================================================================

export interface ActivityLog {
  id: string;
  userId?: string; // User UID (null for system actions)
  action: ActivityAction;
  resourceType: ResourceType;
  resourceId: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

export enum ActivityAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  SHARE = 'share',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export enum ResourceType {
  FORM = 'form',
  SUBMISSION = 'submission',
  FILE = 'file',
  USER = 'user',
  ORGANIZATION = 'organization',
  DASHBOARD = 'dashboard',
  REPORT = 'report'
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  userId: string; // Recipient UID
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export enum NotificationType {
  FORM_SUBMITTED = 'form_submitted',
  FORM_APPROVED = 'form_approved',
  FORM_REJECTED = 'form_rejected',
  FILE_UPLOADED = 'file_uploaded',
  USER_JOINED = 'user_joined',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SECURITY_ALERT = 'security_alert',
  GENERAL = 'general'
}

// ============================================================================
// FIRESTORE COLLECTION REFERENCES
// ============================================================================

export const COLLECTIONS = {
  USERS: 'users',
  FORMS: 'forms',
  FORM_SUBMISSIONS: 'formSubmissions',
  FILES: 'files',
  ORGANIZATIONS: 'organizations',
  DASHBOARD_METRICS: 'dashboardMetrics',
  ACTIVITY_LOGS: 'activityLogs',
  NOTIFICATIONS: 'notifications'
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WithTimestamps<T> = T & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type WithId<T> = T & {
  id: string;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// INDEX DEFINITIONS (for Firestore composite indexes)
// ============================================================================

export const FIRESTORE_INDEXES = [
  // Forms indexes
  {
    collection: COLLECTIONS.FORMS,
    fields: [
      { field: 'organization', order: 'asc' },
      { field: 'status', order: 'asc' },
      { field: 'updatedAt', order: 'desc' }
    ]
  },
  {
    collection: COLLECTIONS.FORMS,
    fields: [
      { field: 'category', order: 'asc' },
      { field: 'organization', order: 'asc' }
    ]
  },

  // Submissions indexes
  {
    collection: COLLECTIONS.FORM_SUBMISSIONS,
    fields: [
      { field: 'formId', order: 'asc' },
      { field: 'submittedAt', order: 'desc' }
    ]
  },
  {
    collection: COLLECTIONS.FORM_SUBMISSIONS,
    fields: [
      { field: 'submittedBy', order: 'asc' },
      { field: 'submittedAt', order: 'desc' }
    ]
  },

  // Files indexes
  {
    collection: COLLECTIONS.FILES,
    fields: [
      { field: 'organization', order: 'asc' },
      { field: 'uploadedAt', order: 'desc' }
    ]
  },
  {
    collection: COLLECTIONS.FILES,
    fields: [
      { field: 'category', order: 'asc' },
      { field: 'organization', order: 'asc' }
    ]
  },

  // Activity logs indexes
  {
    collection: COLLECTIONS.ACTIVITY_LOGS,
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'timestamp', order: 'desc' }
    ]
  },
  {
    collection: COLLECTIONS.ACTIVITY_LOGS,
    fields: [
      { field: 'resourceType', order: 'asc' },
      { field: 'timestamp', order: 'desc' }
    ]
  },

  // Notifications indexes
  {
    collection: COLLECTIONS.NOTIFICATIONS,
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'isRead', order: 'asc' },
      { field: 'createdAt', order: 'desc' }
    ]
  }
];

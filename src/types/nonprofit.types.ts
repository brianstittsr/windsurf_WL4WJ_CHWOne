import { Timestamp } from 'firebase/firestore';

/**
 * Medicaid Regions in North Carolina
 */
export enum MedicaidRegion {
  REGION_1 = 'Region 1',
  REGION_2 = 'Region 2',
  REGION_3 = 'Region 3',
  REGION_4 = 'Region 4',
  REGION_5 = 'Region 5',
  REGION_6 = 'Region 6',
  STATEWIDE = 'Statewide'
}

/**
 * Partnership/Collaboration types between nonprofits
 */
export enum PartnershipType {
  GRANT = 'Grant',
  MOU = 'Memorandum of Understanding',
  CONTRACT = 'Contract',
  INFORMAL = 'Informal Partnership'
}

/**
 * Partnership status
 */
export enum PartnershipStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  EXPIRED = 'Expired',
  TERMINATED = 'Terminated'
}

/**
 * IRS Filing Information from Form 990
 */
export interface IRSFiling {
  taxPeriod: number;
  taxYear: number;
  formType: number; // 990, 990-EZ, 990-PF, etc.
  pdfUrl?: string;
  totalRevenue: number;
  totalExpenses: number;
  totalAssets: number;
  totalLiabilities?: number;
  compensationPercent?: number;
}

/**
 * IRS Data from ProPublica Nonprofit Explorer
 */
export interface IRSData {
  // Basic IRS Information
  ein: string;
  organizationName: string;
  careOfName?: string;
  
  // Address from IRS
  irsAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Classification
  nteeCode?: string; // National Taxonomy of Exempt Entities code
  subsectionCode?: number; // 501(c)(3), 501(c)(4), etc.
  affiliationCode?: number;
  classificationCodes?: string;
  foundationCode?: number;
  activityCodes?: string;
  organizationCode?: number;
  exemptStatusCode?: number;
  
  // Dates
  rulingDate?: string; // Date of IRS ruling
  taxPeriod?: number;
  accountingPeriod?: number;
  
  // Financial Summary (from latest filing)
  assetAmount?: number;
  incomeAmount?: number;
  revenueAmount?: number;
  
  // Deductibility
  deductibilityCode?: number; // 1 = contributions are deductible
  
  // Filing History
  latestFiling?: IRSFiling;
  filingHistory?: IRSFiling[];
  
  // Data Source Metadata
  dataSource: 'propublica' | 'irs' | 'manual';
  lastUpdated?: Timestamp;
  lastVerified?: Timestamp;
}

/**
 * Nonprofit Organization
 */
export interface NonprofitOrganization {
  id?: string;
  name: string;
  ein?: string; // Employer Identification Number
  description?: string;
  
  // Location & Service Area
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    county?: string;
  };
  medicaidRegion: MedicaidRegion;
  serviceCounties: string[]; // NC counties served
  
  // Contact Information
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
    website?: string;
  };
  
  // Staff & Members
  adminUserIds: string[]; // User IDs of nonprofit admins
  chwIds: string[]; // User IDs of employed CHWs
  staffIds: string[]; // User IDs of other staff members
  
  // Partnerships
  partnershipIds: string[]; // IDs of partnerships this org is part of
  
  // Platform Access & Licensing
  licenseId?: string; // Reference to OrganizationLicense
  hasActiveLicense: boolean;
  
  // IRS Data (enriched from ProPublica/IRS)
  irsData?: IRSData;
  irsVerified?: boolean; // Whether the org has been verified against IRS records
  irsClaimedAt?: Timestamp; // When the org was claimed from IRS search
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
  isActive: boolean;
  
  // Optional fields
  logo?: string; // URL to logo image
  missionStatement?: string;
  focusAreas?: string[]; // e.g., ["Maternal Health", "Chronic Disease"]
}

/**
 * Partnership between two or more nonprofit organizations
 */
export interface NonprofitPartnership {
  id?: string;
  name: string;
  description?: string;
  
  // Partnership Details
  type: PartnershipType;
  status: PartnershipStatus;
  
  // Organizations involved
  organizationIds: string[]; // IDs of participating nonprofits
  leadOrganizationId?: string; // Primary/lead organization
  
  // Dates
  startDate: Timestamp;
  endDate?: Timestamp;
  
  // Documents
  documents: {
    id: string;
    name: string;
    type: 'grant' | 'mou' | 'contract' | 'report' | 'other';
    fileUrl: string;
    uploadedAt: Timestamp;
    uploadedBy: string;
  }[];
  
  // Grant-specific fields (if type is GRANT)
  grantDetails?: {
    grantId?: string; // Reference to Grant document
    fundingAmount?: number;
    fundingSource?: string;
    grantPeriod?: {
      start: Timestamp;
      end: Timestamp;
    };
  };
  
  // Collaboration workspace
  collaborationId?: string; // Reference to Collaboration document
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isActive: boolean;
}

/**
 * Collaboration workspace for multiple nonprofits
 * Shared space for forms, datasets, grants, reports, and dashboards
 */
export interface Collaboration {
  id?: string;
  name: string;
  description?: string;
  
  // Organizations with access
  organizationIds: string[]; // All participating nonprofits
  partnershipId?: string; // Optional link to partnership
  
  // Shared Resources
  sharedResources: {
    formIds: string[]; // Shared forms
    datasetIds: string[]; // Shared datasets
    grantIds: string[]; // Shared grants
    reportIds: string[]; // Shared reports
    dashboardIds: string[]; // Shared dashboards
  };
  
  // Access Control
  permissions: {
    organizationId: string;
    canView: boolean;
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  }[];
  
  // Activity Log
  activities: CollaborationActivity[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isActive: boolean;
}

/**
 * Activity in a collaboration
 */
export interface CollaborationActivity {
  id: string;
  type: 'form_added' | 'dataset_added' | 'grant_added' | 'report_added' | 'dashboard_added' | 
        'resource_edited' | 'resource_removed' | 'member_added' | 'member_removed' | 'comment';
  userId: string;
  userName: string;
  organizationId: string;
  organizationName: string;
  description: string;
  resourceId?: string; // ID of affected resource
  resourceType?: string; // Type of affected resource
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

/**
 * CHW Employment relationship with nonprofit
 */
export interface CHWEmployment {
  chwUserId: string;
  organizationId: string;
  position: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  isActive: boolean;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  supervisor?: string; // User ID of supervisor
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Helper function to get Medicaid Region display name
 */
export function getMedicaidRegionName(region: MedicaidRegion): string {
  return region;
}

/**
 * Helper function to get partnership type display name
 */
export function getPartnershipTypeName(type: PartnershipType): string {
  return type;
}

/**
 * Firestore collection names
 */
export const NONPROFIT_COLLECTIONS = {
  ORGANIZATIONS: 'nonprofitOrganizations',
  PARTNERSHIPS: 'nonprofitPartnerships',
  COLLABORATIONS: 'collaborations',
  CHW_EMPLOYMENT: 'chwEmployment'
} as const;

import { Timestamp } from 'firebase/firestore';
import { MedicaidRegion } from './nonprofit.types';

/**
 * Platform tools/features available for licensing
 */
export enum PlatformTool {
  FORMS = 'Forms',
  DATASETS = 'Datasets',
  REPORTS = 'Reports',
  AI_ASSISTANT = 'AI Assistant',
  GRANTS = 'Grants',
  REFERRALS = 'Referrals',
  PROJECTS = 'Projects',
  DASHBOARDS = 'Dashboards'
}

/**
 * Organization types that can purchase licenses
 */
export enum LicensableEntityType {
  NONPROFIT_ORGANIZATION = 'Nonprofit Organization',
  CHW_ASSOCIATION = 'CHW Association',
  MEDICAID_REGION = 'Medicaid Region'
}

/**
 * Subscription/License status
 */
export enum LicenseStatus {
  ACTIVE = 'Active',
  TRIAL = 'Trial',
  EXPIRED = 'Expired',
  SUSPENDED = 'Suspended',
  CANCELLED = 'Cancelled'
}

/**
 * Billing cycle options
 */
export enum BillingCycle {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  ANNUAL = 'Annual'
}

/**
 * Tool access license for a specific feature
 */
export interface ToolLicense {
  tool: PlatformTool;
  isEnabled: boolean;
  maxUsers: number; // Maximum number of users who can access this tool
  currentUsers: number; // Current number of users using this tool
  pricePerUser: number; // Price per user per billing cycle
  enabledAt?: Timestamp;
  disabledAt?: Timestamp;
}

/**
 * Organization subscription/license
 * Granted by Admin to Nonprofit, CHW Association, or Medicaid Region
 */
export interface OrganizationLicense {
  id?: string;
  
  // Organization Details
  entityType: LicensableEntityType;
  entityId: string; // ID of nonprofit, CHW association, or medicaid region
  entityName: string;
  
  // Medicaid Region (if applicable)
  medicaidRegion?: MedicaidRegion;
  
  // License Status
  status: LicenseStatus;
  
  // Tool Access - Admin grants access to specific tools
  toolLicenses: ToolLicense[];
  
  // User Limits
  totalLicensedUsers: number; // Total user licenses purchased
  activeUsers: string[]; // User IDs currently using the platform
  
  // Billing Information
  billingCycle: BillingCycle;
  pricePerUserBase: number; // Base price per user
  totalMonthlyCost: number; // Calculated total cost
  
  // Subscription Dates
  startDate: Timestamp;
  endDate?: Timestamp;
  trialEndDate?: Timestamp;
  nextBillingDate?: Timestamp;
  
  // Payment Information
  paymentMethod?: {
    type: 'credit_card' | 'invoice' | 'purchase_order';
    lastFour?: string;
    billingEmail?: string;
  };
  
  // Admin Controls
  grantedBy: string; // Admin user ID who granted access
  grantedAt: Timestamp;
  lastModifiedBy?: string;
  lastModifiedAt?: Timestamp;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * License usage tracking for analytics and billing
 */
export interface LicenseUsageLog {
  id?: string;
  licenseId: string;
  entityId: string;
  entityName: string;
  
  // Usage Details
  tool: PlatformTool;
  userId: string;
  userName: string;
  
  // Session Info
  sessionStart: Timestamp;
  sessionEnd?: Timestamp;
  durationMinutes?: number;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

/**
 * License change history for audit trail
 */
export interface LicenseChangeLog {
  id?: string;
  licenseId: string;
  entityId: string;
  
  // Change Details
  changeType: 'created' | 'updated' | 'tool_added' | 'tool_removed' | 
              'users_increased' | 'users_decreased' | 'suspended' | 'reactivated' | 'cancelled';
  changedBy: string; // Admin user ID
  changedByName: string;
  
  // Before/After values
  previousValue?: any;
  newValue?: any;
  
  // Description
  description: string;
  
  // Timestamp
  timestamp: Timestamp;
}

/**
 * User's effective tool access (derived from organization license)
 */
export interface UserToolAccess {
  userId: string;
  organizationId: string;
  organizationName: string;
  organizationType: LicensableEntityType;
  
  // Available Tools (inherited from organization license)
  availableTools: {
    tool: PlatformTool;
    hasAccess: boolean;
    reason?: string; // e.g., "Organization license active" or "License expired"
  }[];
  
  // License Status
  licenseStatus: LicenseStatus;
  licenseExpiresAt?: Timestamp;
  
  // Computed at runtime
  computedAt: Timestamp;
}

/**
 * Pricing tier for different organization sizes
 */
export interface PricingTier {
  id: string;
  name: string;
  minUsers: number;
  maxUsers: number;
  pricePerUser: number;
  discount?: number; // Percentage discount
  description?: string;
}

/**
 * Default pricing tiers
 */
export const DEFAULT_PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier_1',
    name: 'Small Organization',
    minUsers: 1,
    maxUsers: 10,
    pricePerUser: 50,
    description: '1-10 users'
  },
  {
    id: 'tier_2',
    name: 'Medium Organization',
    minUsers: 11,
    maxUsers: 50,
    pricePerUser: 45,
    discount: 10,
    description: '11-50 users (10% discount)'
  },
  {
    id: 'tier_3',
    name: 'Large Organization',
    minUsers: 51,
    maxUsers: 200,
    pricePerUser: 40,
    discount: 20,
    description: '51-200 users (20% discount)'
  },
  {
    id: 'tier_4',
    name: 'Enterprise',
    minUsers: 201,
    maxUsers: 999999,
    pricePerUser: 35,
    discount: 30,
    description: '201+ users (30% discount)'
  }
];

/**
 * Tool pricing (per user per month)
 */
export const TOOL_PRICING: Record<PlatformTool, number> = {
  [PlatformTool.FORMS]: 10,
  [PlatformTool.DATASETS]: 15,
  [PlatformTool.REPORTS]: 12,
  [PlatformTool.AI_ASSISTANT]: 20,
  [PlatformTool.GRANTS]: 18,
  [PlatformTool.REFERRALS]: 8,
  [PlatformTool.PROJECTS]: 10,
  [PlatformTool.DASHBOARDS]: 15
};

/**
 * Helper function to calculate total license cost
 */
export function calculateLicenseCost(
  toolLicenses: ToolLicense[],
  billingCycle: BillingCycle
): number {
  const monthlyTotal = toolLicenses.reduce((total, license) => {
    if (license.isEnabled) {
      return total + (license.maxUsers * license.pricePerUser);
    }
    return total;
  }, 0);
  
  // Apply billing cycle multiplier
  const multiplier = billingCycle === BillingCycle.ANNUAL ? 12 : 
                    billingCycle === BillingCycle.QUARTERLY ? 3 : 1;
  
  return monthlyTotal * multiplier;
}

/**
 * Helper function to check if user has access to a tool
 */
export function hasToolAccess(
  userAccess: UserToolAccess,
  tool: PlatformTool
): boolean {
  const toolAccess = userAccess.availableTools.find(t => t.tool === tool);
  return toolAccess?.hasAccess || false;
}

/**
 * Helper function to get pricing tier for user count
 */
export function getPricingTier(userCount: number): PricingTier {
  return DEFAULT_PRICING_TIERS.find(
    tier => userCount >= tier.minUsers && userCount <= tier.maxUsers
  ) || DEFAULT_PRICING_TIERS[0];
}

/**
 * Firestore collection names
 */
export const LICENSE_COLLECTIONS = {
  ORGANIZATION_LICENSES: 'organizationLicenses',
  LICENSE_USAGE_LOGS: 'licenseUsageLogs',
  LICENSE_CHANGE_LOGS: 'licenseChangeLogs'
} as const;

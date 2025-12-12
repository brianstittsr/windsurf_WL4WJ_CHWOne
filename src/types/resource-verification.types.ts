/**
 * Resource Verification Types
 * For monthly verification workflow and nonprofit claiming
 */

export type VerificationStatus = 
  | 'pending'
  | 'verified'
  | 'needs_update'
  | 'unresponsive'
  | 'expired';

export type ClaimStatus = 
  | 'unclaimed'
  | 'pending_verification'
  | 'claimed'
  | 'rejected';

export interface ResourceVerification {
  id: string;
  resourceId: string;
  organizationName: string;
  contactEmail: string;
  contactName?: string;
  verificationToken: string;
  tokenExpiry: Date;
  status: VerificationStatus;
  lastSentDate: Date;
  lastVerifiedDate?: Date;
  verifiedBy?: string;
  responseNotes?: string;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationResponse {
  id: string;
  verificationId: string;
  resourceId: string;
  responseDate: Date;
  isStillAvailable: boolean;
  updatedFields?: Record<string, unknown>;
  newContactEmail?: string;
  newContactName?: string;
  newContactPhone?: string;
  additionalNotes?: string;
  respondentEmail: string;
}

export interface NonprofitClaim {
  id: string;
  resourceId: string;
  organizationName: string;
  ein: string; // Employer Identification Number
  claimantUserId: string;
  claimantEmail: string;
  claimantName: string;
  claimantTitle?: string;
  status: ClaimStatus;
  verificationMethod: 'ein_lookup' | 'document_upload' | 'manual_review';
  verificationDocumentUrl?: string;
  einVerified: boolean;
  einData?: EINLookupData;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EINLookupData {
  ein: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
  nteeCode?: string;
  classification?: string;
  ruling?: string;
  deductibility?: string;
  foundation?: string;
  organization?: string;
  exemptStatus?: string;
  taxPeriod?: string;
  assetAmount?: number;
  incomeAmount?: number;
  filingRequirement?: string;
  pfFilingRequirement?: string;
  accountingPeriod?: string;
  assetCodeDesc?: string;
  incomeCodeDesc?: string;
  formType?: string;
}

export interface VerificationEmailTemplate {
  subject: string;
  greeting: string;
  body: string;
  verificationUrl: string;
  expiryDays: number;
}

// Verification settings
export const VERIFICATION_SETTINGS = {
  tokenExpiryDays: 30,
  reminderIntervalDays: 7,
  maxReminders: 3,
  unresponsiveAfterDays: 45
};

// Create verification input
export interface CreateVerificationInput {
  resourceId: string;
  organizationName: string;
  contactEmail: string;
  contactName?: string;
}

// Create claim input
export interface CreateClaimInput {
  resourceId: string;
  organizationName: string;
  ein: string;
  claimantEmail: string;
  claimantName: string;
  claimantTitle?: string;
  verificationDocumentUrl?: string;
}

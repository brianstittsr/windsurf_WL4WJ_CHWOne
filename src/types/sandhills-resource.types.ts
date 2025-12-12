/**
 * Sandhills Resources Types
 * Data model for community resources in the Sandhills region
 */

export type ResourceType = 
  | "Children's Services"
  | "Disability Programs"
  | "Domestic Violence Advocacy"
  | "Education"
  | "Financial Services"
  | "Health Programs"
  | "Housing & Housing Repairs"
  | "Legal Aid"
  | "Medical & Dental"
  | "Multiple Services"
  | "Senior Services"
  | "Transportation"
  | "Utilities"
  | "Other";

export type ResourceStatus = 
  | "Active"
  | "Inactive"
  | "Pending Verification"
  | "Needs Update";

export interface SandhillsResource {
  id: string;
  organization: string;
  address?: string;
  city?: string;
  state: string;
  zip?: string;
  county?: string; // Legacy single county field
  counties?: string[]; // New multi-county support
  resourceType: ResourceType;
  // Verification status
  isVerified?: boolean;
  verifiedDate?: Date;
  verifiedBy?: string;
  // Claim status
  isClaimed?: boolean;
  claimedByUserId?: string;
  claimedByOrganization?: string;
  claimDate?: Date;
  ein?: string;
  department?: string;
  contactPerson?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  generalContactName?: string;
  generalContactPhone?: string;
  website?: string;
  lastContactDate?: string;
  currentStatus: ResourceStatus;
  notes?: string;
  resourceDescription?: string;
  eligibility?: string;
  howToApply?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateSandhillsResourceInput {
  organization: string;
  address?: string;
  city?: string;
  state: string;
  zip?: string;
  county?: string;
  counties?: string[];
  resourceType: ResourceType;
  department?: string;
  contactPerson?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  generalContactName?: string;
  generalContactPhone?: string;
  website?: string;
  lastContactDate?: string;
  currentStatus?: ResourceStatus;
  notes?: string;
  resourceDescription?: string;
  eligibility?: string;
  howToApply?: string;
}

export interface UpdateSandhillsResourceInput {
  organization?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  counties?: string[];
  resourceType?: ResourceType;
  department?: string;
  contactPerson?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  generalContactName?: string;
  generalContactPhone?: string;
  website?: string;
  lastContactDate?: string;
  currentStatus?: ResourceStatus;
  notes?: string;
  resourceDescription?: string;
  eligibility?: string;
  howToApply?: string;
}

export interface SandhillsResourceFilters {
  resourceType?: ResourceType;
  county?: string;
  status?: ResourceStatus;
  searchTerm?: string;
}

// Resource type options for dropdowns
export const RESOURCE_TYPES: ResourceType[] = [
  "Children's Services",
  "Disability Programs",
  "Domestic Violence Advocacy",
  "Education",
  "Financial Services",
  "Health Programs",
  "Housing & Housing Repairs",
  "Legal Aid",
  "Medical & Dental",
  "Multiple Services",
  "Senior Services",
  "Transportation",
  "Utilities",
  "Other"
];

// Status options for dropdowns
export const RESOURCE_STATUSES: ResourceStatus[] = [
  "Active",
  "Inactive",
  "Pending Verification",
  "Needs Update"
];

// Standard counties in the Sandhills region (individual counties only)
export const SANDHILLS_COUNTIES = [
  "Cumberland",
  "Durham",
  "Harnett",
  "Johnston",
  "Lee",
  "Moore",
  "Robeson",
  "Sampson",
  "Wake"
];

// Special coverage options
export const COVERAGE_OPTIONS = [
  "All NC Counties",
  "Statewide"
];

// Helper to parse legacy county strings into array
export function parseCountyString(countyStr: string | undefined): string[] {
  if (!countyStr) return [];
  
  // Handle special cases
  if (countyStr === "All Counties" || countyStr === "All NC Counties") {
    return ["All NC Counties"];
  }
  
  // Parse combined county strings
  const normalized = countyStr
    .replace(/Cum\b/gi, "Cumberland")
    .replace(/Har\b/gi, "Harnett")
    .replace(/Cumb\b/gi, "Cumberland")
    .replace(/surr\. counties/gi, "")
    .replace(/&/g, "/")
    .replace(/,/g, "/");
  
  // Split by / and clean up
  const counties = normalized
    .split("/")
    .map(c => c.trim())
    .filter(c => c.length > 0 && c !== "surr. counties")
    .map(c => {
      // Capitalize first letter of each word
      return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    });
  
  // Validate against known counties
  return counties.filter(c => 
    SANDHILLS_COUNTIES.includes(c) || 
    COVERAGE_OPTIONS.includes(c) ||
    c === "All NC Counties"
  );
}

// Get display string for counties array
export function getCountiesDisplay(counties: string[] | undefined, legacyCounty?: string): string {
  if (counties && counties.length > 0) {
    if (counties.includes("All NC Counties")) return "All NC Counties";
    return counties.join(", ");
  }
  if (legacyCounty) return legacyCounty;
  return "-";
}

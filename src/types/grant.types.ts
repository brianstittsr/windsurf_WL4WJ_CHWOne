export interface GrantDocument {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url?: string;
  id?: string;
}

export interface Grant {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  fundingSource: string;
  grantNumber: string;
  totalBudget: number;
  reportingRequirements: ReportingRequirement[];
  keyContacts: KeyContact[];
  organizationId: string;
  status: 'active' | 'inactive' | 'draft' | 'completed';
  documents?: GrantDocument[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Organization {
  id?: string;
  name: string;
  description: string;
  website?: string;
  logoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportingRequirement {
  id: string;
  type: 'financial' | 'programmatic' | 'other';
  dueDate: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  description: string;
  status: 'upcoming' | 'submitted' | 'overdue';
  submittedDate?: string;
  notes?: string;
}

export interface KeyContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  organization: string;
  isPrimary: boolean;
}

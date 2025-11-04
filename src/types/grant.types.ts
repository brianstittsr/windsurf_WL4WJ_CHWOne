export interface GrantDocument {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url?: string;
  id?: string;
}

export interface CollaboratingEntity {
  id?: string;
  name: string;
  role: 'lead' | 'partner' | 'evaluator' | 'stakeholder' | 'other';
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  responsibilities: string[];
}

export interface DataCollectionMethod {
  id?: string;
  name: string;
  description: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  responsibleEntity: string;
  dataPoints: string[];
  tools: string[];
}

export interface ProjectMilestone {
  id?: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'delayed' | 'completed';
  responsibleParties: string[];
  dependencies: string[];
}

export interface AnalysisRecommendation {
  id?: string;
  area: 'governance' | 'data_collection' | 'reporting' | 'resource_allocation' | 'timeline' | 'risk_management';
  description: string;
  priority: 'high' | 'medium' | 'low';
  implementationSteps: string[];
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
  
  // New fields for enhanced grant analyzer
  collaboratingEntities?: CollaboratingEntity[];
  dataCollectionMethods?: DataCollectionMethod[];
  projectMilestones?: ProjectMilestone[];
  analysisRecommendations?: AnalysisRecommendation[];
  entityRelationshipNotes?: string;
  
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

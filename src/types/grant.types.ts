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

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'signature';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  defaultValue?: any;
  validation?: string;
  width?: 'full' | 'half' | 'third';
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  purpose: 'intake' | 'progress' | 'assessment' | 'feedback' | 'reporting' | 'data';
  sections: FormSection[];
  createdAt: string;
  updatedBy?: string;
  status: 'draft' | 'active' | 'archived';
  submissionCount?: number;
  completionTime?: number; // Average in minutes
  entityResponsible: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dueDate?: string;
  contractDeliverable?: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'dashboard' | 'excel' | 'presentation';
  sections: {
    id: string;
    title: string;
    description?: string;
    dataSource: string;
    visualizationType?: 'table' | 'chart' | 'metric' | 'text';
    chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  }[];
  deliverySchedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    dayOfMonth?: number;
    dayOfWeek?: string;
    recipients: string[];
  };
  contractDeliverable: boolean;
  dueDate?: string;
}

export interface DashboardMetric {
  id: string;
  name: string;
  description?: string;
  value: number | string;
  previousValue?: number | string;
  target?: number | string;
  unit?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  trend?: 'up' | 'down' | 'flat';
  trendPercentage?: number;
  dataSource: string;
  visualization: 'number' | 'percentage' | 'currency' | 'ratio';
  aiInsight?: string;
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
  
  // Form generation and management
  formTemplates?: FormTemplate[];
  reportTemplates?: ReportTemplate[];
  
  // AI-driven project tracking
  dashboardMetrics?: DashboardMetric[];
  aiInsights?: {
    id: string;
    category: 'risk' | 'opportunity' | 'trend' | 'recommendation';
    title: string;
    description: string;
    confidence: number; // 0-100
    dataPoints: string[];
    createdAt: string;
    status: 'new' | 'acknowledged' | 'addressed' | 'dismissed';
  }[];
  
  // Real-time tracking
  lastDataRefresh?: string;
  trackingEnabled?: boolean;
  trackingFrequency?: 'hourly' | 'daily' | 'weekly';
  
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

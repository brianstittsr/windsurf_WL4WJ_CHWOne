// Core Platform Types for CHWOne

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  hipaaTrainingCompleted: boolean;
  hipaaTrainingDate?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  CHW_COORDINATOR = 'chw_coordinator',
  CHW = 'community_health_worker',
  NONPROFIT_STAFF = 'nonprofit_staff',
  CLIENT = 'client',
  VIEWER = 'viewer'
}

export interface CommunityHealthWorker {
  id: string;
  userId: string;
  certificationNumber: string;
  certificationDate: Date;
  expirationDate: Date;
  specializations: string[];
  region: string;
  serviceArea: string[];
  languages: string[];
  isActive: boolean;
  caseLoad: number;
  maxCaseLoad: number;
  supervisor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grant {
  id: string;
  title: string;
  description: string;
  fundingSource: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: GrantStatus;
  projectIds: string[];
  requirements: string[];
  reportingSchedule: ReportingSchedule[];
  contactPerson: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum GrantStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ReportingSchedule {
  type: 'monthly' | 'quarterly' | 'annual' | 'final';
  dueDate: Date;
  completed: boolean;
  submittedDate?: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  grantId?: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  assignedCHWs: string[];
  targetPopulation: string;
  goals: string[];
  outcomes: ProjectOutcome[];
  budget: number;
  spentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ProjectOutcome {
  metric: string;
  target: number;
  current: number;
  unit: string;
  measurementDate: Date;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  projectId: string;
  type: DatasetType;
  source: string;
  collectionMethod: string;
  dataPoints: DataPoint[];
  isHIPAAProtected: boolean;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export enum DatasetType {
  SURVEY_RESULTS = 'survey_results',
  CLIENT_DATA = 'client_data',
  OUTCOME_METRICS = 'outcome_metrics',
  RESOURCE_UTILIZATION = 'resource_utilization',
  EMPOWER_SURVEY = 'empower_survey'
}

export enum AccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential'
}

export interface DataPoint {
  id: string;
  timestamp: Date;
  value: any;
  metadata?: Record<string, any>;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  email?: string;
  address: Address;
  assignedCHW: string;
  consentGiven: boolean;
  consentDate: Date;
  isActive: boolean;
  demographics: Demographics;
  healthConditions: string[];
  socialDeterminants: SocialDeterminants;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
}

export interface Demographics {
  gender?: string;
  race?: string[];
  ethnicity?: string;
  preferredLanguage: string;
  householdSize: number;
  householdIncome?: string;
  insuranceStatus: string;
}

export interface SocialDeterminants {
  housingStatus: string;
  employmentStatus: string;
  transportationAccess: boolean;
  foodSecurity: string;
  socialSupport: string;
  educationLevel: string;
}

export interface ReferralResource {
  id: string;
  name: string;
  organization: string;
  category: ResourceCategory;
  description: string;
  contactInfo: ContactInfo;
  address: Address;
  serviceHours: ServiceHours;
  eligibilityCriteria: string[];
  servicesOffered: string[];
  isActive: boolean;
  region5Certified: boolean;
  ncCare360Id?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface ContactInfo {
  phone: string;
  email?: string;
  website?: string;
  fax?: string;
}

export interface ServiceHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  notes?: string;
}

export interface Referral {
  id: string;
  clientId: string;
  resourceId: string;
  chwId: string;
  status: ReferralStatus;
  urgency: ReferralUrgency;
  reason: string;
  notes?: string;
  followUpDate?: Date;
  outcomeNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum ReferralStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum ReferralUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Communication {
  id: string;
  type: CommunicationType;
  fromUserId: string;
  toUserId?: string;
  clientId?: string;
  subject: string;
  message: string;
  isHIPAAProtected: boolean;
  isEncrypted: boolean;
  attachments?: Attachment[];
  readAt?: Date;
  createdAt: Date;
}

export enum CommunicationType {
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  ALERT = 'alert',
  REMINDER = 'reminder'
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  isEncrypted: boolean;
}

export interface EmpowerSurveyResult {
  id: string;
  projectId: string;
  surveyId: string;
  respondentId?: string;
  responses: SurveyResponse[];
  completedAt: Date;
  isAnonymous: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface SurveyResponse {
  questionId: string;
  questionText: string;
  answer: any;
  answerType: 'text' | 'number' | 'boolean' | 'multiple_choice' | 'scale';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface DashboardMetrics {
  totalCHWs: number;
  activeCHWs: number;
  totalClients: number;
  activeProjects: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalGrants: number;
  activeGrants: number;
  totalGrantAmount: number;
  region5Resources: number;
  empowerSurveys: number;
}

export interface NCCare360Integration {
  resourceId: string;
  ncCare360Id: string;
  lastSyncDate: Date;
  syncStatus: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

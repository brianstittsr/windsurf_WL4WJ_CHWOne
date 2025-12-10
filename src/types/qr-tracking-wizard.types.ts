import { Timestamp } from 'firebase/firestore';

/**
 * QR Code-Based Participant Tracking System - Wizard Types
 * Comprehensive type definitions for the 8-step wizard process
 */

// ============================================================================
// STEP 1: PLATFORM DISCOVERY
// ============================================================================

export interface PlatformCapabilities {
  platformName: string;
  platformType: 'salesforce' | 'airtable' | 'microsoft365' | 'google_workspace' | 'custom' | 'other';
  
  formBuilder: {
    toolName: string;
    features: {
      multipleChoice: boolean;
      textFields: boolean;
      dropdowns: boolean;
      fileUploads: boolean;
      conditionalLogic: boolean;
    };
    preFillCapability: boolean;
    multiLanguageSupport: boolean;
    supportedLanguages?: string[];
    mobileResponsive: boolean;
    otherFeatures?: string;
  };
  
  qrCodeGeneration: {
    hasBuiltInGenerator: boolean;
    canGenerateIndividual: boolean;
    canGenerateSingle: boolean;
    capabilities: {
      linkToForms: boolean;
      passParameters: boolean;
      preFillFields: boolean;
    };
    formatOptions: {
      downloadImages: boolean;
      printSheets: boolean;
      displayOnScreen: boolean;
    };
  };
  
  datasetFeatures: {
    storageType: 'spreadsheets' | 'database' | 'crm' | 'lists' | 'other';
    capabilities: {
      autoUpdateFromForms: boolean;
      linkMultipleForms: boolean;
      generateReports: boolean;
      exportData: boolean;
      relationalData: boolean;
      calculatedFields: boolean;
      historicalTracking: boolean;
      dashboards: boolean;
    };
    realTimeUpdates: boolean;
  };
  
  integrationAutomation: {
    formsAutoWriteToDatasets: boolean;
    canTriggerWorkflows: boolean;
    canSendNotifications: boolean;
    hasAPI: boolean;
  };
  
  limitations?: string;
  concerns?: string;
}

// ============================================================================
// STEP 2: PROGRAM DETAILS
// ============================================================================

export interface Cohort {
  cohortId: string;
  cohortName: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  description?: string;
}

export interface SessionSchedule {
  sessionId: string;
  sessionName: string;
  dayOfWeek: string;
  time: string;
  duration: number; // in minutes
  location: string;
  maxCapacity: number;
  cohortId?: string;
}

export interface ParticipantGroup {
  groupId: string;
  groupName: string;
  description?: string;
  maxSize?: number;
}

export interface ProgramDetails {
  basicInfo: {
    programName: string;
    programType: 'ongoing' | 'fixed_duration' | 'seasonal' | 'event_based';
    description: string;
    startDate: string;
    endDate: string;
    fundingSource: string;
    programGoals: string[];
    leadOrganization?: string;
    partnerOrganizations?: string[];
  };
  
  cohortStructure: {
    hasCohorts: boolean;
    cohorts: Cohort[];
    allowMultipleCohorts: boolean;
  };
  
  sessionSchedule: {
    hasRegularSessions: boolean;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'adhoc';
    sessions: SessionSchedule[];
    requiresPreRegistration: boolean;
  };
  
  participantGroups: {
    hasGroups: boolean;
    groups: ParticipantGroup[];
    groupAssignmentMethod: 'manual' | 'automatic' | 'self_select';
  };
  
  trackingRequirements: {
    trackAttendance: boolean;
    trackProgress: boolean;
    trackOutcomes: boolean;
    trackReferrals: boolean;
    customMetrics: string[];
  };
  
  // Legacy fields for backward compatibility
  participantStructure?: {
    totalParticipants: number;
    organizationType: 'cohorts' | 'rolling' | 'individual';
    numberOfCohorts?: number;
    participantsPerCohort?: number;
  };
  
  staffing?: {
    numberOfInstructors: number;
    instructorAssignment: 'same_cohort' | 'rotate';
    administrativeStaff: number;
    multipleAccessNeeded: boolean;
  };
  
  geographicScope?: {
    serviceArea: string;
    participantOrigin: 'same_area' | 'multiple_regions';
    trackLocation: boolean;
  };
  
  completionRequirements?: {
    requiredHours: number;
    completionLeadsTo: string[];
    minimumAttendance?: number;
  };
  
  specialFeatures?: {
    culturalProgramming?: string;
    multilingualDelivery?: string[];
    specialPopulations?: string;
    partnerCollaboration: boolean;
    equipmentDistribution: boolean;
    stipendsProvided: boolean;
    other?: string;
  };
}

// ============================================================================
// STEP 3: DATA REQUIREMENTS
// ============================================================================

export interface CustomField {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'time' | 'datetime' | 
              'select' | 'multiselect' | 'radio' | 'checkbox' | 'rating' | 'yesno' | 'file';
  required: boolean;
  description?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface DataRequirements {
  standardFields: string[]; // IDs of selected standard fields
  customFields: CustomField[];
  
  demographicData: {
    collectAge: boolean;
    collectGender: boolean;
    collectRace: boolean;
    collectEthnicity: boolean;
    collectLanguage: boolean;
    collectIncome: boolean;
    collectEducation: boolean;
    collectEmployment: boolean;
  };
  
  medicalData: {
    collectHealthConditions: boolean;
    collectMedications: boolean;
    collectAllergies: boolean;
    collectInsurance: boolean;
  };
  
  consentTracking: {
    requireConsent: boolean;
    consentTypes: string[];
    trackConsentDate: boolean;
  };
  
  privacySettings: {
    dataRetentionPeriod: number; // days
    allowDataSharing: boolean;
    anonymizeReports: boolean;
  };
  
  // Legacy fields for backward compatibility
  participantMasterInfo?: {
    requiredFields: ParticipantField[];
    additionalFields: ParticipantField[];
  };
  
  sessionAttendance?: {
    autoCapture: string[];
    instructorIndicates: string[];
    autoCalculate: string[];
  };
  
  participantFeedback?: {
    collectWhen: 'every_session' | 'every_other' | 'midpoint_end' | 'end_only' | 'other';
    questions: FeedbackQuestion[];
  };
  
  instructorNotes?: {
    frequency: 'every_session' | 'as_needed' | 'weekly' | 'other';
    trackingItems: string[];
  };
  
  programOutcomes?: {
    trackOutcomes: boolean;
    followUpTimeline?: number[]; // months
    measures?: string[];
  };
  
  administrativeTracking?: string[];
}

export interface ParticipantField {
  fieldName: string;
  fieldType: 'text' | 'email' | 'phone' | 'dropdown' | 'multiselect' | 'number' | 'date' | 'textarea';
  required: boolean;
  options?: string[]; // for dropdown/multiselect
  validation?: string;
  helpText?: string;
}

export interface FeedbackQuestion {
  question: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
}

// ============================================================================
// STEP 4: PARTICIPANT DATA UPLOAD
// ============================================================================

export interface ParticipantDataUpload {
  uploadMethod: 'file' | 'existing_list' | 'need_to_collect';
  participants: any[]; // Parsed participant data
  fieldMapping: Record<string, string>; // CSV column -> target field
  validationResults: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    warnings: string[];
    errors: string[];
  };
  
  // Legacy fields for backward compatibility
  rawData?: string; // CSV, table, or plain text
  dataColumns?: string[];
  
  registrationProcess?: {
    timeline?: string;
    method: 'online' | 'paper' | 'email_phone' | 'partner_referrals' | 'multiple';
    dataEntryBy: 'participants' | 'staff' | 'both';
  };
}

export interface ParticipantRecord {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  county?: string;
  cohortId?: string;
  cohortName?: string;
  customFields: Record<string, any>;
  qrCodeUrl?: string;
  qrCodeImageUrl?: string;
  enrollmentDate: Timestamp;
  status: 'enrolled' | 'active' | 'completed' | 'withdrawn';
}

export interface DataAnalysisResult {
  totalRecords: number;
  columnsDetected: string[];
  dataQualityIssues: {
    duplicates: number;
    missingRequired: string[];
    formattingIssues: string[];
  };
  suggestedCleanup: string[];
  cohortAssignments?: Record<string, string[]>; // cohortId -> participantIds
  readyForUpload: boolean;
}

// ============================================================================
// STEP 5: FORM CUSTOMIZATION
// ============================================================================

export interface CustomForm {
  formId: string;
  formName: string;
  formType: 'check_in' | 'registration' | 'feedback' | 'assessment' | 'attendance' | 'custom';
  description: string;
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
}

export interface FormField {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'time' | 
              'select' | 'radio' | 'checkbox' | 'rating' | 'yesno';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

export interface FormCustomization {
  forms: CustomForm[];
  qrCodeBehavior: {
    preFillParticipantData: boolean;
    requireQRScan: boolean;
    allowManualEntry: boolean;
    sessionTracking: boolean;
  };
  formSettings: {
    mobileOptimized: boolean;
    offlineCapable: boolean;
    multiLanguage: boolean;
    languages: string[];
  };
  
  // Legacy fields for backward compatibility
  formsNeeded?: FormType[];
  
  languageSettings?: {
    languages: string[];
    handleMethod: 'separate_forms' | 'language_toggle' | 'side_by_side';
  };
  
  mobileOptimization?: {
    priority: 'must_work_on_phones' | 'tablet_friendly' | 'desktop_fine';
    screenSizeConsiderations?: string;
  };
  
  accessibility?: {
    largeText: boolean;
    simpleLanguage: boolean;
    voiceInput: boolean;
    screenReader: boolean;
    highContrast: boolean;
    other?: string;
  };
  
  userExperience?: {
    formLength: 'short' | 'comprehensive' | 'balanced';
    showProgress: boolean;
    requiredFieldIndicator: 'asterisk' | 'color' | 'text';
    errorValidation: 'realtime' | 'on_submit' | 'both';
    confirmationMessage: 'simple' | 'show_submitted' | 'next_steps';
  };
  
  conditionalLogic?: ConditionalLogicRule[];
  
  branding?: {
    includeLogo: boolean;
    colors?: string[];
    partnerBranding: boolean;
    other?: string;
  };
}

export type FormType = 
  | 'participant_registration'
  | 'participant_checkin'
  | 'session_feedback'
  | 'instructor_progress'
  | 'makeup_session_request'
  | 'withdrawal_exit'
  | 'equipment_distribution'
  | 'followup_survey'
  | 'other';

export interface ConditionalLogicRule {
  condition: string; // e.g., "If participant selects 'Yes' to needing childcare"
  action: string; // e.g., "Show childcare options field"
  fieldId?: string;
  showFields?: string[];
  hideFields?: string[];
}

export interface GeneratedForm {
  formType: FormType;
  formName: string;
  description: string;
  fields: FormField[];
  logicMap: ConditionalLogicRule[];
  preFillConfiguration: PreFillConfig;
  dataFlow: DataFlowSpec;
  platformInstructions: string[];
  layoutMockup: string;
}

export interface StandardFormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  validation?: string;
  helpText?: string;
  options?: string[];
  conditionalDisplay?: string;
  preFill?: boolean;
  preFillSource?: string;
}

export interface PreFillConfig {
  enabled: boolean;
  participantIdParameter: string;
  autoPopulateFields: string[];
  visibleToParticipant: string[];
  hiddenFromParticipant: string[];
}

export interface DataFlowSpec {
  targetDataset: string;
  writeMode: 'create' | 'update' | 'upsert';
  fieldMappings: Record<string, string>; // formField -> datasetField
  calculations?: string[];
  transformations?: string[];
}

// ============================================================================
// STEP 6: QR CODE GENERATION
// ============================================================================

export interface QRCodeStrategy {
  approach: 'individual' | 'single' | 'hybrid';
  printFormat: 'badge' | 'card' | 'sticker' | 'sheet';
  includePhoto: boolean;
  includeName: boolean;
  includeId: boolean;
  includeInstructions: boolean;
  distributionMethod: string[];
  backupPlan: string;
  qrCodeSettings: {
    size: 'small' | 'medium' | 'large';
    errorCorrection: 'low' | 'medium' | 'high';
    includeUrl: boolean;
    customDomain: string;
  };
  
  // Legacy fields for backward compatibility
  qrCodeTypes?: QRCodeType[];
  
  distribution?: {
    individualParticipant?: {
      methods: ('printed_badge' | 'email' | 'sms' | 'certificate' | 'portal' | 'other')[];
      printSpecs?: PrintSpecifications;
    };
    sessionEvent?: {
      methods: ('projector' | 'poster' | 'table_tent' | 'reminder_message' | 'other')[];
      displaySpecs?: DisplaySpecifications;
    };
  };
  
  technicalPreferences?: {
    errorCorrectionLevel: 'low' | 'medium' | 'high';
    includeLogo: boolean;
    colorScheme: 'black_white' | 'brand_colors' | 'other';
    customColors?: string[];
  };
  
  participantInstructions?: {
    needed: boolean;
    format: ('instruction_sheet' | 'video' | 'card_text' | 'verbal' | 'other')[];
    languages: string[];
  };
}

export type QRCodeType = 
  | 'individual_checkin'
  | 'session_feedback'
  | 'program_info'
  | 'instructor_access'
  | 'equipment_checkout'
  | 'other';

export interface PrintSpecifications {
  cardSize: 'business_card' | 'badge_3x4' | 'name_tag' | 'full_page' | 'other';
  qrCodeSize: 'small_1in' | 'medium_2in' | 'large_3in';
  additionalInfo: ('participant_name' | 'cohort' | 'id_number' | 'instructions' | 'minimal')[];
}

export interface DisplaySpecifications {
  size: string;
  placement: string;
  visibility: string;
}

export interface QRCodeGeneration {
  participantQRCodes: ParticipantQRCode[];
  sessionQRCodes: SessionQRCode[];
  generationInstructions: string[];
  printTemplates: PrintTemplate[];
  testingChecklist: string[];
  distributionWorkflow: WorkflowStep[];
}

export interface ParticipantQRCode {
  participantId: string;
  participantName: string;
  cohortId?: string;
  qrCodeUrl: string;
  qrCodeImageUrl: string;
  qrCodeData: string; // The actual QR code content
}

export interface SessionQRCode {
  sessionId: string;
  sessionName: string;
  cohortId?: string;
  qrCodeUrl: string;
  qrCodeImageUrl: string;
  purpose: string;
}

export interface PrintTemplate {
  templateType: 'badge' | 'poster' | 'instruction_sheet';
  format: string;
  content: string;
  downloadUrl?: string;
}

// ============================================================================
// STEP 7: WORKFLOWS & TRAINING
// ============================================================================

export interface WorkflowsTraining {
  trainingTopics: string[];
  staffRoles: string[];
  trainingFormat: string;
  trainingDuration: string;
  supportDocumentation: boolean;
  videoTutorials: boolean;
  liveTraining: boolean;
  workflows: {
    participantRegistration: string;
    sessionCheckIn: string;
    dataCollection: string;
    troubleshooting: string;
  };
}

// Legacy interface for backward compatibility
export interface WorkflowsAndTraining {
  trainingNeeds: TrainingNeed[];
  
  documentationFormat: ('written_instructions' | 'video' | 'quick_reference' | 'flowcharts' | 'interactive' | 'all')[];
  languages: string[];
  
  specificWorkflows: {
    instructors?: string[];
    participants?: string[];
    administrators?: string[];
  };
  
  contingencyProcedures: ContingencyScenario[];
  
  reportingRequirements: ReportingRequirement[];
}

export interface TrainingNeed {
  role: string;
  numberOfPeople: number;
  technicalLevel: 'low' | 'medium' | 'high';
  needsToUnderstand: string[];
}

export interface ContingencyScenario {
  scenario: string;
  procedure: string[];
  backupPlan: string;
}

export interface ReportingRequirement {
  reportName: string;
  frequency: 'realtime' | 'weekly' | 'monthly' | 'end_of_program' | 'ad_hoc';
  audience: ('internal' | 'board' | 'funders' | 'partners' | 'public')[];
  dataPoints: string[];
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  timeEstimate?: string;
  responsibleRole: string;
  dependencies?: string[];
  tips?: string[];
}

export interface GeneratedWorkflow {
  role: string;
  workflowName: string;
  steps: WorkflowStep[];
  commonIssues: string[];
  tips: string[];
  quickReference: string;
}

// ============================================================================
// STEP 8: IMPLEMENTATION PLAN
// ============================================================================

export interface ImplementationPlan {
  startDate: string;
  timeline: 'aggressive' | 'standard' | 'relaxed';
  milestones: string[];
  successMetrics: string[];
  budget: string;
  resources: string;
  risks: string;
  notes: string;
  
  // Legacy fields for backward compatibility
  legacyTimeline?: {
    currentDate: Date;
    programStartDate: Date;
    testingStartDate: Date;
    staffTrainingDate: Date;
    participantEnrollmentDate: Date;
  };
  
  team?: {
    projectLead: TeamMember;
    technicalLead: TeamMember;
    platformAdmin: TeamMember;
    otherMembers: TeamMember[];
  };
  
  technicalSupport?: {
    type: ('in_house_it' | 'vendor_support' | 'consultant' | 'limited')[];
    responseTime?: string;
  };
  
  testingApproach?: {
    method: 'pilot_cohort' | 'staff_only' | 'full_launch' | 'other';
    duration: number; // days
  };
  
  successCriteria?: SuccessCriterion[];
  
  riskAssessment?: Risk[];
  
  postLaunchSupport?: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  availability?: string;
  technicalSkills?: string;
}

export interface SuccessCriterion {
  metric: string;
  target: string;
  measurementMethod: string;
}

export interface Risk {
  concern: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigationStrategy: string;
}

export interface FinalDeliverables {
  systemArchitecture: SystemArchitectureDoc;
  implementationPlan: WeekByWeekPlan;
  setupChecklist: string[];
  trainingPlan: TrainingPlanDoc;
  launchChecklist: string[];
  riskMitigationPlan: RiskMitigationDoc;
  optimizationRoadmap: OptimizationDoc;
  supportGuide: SupportGuideDoc;
  successMeasurement: SuccessMeasurementDoc;
}

export interface SystemArchitectureDoc {
  datasetSchemas: any[];
  formSpecifications: GeneratedForm[];
  qrCodeStrategy: QRCodeGeneration;
  dataFlowDiagrams: string[];
  integrationPoints: string[];
}

export interface WeekByWeekPlan {
  weeks: {
    weekNumber: number;
    tasks: {
      task: string;
      owner: string;
      deadline: Date;
      status: 'not_started' | 'in_progress' | 'completed';
      dependencies?: string[];
    }[];
  }[];
}

export interface TrainingPlanDoc {
  schedule: {
    role: string;
    date: Date;
    duration: number;
    materials: string[];
  }[];
  practiceScenarios: string[];
  certification: string;
}

export interface RiskMitigationDoc {
  risks: {
    risk: Risk;
    contingencyPlan: string;
    rollbackProcedure?: string;
  }[];
}

export interface OptimizationDoc {
  monitoringSchedule: {
    day30: string[];
    day60: string[];
    day90: string[];
  };
  potentialEnhancements: string[];
  feedbackCollection: string;
}

export interface SupportGuideDoc {
  maintenanceTasks: string[];
  addNewParticipants: string[];
  dataCorrections: string[];
  reviewSchedule: string;
  closeoutProcedures: string[];
}

export interface SuccessMeasurementDoc {
  kpis: string[];
  measurementMethods: string[];
  reportingSchedule: string;
  continuousImprovement: string;
}

// ============================================================================
// WIZARD STATE MANAGEMENT
// ============================================================================

export interface QRTrackingWizardState {
  currentStep: number;
  completedSteps: number[];
  
  step1_platform?: PlatformCapabilities;
  step2_program?: ProgramDetails;
  step3_data?: DataRequirements;
  step4_participants?: ParticipantDataUpload;
  step4_analysis?: DataAnalysisResult;
  step5_forms?: FormCustomization;
  step5_generated?: GeneratedForm[];
  step6_qr_strategy?: QRCodeStrategy; // Updated to match context
  step6_qr?: QRCodeStrategy; // Legacy support
  step6_generation?: QRCodeGeneration;
  step7_workflows?: WorkflowsTraining | WorkflowsAndTraining; // Support both types
  step7_generated?: GeneratedWorkflow[];
  step8_implementation?: ImplementationPlan;
  step8_deliverables?: FinalDeliverables;
  
  // Metadata
  wizardId?: string;
  organizationId?: string;
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status: 'draft' | 'in_progress' | 'completed';
}

// ============================================================================
// FIRESTORE COLLECTIONS
// ============================================================================

export const QR_TRACKING_COLLECTIONS = {
  WIZARD_STATES: 'qrTrackingWizards',
  PARTICIPANTS: 'qrParticipants',
  SESSIONS: 'qrSessions',
  ATTENDANCE: 'qrAttendance',
  FEEDBACK: 'qrFeedback',
  GENERATED_FORMS: 'qrGeneratedForms',
  QR_CODES: 'qrCodes'
} as const;

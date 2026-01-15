/**
 * Program Form Types
 * Defines the structure for program forms attached to MOUs/collaborations
 * with multi-level datasets for reporting at instructor, student, and nonprofit levels
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// PROGRAM FORM DEFINITION
// ============================================================================

export interface ProgramForm {
  id: string;
  collaborationId: string; // Links to the MOU/grant
  name: string;
  description: string;
  programType: ProgramType;
  status: 'draft' | 'active' | 'archived';
  
  // Multi-level datasets
  datasets: ProgramDatasets;
  
  // Form configuration
  instructorForm?: FormTemplate;
  studentForm?: FormTemplate;
  nonprofitForm?: FormTemplate;
  
  // Metadata
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export type ProgramType = 
  | 'digital_literacy'
  | 'health_education'
  | 'workforce_development'
  | 'community_outreach'
  | 'youth_program'
  | 'senior_services'
  | 'custom';

// ============================================================================
// MULTI-LEVEL DATASETS
// ============================================================================

export interface ProgramDatasets {
  // Instructor-level dataset
  instructor: DatasetConfig;
  
  // Student/Participant-level dataset
  student: DatasetConfig;
  
  // Nonprofit/Organization-level dataset
  nonprofit: DatasetConfig;
}

export interface DatasetConfig {
  id: string;
  name: string;
  description: string;
  fields: DatasetField[];
  enabled: boolean;
}

export interface DatasetField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select/radio fields
  validation?: FieldValidation;
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'signature';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

// ============================================================================
// FORM TEMPLATES
// ============================================================================

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  sections?: FormSection[];
}

export interface FormField {
  id: string;
  sectionId?: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  defaultValue?: any;
  validation?: FieldValidation;
  order: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
}

// ============================================================================
// PROGRAM FORM SUBMISSIONS
// ============================================================================

export interface ProgramFormSubmission {
  id: string;
  programFormId: string;
  formType: 'instructor' | 'student' | 'nonprofit';
  submittedBy: string;
  submittedByName: string;
  submittedAt: Date | Timestamp;
  data: Record<string, any>;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date | Timestamp;
  reviewNotes?: string;
}

// ============================================================================
// DIGITAL LITERACY PROGRAM SPECIFIC
// ============================================================================

export interface DigitalLiteracyProgram extends ProgramForm {
  programType: 'digital_literacy';
  
  // Program-specific configuration
  curriculum: {
    modules: CurriculumModule[];
    totalHours: number;
    certificationOffered: boolean;
  };
  
  // Target metrics
  targetMetrics: {
    enrollmentTarget: number;
    completionRateTarget: number;
    satisfactionTarget: number;
  };
}

export interface CurriculumModule {
  id: string;
  name: string;
  description: string;
  hours: number;
  order: number;
  skills: string[];
}

// ============================================================================
// DEFAULT DATASET CONFIGURATIONS
// ============================================================================

export const DEFAULT_INSTRUCTOR_FIELDS: DatasetField[] = [
  { id: 'instructor_id', name: 'instructor_id', label: 'Instructor ID', type: 'text', required: true },
  { id: 'instructor_name', name: 'instructor_name', label: 'Instructor Name', type: 'text', required: true },
  { id: 'instructor_email', name: 'instructor_email', label: 'Email', type: 'email', required: true },
  { id: 'instructor_phone', name: 'instructor_phone', label: 'Phone', type: 'phone', required: false },
  { id: 'organization', name: 'organization', label: 'Organization', type: 'text', required: true },
  { id: 'certification_status', name: 'certification_status', label: 'CHW Certification Status', type: 'select', required: true, options: ['Certified', 'In Training', 'Pending'] },
  { id: 'classes_taught', name: 'classes_taught', label: 'Classes Taught', type: 'number', required: false },
  { id: 'students_trained', name: 'students_trained', label: 'Students Trained', type: 'number', required: false },
  { id: 'start_date', name: 'start_date', label: 'Start Date', type: 'date', required: true },
  { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false },
];

export const DEFAULT_STUDENT_FIELDS: DatasetField[] = [
  { id: 'student_id', name: 'student_id', label: 'Student ID', type: 'text', required: true },
  { id: 'student_name', name: 'student_name', label: 'Student Name', type: 'text', required: true },
  { id: 'student_email', name: 'student_email', label: 'Email', type: 'email', required: false },
  { id: 'student_phone', name: 'student_phone', label: 'Phone', type: 'phone', required: false },
  { id: 'instructor_id', name: 'instructor_id', label: 'Instructor ID', type: 'text', required: true },
  { id: 'enrollment_date', name: 'enrollment_date', label: 'Enrollment Date', type: 'date', required: true },
  { id: 'completion_date', name: 'completion_date', label: 'Completion Date', type: 'date', required: false },
  { id: 'status', name: 'status', label: 'Status', type: 'select', required: true, options: ['Enrolled', 'In Progress', 'Completed', 'Dropped'] },
  { id: 'pre_assessment_score', name: 'pre_assessment_score', label: 'Pre-Assessment Score', type: 'number', required: false },
  { id: 'post_assessment_score', name: 'post_assessment_score', label: 'Post-Assessment Score', type: 'number', required: false },
  { id: 'modules_completed', name: 'modules_completed', label: 'Modules Completed', type: 'number', required: false },
  { id: 'hours_completed', name: 'hours_completed', label: 'Hours Completed', type: 'number', required: false },
  { id: 'satisfaction_rating', name: 'satisfaction_rating', label: 'Satisfaction Rating', type: 'select', required: false, options: ['1', '2', '3', '4', '5'] },
  { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false },
];

export const DEFAULT_NONPROFIT_FIELDS: DatasetField[] = [
  { id: 'nonprofit_id', name: 'nonprofit_id', label: 'Nonprofit ID', type: 'text', required: true },
  { id: 'nonprofit_name', name: 'nonprofit_name', label: 'Organization Name', type: 'text', required: true },
  { id: 'contact_name', name: 'contact_name', label: 'Contact Name', type: 'text', required: true },
  { id: 'contact_email', name: 'contact_email', label: 'Contact Email', type: 'email', required: true },
  { id: 'contact_phone', name: 'contact_phone', label: 'Contact Phone', type: 'phone', required: false },
  { id: 'reporting_period', name: 'reporting_period', label: 'Reporting Period', type: 'select', required: true, options: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'] },
  { id: 'total_instructors', name: 'total_instructors', label: 'Total Instructors', type: 'number', required: true },
  { id: 'total_students_enrolled', name: 'total_students_enrolled', label: 'Total Students Enrolled', type: 'number', required: true },
  { id: 'total_students_completed', name: 'total_students_completed', label: 'Total Students Completed', type: 'number', required: true },
  { id: 'total_classes_held', name: 'total_classes_held', label: 'Total Classes Held', type: 'number', required: true },
  { id: 'total_hours_delivered', name: 'total_hours_delivered', label: 'Total Hours Delivered', type: 'number', required: true },
  { id: 'avg_satisfaction_score', name: 'avg_satisfaction_score', label: 'Avg Satisfaction Score', type: 'number', required: false },
  { id: 'challenges', name: 'challenges', label: 'Challenges Encountered', type: 'textarea', required: false },
  { id: 'successes', name: 'successes', label: 'Successes/Highlights', type: 'textarea', required: false },
  { id: 'budget_spent', name: 'budget_spent', label: 'Budget Spent', type: 'number', required: false },
  { id: 'submission_date', name: 'submission_date', label: 'Submission Date', type: 'date', required: true },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createDefaultProgramDatasets(programName: string): ProgramDatasets {
  return {
    instructor: {
      id: `${programName.toLowerCase().replace(/\s+/g, '_')}_instructor_dataset`,
      name: `${programName} - Instructor Data`,
      description: 'Track instructor information, certifications, and teaching metrics',
      fields: [...DEFAULT_INSTRUCTOR_FIELDS],
      enabled: true,
    },
    student: {
      id: `${programName.toLowerCase().replace(/\s+/g, '_')}_student_dataset`,
      name: `${programName} - Student Data`,
      description: 'Track student enrollment, progress, and outcomes',
      fields: [...DEFAULT_STUDENT_FIELDS],
      enabled: true,
    },
    nonprofit: {
      id: `${programName.toLowerCase().replace(/\s+/g, '_')}_nonprofit_dataset`,
      name: `${programName} - Nonprofit Reporting`,
      description: 'Aggregate reporting data at the organization level',
      fields: [...DEFAULT_NONPROFIT_FIELDS],
      enabled: true,
    },
  };
}

export function getProgramTypeLabel(type: ProgramType): string {
  const labels: Record<ProgramType, string> = {
    digital_literacy: 'Digital Literacy Program',
    health_education: 'Health Education Program',
    workforce_development: 'Workforce Development Program',
    community_outreach: 'Community Outreach Program',
    youth_program: 'Youth Program',
    senior_services: 'Senior Services Program',
    custom: 'Custom Program',
  };
  return labels[type] || type;
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const FIRST_NAMES = ['Maria', 'James', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David'];
const LAST_NAMES = ['Garcia', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Martinez', 'Anderson'];
const ORGANIZATIONS = ['Community Health Center', 'Wellness Foundation', 'Family Services Inc', 'Hope Community Center', 'United Way Chapter'];

function randomName(): string {
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
}

function randomEmail(name: string): string {
  return `${name.toLowerCase().replace(' ', '.')}@example.org`;
}

function randomPhone(): string {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function randomDate(startDays: number, endDays: number): string {
  const start = new Date();
  start.setDate(start.getDate() - startDays);
  const end = new Date();
  end.setDate(end.getDate() - endDays);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

export function generateMockInstructorData(count: number = 5): Record<string, any>[] {
  const data: Record<string, any>[] = [];
  for (let i = 0; i < count; i++) {
    const name = randomName();
    data.push({
      instructor_id: `INS-${String(i + 1).padStart(4, '0')}`,
      instructor_name: name,
      instructor_email: randomEmail(name),
      instructor_phone: randomPhone(),
      organization: ORGANIZATIONS[Math.floor(Math.random() * ORGANIZATIONS.length)],
      certification_status: ['Certified', 'In Training', 'Pending'][Math.floor(Math.random() * 3)],
      classes_taught: Math.floor(Math.random() * 20) + 1,
      students_trained: Math.floor(Math.random() * 100) + 10,
      start_date: randomDate(365, 30),
      notes: ['Excellent instructor', 'New to program', 'Experienced trainer', ''][Math.floor(Math.random() * 4)],
    });
  }
  return data;
}

export function generateMockStudentData(count: number = 10): Record<string, any>[] {
  const data: Record<string, any>[] = [];
  const statuses = ['Enrolled', 'In Progress', 'Completed', 'Dropped'];
  for (let i = 0; i < count; i++) {
    const name = randomName();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const enrollmentDate = randomDate(180, 30);
    data.push({
      student_id: `STU-${String(i + 1).padStart(4, '0')}`,
      student_name: name,
      student_email: randomEmail(name),
      student_phone: randomPhone(),
      instructor_id: `INS-${String(Math.floor(Math.random() * 5) + 1).padStart(4, '0')}`,
      enrollment_date: enrollmentDate,
      completion_date: status === 'Completed' ? randomDate(30, 1) : '',
      status,
      pre_assessment_score: Math.floor(Math.random() * 40) + 30,
      post_assessment_score: status === 'Completed' ? Math.floor(Math.random() * 30) + 70 : '',
      modules_completed: status === 'Completed' ? 8 : Math.floor(Math.random() * 7) + 1,
      hours_completed: status === 'Completed' ? 40 : Math.floor(Math.random() * 35) + 5,
      satisfaction_rating: status === 'Completed' ? String(Math.floor(Math.random() * 2) + 4) : '',
      notes: '',
    });
  }
  return data;
}

export function generateMockNonprofitData(count: number = 3): Record<string, any>[] {
  const data: Record<string, any>[] = [];
  const periods = ['Q1', 'Q2', 'Q3', 'Q4'];
  for (let i = 0; i < count; i++) {
    const contactName = randomName();
    const orgName = ORGANIZATIONS[i % ORGANIZATIONS.length];
    const totalEnrolled = Math.floor(Math.random() * 50) + 20;
    const completionRate = Math.random() * 0.3 + 0.6;
    data.push({
      nonprofit_id: `NP-${String(i + 1).padStart(4, '0')}`,
      nonprofit_name: orgName,
      contact_name: contactName,
      contact_email: randomEmail(contactName),
      contact_phone: randomPhone(),
      reporting_period: periods[i % periods.length],
      total_instructors: Math.floor(Math.random() * 5) + 2,
      total_students_enrolled: totalEnrolled,
      total_students_completed: Math.floor(totalEnrolled * completionRate),
      total_classes_held: Math.floor(Math.random() * 15) + 5,
      total_hours_delivered: Math.floor(Math.random() * 200) + 100,
      avg_satisfaction_score: (Math.random() * 1 + 4).toFixed(1),
      challenges: ['Scheduling conflicts', 'Technology access issues', 'Transportation barriers'][Math.floor(Math.random() * 3)],
      successes: ['High completion rate', 'Positive feedback', 'Community engagement'][Math.floor(Math.random() * 3)],
      budget_spent: Math.floor(Math.random() * 10000) + 5000,
      submission_date: randomDate(30, 1),
    });
  }
  return data;
}

/**
 * CHW Levels Information
 * 
 * This file contains detailed information about Community Health Worker (CHW) certification levels
 * based on WL4WJ standards and requirements.
 */

export interface CHWLevel {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  competencies: string[];
  trainingHours: number;
  supervisionHours: number;
  recertificationPeriod: number; // in years
  color: string;
}

export const CHW_LEVELS: Record<string, CHWLevel> = {
  entry: {
    id: 'entry',
    name: 'Entry Level',
    description: 'Entry-level CHWs are beginning their career in community health work. They have completed basic training and are developing foundational skills in community outreach and health education.',
    requirements: [
      'High school diploma or equivalent',
      'Completion of basic CHW training program (minimum 80 hours)',
      'Basic knowledge of community resources',
      'Ability to communicate effectively with diverse populations'
    ],
    competencies: [
      'Basic health education and outreach',
      'Resource navigation and referrals',
      'Documentation and reporting',
      'Cultural sensitivity and awareness',
      'Basic communication skills'
    ],
    trainingHours: 80,
    supervisionHours: 40,
    recertificationPeriod: 1,
    color: '#4caf50' // Green
  },
  
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate Level',
    description: 'Intermediate CHWs have established experience in the field and can work more independently. They have developed specialized knowledge in specific health areas and can lead basic community health initiatives.',
    requirements: [
      'At least 1 year of experience as an Entry-Level CHW',
      'Additional 40 hours of specialized training',
      'Demonstrated ability to work independently',
      'Experience in at least one specialized health area'
    ],
    competencies: [
      'Advanced health education and outreach',
      'Case management and follow-up',
      'Community assessment and planning',
      'Group facilitation and presentation skills',
      'Specialized knowledge in specific health conditions',
      'Mentoring of entry-level CHWs'
    ],
    trainingHours: 120,
    supervisionHours: 20,
    recertificationPeriod: 2,
    color: '#2196f3' // Blue
  },
  
  advanced: {
    id: 'advanced',
    name: 'Advanced Level',
    description: 'Advanced CHWs are experienced professionals who can lead complex initiatives, train other CHWs, and contribute to program development. They have extensive knowledge in multiple health areas and strong leadership skills.',
    requirements: [
      'At least 3 years of experience as a CHW',
      'Completion of advanced CHW training (minimum 160 total hours)',
      'Demonstrated leadership in community health initiatives',
      'Expertise in multiple specialized health areas',
      'Experience in program development and evaluation'
    ],
    competencies: [
      'Program development and management',
      'Training and supervision of other CHWs',
      'Advanced case management',
      'Community mobilization and advocacy',
      'Research and evaluation',
      'Policy development and implementation',
      'Systems navigation and coordination',
      'Crisis intervention and management'
    ],
    trainingHours: 160,
    supervisionHours: 10,
    recertificationPeriod: 3,
    color: '#9c27b0' // Purple
  }
};

/**
 * WL4WJ Certification Requirements
 * 
 * These are the specific requirements for CHW certification through WL4WJ.
 */
export const CERTIFICATION_REQUIREMENTS = {
  core: [
    'Complete the required training hours for your certification level',
    'Pass the WL4WJ CHW competency assessment',
    'Complete the required supervised field experience hours',
    'Submit three professional references',
    'Sign the CHW Code of Ethics',
    'Complete a background check'
  ],
  
  recertification: [
    'Complete continuing education requirements (20 hours per year)',
    'Submit documentation of ongoing CHW work',
    'Complete recertification application',
    'Pay recertification fee'
  ],
  
  specializations: [
    'Maternal and Child Health',
    'Chronic Disease Management',
    'Mental Health',
    'Substance Use Disorders',
    'Elder Care',
    'Rural Health',
    'Cultural Competency',
    'Health Technology'
  ]
};

/**
 * Career Advancement Pathways
 * 
 * Potential career advancement opportunities for CHWs at different levels.
 */
export const CAREER_PATHWAYS = {
  entry: [
    'Community Outreach Worker',
    'Health Educator Assistant',
    'Patient Navigator',
    'Resource Coordinator'
  ],
  
  intermediate: [
    'CHW Specialist',
    'Health Coach',
    'Case Manager',
    'Program Coordinator',
    'Community Health Educator'
  ],
  
  advanced: [
    'CHW Supervisor',
    'Program Manager',
    'CHW Trainer',
    'Community Health Director',
    'Policy Advocate',
    'Research Coordinator'
  ]
};

/**
 * Training Programs
 * 
 * WL4WJ-approved training programs for CHW certification.
 */
export const TRAINING_PROGRAMS = [
  {
    name: 'WL4WJ Core CHW Training',
    provider: 'WL4WJ Institute',
    hours: 80,
    format: 'Hybrid (online and in-person)',
    levels: ['entry'],
    website: 'https://www.wl4wj.org/training'
  },
  {
    name: 'Advanced CHW Certification Program',
    provider: 'WL4WJ Institute',
    hours: 40,
    format: 'In-person',
    levels: ['intermediate'],
    prerequisites: ['entry'],
    website: 'https://www.wl4wj.org/advanced-training'
  },
  {
    name: 'CHW Leadership and Management',
    provider: 'WL4WJ Institute',
    hours: 40,
    format: 'Hybrid (online and in-person)',
    levels: ['advanced'],
    prerequisites: ['intermediate'],
    website: 'https://www.wl4wj.org/leadership-training'
  },
  {
    name: 'Specialized Health Topic Modules',
    provider: 'WL4WJ Institute',
    hours: 20,
    format: 'Online',
    levels: ['entry', 'intermediate', 'advanced'],
    topics: CERTIFICATION_REQUIREMENTS.specializations,
    website: 'https://www.wl4wj.org/specialized-modules'
  }
];

/**
 * Get information about a specific CHW level
 * @param levelId The ID of the CHW level
 * @returns The CHW level information or null if not found
 */
export function getCHWLevel(levelId: string): CHWLevel | null {
  return CHW_LEVELS[levelId] || null;
}

/**
 * Get all CHW levels
 * @returns Array of all CHW levels
 */
export function getAllCHWLevels(): CHWLevel[] {
  return Object.values(CHW_LEVELS);
}

/**
 * Get career pathways for a specific CHW level
 * @param levelId The ID of the CHW level
 * @returns Array of career pathways or empty array if level not found
 */
export function getCareerPathways(levelId: string): string[] {
  return CAREER_PATHWAYS[levelId as keyof typeof CAREER_PATHWAYS] || [];
}

/**
 * Get training programs for a specific CHW level
 * @param levelId The ID of the CHW level
 * @returns Array of training programs for the specified level
 */
export function getTrainingPrograms(levelId: string): any[] {
  return TRAINING_PROGRAMS.filter(program => program.levels.includes(levelId));
}

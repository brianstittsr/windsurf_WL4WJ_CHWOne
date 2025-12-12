/**
 * WL4WJ Types
 * Data models for WL4WJ program goals and events
 */

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalCategory = 'recruitment' | 'outreach' | 'training' | 'health' | 'community' | 'other';

export interface ProgramGoal {
  id: string;
  name: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., "CHWs", "sessions", "assessments"
  startDate: Date;
  endDate: Date;
  status: GoalStatus;
  milestones?: GoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface GoalMilestone {
  id: string;
  name: string;
  targetValue: number;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue?: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  status?: GoalStatus;
}

export type EventType = 'meeting' | 'training' | 'event' | 'deadline' | 'workshop' | 'conference' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface WL4WJEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  status: EventStatus;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  isVirtual: boolean;
  virtualLink?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  flyerUrl?: string;
  flyerBase64?: string;
  maxAttendees?: number;
  registrationRequired: boolean;
  registrationLink?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  eventType: EventType;
  status?: EventStatus;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  isVirtual?: boolean;
  virtualLink?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  flyerUrl?: string;
  flyerBase64?: string;
  maxAttendees?: number;
  registrationRequired?: boolean;
  registrationLink?: string;
  notes?: string;
  tags?: string[];
}

// Goal category options
export const GOAL_CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: 'recruitment', label: 'CHW Recruitment' },
  { value: 'outreach', label: 'Community Outreach' },
  { value: 'training', label: 'Training & Education' },
  { value: 'health', label: 'Health Assessments' },
  { value: 'community', label: 'Community Programs' },
  { value: 'other', label: 'Other' }
];

// Event type options
export const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'meeting', label: 'Meeting', color: '#9C27B0' },
  { value: 'training', label: 'Training', color: '#2196F3' },
  { value: 'event', label: 'Community Event', color: '#4CAF50' },
  { value: 'deadline', label: 'Deadline', color: '#F44336' },
  { value: 'workshop', label: 'Workshop', color: '#FF9800' },
  { value: 'conference', label: 'Conference', color: '#00BCD4' },
  { value: 'other', label: 'Other', color: '#757575' }
];

/**
 * Nonprofit Collaboration Types
 * Defines the structure for nonprofit organization collaborations on grants
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// NONPROFIT MEMBERSHIP
// ============================================================================

export interface NonprofitMember {
  userId: string;
  nonprofitId: string;
  role: NonprofitMemberRole;
  title: string;
  department?: string;
  permissions: NonprofitMemberPermissions;
  joinedAt: Date | Timestamp;
  invitedBy?: string; // User ID
  status: 'active' | 'inactive' | 'pending';
}

export type NonprofitMemberRole = 'admin' | 'staff' | 'coordinator' | 'volunteer';

export interface NonprofitMemberPermissions {
  canCreateGrants: boolean;
  canEditGrants: boolean;
  canManageMembers: boolean;
  canViewFinancials: boolean;
  canManageCollaborations: boolean;
  canAddActivities: boolean;
  canUploadDocuments: boolean;
}

export interface MembershipRequest {
  id: string;
  userId: string;
  nonprofitId: string;
  requestedRole: NonprofitMemberRole;
  title: string;
  department?: string;
  statement: string; // Why they want to join
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date | Timestamp;
  reviewedBy?: string; // Admin user ID
  reviewedAt?: Date | Timestamp;
  reviewNotes?: string;
}

export interface MembershipInvitation {
  id: string;
  nonprofitId: string;
  invitedEmail: string;
  invitedUserId?: string; // If user exists in system
  role: NonprofitMemberRole;
  title: string;
  department?: string;
  permissions: NonprofitMemberPermissions;
  invitedBy: string; // Admin user ID
  invitedAt: Date | Timestamp;
  expiresAt: Date | Timestamp;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  acceptedAt?: Date | Timestamp;
}

// ============================================================================
// GRANT COLLABORATION
// ============================================================================

export interface GrantCollaboration {
  id: string;
  grantId: string;
  grantName: string;
  
  // Participating Organizations
  leadOrganization: LeadOrganization;
  partnerOrganizations: PartnerOrganization[];
  
  // Collaboration Details
  agreementDocument?: string; // URL to signed agreement
  mou?: string; // Memorandum of Understanding URL
  collaborationNotes: string;
  communicationPlan: CommunicationPlan;
  
  // Status
  status: CollaborationStatus;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string; // User ID
}

export type CollaborationStatus = 'draft' | 'active' | 'completed' | 'terminated' | 'on-hold';

export interface LeadOrganization {
  nonprofitId: string;
  nonprofitName: string;
  role: 'lead';
  responsibilities: string[];
  contactPerson: ContactPerson;
}

export interface PartnerOrganization {
  nonprofitId: string;
  nonprofitName: string;
  role: PartnerRole;
  responsibilities: string[];
  contactPerson: ContactPerson;
  budgetAllocation?: number;
  startDate?: Date | Timestamp;
  endDate?: Date | Timestamp;
  status: 'invited' | 'accepted' | 'declined' | 'active' | 'inactive';
  invitedAt?: Date | Timestamp;
  acceptedAt?: Date | Timestamp;
}

export type PartnerRole = 'partner' | 'subcontractor' | 'evaluator' | 'stakeholder' | 'consultant';

export interface ContactPerson {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
}

export interface CommunicationPlan {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as-needed';
  method: 'email' | 'meeting' | 'video-call' | 'phone' | 'both';
  nextMeeting?: Date | Timestamp;
  meetingSchedule?: string; // e.g., "First Monday of each month"
  primaryChannel?: string; // e.g., "Slack", "Teams", "Email"
}

// ============================================================================
// COLLABORATION ACTIVITIES
// ============================================================================

export interface CollaborationActivity {
  id: string;
  collaborationId: string;
  type: ActivityType;
  title: string;
  description: string;
  date: Date | Timestamp;
  
  // Participants
  nonprofitIds: string[]; // Organizations involved
  participants: ActivityParticipant[];
  
  // Attachments
  documents: ActivityDocument[];
  
  // Follow-up
  actionItems: ActionItem[];
  
  // Metadata
  createdBy: string; // User ID
  createdByName: string;
  createdByNonprofit: string; // Nonprofit ID
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export type ActivityType = 
  | 'meeting' 
  | 'report' 
  | 'milestone' 
  | 'issue' 
  | 'decision' 
  | 'communication'
  | 'training'
  | 'review'
  | 'other';

export interface ActivityParticipant {
  userId: string;
  name: string;
  nonprofitId: string;
  nonprofitName: string;
  role?: string;
}

export interface ActivityDocument {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // bytes
  uploadedBy: string; // User ID
  uploadedAt: Date | Timestamp;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string; // User ID
  assignedToName: string;
  assignedNonprofit: string; // Nonprofit ID
  assignedNonprofitName: string;
  dueDate: Date | Timestamp;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedDate?: Date | Timestamp;
  completedBy?: string; // User ID
  notes?: string;
}

// ============================================================================
// COLLABORATION MILESTONES
// ============================================================================

export interface CollaborationMilestone {
  id: string;
  collaborationId: string;
  name: string;
  description: string;
  dueDate: Date | Timestamp;
  
  // Responsibility
  responsibleNonprofit: string; // Nonprofit ID
  responsibleNonprofitName: string;
  responsiblePerson?: string; // User ID
  responsiblePersonName?: string;
  
  // Dependencies
  dependencies: string[]; // Other milestone IDs
  dependencyNames?: string[]; // For display
  
  // Deliverables
  deliverables: Deliverable[];
  
  // Status
  status: MilestoneStatus;
  completedDate?: Date | Timestamp;
  notes?: string;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export type MilestoneStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'at-risk';

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  completedDate?: Date | Timestamp;
  documentUrl?: string;
  documentName?: string;
  notes?: string;
}

// ============================================================================
// COLLABORATION DOCUMENTS
// ============================================================================

export interface CollaborationDocument {
  id: string;
  collaborationId: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  url: string;
  type: string; // MIME type
  size: number; // bytes
  version: number;
  
  // Access Control
  uploadedBy: string; // User ID
  uploadedByName: string;
  uploadedByNonprofit: string; // Nonprofit ID
  visibleTo: string[]; // Nonprofit IDs that can access
  
  // Metadata
  tags: string[];
  uploadedAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export type DocumentCategory = 
  | 'agreement' 
  | 'mou' 
  | 'report' 
  | 'meeting-minutes'
  | 'deliverable'
  | 'financial'
  | 'evaluation'
  | 'communication'
  | 'other';

// ============================================================================
// COLLABORATION INVITATIONS
// ============================================================================

export interface CollaborationInvitation {
  id: string;
  collaborationId: string;
  grantName: string;
  
  // Inviting Organization
  fromNonprofitId: string;
  fromNonprofitName: string;
  invitedBy: string; // User ID
  invitedByName: string;
  
  // Invited Organization
  toNonprofitId: string;
  toNonprofitName: string;
  toContactPerson?: ContactPerson;
  
  // Invitation Details
  proposedRole: PartnerRole;
  proposedResponsibilities: string[];
  proposedBudget?: number;
  message?: string;
  
  // Status
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedAt: Date | Timestamp;
  expiresAt: Date | Timestamp;
  respondedAt?: Date | Timestamp;
  respondedBy?: string; // User ID
  responseNotes?: string;
}

// ============================================================================
// COLLABORATION ANALYTICS
// ============================================================================

export interface CollaborationMetrics {
  collaborationId: string;
  
  // Activity Metrics
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesThisMonth: number;
  lastActivityDate?: Date | Timestamp;
  
  // Milestone Metrics
  totalMilestones: number;
  completedMilestones: number;
  delayedMilestones: number;
  upcomingMilestones: number;
  milestoneCompletionRate: number; // percentage
  
  // Action Item Metrics
  totalActionItems: number;
  completedActionItems: number;
  overdueActionItems: number;
  actionItemCompletionRate: number; // percentage
  
  // Document Metrics
  totalDocuments: number;
  documentsByCategory: Record<DocumentCategory, number>;
  
  // Partner Engagement
  partnerEngagement: {
    nonprofitId: string;
    nonprofitName: string;
    activitiesContributed: number;
    milestonesCompleted: number;
    documentsUploaded: number;
    lastActivityDate?: Date | Timestamp;
  }[];
  
  // Communication Metrics
  meetingsHeld: number;
  averageMeetingFrequency: number; // days between meetings
  lastMeetingDate?: Date | Timestamp;
  nextScheduledMeeting?: Date | Timestamp;
  
  // Overall Health Score
  healthScore: number; // 0-100
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'at-risk';
  
  // Calculated At
  calculatedAt: Date | Timestamp;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface CollaborationSummary {
  id: string;
  grantName: string;
  leadOrganizationName: string;
  partnerCount: number;
  status: CollaborationStatus;
  nextMilestone?: {
    name: string;
    dueDate: Date | Timestamp;
  };
  recentActivity?: {
    type: ActivityType;
    title: string;
    date: Date | Timestamp;
  };
  healthScore: number;
}

export interface CollaborationFilter {
  status?: CollaborationStatus[];
  nonprofitId?: string;
  role?: ('lead' | PartnerRole)[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface CollaborationSort {
  field: 'grantName' | 'createdAt' | 'updatedAt' | 'status' | 'healthScore';
  direction: 'asc' | 'desc';
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface CollaborationNotification {
  id: string;
  userId: string;
  collaborationId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date | Timestamp;
}

export type NotificationType =
  | 'invitation-received'
  | 'invitation-accepted'
  | 'invitation-declined'
  | 'activity-added'
  | 'action-item-assigned'
  | 'action-item-due'
  | 'milestone-approaching'
  | 'milestone-completed'
  | 'milestone-delayed'
  | 'document-uploaded'
  | 'collaboration-status-changed'
  | 'partner-added'
  | 'partner-removed'
  | 'meeting-scheduled'
  | 'report-submitted';

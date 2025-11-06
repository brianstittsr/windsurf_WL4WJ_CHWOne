import { BaseEntity } from "./hierarchy";

export type IdeaCategory = 
  | 'feature' 
  | 'usability' 
  | 'integration' 
  | 'accessibility' 
  | 'training' 
  | 'content'
  | 'other';

export type IdeaPriority = 'low' | 'medium' | 'high' | 'critical';

export type IdeaStatus = 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';

export interface IdeaVote {
  userId: string;
  timestamp: Date;
  value: 1 | -1; // upvote or downvote
}

export interface IdeaComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  isEdited?: boolean;
}

export interface PlatformIdea extends BaseEntity {
  title: string;
  description: string;
  submittedBy: {
    userId: string;
    name: string;
    email: string;
    role: string; // CHW, Nonprofit staff, etc.
  };
  organizationId?: string; // If submitted on behalf of an organization
  chwAssociationId?: string; // If submitted on behalf of a CHW Association
  category: IdeaCategory;
  status: IdeaStatus;
  priority?: IdeaPriority; // Set by admins
  votes: IdeaVote[];
  comments: IdeaComment[];
  adminNotes?: string; // Private notes for admins
  attachments?: string[]; // URLs to any attachments
  implementationDetails?: string; // Added when idea is implemented
  implementedAt?: Date; // When the idea was implemented
}

import { User } from 'firebase/auth';

// Organization
export interface TrainingOrganization {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  domains: string[]; // Custom domains
  admins: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    expiresAt: Date;
    paymentMethod?: string;
    autoRenew: boolean;
  };
  settings: {
    allowPublicCourses: boolean;
    requireApproval: boolean;
    customDomain?: string;
    brandingOptions: {
      showLogo: boolean;
      customCss?: string;
      customFavicon?: string;
    };
  };
}

// Course
export interface Course {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  thumbnail: string;
  modules: Module[];
  price: number;
  isPublished: boolean;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  reviewCount: number;
  certificateTemplate?: string;
  isPublic: boolean;
  prerequisites?: string[];
  learningObjectives: string[];
  targetAudience?: string;
  featured: boolean;
}

// Module
export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  content: ContentBlock[];
  quizzes: Quiz[];
  completionRequirements: CompletionRequirement[];
  duration: number; // in minutes
  isPublished: boolean;
  isLocked: boolean;
  unlockCondition?: {
    type: 'previous_module' | 'date' | 'custom';
    value: string;
  };
}

// Content Block
export interface ContentBlock {
  id: string;
  moduleId: string;
  type: 'text' | 'video' | 'image' | 'pdf' | 'audio' | 'html' | 'scorm' | 'assignment';
  title: string;
  content: string; // URL for media, HTML for text
  order: number;
  duration?: number; // in minutes
  required: boolean;
  metadata?: Record<string, any>;
}

// Quiz
export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  order: number;
  required: boolean;
}

// Question
export interface Question {
  id: string;
  quizId: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  order: number;
}

// Completion Requirement
export interface CompletionRequirement {
  id: string;
  moduleId: string;
  type: 'view_content' | 'complete_quiz' | 'submit_assignment' | 'time_spent';
  value: string; // Content ID, Quiz ID, Assignment ID, or time in minutes
  completed: boolean;
}

// Enrollment
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'expired' | 'suspended';
  progress: number; // 0-100%
  startDate: Date;
  completionDate?: Date;
  paymentId?: string;
  certificateId?: string;
  expiresAt?: Date;
  lastAccessedAt: Date;
  notes?: string;
  enrolledBy?: string; // User ID of admin who enrolled the user
}

// User Progress
export interface UserProgress {
  userId: string;
  courseId: string;
  moduleId: string;
  completedItems: string[]; // Content IDs, Quiz IDs
  quizScores: Record<string, number>;
  lastAccessed: Date;
  timeSpent: number; // in seconds
  completedAt?: Date;
  notes?: string;
}

// Payment
export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed' | 'disputed';
  gateway: 'stripe' | 'paypal' | 'cashapp' | 'affirm' | 'afterpay';
  gatewayPaymentId: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    customerEmail: string;
    customerName: string;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: {
      type: string;
      last4?: string;
      brand?: string;
    };
    receiptUrl?: string;
  };
  refundReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
}

// Certificate
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  issuedAt: Date;
  expiresAt?: Date;
  templateId: string;
  verificationCode: string;
  pdfUrl: string;
  metadata: {
    recipientName: string;
    courseName: string;
    organizationName: string;
    issuerName: string;
    completionDate: string;
    customFields?: Record<string, string>;
  };
}

// Review
export interface CourseReview {
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  response?: {
    text: string;
    respondedBy: string;
    respondedAt: Date;
  };
}

// Notification
export interface TrainingNotification {
  id: string;
  userId: string;
  type: 'enrollment' | 'completion' | 'reminder' | 'announcement' | 'certificate';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Report
export interface TrainingReport {
  id: string;
  organizationId: string;
  type: 'enrollment' | 'completion' | 'revenue' | 'user_activity' | 'course_performance';
  title: string;
  description: string;
  parameters: Record<string, any>;
  createdAt: Date;
  createdBy: string;
  lastGeneratedAt?: Date;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun: Date;
    recipients: string[];
  };
  results?: any;
}

// Discount
export interface CourseDiscount {
  id: string;
  courseId: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startsAt: Date;
  expiresAt?: Date;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  minimumPurchase?: number;
  applicableCourses?: string[]; // Course IDs
}

// Subscription
export interface TrainingSubscription {
  id: string;
  userId: string;
  organizationId: string;
  plan: 'monthly' | 'annual' | 'lifetime';
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  canceledAt?: Date;
  paymentMethod: {
    type: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  price: number;
  currency: string;
  autoRenew: boolean;
  gatewaySubscriptionId: string;
  gateway: 'stripe' | 'paypal';
}

// Assignment
export interface Assignment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  dueDate?: Date;
  points: number;
  rubric?: {
    criteria: {
      name: string;
      description: string;
      points: number;
    }[];
  };
  submissions: AssignmentSubmission[];
  order: number;
  required: boolean;
}

// Assignment Submission
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  submittedAt: Date;
  content: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
  status: 'submitted' | 'graded' | 'returned';
}

// Training User Profile (extends base user)
export interface TrainingUserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  title?: string;
  organization?: string;
  enrolledCourses: string[];
  completedCourses: string[];
  certificates: string[];
  preferences: {
    emailNotifications: boolean;
    language: string;
    timezone: string;
  };
  role: 'student' | 'instructor' | 'admin' | 'organization_admin';
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

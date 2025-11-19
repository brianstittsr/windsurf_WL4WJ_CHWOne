import { Timestamp } from 'firebase/firestore';

export interface CHWJob {
  id: string;
  title: string;
  organization: string;
  location: {
    city: string;
    state: string;
    county?: string;
    remote?: boolean;
    hybrid?: boolean;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  salary: {
    min?: number;
    max?: number;
    type: 'hourly' | 'annual' | 'contract';
    currency: string;
  };
  benefits?: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  experienceLevel: 'entry' | 'intermediate' | 'advanced' | 'any';
  requiredSkills: string[];
  preferredSkills?: string[];
  certificationRequired: boolean;
  languages?: string[];
  applicationDeadline?: Timestamp;
  startDate?: Timestamp;
  contactEmail: string;
  contactPhone?: string;
  applicationUrl?: string;
  postedDate: Timestamp;
  status: 'active' | 'filled' | 'closed' | 'draft';
  source: 'manual' | 'crawled' | 'imported';
  sourceUrl?: string;
  matchScore?: number; // AI-calculated match score for a specific CHW
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CHWJobRecommendation {
  id: string;
  chwId: string;
  jobId: string;
  matchScore: number;
  matchReasons: string[];
  status: 'pending' | 'viewed' | 'applied' | 'dismissed';
  notificationSent: boolean;
  notificationSentAt?: Timestamp;
  viewedAt?: Timestamp;
  appliedAt?: Timestamp;
  dismissedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface JobCrawlerConfig {
  id: string;
  name: string;
  enabled: boolean;
  url: string;
  crawlFrequency: 'daily' | 'weekly' | 'monthly';
  lastCrawlDate?: Timestamp;
  nextCrawlDate?: Timestamp;
  selectors?: {
    jobTitle?: string;
    organization?: string;
    location?: string;
    description?: string;
    requirements?: string;
    salary?: string;
    applicationUrl?: string;
  };
  filters?: {
    keywords?: string[];
    excludeKeywords?: string[];
    states?: string[];
    counties?: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface JobSearchCriteria {
  keywords?: string[];
  location?: {
    city?: string;
    state?: string;
    county?: string;
    radius?: number;
  };
  employmentType?: ('full-time' | 'part-time' | 'contract' | 'temporary')[];
  experienceLevel?: ('entry' | 'intermediate' | 'advanced' | 'any')[];
  salaryMin?: number;
  certificationRequired?: boolean;
  remote?: boolean;
  skills?: string[];
}

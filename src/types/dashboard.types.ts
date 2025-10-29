/**
 * Dashboard metrics types
 */

export interface CategoryCount {
  name: string;
  count: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalForms: number;
  publishedForms: number;
  totalSubmissions: number;
  submissionsThisMonth: number;
  averageCompletionTime: number; // seconds
  formCompletionRate: number; // percentage
  userEngagementScore: number; // 0-100 scale
  topFormCategories: CategoryCount[];
  submissionTrends: DateCount[];
  userActivityTrends: DateCount[];
}

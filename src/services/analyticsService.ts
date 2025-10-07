import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  COLLECTIONS,
  OrganizationMetrics,
  FormCategory
} from '@/types/firebase/schema';

class AnalyticsService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getOrganizationMetrics(organization: 'general' | 'region5' | 'wl4wj'): Promise<OrganizationMetrics> {
    const cacheKey = `metrics_${organization}`;

    // Check cache first
    const cached = this.getCachedData<OrganizationMetrics>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get data from various collections
      const [
        usersData,
        formsData,
        submissionsData,
        activityData
      ] = await Promise.all([
        this.getUsersMetrics(organization),
        this.getFormsMetrics(organization),
        this.getSubmissionsMetrics(organization),
        this.getActivityMetrics(organization)
      ]);

      const metrics: OrganizationMetrics = {
        totalUsers: usersData.totalUsers,
        activeUsers: usersData.activeUsers,
        totalForms: formsData.totalForms,
        publishedForms: formsData.publishedForms,
        totalSubmissions: submissionsData.totalSubmissions,
        submissionsThisMonth: submissionsData.submissionsThisMonth,
        averageCompletionTime: submissionsData.averageCompletionTime,
        formCompletionRate: submissionsData.formCompletionRate,
        userEngagementScore: activityData.userEngagementScore,
        topFormCategories: activityData.topFormCategories,
        submissionTrends: activityData.submissionTrends,
        userActivityTrends: activityData.userActivityTrends
      };

      // Cache the result
      this.setCachedData(cacheKey, metrics);

      return metrics;
    } catch (error) {
      console.error('Error fetching organization metrics:', error);
      // Return default metrics on error
      return this.getDefaultMetrics(organization);
    }
  }

  private async getUsersMetrics(organization: string) {
    try {
      // Get total users for this organization
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('organization', '==', organization)
      );
      const usersSnapshot = await getDocs(usersQuery);

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('organization', '==', organization),
        where('lastLoginAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);

      return {
        totalUsers: usersSnapshot.size,
        activeUsers: activeUsersSnapshot.size
      };
    } catch (error) {
      console.error('Error fetching users metrics:', error);
      return { totalUsers: 0, activeUsers: 0 };
    }
  }

  private async getFormsMetrics(organization: string) {
    try {
      const formsQuery = query(
        collection(db, COLLECTIONS.FORMS),
        where('organization', '==', organization)
      );
      const formsSnapshot = await getDocs(formsQuery);

      const publishedForms = formsSnapshot.docs.filter(
        doc => doc.data().status === 'published'
      ).length;

      return {
        totalForms: formsSnapshot.size,
        publishedForms
      };
    } catch (error) {
      console.error('Error fetching forms metrics:', error);
      return { totalForms: 0, publishedForms: 0 };
    }
  }

  private async getSubmissionsMetrics(organization: string) {
    try {
      // Get all submissions for forms in this organization
      const formsQuery = query(
        collection(db, COLLECTIONS.FORMS),
        where('organization', '==', organization)
      );
      const formsSnapshot = await getDocs(formsQuery);
      const formIds = formsSnapshot.docs.map(doc => doc.id);

      if (formIds.length === 0) {
        return {
          totalSubmissions: 0,
          submissionsThisMonth: 0,
          averageCompletionTime: 0,
          formCompletionRate: 0
        };
      }

      // Get submissions for these forms
      const submissionsQuery = query(
        collection(db, COLLECTIONS.FORM_SUBMISSIONS),
        where('formId', 'in', formIds.slice(0, 10)) // Firestore 'in' limit is 10
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);

      // Get submissions this month
      const thisMonth = new Date();
      thisMonth.setDate(1); // Start of current month

      const thisMonthSubmissions = submissionsSnapshot.docs.filter(
        doc => doc.data().submittedAt.toDate() >= thisMonth
      ).length;

      // Calculate average completion time (mock for now)
      const completionTimes = submissionsSnapshot.docs
        .map(doc => doc.data().metadata?.timeToComplete || 0)
        .filter(time => time > 0);

      const averageCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 300; // 5 minutes default

      // Calculate completion rate (mock for now)
      const formCompletionRate = Math.min(95, 60 + (submissionsSnapshot.size * 2));

      return {
        totalSubmissions: submissionsSnapshot.size,
        submissionsThisMonth: thisMonthSubmissions,
        averageCompletionTime,
        formCompletionRate
      };
    } catch (error) {
      console.error('Error fetching submissions metrics:', error);
      return {
        totalSubmissions: 0,
        submissionsThisMonth: 0,
        averageCompletionTime: 300,
        formCompletionRate: 75
      };
    }
  }

  private async getActivityMetrics(organization: string) {
    try {
      // Get activity data for trends
      const activityQuery = query(
        collection(db, COLLECTIONS.ACTIVITY_LOGS),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const activitySnapshot = await getDocs(activityQuery);

      // Calculate user engagement score (0-100)
      const userEngagementScore = Math.min(100, activitySnapshot.size * 2);

      // Get top form categories (mock data for now)
      const topFormCategories = [
        { category: 'intake' as FormCategory, count: 15, percentage: 25 },
        { category: 'health' as FormCategory, count: 12, percentage: 20 },
        { category: 'training' as FormCategory, count: 10, percentage: 17 },
        { category: 'evaluation' as FormCategory, count: 8, percentage: 13 },
        { category: 'followup' as FormCategory, count: 6, percentage: 10 }
      ];

      // Generate submission trends for last 7 days
      const submissionTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 20) + 5 // Mock data
        };
      });

      // Generate user activity trends
      const userActivityTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 15) + 3 // Mock data
        };
      });

      return {
        userEngagementScore,
        topFormCategories,
        submissionTrends,
        userActivityTrends
      };
    } catch (error) {
      console.error('Error fetching activity metrics:', error);
      return this.getDefaultActivityMetrics();
    }
  }

  private getDefaultMetrics(organization: 'general' | 'region5' | 'wl4wj'): OrganizationMetrics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalForms: 0,
      publishedForms: 0,
      totalSubmissions: 0,
      submissionsThisMonth: 0,
      averageCompletionTime: 300,
      formCompletionRate: 75,
      userEngagementScore: 50,
      topFormCategories: [],
      submissionTrends: [],
      userActivityTrends: []
    };
  }

  // Public method to get default metrics
  public getDefaultOrganizationMetrics(organization: 'general' | 'region5' | 'wl4wj'): OrganizationMetrics {
    return this.getDefaultMetrics(organization);
  }

  private getDefaultActivityMetrics() {
    return {
      userEngagementScore: 50,
      topFormCategories: [
        { category: 'intake' as FormCategory, count: 0, percentage: 0 },
        { category: 'health' as FormCategory, count: 0, percentage: 0 },
        { category: 'training' as FormCategory, count: 0, percentage: 0 }
      ],
      submissionTrends: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          value: 0
        };
      }),
      userActivityTrends: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          value: 0
        };
      })
    };
  }

  // Clear cache (useful for development/testing)
  clearCache(): void {
    this.cache.clear();
  }

  // Get real-time metrics (bypass cache)
  async getRealTimeMetrics(organization: 'general' | 'region5' | 'wl4wj'): Promise<OrganizationMetrics> {
    this.cache.delete(`metrics_${organization}`);
    return this.getOrganizationMetrics(organization);
  }
}

export const analyticsService = new AnalyticsService();

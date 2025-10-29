'use client';

import { DashboardMetrics } from '@/types/dashboard.types';

/**
 * Dashboard service for fetching dashboard metrics
 * This is a simplified version that returns mock data
 */
class DashboardService {
  /**
   * Get dashboard metrics for an organization
   */
  async getDashboardMetrics(organizationId?: string): Promise<DashboardMetrics> {
    console.log('%c[SERVICE] getDashboardMetrics disabled, using mock data', 'color: #805ad5;', {
      timestamp: new Date().toISOString(),
      organizationId
    });
    
    // Return mock data
    return this.getMockDashboardMetrics();
  }
  
  /**
   * Get mock dashboard metrics
   */
  private getMockDashboardMetrics(): DashboardMetrics {
    return {
      totalUsers: 50,
      activeUsers: 24,
      totalForms: 15,
      publishedForms: 12,
      totalSubmissions: 120,
      submissionsThisMonth: 45,
      averageCompletionTime: 300, // seconds
      formCompletionRate: 75, // percentage
      userEngagementScore: 50, // 0-100 scale
      topFormCategories: [
        { name: 'Health Assessment', count: 45 },
        { name: 'Referral', count: 32 },
        { name: 'Follow-up', count: 28 },
        { name: 'Intake', count: 15 }
      ],
      submissionTrends: [
        { date: '2023-01', count: 10 },
        { date: '2023-02', count: 15 },
        { date: '2023-03', count: 12 },
        { date: '2023-04', count: 18 },
        { date: '2023-05', count: 22 },
        { date: '2023-06', count: 20 }
      ],
      userActivityTrends: [
        { date: '2023-01', count: 5 },
        { date: '2023-02', count: 8 },
        { date: '2023-03', count: 7 },
        { date: '2023-04', count: 10 },
        { date: '2023-05', count: 12 },
        { date: '2023-06', count: 15 }
      ]
    };
  }
  
  /**
   * Get active CHWs count
   */
  async getActiveCHWsCount(): Promise<number> {
    console.log('%c[SERVICE] getActiveCHWsCount disabled, using mock data', 'color: #805ad5;', {
      timestamp: new Date().toISOString()
    });
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Return mock value
    return 24;
  }

  /**
   * Get active projects count
   */
  async getActiveProjectsCount(): Promise<number> {
    console.log('%c[SERVICE] getActiveProjectsCount disabled, using mock data', 'color: #805ad5;', {
      timestamp: new Date().toISOString()
    });
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Return mock value
    return 12;
  }
  
  /**
   * Get active grants count
   */
  async getActiveGrantsCount(): Promise<number> {
    console.log('%c[SERVICE] getActiveGrantsCount disabled, using mock data', 'color: #805ad5;', {
      timestamp: new Date().toISOString()
    });
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Return mock value
    return 8;
  }
  
  /**
   * Get pending referrals count
   */
  async getPendingReferralsCount(): Promise<number> {
    console.log('%c[SERVICE] getPendingReferralsCount disabled, using mock data', 'color: #805ad5;', {
      timestamp: new Date().toISOString()
    });
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Return mock value
    return 15;
  }
}

// Create instance
const dashboardService = new DashboardService();

// Export
export { dashboardService };
export default dashboardService;

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  getDoc,
  addDoc,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  COLLECTIONS,
  DashboardMetrics,
  UserRole
} from '@/lib/schema/unified-schema';
import { getLatestDashboardMetrics } from '@/lib/schema/data-access';

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
  latency?: number; // in ms
  isPermissionsError?: boolean; // Indicates if the error is related to Firebase permissions
}

class DashboardService {
  private connectionStatus: DatabaseConnectionStatus = {
    isConnected: false,
    lastChecked: new Date()
  };

  constructor() {
    // Check connection on initialization
    this.checkDatabaseConnection();
  }

  /**
   * Check if the Firebase database is connected
   */
  async checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
    const startTime = performance.now();
    
    try {
      // Try to fetch a small document to test connection
      const testDocRef = doc(db, 'system', 'connection_test');
      const docSnap = await getDoc(testDocRef);
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      // If the document doesn't exist, try to initialize the schema
      if (!docSnap.exists()) {
        try {
          // Import the schema module dynamically to avoid circular dependencies
          const { initializeFirebaseSchema } = await import('@/lib/schema/initialize-schema');
          await initializeFirebaseSchema();
          console.log('Firebase schema initialized successfully');
        } catch (schemaError) {
          console.error('Error initializing schema:', schemaError);
          // Continue anyway - the permissions error might be fixed by the rules update
        }
      }
      
      this.connectionStatus = {
        isConnected: true,
        lastChecked: new Date(),
        latency
      };
    } catch (error) {
      console.error('Database connection error:', error);
      
      // Check if it's a permissions error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isPermissionsError = errorMessage.includes('permission') || errorMessage.includes('unauthorized');
      
      this.connectionStatus = {
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage,
        isPermissionsError
      };
      
      // If it's a permissions error, log helpful information
      if (isPermissionsError) {
        console.warn('Firebase permissions error detected. This may be fixed by updating your Firestore security rules.');
        console.warn('Try deploying the updated security rules using: npm run deploy-rules');
      }
    }
    
    return this.connectionStatus;
  }

  /**
   * Get the current database connection status
   */
  getConnectionStatus(): DatabaseConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Get dashboard metrics for a specific organization
   */
  async getDashboardMetrics(organizationId: string): Promise<DashboardMetrics | null> {
    try {
      // Use the unified schema data access layer
      const result = await getLatestDashboardMetrics(organizationId);
      
      if (result.success && result.metrics) {
        return result.metrics;
      }
      
      // Fallback to direct Firestore query if data access layer fails
      const metricsQuery = query(
        collection(db, COLLECTIONS.DASHBOARD_METRICS),
        where('organizationId', '==', organizationId),
        orderBy('date', 'desc'),
        limit(1)
      );
      
      const metricsSnapshot = await getDocs(metricsQuery);
      
      if (metricsSnapshot.empty) {
        // If no metrics found, create mock data
        const mockMetrics = this.getMockDashboardMetrics(organizationId);
        return mockMetrics;
      }
      
      const metricsDoc = metricsSnapshot.docs[0];
      return {
        id: metricsDoc.id,
        ...metricsDoc.data()
      } as DashboardMetrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return this.getMockDashboardMetrics(organizationId);
    }
  }

  /**
   * Get active CHWs count
   */
  async getActiveCHWsCount(): Promise<number> {
    try {
      const chwsQuery = query(
        collection(db, COLLECTIONS.CHW_PROFILES),
        where('isActive', '==', true)
      );
      
      const chwsSnapshot = await getDocs(chwsQuery);
      return chwsSnapshot.size;
    } catch (error) {
      console.error('Error fetching active CHWs count:', error);
      return 0;
    }
  }

  /**
   * Get active projects count
   */
  async getActiveProjectsCount(): Promise<number> {
    try {
      const projectsQuery = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('status', '==', 'active')
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      return projectsSnapshot.size;
    } catch (error) {
      console.error('Error fetching active projects count:', error);
      return 12; // Fallback mock value
    }
  }

  /**
   * Get active grants count
   */
  async getActiveGrantsCount(): Promise<number> {
    try {
      const grantsQuery = query(
        collection(db, COLLECTIONS.GRANTS),
        where('status', '==', 'active')
      );
      
      const grantsSnapshot = await getDocs(grantsQuery);
      return grantsSnapshot.size;
    } catch (error) {
      console.error('Error fetching active grants count:', error);
      return 8; // Fallback mock value
    }
  }

  /**
   * Get pending referrals count
   */
  async getPendingReferralsCount(): Promise<number> {
    try {
      const referralsQuery = query(
        collection(db, COLLECTIONS.REFERRALS),
        where('status', '==', 'pending')
      );
      
      const referralsSnapshot = await getDocs(referralsQuery);
      return referralsSnapshot.size;
    } catch (error) {
      console.error('Error fetching pending referrals count:', error);
      return 15; // Fallback mock value
    }
  }

  /**
   * Generate mock dashboard metrics for development
   */
  private getMockDashboardMetrics(organizationId: string): DashboardMetrics {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Create mock metrics based on organization
    const totalCHWs = organizationId === 'general' ? 45 : (organizationId === 'region5' ? 18 : 27);
    const activeCHWs = Math.floor(totalCHWs * 0.8); // 80% active
    
    return {
      id: `mock-${organizationId}-${date}`,
      organizationId,
      date,
      
      // CHW Metrics
      totalCHWs,
      activeCHWs,
      chwCaseloadUtilization: 0.75, // 75% utilization
      chwsByRegion: [
        { region: 'Charlotte Metro', count: Math.floor(totalCHWs * 0.4) },
        { region: 'Triangle', count: Math.floor(totalCHWs * 0.3) },
        { region: 'Western NC', count: Math.floor(totalCHWs * 0.2) },
        { region: 'Eastern NC', count: Math.floor(totalCHWs * 0.1) }
      ],
      
      // Client Metrics
      totalClients: totalCHWs * 15, // Average 15 clients per CHW
      activeClients: totalCHWs * 12, // 80% of clients are active
      clientsByStatus: [
        { status: 'active', count: totalCHWs * 12 },
        { status: 'inactive', count: totalCHWs * 2 },
        { status: 'completed', count: totalCHWs * 1 }
      ],
      
      // Referral Metrics
      totalReferrals: totalCHWs * 8,
      referralsByStatus: [
        { status: 'pending', count: totalCHWs * 2 },
        { status: 'contacted', count: totalCHWs * 2 },
        { status: 'scheduled', count: totalCHWs * 2 },
        { status: 'completed', count: totalCHWs * 2 }
      ],
      referralsByCategory: [
        { category: 'healthcare', count: totalCHWs * 3 },
        { category: 'housing', count: totalCHWs * 2 },
        { category: 'food_assistance', count: totalCHWs * 2 },
        { category: 'mental_health', count: totalCHWs * 1 }
      ],
      
      // Project & Grant Metrics
      activeProjects: organizationId === 'general' ? 12 : (organizationId === 'region5' ? 5 : 7),
      activeGrants: organizationId === 'general' ? 8 : (organizationId === 'region5' ? 3 : 5),
      totalGrantAmount: organizationId === 'general' ? 1200000 : (organizationId === 'region5' ? 500000 : 700000),
      grantUtilization: 0.65, // 65% of grant funds utilized
      
      // Form Metrics
      totalFormSubmissions: totalCHWs * 30,
      submissionsThisMonth: totalCHWs * 5,
      formCompletionRate: 0.85,
      averageCompletionTime: 240, // seconds
      
      // Time Series Data
      submissionTrends: Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toISOString().split('T')[0],
          count: Math.floor(Math.random() * totalCHWs) + 5
        };
      }),
      referralTrends: Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toISOString().split('T')[0],
          count: Math.floor(Math.random() * (totalCHWs / 2)) + 3
        };
      }),
      
      // Timestamp
      updatedAt: Timestamp.now()
    };
  }
}

export const dashboardService = new DashboardService();

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  OrganizationLicense,
  LicenseUsageLog,
  LicenseChangeLog,
  UserToolAccess,
  PlatformTool,
  LicenseStatus,
  LicensableEntityType,
  ToolLicense,
  calculateLicenseCost,
  LICENSE_COLLECTIONS,
  TOOL_PRICING
} from '@/types/licensing.types';

/**
 * Service for managing organization licenses and tool access
 */
export class LicenseService {
  /**
   * Create a new organization license (Admin only)
   */
  static async createLicense(
    licenseData: Omit<OrganizationLicense, 'id' | 'createdAt' | 'updatedAt'>,
    adminUserId: string
  ): Promise<string> {
    const licenseRef = doc(collection(db, LICENSE_COLLECTIONS.ORGANIZATION_LICENSES));
    
    const license: OrganizationLicense = {
      ...licenseData,
      id: licenseRef.id,
      grantedBy: adminUserId,
      grantedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(licenseRef, license);
    
    // Log the change
    await this.logLicenseChange({
      licenseId: licenseRef.id,
      entityId: licenseData.entityId,
      changeType: 'created',
      changedBy: adminUserId,
      changedByName: 'Admin',
      description: `License created for ${licenseData.entityName}`,
      timestamp: Timestamp.now()
    });
    
    return licenseRef.id;
  }
  
  /**
   * Get license by ID
   */
  static async getLicense(licenseId: string): Promise<OrganizationLicense | null> {
    const licenseRef = doc(db, LICENSE_COLLECTIONS.ORGANIZATION_LICENSES, licenseId);
    const licenseSnap = await getDoc(licenseRef);
    
    if (!licenseSnap.exists()) {
      return null;
    }
    
    return { id: licenseSnap.id, ...licenseSnap.data() } as OrganizationLicense;
  }
  
  /**
   * Get license by entity ID (nonprofit, CHW association, or medicaid region)
   */
  static async getLicenseByEntity(entityId: string): Promise<OrganizationLicense | null> {
    const q = query(
      collection(db, LICENSE_COLLECTIONS.ORGANIZATION_LICENSES),
      where('entityId', '==', entityId),
      where('status', '==', LicenseStatus.ACTIVE)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as OrganizationLicense;
  }
  
  /**
   * Get all licenses (Admin only)
   */
  static async getAllLicenses(): Promise<OrganizationLicense[]> {
    const q = query(
      collection(db, LICENSE_COLLECTIONS.ORGANIZATION_LICENSES),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as OrganizationLicense[];
  }
  
  /**
   * Update license (Admin only)
   */
  static async updateLicense(
    licenseId: string,
    updates: Partial<OrganizationLicense>,
    adminUserId: string
  ): Promise<void> {
    const licenseRef = doc(db, LICENSE_COLLECTIONS.ORGANIZATION_LICENSES, licenseId);
    
    // Get current license for comparison
    const currentLicense = await this.getLicense(licenseId);
    
    await updateDoc(licenseRef, {
      ...updates,
      lastModifiedBy: adminUserId,
      lastModifiedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log the change
    await this.logLicenseChange({
      licenseId,
      entityId: currentLicense?.entityId || '',
      changeType: 'updated',
      changedBy: adminUserId,
      changedByName: 'Admin',
      description: `License updated`,
      previousValue: currentLicense,
      newValue: updates,
      timestamp: Timestamp.now()
    });
  }
  
  /**
   * Grant tool access to organization (Admin only)
   */
  static async grantToolAccess(
    licenseId: string,
    tool: PlatformTool,
    maxUsers: number,
    adminUserId: string
  ): Promise<void> {
    const license = await this.getLicense(licenseId);
    if (!license) {
      throw new Error('License not found');
    }
    
    const toolLicense: ToolLicense = {
      tool,
      isEnabled: true,
      maxUsers,
      currentUsers: 0,
      pricePerUser: TOOL_PRICING[tool],
      enabledAt: Timestamp.now()
    };
    
    const updatedToolLicenses = [
      ...license.toolLicenses.filter(t => t.tool !== tool),
      toolLicense
    ];
    
    const totalCost = calculateLicenseCost(updatedToolLicenses, license.billingCycle);
    
    await this.updateLicense(
      licenseId,
      {
        toolLicenses: updatedToolLicenses,
        totalMonthlyCost: totalCost
      },
      adminUserId
    );
    
    // Log the change
    await this.logLicenseChange({
      licenseId,
      entityId: license.entityId,
      changeType: 'tool_added',
      changedBy: adminUserId,
      changedByName: 'Admin',
      description: `Granted access to ${tool} for ${maxUsers} users`,
      timestamp: Timestamp.now()
    });
  }
  
  /**
   * Revoke tool access from organization (Admin only)
   */
  static async revokeToolAccess(
    licenseId: string,
    tool: PlatformTool,
    adminUserId: string
  ): Promise<void> {
    const license = await this.getLicense(licenseId);
    if (!license) {
      throw new Error('License not found');
    }
    
    const updatedToolLicenses = license.toolLicenses.map(t => 
      t.tool === tool 
        ? { ...t, isEnabled: false, disabledAt: Timestamp.now() }
        : t
    );
    
    const totalCost = calculateLicenseCost(updatedToolLicenses, license.billingCycle);
    
    await this.updateLicense(
      licenseId,
      {
        toolLicenses: updatedToolLicenses,
        totalMonthlyCost: totalCost
      },
      adminUserId
    );
    
    // Log the change
    await this.logLicenseChange({
      licenseId,
      entityId: license.entityId,
      changeType: 'tool_removed',
      changedBy: adminUserId,
      changedByName: 'Admin',
      description: `Revoked access to ${tool}`,
      timestamp: Timestamp.now()
    });
  }
  
  /**
   * Get user's effective tool access based on their organization's license
   */
  static async getUserToolAccess(userId: string, organizationId: string): Promise<UserToolAccess | null> {
    const license = await this.getLicenseByEntity(organizationId);
    
    if (!license) {
      return {
        userId,
        organizationId,
        organizationName: 'Unknown',
        organizationType: LicensableEntityType.NONPROFIT_ORGANIZATION,
        availableTools: Object.values(PlatformTool).map(tool => ({
          tool,
          hasAccess: false,
          reason: 'No active license'
        })),
        licenseStatus: LicenseStatus.EXPIRED,
        computedAt: Timestamp.now()
      };
    }
    
    // Check if license is active
    const isActive = license.status === LicenseStatus.ACTIVE || license.status === LicenseStatus.TRIAL;
    const isExpired = license.endDate && license.endDate.toDate() < new Date();
    
    const availableTools = Object.values(PlatformTool).map(tool => {
      const toolLicense = license.toolLicenses.find(t => t.tool === tool);
      
      if (!toolLicense || !toolLicense.isEnabled) {
        return {
          tool,
          hasAccess: false,
          reason: 'Tool not licensed'
        };
      }
      
      if (!isActive || isExpired) {
        return {
          tool,
          hasAccess: false,
          reason: 'License expired or inactive'
        };
      }
      
      if (toolLicense.currentUsers >= toolLicense.maxUsers) {
        return {
          tool,
          hasAccess: false,
          reason: 'User limit reached'
        };
      }
      
      return {
        tool,
        hasAccess: true,
        reason: 'Access granted'
      };
    });
    
    return {
      userId,
      organizationId,
      organizationName: license.entityName,
      organizationType: license.entityType,
      availableTools,
      licenseStatus: license.status,
      licenseExpiresAt: license.endDate,
      computedAt: Timestamp.now()
    };
  }
  
  /**
   * Log license usage
   */
  static async logUsage(usageLog: Omit<LicenseUsageLog, 'id' | 'timestamp'>): Promise<void> {
    const logRef = doc(collection(db, LICENSE_COLLECTIONS.LICENSE_USAGE_LOGS));
    
    await setDoc(logRef, {
      ...usageLog,
      id: logRef.id,
      timestamp: Timestamp.now()
    });
  }
  
  /**
   * Log license change
   */
  static async logLicenseChange(changeLog: Omit<LicenseChangeLog, 'id'>): Promise<void> {
    const logRef = doc(collection(db, LICENSE_COLLECTIONS.LICENSE_CHANGE_LOGS));
    
    await setDoc(logRef, {
      ...changeLog,
      id: logRef.id
    });
  }
  
  /**
   * Get license usage logs
   */
  static async getUsageLogs(licenseId: string, limit: number = 100): Promise<LicenseUsageLog[]> {
    const q = query(
      collection(db, LICENSE_COLLECTIONS.LICENSE_USAGE_LOGS),
      where('licenseId', '==', licenseId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LicenseUsageLog[];
  }
  
  /**
   * Get license change history
   */
  static async getChangeHistory(licenseId: string): Promise<LicenseChangeLog[]> {
    const q = query(
      collection(db, LICENSE_COLLECTIONS.LICENSE_CHANGE_LOGS),
      where('licenseId', '==', licenseId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LicenseChangeLog[];
  }
  
  /**
   * Check if organization has reached user limit
   */
  static async checkUserLimit(licenseId: string): Promise<{
    hasCapacity: boolean;
    currentUsers: number;
    maxUsers: number;
  }> {
    const license = await this.getLicense(licenseId);
    
    if (!license) {
      return { hasCapacity: false, currentUsers: 0, maxUsers: 0 };
    }
    
    return {
      hasCapacity: license.activeUsers.length < license.totalLicensedUsers,
      currentUsers: license.activeUsers.length,
      maxUsers: license.totalLicensedUsers
    };
  }
  
  /**
   * Add user to active users list
   */
  static async addActiveUser(licenseId: string, userId: string): Promise<void> {
    const license = await this.getLicense(licenseId);
    
    if (!license) {
      throw new Error('License not found');
    }
    
    if (license.activeUsers.includes(userId)) {
      return; // User already active
    }
    
    if (license.activeUsers.length >= license.totalLicensedUsers) {
      throw new Error('User limit reached');
    }
    
    const licenseRef = doc(db, LICENSE_COLLECTIONS.ORGANIZATION_LICENSES, licenseId);
    await updateDoc(licenseRef, {
      activeUsers: [...license.activeUsers, userId],
      updatedAt: Timestamp.now()
    });
  }
  
  /**
   * Remove user from active users list
   */
  static async removeActiveUser(licenseId: string, userId: string): Promise<void> {
    const license = await this.getLicense(licenseId);
    
    if (!license) {
      throw new Error('License not found');
    }
    
    const licenseRef = doc(db, LICENSE_COLLECTIONS.ORGANIZATION_LICENSES, licenseId);
    await updateDoc(licenseRef, {
      activeUsers: license.activeUsers.filter(id => id !== userId),
      updatedAt: Timestamp.now()
    });
  }
}

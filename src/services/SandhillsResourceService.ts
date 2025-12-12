/**
 * Sandhills Resource Service
 * Firebase CRUD operations for community resources
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import {
  SandhillsResource,
  CreateSandhillsResourceInput,
  UpdateSandhillsResourceInput,
  SandhillsResourceFilters,
  ResourceType,
  ResourceStatus
} from '@/types/sandhills-resource.types';

const COLLECTION_NAME = 'sandhillsResources';

// Helper to convert Firestore document to SandhillsResource
const docToResource = (doc: DocumentData, id: string): SandhillsResource => {
  const data = doc;
  return {
    id,
    organization: data.organization || '',
    address: data.address,
    city: data.city,
    state: data.state || 'North Carolina',
    zip: data.zip,
    county: data.county,
    counties: data.counties || [],
    resourceType: data.resourceType || 'Other',
    // Verification fields
    isVerified: data.isVerified || false,
    verifiedDate: data.verifiedDate?.toDate(),
    verifiedBy: data.verifiedBy,
    // Claim fields
    isClaimed: data.isClaimed || false,
    claimedByUserId: data.claimedByUserId,
    claimedByOrganization: data.claimedByOrganization,
    claimDate: data.claimDate?.toDate(),
    ein: data.ein,
    department: data.department,
    contactPerson: data.contactPerson,
    contactPersonPhone: data.contactPersonPhone,
    contactPersonEmail: data.contactPersonEmail,
    generalContactName: data.generalContactName,
    generalContactPhone: data.generalContactPhone,
    website: data.website,
    lastContactDate: data.lastContactDate,
    currentStatus: data.currentStatus || 'Active',
    notes: data.notes,
    resourceDescription: data.resourceDescription,
    eligibility: data.eligibility,
    howToApply: data.howToApply,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy
  };
};

export class SandhillsResourceService {
  /**
   * Get all resources
   */
  static async getAll(): Promise<SandhillsResource[]> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      // Don't use orderBy to avoid index requirements - sort in memory instead
      const snapshot = await getDocs(resourcesRef);
      
      const resources = snapshot.docs.map(doc => docToResource(doc.data(), doc.id));
      // Sort in memory
      return resources.sort((a, b) => a.organization.localeCompare(b.organization));
    } catch (error) {
      console.error('Error fetching resources:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get resource by ID
   */
  static async getById(id: string): Promise<SandhillsResource | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return docToResource(docSnap.data(), docSnap.id);
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  }

  /**
   * Get resources by type
   */
  static async getByType(resourceType: ResourceType): Promise<SandhillsResource[]> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      const q = query(resourcesRef, where('resourceType', '==', resourceType));
      const snapshot = await getDocs(q);
      
      const resources = snapshot.docs.map(doc => docToResource(doc.data(), doc.id));
      return resources.sort((a, b) => a.organization.localeCompare(b.organization));
    } catch (error) {
      console.error('Error fetching resources by type:', error);
      return [];
    }
  }

  /**
   * Get resources by county
   */
  static async getByCounty(county: string): Promise<SandhillsResource[]> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      const q = query(resourcesRef, where('county', '==', county));
      const snapshot = await getDocs(q);
      
      const resources = snapshot.docs.map(doc => docToResource(doc.data(), doc.id));
      return resources.sort((a, b) => a.organization.localeCompare(b.organization));
    } catch (error) {
      console.error('Error fetching resources by county:', error);
      return [];
    }
  }

  /**
   * Search resources with filters
   */
  static async search(filters: SandhillsResourceFilters): Promise<SandhillsResource[]> {
    try {
      // Get all resources first, then filter in memory
      // This is more flexible for complex filtering
      const allResources = await this.getAll();
      
      return allResources.filter(resource => {
        // Filter by resource type
        if (filters.resourceType && resource.resourceType !== filters.resourceType) {
          return false;
        }
        
        // Filter by county
        if (filters.county && resource.county !== filters.county) {
          return false;
        }
        
        // Filter by status
        if (filters.status && resource.currentStatus !== filters.status) {
          return false;
        }
        
        // Search term filter (searches organization, description, notes)
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const searchableFields = [
            resource.organization,
            resource.resourceDescription,
            resource.notes,
            resource.department,
            resource.contactPerson,
            resource.city,
            resource.county
          ].filter(Boolean).join(' ').toLowerCase();
          
          if (!searchableFields.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error searching resources:', error);
      throw error;
    }
  }

  /**
   * Create a new resource
   */
  static async create(
    input: CreateSandhillsResourceInput,
    userId?: string
  ): Promise<SandhillsResource> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      
      const newResource = {
        ...input,
        state: input.state || 'North Carolina',
        currentStatus: input.currentStatus || 'Active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId
      };
      
      const docRef = await addDoc(resourcesRef, newResource);
      
      return {
        ...newResource,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      } as SandhillsResource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  /**
   * Update an existing resource
   */
  static async update(
    id: string,
    input: UpdateSandhillsResourceInput,
    userId?: string
  ): Promise<SandhillsResource> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const updateData = {
        ...input,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      };
      
      await updateDoc(docRef, updateData);
      
      // Fetch and return the updated resource
      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Resource not found after update');
      }
      
      return updated;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  }

  /**
   * Delete a resource
   */
  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }

  /**
   * Bulk create resources (for seeding data)
   */
  static async bulkCreate(
    resources: CreateSandhillsResourceInput[],
    userId?: string
  ): Promise<number> {
    try {
      let created = 0;
      
      for (const resource of resources) {
        await this.create(resource, userId);
        created++;
      }
      
      return created;
    } catch (error) {
      console.error('Error bulk creating resources:', error);
      throw error;
    }
  }

  /**
   * Get unique counties from all resources
   */
  static async getUniqueCounties(): Promise<string[]> {
    try {
      const resources = await this.getAll();
      const counties = new Set<string>();
      
      resources.forEach(r => {
        if (r.county) {
          counties.add(r.county);
        }
      });
      
      return Array.from(counties).sort();
    } catch (error) {
      console.error('Error fetching unique counties:', error);
      throw error;
    }
  }

  /**
   * Get resource counts by type
   */
  static async getCountsByType(): Promise<Record<string, number>> {
    try {
      const resources = await this.getAll();
      const counts: Record<string, number> = {};
      
      resources.forEach(r => {
        counts[r.resourceType] = (counts[r.resourceType] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      console.error('Error fetching counts by type:', error);
      return {}; // Return empty object instead of throwing
    }
  }
}

export default SandhillsResourceService;

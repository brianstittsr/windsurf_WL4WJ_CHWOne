import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { 
  Organization, 
  WithDate, 
  BaseEntity, 
  OrganizationType 
} from '@/types/hierarchy';
import RegionService from './RegionService';
import ChwAssociationService from './ChwAssociationService';

// Helper function to convert Firestore data to app data
const toAppOrganization = (id: string, data: any): WithDate<Organization> => ({
  id,
  name: data.name,
  type: data.type,
  regionId: data.regionId,
  chwAssociationId: data.chwAssociationId,
  isActive: data.isActive ?? true,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

class OrganizationService {
  private static readonly COLLECTION_NAME = 'organizations';

  static async createOrganization(
    orgData: Omit<Organization, keyof BaseEntity | 'id'> & { regionId?: string; chwAssociationId?: string }
  ): Promise<WithDate<Organization>> {
    // Validate organization type and required fields
    if (orgData.type === 'nonprofit' && !orgData.regionId) {
      throw new Error('Nonprofit organizations must be associated with a region');
    }

    if (orgData.type === 'chw_association' && !orgData.chwAssociationId) {
      throw new Error('CHW Associations must be associated with a state');
    }

    // If it's a nonprofit, verify the region exists
    if (orgData.type === 'nonprofit' && orgData.regionId) {
      const region = await RegionService.getRegion(orgData.regionId);
      if (!region) {
        throw new Error(`Region with ID ${orgData.regionId} does not exist`);
      }
      // Ensure the region has a CHW association
      if (!region.chwAssociationId) {
        throw new Error(`Region ${orgData.regionId} is not associated with any CHW Association`);
      }
      // Set the CHW association ID from the region
      orgData.chwAssociationId = region.chwAssociationId;
    }

    // If it's a CHW association, verify it exists
    if (orgData.type === 'chw_association' && orgData.chwAssociationId) {
      const association = await ChwAssociationService.getAssociation(orgData.chwAssociationId);
      if (!association) {
        throw new Error(`CHW Association with ID ${orgData.chwAssociationId} does not exist`);
      }
    }

    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
      ...orgData,
      createdAt: now,
      updatedAt: now,
    });

    // If this is a nonprofit, add it to its region
    if (orgData.type === 'nonprofit' && orgData.regionId) {
      await RegionService.addNonprofitToRegion(orgData.regionId, docRef.id);
    }

    return {
      id: docRef.id,
      ...orgData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as WithDate<Organization>;
  }

  static async getOrganization(id: string): Promise<WithDate<Organization> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppOrganization(docSnap.id, docSnap.data());
  }

  static async updateOrganization(
    id: string, 
    updates: Partial<Omit<Organization, keyof BaseEntity | 'type'>>
  ): Promise<void> {
    // If updating regionId, validate the new region
    if (updates.regionId) {
      const org = await this.getOrganization(id);
      if (org && org.type === 'nonprofit') {
        const region = await RegionService.getRegion(updates.regionId);
        if (!region) {
          throw new Error(`Region with ID ${updates.regionId} does not exist`);
        }
        
        // Update the region's nonprofit list
        if (org.regionId) {
          await RegionService.removeNonprofitFromRegion(org.regionId, id);
        }
        await RegionService.addNonprofitToRegion(updates.regionId, id);
        
        // Update the CHW association from the new region
        updates.chwAssociationId = region.chwAssociationId;
      }
    }

    const docRef = doc(db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteOrganization(id: string): Promise<void> {
    const org = await this.getOrganization(id);
    if (!org) return;

    // If it's a nonprofit, remove it from its region
    if (org.type === 'nonprofit' && org.regionId) {
      await RegionService.removeNonprofitFromRegion(org.regionId, id);
    }

    // Delete the organization
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  static async getOrganizationsByRegion(regionId: string): Promise<WithDate<Organization>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('regionId', '==', regionId),
      where('type', '==', 'nonprofit')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppOrganization(doc.id, doc.data())
    );
  }

  static async getOrganizationsByAssociation(chwAssociationId: string): Promise<WithDate<Organization>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('chwAssociationId', '==', chwAssociationId),
      where('type', 'in', ['chw_association', 'nonprofit'])
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppOrganization(doc.id, doc.data())
    );
  }

  static async getAllOrganizations(): Promise<WithDate<Organization>[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
    return querySnapshot.docs.map(doc => 
      toAppOrganization(doc.id, doc.data())
    );
  }
}

export default OrganizationService;

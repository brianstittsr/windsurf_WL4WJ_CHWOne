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
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { 
  UserProfile, 
  WithDate, 
  BaseEntity,
  Organization
} from '@/types/hierarchy';
import OrganizationService from './OrganizationService';
import RegionService from './RegionService';
import ChwAssociationService from './ChwAssociationService';

// Helper function to convert Firestore data to app data
const toAppUserProfile = (id: string, data: any): WithDate<UserProfile> => ({
  id,
  email: data.email,
  displayName: data.displayName,
  role: data.role,
  chwAssociationId: data.chwAssociationId,
  regionId: data.regionId,
  nonprofitId: data.nonprofitId,
  // Add required permissions field with default empty object if missing
  permissions: data.permissions || {},
  isActive: data.isActive !== undefined ? data.isActive : true,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

class UserService {
  private static readonly COLLECTION_NAME = 'users';

  static async createUser(
    userData: Omit<UserProfile, keyof BaseEntity | 'id'>
  ): Promise<WithDate<UserProfile>> {
    // Validate user's organization hierarchy
    await this.validateAndSetHierarchy(userData);

    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
      ...userData,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: docRef.id,
      ...userData,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async getUser(id: string): Promise<WithDate<UserProfile> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppUserProfile(docSnap.id, docSnap.data());
  }

  static async getUserByEmail(email: string): Promise<WithDate<UserProfile> | null> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return toAppUserProfile(doc.id, doc.data());
  }

  static async updateUser(
    id: string, 
    updates: Partial<Omit<UserProfile, keyof BaseEntity>>
  ): Promise<void> {
    // If updating organization-related fields, validate the hierarchy
    if (updates.nonprofitId || updates.regionId || updates.chwAssociationId) {
      const currentUser = await this.getUser(id);
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...currentUser,
        ...updates,
      };
      
      await this.validateAndSetHierarchy(updatedUser);
    }

    const docRef = doc(db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteUser(id: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  static async getUsersByNonprofit(nonprofitId: string): Promise<WithDate<UserProfile>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('nonprofitId', '==', nonprofitId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppUserProfile(doc.id, doc.data())
    );
  }

  static async getUsersByRegion(regionId: string): Promise<WithDate<UserProfile>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('regionId', '==', regionId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppUserProfile(doc.id, doc.data())
    );
  }

  static async getUsersByAssociation(chwAssociationId: string): Promise<WithDate<UserProfile>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('chwAssociationId', '==', chwAssociationId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppUserProfile(doc.id, doc.data())
    );
  }

  static async getAllUsers(): Promise<WithDate<UserProfile>[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
    return querySnapshot.docs.map(doc => 
      toAppUserProfile(doc.id, doc.data())
    );
  }

  private static async validateAndSetHierarchy(
    userData: Partial<UserProfile> & { nonprofitId?: string; regionId?: string; chwAssociationId?: string }
  ): Promise<void> {
    // If user is associated with a nonprofit
    if (userData.nonprofitId) {
      const nonprofit = await OrganizationService.getOrganization(userData.nonprofitId);
      if (!nonprofit || nonprofit.type !== 'nonprofit') {
        throw new Error('Invalid nonprofit organization');
      }
      
      // Set region and CHW association from nonprofit
      userData.regionId = nonprofit.regionId;
      userData.chwAssociationId = nonprofit.chwAssociationId;
      
      // Clear any direct region or CHW association
      delete userData.regionId;
      delete userData.chwAssociationId;
    } 
    // If user is associated with a region (but not a specific nonprofit)
    else if (userData.regionId) {
      const region = await RegionService.getRegion(userData.regionId);
      if (!region) {
        throw new Error('Invalid region');
      }
      
      // Set CHW association from region
      userData.chwAssociationId = region.chwAssociationId;
      
      // Clear any direct CHW association
      delete userData.chwAssociationId;
    }
    // If user is only associated with a CHW association
    else if (userData.chwAssociationId) {
      const association = await ChwAssociationService.getAssociation(userData.chwAssociationId);
      if (!association) {
        throw new Error('Invalid CHW association');
      }
    }
  }
  
  static async updateUserOrganization(
    userId: string, 
    organizationType: 'nonprofit' | 'region' | 'chw_association',
    organizationId: string | null
  ): Promise<void> {
    const batch = writeBatch(db);
    const userRef = doc(db, this.COLLECTION_NAME, userId);
    
    // First, clear all organization references
    const updates: any = {
      nonprofitId: null,
      regionId: null,
      chwAssociationId: null,
      updatedAt: serverTimestamp(),
    };
    
    // Then set the appropriate reference based on organization type
    if (organizationId) {
      switch (organizationType) {
        case 'nonprofit':
          updates.nonprofitId = organizationId;
          // The validateAndSetHierarchy will set the region and CHW association
          break;
        case 'region':
          updates.regionId = organizationId;
          // The validateAndSetHierarchy will set the CHW association
          break;
        case 'chw_association':
          updates.chwAssociationId = organizationId;
          break;
      }
    }
    
    // Get current user data to validate the hierarchy
    const currentUser = await this.getUser(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...currentUser,
      ...updates,
    };
    
    // This will validate the hierarchy and throw if invalid
    await this.validateAndSetHierarchy(updatedUser);
    
    // If we got here, the hierarchy is valid, so we can update the user
    batch.update(userRef, updates);
    
    await batch.commit();
  }
}

export default UserService;

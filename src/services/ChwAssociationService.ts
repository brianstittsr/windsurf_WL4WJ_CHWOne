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
  orderBy,
  limit,
  serverTimestamp, 
  arrayUnion,
  arrayRemove,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { CHWAssociation, WithDate, BaseEntity, CreateEntity, ApprovalStatus } from '@/types/hierarchy';
import StateService from './StateService';

// Helper function to convert Firestore data to app data
const toAppAssociation = (id: string, data: any): WithDate<CHWAssociation> => ({
  id,
  name: data.name || '',
  stateId: data.stateId || '',
  description: data.description || '',
  contactInfo: data.contactInfo || {
    email: '',
    phone: '',
    website: ''
  },
  logo: data.logo || undefined,
  primaryColor: data.primaryColor || undefined,
  administrators: data.administrators || [],
  approvalStatus: data.approvalStatus || 'approved',
  isActive: data.isActive !== undefined ? data.isActive : true,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

class CHWAssociationService {
  private static readonly COLLECTION_NAME = 'chwAssociations';

  static async createAssociation(
    associationData: CreateEntity<CHWAssociation>
  ): Promise<WithDate<CHWAssociation>> {
    // Verify state exists
    const state = await StateService.getState(associationData.stateId);
    if (!state) {
      throw new Error(`State with ID ${associationData.stateId} does not exist`);
    }

    const now = serverTimestamp();
    
    // Prepare data with required fields
    const newAssociation = {
      ...associationData,
      isActive: associationData.isActive ?? true,
      approvalStatus: associationData.approvalStatus || 'pending',
      administrators: associationData.administrators || [],
      createdAt: now,
      updatedAt: now,
    };
    
    // Generate a custom ID for easier reference
    const customId = `assoc-${Date.now()}`;
    await setDoc(doc(db, this.COLLECTION_NAME, customId), newAssociation);
    
    // Return the created association
    return {
      id: customId,
      ...associationData,
      isActive: associationData.isActive ?? true,
      approvalStatus: associationData.approvalStatus || 'pending',
      administrators: associationData.administrators || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async getAssociation(id: string): Promise<WithDate<CHWAssociation> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppAssociation(docSnap.id, docSnap.data());
  }

  static async updateAssociation(
    id: string, 
    updates: Partial<Omit<CHWAssociation, keyof BaseEntity>>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteAssociation(id: string): Promise<void> {
    // First check if the association has any nonprofits
    const hasNonprofits = await this.hasNonprofits(id);
    if (hasNonprofits) {
      throw new Error('Cannot delete association with linked nonprofits');
    }
    
    // Delete the association
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  static async updateApprovalStatus(id: string, status: ApprovalStatus): Promise<void> {
    const association = await this.getAssociation(id);
    if (!association) {
      throw new Error(`Association with ID ${id} not found`);
    }
    
    const updates: any = {
      approvalStatus: status,
      updatedAt: serverTimestamp()
    };
    
    // If approving, also set isActive to true
    if (status === 'approved') {
      updates.isActive = true;
    }
    
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  }

  static async getAssociationsByState(stateId: string): Promise<WithDate<CHWAssociation>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('stateId', '==', stateId),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppAssociation(doc.id, doc.data())
    );
  }
  
  static async getActiveAssociations(): Promise<WithDate<CHWAssociation>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppAssociation(doc.id, doc.data())
    );
  }
  
  static async getPendingAssociations(): Promise<WithDate<CHWAssociation>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('approvalStatus', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppAssociation(doc.id, doc.data())
    );
  }

  static async getAllAssociations(): Promise<WithDate<CHWAssociation>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppAssociation(doc.id, doc.data())
    );
  }
  
  // Check if an association has any nonprofits
  static async hasNonprofits(associationId: string): Promise<boolean> {
    const q = query(
      collection(db, 'nonprofits'),
      where('chwAssociationId', '==', associationId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
}

export default CHWAssociationService;

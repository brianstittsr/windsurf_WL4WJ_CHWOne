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
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { CHWAssociation, WithDate, BaseEntity, CreateEntity, ApprovalStatus, ClaimStatus, ClaimAttempt } from '@/types/hierarchy';
import StateService from './StateService';

// Helper functions
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const generateClaimToken = (): string => {
  return Math.random().toString(36).substr(2, 32);
};

// Helper function to convert Firestore data to app data
const toAppAssociation = (id: string, data: any): WithDate<CHWAssociation> => ({
  id,
  name: data.name || '',
  abbreviation: data.abbreviation || '',
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
  claimStatus: data.claimStatus || 'unclaimed',
  claimToken: data.claimToken,
  claimHistory: data.claimHistory ? data.claimHistory.map((claim: any) => ({
    ...claim,
    requestedAt: claim.requestedAt?.toDate() || new Date(),
    reviewedAt: claim.reviewedAt?.toDate(),
  })) : [],
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
    
    // Generate a claim token if not provided
    const claimToken = generateClaimToken();
    
    // Prepare data with required fields
    const newAssociation = {
      ...associationData,
      isActive: associationData.isActive ?? true,
      approvalStatus: associationData.approvalStatus || 'pending',
      administrators: associationData.administrators || [],
      claimStatus: associationData.claimStatus || 'unclaimed',
      claimToken,
      claimHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    
    // Generate a custom ID based on abbreviation if available
    const customId = associationData.abbreviation 
      ? `assoc-${associationData.abbreviation.toLowerCase().replace(/[^a-z0-9]/g, '')}` 
      : `assoc-${Date.now()}`;
      
    await setDoc(doc(db, this.COLLECTION_NAME, customId), newAssociation);
    
    // Return the created association
    return {
      id: customId,
      ...associationData,
      isActive: associationData.isActive ?? true,
      approvalStatus: associationData.approvalStatus || 'pending',
      administrators: associationData.administrators || [],
      claimStatus: 'unclaimed' as ClaimStatus,
      claimToken,
      claimHistory: [],
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
  
  // Set active status for an association
  static async setUserActiveStatus(associationId: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, associationId);
    await updateDoc(docRef, {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
  }
  
  /**
   * Create multiple CHW associations in a batch
   * @param associations Array of CHW associations to create
   * @param stateIds Optional mapping of state names to IDs
   * @returns Array of created association IDs
   */
  static async createAssociationsBatch(
    associations: Array<CreateEntity<CHWAssociation>>,
    stateIds: Record<string, string> = {}
  ): Promise<string[]> {
    const batch = writeBatch(db);
    const createdIds: string[] = [];
    
    for (const association of associations) {
      // Generate ID if not provided
      const docId = association.id || generateId();
      
      // Generate a claim token
      const claimToken = generateClaimToken();
      
      const docRef = doc(db, this.COLLECTION_NAME, docId);
      
      // Check if already exists
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        console.warn(`Association with ID ${docId} already exists, skipping`);
        // Skip to next iteration
        continue;
      }
      
      // Prepare association data
      const now = serverTimestamp();
      const newAssociation = {
        ...association,
        isActive: association.isActive ?? true,
        approvalStatus: 'approved', // Pre-registered associations are automatically approved
        administrators: association.administrators || [],
        claimStatus: 'unclaimed' as ClaimStatus,
        claimToken,
        claimHistory: [],
        createdAt: now,
        updatedAt: now,
      };
      
      // Add to batch
      batch.set(docRef, newAssociation);
      createdIds.push(docId);
    }
    
    // Commit batch if not empty
    if (createdIds.length > 0) {
      console.log(`Committing batch with ${createdIds.length} associations`);
      await batch.commit();
    } else {
      console.log('No valid associations to create');
    }
    
    return createdIds;
  }
  
  /**
   * Submit a claim request for an association
   * @param associationId Association ID to claim
   * @param claimData Claim request data
   */
  static async submitClaimRequest(
    associationId: string,
    claimData: Omit<ClaimAttempt, 'requestId' | 'status' | 'reviewedBy' | 'reviewedAt' | 'reviewNotes'>
  ): Promise<string> {
    const docRef = doc(db, this.COLLECTION_NAME, associationId);
    
    // Check if association exists and is claimable
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Association not found');
    }
    
    const data = docSnap.data();
    if (data.claimStatus !== 'unclaimed') {
      throw new Error(`Association is not claimable (current status: ${data.claimStatus})`);
    }
    
    // Generate a request ID
    const requestId = generateId();
    
    // Prepare the claim data
    const claimRequest: ClaimAttempt = {
      ...claimData,
      requestId,
      status: 'pending',
      requestedAt: serverTimestamp() as any,
    };
    
    // Update the association
    await updateDoc(docRef, {
      claimStatus: 'claim-pending',
      claimHistory: arrayUnion(claimRequest),
      updatedAt: serverTimestamp(),
    });
    
    return requestId;
  }
  
  /**
   * Process a claim request (approve or reject)
   * @param associationId Association ID
   * @param requestId Claim request ID
   * @param status New status (approved or rejected)
   * @param adminId Admin user ID processing the request
   * @param notes Optional notes
   */
  static async processClaimRequest(
    associationId: string,
    requestId: string,
    status: 'approved' | 'rejected',
    adminId: string,
    notes?: string
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, associationId);
    
    // Get current document
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Association not found');
    }
    
    const data = docSnap.data();
    const claimHistory = [...(data.claimHistory || [])];
    
    // Find the specific claim
    const claimIndex = claimHistory.findIndex(c => c.requestId === requestId);
    if (claimIndex === -1) {
      throw new Error('Claim request not found');
    }
    
    // Make a copy of the claim history to modify
    const updatedClaimHistory = [...claimHistory];
    
    // Update the claim request
    updatedClaimHistory[claimIndex] = {
      ...updatedClaimHistory[claimIndex],
      status,
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
      reviewNotes: notes,
    };
    
    // Prepare updates
    const updates: any = {
      claimStatus: status === 'approved' ? 'verified' : 'unclaimed',
      claimHistory: updatedClaimHistory,
      updatedAt: serverTimestamp(),
    };
    
    // If approved, add the requestor as an admin
    if (status === 'approved') {
      const requestorId = claimHistory[claimIndex].requestedBy;
      if (requestorId) {
        updates.administrators = arrayUnion(requestorId);
      }
    }
    
    // Update the document
    await updateDoc(docRef, updates);
  }
  
  /**
   * Get associations by claim status
   * @param status Claim status to filter by
   * @returns Array of associations with the specified claim status
   */
  static async getAssociationsByClaimStatus(status: ClaimStatus): Promise<WithDate<CHWAssociation>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('claimStatus', '==', status),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toAppAssociation(doc.id, doc.data()));
  }
  
  /**
   * Get pending claim requests
   * @returns Array of associations with pending claim requests
   */
  static async getPendingClaimRequests(): Promise<WithDate<CHWAssociation>[]> {
    return this.getAssociationsByClaimStatus('claim-pending');
  }
  
  /**
   * Get unclaimed associations
   * @returns Array of unclaimed associations
   */
  static async getUnclaimedAssociations(): Promise<WithDate<CHWAssociation>[]> {
    return this.getAssociationsByClaimStatus('unclaimed');
  }

  /**
   * Add a region to an association
   * @param chwAssociationId Association ID
   * @param regionId Region ID
   */
  static async addRegionToAssociation(chwAssociationId: string, regionId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, chwAssociationId);
    await updateDoc(docRef, {
      regionIds: arrayUnion(regionId),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Remove a region from an association
   * @param chwAssociationId Association ID
   * @param regionId Region ID
   */
  static async removeRegionFromAssociation(chwAssociationId: string, regionId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, chwAssociationId);
    await updateDoc(docRef, {
      regionIds: arrayRemove(regionId),
      updatedAt: serverTimestamp(),
    });
  }
}

export default CHWAssociationService;

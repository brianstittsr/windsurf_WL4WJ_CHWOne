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
import { ChwAssociation, WithDate, BaseEntity } from '@/types/hierarchy';
import StateService from './StateService';

// Helper function to convert Firestore data to app data
const toAppChwAssociation = (id: string, data: any): WithDate<ChwAssociation> => ({
  id,
  name: data.name,
  stateId: data.stateId,
  contactEmail: data.contactEmail,
  contactPhone: data.contactPhone,
  regionIds: data.regionIds || [],
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

class ChwAssociationService {
  private static readonly COLLECTION_NAME = 'chwAssociations';

  static async createAssociation(
    associationData: Omit<ChwAssociation, keyof BaseEntity | 'regionIds'>,
    stateId: string
  ): Promise<WithDate<ChwAssociation>> {
    // Verify state exists
    const state = await StateService.getState(stateId);
    if (!state) {
      throw new Error(`State with ID ${stateId} does not exist`);
    }

    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
      ...associationData,
      stateId,
      regionIds: [],
      createdAt: now,
      updatedAt: now,
    });

    // Update the state with this association
    await StateService.updateState(stateId, {
      chwAssociationId: docRef.id
    });

    return {
      id: docRef.id,
      ...associationData,
      stateId,
      regionIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async getAssociation(id: string): Promise<WithDate<ChwAssociation> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppChwAssociation(docSnap.id, docSnap.data());
  }

  static async updateAssociation(
    id: string, 
    updates: Partial<Omit<ChwAssociation, keyof BaseEntity | 'regionIds'>>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteAssociation(id: string): Promise<void> {
    // First get the association to update the state
    const association = await this.getAssociation(id);
    if (!association) return;

    // Delete the association
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);

    // Update the state to remove the association reference
    await StateService.updateState(association.stateId, {
      chwAssociationId: ''
    });
  }

  static async addRegionToAssociation(associationId: string, regionId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, associationId);
    await updateDoc(docRef, {
      regionIds: arrayUnion(regionId),
      updatedAt: serverTimestamp(),
    });
  }

  static async removeRegionFromAssociation(associationId: string, regionId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, associationId);
    await updateDoc(docRef, {
      regionIds: arrayRemove(regionId),
      updatedAt: serverTimestamp(),
    });
  }

  static async getAssociationsByState(stateId: string): Promise<WithDate<ChwAssociation>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('stateId', '==', stateId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppChwAssociation(doc.id, doc.data())
    );
  }

  static async getAllAssociations(): Promise<WithDate<ChwAssociation>[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
    return querySnapshot.docs.map(doc => 
      toAppChwAssociation(doc.id, doc.data())
    );
  }
}

export default ChwAssociationService;

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
import { Region, WithDate, BaseEntity } from '@/types/hierarchy';
import ChwAssociationService from './ChwAssociationService';
import StateService from './StateService';

// Helper function to convert Firestore data to app data
const toAppRegion = (id: string, data: any): WithDate<Region> => ({
  id,
  name: data.name,
  stateId: data.stateId,
  chwAssociationId: data.chwAssociationId,
  nonprofitIds: data.nonprofitIds || [],
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

class RegionService {
  private static readonly COLLECTION_NAME = 'regions';

  static async createRegion(
    regionData: Omit<Region, keyof BaseEntity | 'nonprofitIds' | 'chwAssociationId' | 'stateId'>,
    chwAssociationId: string
  ): Promise<WithDate<Region>> {
    // Get the CHW Association to get the state ID
    const association = await ChwAssociationService.getAssociation(chwAssociationId);
    if (!association) {
      throw new Error(`CHW Association with ID ${chwAssociationId} does not exist`);
    }

    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
      ...regionData,
      stateId: association.stateId,
      chwAssociationId,
      nonprofitIds: [],
      createdAt: now,
      updatedAt: now,
    });

    // Add this region to its CHW Association
    await ChwAssociationService.addRegionToAssociation(chwAssociationId, docRef.id);

    return {
      id: docRef.id,
      ...regionData,
      stateId: association.stateId,
      chwAssociationId,
      nonprofitIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async getRegion(id: string): Promise<WithDate<Region> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppRegion(docSnap.id, docSnap.data());
  }

  static async updateRegion(
    id: string, 
    updates: Partial<Omit<Region, keyof BaseEntity | 'nonprofitIds' | 'chwAssociationId' | 'stateId'>>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteRegion(id: string): Promise<void> {
    // First get the region to update the CHW Association
    const region = await this.getRegion(id);
    if (!region) return;

    // Remove the region from its CHW Association
    await ChwAssociationService.removeRegionFromAssociation(region.chwAssociationId, id);

    // Delete the region
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  static async addNonprofitToRegion(regionId: string, nonprofitId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, regionId);
    await updateDoc(docRef, {
      nonprofitIds: arrayUnion(nonprofitId),
      updatedAt: serverTimestamp(),
    });
  }

  static async removeNonprofitFromRegion(regionId: string, nonprofitId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, regionId);
    await updateDoc(docRef, {
      nonprofitIds: arrayRemove(nonprofitId),
      updatedAt: serverTimestamp(),
    });
  }

  static async getRegionsByAssociation(chwAssociationId: string): Promise<WithDate<Region>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('chwAssociationId', '==', chwAssociationId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppRegion(doc.id, doc.data())
    );
  }

  static async getRegionsByState(stateId: string): Promise<WithDate<Region>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('stateId', '==', stateId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppRegion(doc.id, doc.data())
    );
  }

  static async getAllRegions(): Promise<WithDate<Region>[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
    return querySnapshot.docs.map(doc => 
      toAppRegion(doc.id, doc.data())
    );
  }
}

export default RegionService;

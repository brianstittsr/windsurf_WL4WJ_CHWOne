import { db } from '@/lib/firebase/firebaseConfig';
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
  serverTimestamp, 
  Timestamp,
  setDoc,
  limit
} from 'firebase/firestore';
import { State, WithDate, BaseEntity, CreateEntity } from '@/types/hierarchy';

// Helper function to convert Firestore data to app data
const toAppState = (id: string, data: any): WithDate<State> => ({
  id,
  ...data,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

class StateService {
  private static readonly COLLECTION_NAME = 'states';

  static async createState(stateData: CreateEntity<State>): Promise<WithDate<State>> {
    // Generate a custom ID based on state abbreviation (lowercase)
    const stateId = stateData.abbreviation.toLowerCase();
    
    const now = serverTimestamp();
    const stateWithTimestamps = {
      ...stateData,
      isActive: stateData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    // Use setDoc with custom ID instead of addDoc
    await setDoc(doc(db, this.COLLECTION_NAME, stateId), stateWithTimestamps);

    // Create the return value with proper typing
    return {
      id: stateId,
      ...stateData,
      isActive: stateData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async getState(id: string): Promise<WithDate<State> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppState(docSnap.id, docSnap.data());
  }

  static async getStateByAbbreviation(abbreviation: string): Promise<WithDate<State> | null> {
    // Convert to lowercase for consistency
    const stateId = abbreviation.toLowerCase();
    return this.getState(stateId);
  }

  static async updateState(id: string, updates: Partial<Omit<State, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteState(id: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  static async getStatesByRegion(region: string): Promise<WithDate<State>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('region', '==', region),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppState(doc.id, doc.data())
    );
  }

  static async getActiveStates(): Promise<WithDate<State>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppState(doc.id, doc.data())
    );
  }

  static async getAllStates(): Promise<WithDate<State>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppState(doc.id, doc.data())
    );
  }
  
  // Check if any associations are linked to this state
  static async hasAssociations(stateId: string): Promise<boolean> {
    const q = query(
      collection(db, 'chwAssociations'),
      where('stateId', '==', stateId),
      // Limit to 1 since we only need to know if any exist
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
}

export default StateService;

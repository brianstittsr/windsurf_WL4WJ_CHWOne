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
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { State, WithDate, BaseEntity } from '@/types/hierarchy';

// Helper function to convert Firestore data to app data
const toAppState = (id: string, data: any): WithDate<State> => ({
  id,
  ...data,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

class StateService {
  private static readonly COLLECTION_NAME = 'states';

  static async createState(stateData: Omit<State, keyof BaseEntity>): Promise<WithDate<State>> {
    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
      ...stateData,
      createdAt: now,
      updatedAt: now,
    });

    // Create the return value with proper typing
    const newState: WithDate<State> = {
      id: docRef.id,
      name: stateData.name,
      code: stateData.code,
      chwAssociationId: stateData.chwAssociationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newState;
  }

  static async getState(id: string): Promise<WithDate<State> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppState(docSnap.id, docSnap.data());
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

  static async getStatesByAssociation(chwAssociationId: string): Promise<WithDate<State>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('chwAssociationId', '==', chwAssociationId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      toAppState(doc.id, doc.data())
    );
  }

  static async getAllStates(): Promise<WithDate<State>[]> {
    const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
    return querySnapshot.docs.map(doc => 
      toAppState(doc.id, doc.data())
    );
  }
}

export default StateService;

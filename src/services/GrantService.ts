import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { Grant } from '@/types/grant.types';

class GrantService {
  private static readonly COLLECTION_NAME = 'grants';

  static async createGrant(grantData: Partial<Grant>): Promise<string> {
    try {
      const grantCollection = collection(db, this.COLLECTION_NAME);
      
      const docRef = await addDoc(grantCollection, {
        ...grantData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Grant created with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating grant:', error);
      throw new Error('Failed to create grant.');
    }
  }
}

export default GrantService;

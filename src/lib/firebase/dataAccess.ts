import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth, handleFirebaseError } from './firebaseConfig';

// Mock data for fallback when Firebase is unavailable
import { getMockData } from '../mockData';

/**
 * Safely get a document from Firestore with error handling and fallback
 */
export async function safeGetDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error: any) {
    console.error(`Error getting ${collectionName}/${docId}:`, error);
    
    // Handle Firebase errors
    const errorInfo = handleFirebaseError(error);
    
    // Log detailed error information for debugging
    if (errorInfo.type === 'permission') {
      console.error(
        `Permission denied for ${collectionName}/${docId}. ` +
        `This usually means the current user doesn't have access to this document. ` +
        `Check your Firestore rules and make sure the user has the correct role.`
      );
      
      // Check if user is authenticated
      if (!auth.currentUser) {
        console.error('User is not authenticated. Log in first.');
      } else {
        console.log('Current user:', auth.currentUser.uid, auth.currentUser.email);
      }
    }
    
    // Use mock data as fallback
    if (errorInfo.type === 'offline' || errorInfo.type === 'permission') {
      const mockData = getMockData(collectionName, docId);
      if (mockData) {
        console.log(`Using mock data for ${collectionName}/${docId}`);
        return { success: true, data: mockData, isMock: true };
      }
    }
    
    return { 
      success: false, 
      error: errorInfo.message,
      errorType: errorInfo.type
    };
  }
}

/**
 * Safely query documents from Firestore with error handling and fallback
 */
export async function safeQueryDocuments(
  collectionName: string, 
  constraints: QueryConstraint[] = [],
  mockFallback = true
) {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: results };
  } catch (error: any) {
    console.error(`Error querying ${collectionName}:`, error);
    
    // Handle Firebase errors
    const errorInfo = handleFirebaseError(error);
    
    // Log detailed error information for debugging
    if (errorInfo.type === 'permission') {
      console.error(
        `Permission denied for query on ${collectionName}. ` +
        `This usually means the current user doesn't have access to this collection. ` +
        `Check your Firestore rules and make sure the user has the correct role.`
      );
      
      // Check if user is authenticated
      if (!auth.currentUser) {
        console.error('User is not authenticated. Log in first.');
      } else {
        console.log('Current user:', auth.currentUser.uid, auth.currentUser.email);
        console.log('Query constraints:', JSON.stringify(constraints));
      }
    }
    
    // Use mock data as fallback
    if (mockFallback && (errorInfo.type === 'offline' || errorInfo.type === 'permission')) {
      const mockData = getMockData(collectionName);
      if (mockData && Array.isArray(mockData)) {
        console.log(`Using mock data for ${collectionName} query`);
        return { success: true, data: mockData, isMock: true };
      }
    }
    
    return { 
      success: false, 
      error: errorInfo.message,
      errorType: errorInfo.type
    };
  }
}

/**
 * Safely add a document to Firestore with error handling
 */
export async function safeAddDocument(collectionName: string, data: DocumentData) {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error(`Error adding document to ${collectionName}:`, error);
    const errorInfo = handleFirebaseError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
      errorType: errorInfo.type
    };
  }
}

/**
 * Safely update a document in Firestore with error handling
 */
export async function safeUpdateDocument(collectionName: string, docId: string, data: DocumentData) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating ${collectionName}/${docId}:`, error);
    const errorInfo = handleFirebaseError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
      errorType: errorInfo.type
    };
  }
}

/**
 * Safely delete a document from Firestore with error handling
 */
export async function safeDeleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting ${collectionName}/${docId}:`, error);
    const errorInfo = handleFirebaseError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
      errorType: errorInfo.type
    };
  }
}

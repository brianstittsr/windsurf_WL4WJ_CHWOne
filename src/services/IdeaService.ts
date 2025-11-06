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
import { PlatformIdea, IdeaStatus, IdeaComment, IdeaVote, IdeaCategory, IdeaPriority } from '@/types/idea.types';
import { BaseEntity, WithDate } from '@/types/hierarchy';

// Helper function to convert Firestore data to app data
const toAppIdea = (id: string, data: any): WithDate<PlatformIdea> => ({
  id,
  title: data.title || '',
  description: data.description || '',
  submittedBy: data.submittedBy || {
    userId: '',
    name: '',
    email: '',
    role: ''
  },
  organizationId: data.organizationId,
  chwAssociationId: data.chwAssociationId,
  category: data.category || 'other',
  status: data.status || 'submitted',
  priority: data.priority,
  votes: (data.votes || []).map((vote: any) => ({
    ...vote,
    timestamp: vote.timestamp?.toDate() || new Date()
  })),
  comments: (data.comments || []).map((comment: any) => ({
    ...comment,
    timestamp: comment.timestamp?.toDate() || new Date()
  })),
  adminNotes: data.adminNotes,
  attachments: data.attachments || [],
  implementationDetails: data.implementationDetails,
  implementedAt: data.implementedAt?.toDate(),
  isActive: data.isActive !== undefined ? data.isActive : true,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

// Interface for creating a new idea
export interface CreateIdeaData {
  title: string;
  description: string;
  submittedBy: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  organizationId?: string;
  chwAssociationId?: string;
  category: IdeaCategory;
  attachments?: string[];
}

// Interface for updating idea status
export interface UpdateIdeaStatusData {
  status: IdeaStatus;
  adminNotes?: string;
  priority?: IdeaPriority;
  implementationDetails?: string;
}

class IdeaService {
  private static readonly COLLECTION_NAME = 'platformIdeas';

  /**
   * Create a new platform idea
   * @param ideaData Data for the new idea
   * @returns Created idea with ID
   */
  static async createIdea(
    ideaData: CreateIdeaData
  ): Promise<WithDate<PlatformIdea>> {
    const now = serverTimestamp();

    // Prepare data with required fields
    const newIdea = {
      ...ideaData,
      votes: [],
      comments: [],
      status: 'submitted' as IdeaStatus,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newIdea);
    
    // Return the created idea
    return {
      id: docRef.id,
      ...ideaData,
      votes: [],
      comments: [],
      status: 'submitted' as IdeaStatus,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get an idea by ID
   * @param id Idea ID
   * @returns Idea or null if not found
   */
  static async getIdea(id: string): Promise<WithDate<PlatformIdea> | null> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return toAppIdea(docSnap.id, docSnap.data());
  }

  /**
   * Update an idea's status and admin fields
   * @param id Idea ID
   * @param updates Status updates
   */
  static async updateIdeaStatus(
    id: string,
    updates: UpdateIdeaStatusData
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, id);
    
    const updateData: any = {
      status: updates.status,
      updatedAt: serverTimestamp()
    };

    if (updates.adminNotes !== undefined) {
      updateData.adminNotes = updates.adminNotes;
    }

    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }

    if (updates.implementationDetails !== undefined) {
      updateData.implementationDetails = updates.implementationDetails;
    }

    // If status is completed, set implementedAt
    if (updates.status === 'completed') {
      updateData.implementedAt = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
  }

  /**
   * Add a comment to an idea
   * @param ideaId Idea ID
   * @param comment Comment data
   */
  static async addComment(
    ideaId: string,
    comment: Omit<IdeaComment, 'timestamp'>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, ideaId);
    
    const commentWithTimestamp = {
      ...comment,
      timestamp: serverTimestamp()
    };

    await updateDoc(docRef, {
      comments: arrayUnion(commentWithTimestamp),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Vote on an idea
   * @param ideaId Idea ID
   * @param userId User ID
   * @param value Vote value (1 or -1)
   */
  static async voteOnIdea(
    ideaId: string,
    userId: string,
    value: 1 | -1
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, ideaId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Idea not found');
    }

    const data = docSnap.data();
    const votes = [...(data.votes || [])];
    
    // Check if user already voted
    const existingVoteIndex = votes.findIndex(v => v.userId === userId);
    
    if (existingVoteIndex !== -1) {
      // Remove existing vote
      await updateDoc(docRef, {
        votes: arrayRemove(votes[existingVoteIndex]),
        updatedAt: serverTimestamp()
      });
    }

    // Add new vote
    const newVote = {
      userId,
      value,
      timestamp: serverTimestamp()
    };

    await updateDoc(docRef, {
      votes: arrayUnion(newVote),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get all ideas
   * @param status Optional status filter
   * @param limit Optional limit on number of results
   * @returns Array of ideas
   */
  static async getAllIdeas(
    status?: IdeaStatus,
    resultLimit?: number
  ): Promise<WithDate<PlatformIdea>[]> {
    let q;
    
    if (status) {
      q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', status),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    if (resultLimit) {
      q = query(q, limit(resultLimit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toAppIdea(doc.id, doc.data()));
  }

  /**
   * Get ideas submitted by a specific user
   * @param userId User ID
   * @returns Array of ideas
   */
  static async getIdeasByUser(userId: string): Promise<WithDate<PlatformIdea>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('submittedBy.userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toAppIdea(doc.id, doc.data()));
  }

  /**
   * Get ideas submitted by a specific organization
   * @param organizationId Organization ID
   * @returns Array of ideas
   */
  static async getIdeasByOrganization(organizationId: string): Promise<WithDate<PlatformIdea>[]> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('organizationId', '==', organizationId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toAppIdea(doc.id, doc.data()));
  }

  /**
   * Search ideas by text
   * @param searchText Text to search for in title and description
   * @returns Array of matching ideas
   */
  static async searchIdeas(searchText: string): Promise<WithDate<PlatformIdea>[]> {
    // This is a simple implementation that gets all ideas and filters client-side
    // For a production app, consider using Algolia or similar search service
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const allIdeas = querySnapshot.docs.map(doc => toAppIdea(doc.id, doc.data()));
    
    // Filter ideas that contain the search text in title or description
    const searchTextLower = searchText.toLowerCase();
    return allIdeas.filter(idea => 
      idea.title.toLowerCase().includes(searchTextLower) || 
      idea.description.toLowerCase().includes(searchTextLower)
    );
  }
}

export default IdeaService;

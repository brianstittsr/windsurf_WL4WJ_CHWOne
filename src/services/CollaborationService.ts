/**
 * Collaboration Service
 * Manages nonprofit grant collaborations, activities, and milestones
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import {
  GrantCollaboration,
  CollaborationActivity,
  CollaborationMilestone,
  CollaborationDocument,
  CollaborationInvitation,
  NonprofitMember,
  MembershipRequest,
  MembershipInvitation,
  CollaborationMetrics,
  CollaborationSummary,
  CollaborationFilter,
  CollaborationSort,
} from '@/types/collaboration.types';

const COLLECTIONS = {
  COLLABORATIONS: 'grantCollaborations',
  ACTIVITIES: 'collaborationActivities',
  MILESTONES: 'collaborationMilestones',
  DOCUMENTS: 'collaborationDocuments',
  INVITATIONS: 'collaborationInvitations',
  NONPROFIT_MEMBERS: 'nonprofitMembers',
  MEMBERSHIP_REQUESTS: 'membershipRequests',
  MEMBERSHIP_INVITATIONS: 'membershipInvitations',
};

export class CollaborationService {
  // ============================================================================
  // GRANT COLLABORATION MANAGEMENT
  // ============================================================================

  /**
   * Create a new grant collaboration
   */
  static async createCollaboration(
    data: Omit<GrantCollaboration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; collaborationId?: string; error?: string }> {
    try {
      const collaborationRef = doc(collection(db, COLLECTIONS.COLLABORATIONS));
      const collaborationId = collaborationRef.id;

      const collaboration: GrantCollaboration = {
        ...data,
        id: collaborationId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(collaborationRef, collaboration);

      return { success: true, collaborationId };
    } catch (error) {
      console.error('Error creating collaboration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create collaboration',
      };
    }
  }

  /**
   * Get collaboration by ID
   */
  static async getCollaboration(
    collaborationId: string
  ): Promise<GrantCollaboration | null> {
    try {
      const docRef = doc(db, COLLECTIONS.COLLABORATIONS, collaborationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as GrantCollaboration;
      }
      return null;
    } catch (error) {
      console.error('Error getting collaboration:', error);
      return null;
    }
  }

  /**
   * Get all collaborations for a nonprofit
   */
  static async getCollaborationsByNonprofit(
    nonprofitId: string,
    filters?: CollaborationFilter
  ): Promise<GrantCollaboration[]> {
    try {
      const collaborationsRef = collection(db, COLLECTIONS.COLLABORATIONS);
      
      // Build query
      let q = query(collaborationsRef);

      // Filter by status if provided
      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      const querySnapshot = await getDocs(q);
      const collaborations: GrantCollaboration[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as GrantCollaboration;
        
        // Check if nonprofit is lead or partner
        const isLead = data.leadOrganization.nonprofitId === nonprofitId;
        const isPartner = data.partnerOrganizations.some(
          (p) => p.nonprofitId === nonprofitId
        );

        if (isLead || isPartner) {
          collaborations.push(data);
        }
      });

      return collaborations;
    } catch (error) {
      console.error('Error getting collaborations:', error);
      return [];
    }
  }

  /**
   * Update collaboration
   */
  static async updateCollaboration(
    collaborationId: string,
    updates: Partial<GrantCollaboration>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, COLLECTIONS.COLLABORATIONS, collaborationId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating collaboration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update collaboration',
      };
    }
  }

  /**
   * Delete collaboration
   */
  static async deleteCollaboration(
    collaborationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const batch = writeBatch(db);

      // Delete collaboration document
      const collaborationRef = doc(db, COLLECTIONS.COLLABORATIONS, collaborationId);
      batch.delete(collaborationRef);

      // Delete related activities
      const activitiesQuery = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('collaborationId', '==', collaborationId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      activitiesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete related milestones
      const milestonesQuery = query(
        collection(db, COLLECTIONS.MILESTONES),
        where('collaborationId', '==', collaborationId)
      );
      const milestonesSnapshot = await getDocs(milestonesQuery);
      milestonesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Error deleting collaboration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete collaboration',
      };
    }
  }

  // ============================================================================
  // COLLABORATION ACTIVITIES
  // ============================================================================

  /**
   * Add activity to collaboration
   */
  static async addActivity(
    data: Omit<CollaborationActivity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; activityId?: string; error?: string }> {
    try {
      const activityRef = doc(collection(db, COLLECTIONS.ACTIVITIES));
      const activityId = activityRef.id;

      const activity: CollaborationActivity = {
        ...data,
        id: activityId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(activityRef, activity);

      // Update collaboration's updatedAt timestamp
      await this.updateCollaboration(data.collaborationId, {});

      return { success: true, activityId };
    } catch (error) {
      console.error('Error adding activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add activity',
      };
    }
  }

  /**
   * Get activities for a collaboration
   */
  static async getActivities(
    collaborationId: string,
    limitCount?: number
  ): Promise<CollaborationActivity[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('collaborationId', '==', collaborationId),
        orderBy('date', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const activities: CollaborationActivity[] = [];

      querySnapshot.forEach((doc) => {
        activities.push(doc.data() as CollaborationActivity);
      });

      return activities;
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  /**
   * Update activity
   */
  static async updateActivity(
    activityId: string,
    updates: Partial<CollaborationActivity>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, COLLECTIONS.ACTIVITIES, activityId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update activity',
      };
    }
  }

  // ============================================================================
  // COLLABORATION MILESTONES
  // ============================================================================

  /**
   * Add milestone to collaboration
   */
  static async addMilestone(
    data: Omit<CollaborationMilestone, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; milestoneId?: string; error?: string }> {
    try {
      const milestoneRef = doc(collection(db, COLLECTIONS.MILESTONES));
      const milestoneId = milestoneRef.id;

      const milestone: CollaborationMilestone = {
        ...data,
        id: milestoneId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(milestoneRef, milestone);

      return { success: true, milestoneId };
    } catch (error) {
      console.error('Error adding milestone:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add milestone',
      };
    }
  }

  /**
   * Get milestones for a collaboration
   */
  static async getMilestones(
    collaborationId: string
  ): Promise<CollaborationMilestone[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.MILESTONES),
        where('collaborationId', '==', collaborationId),
        orderBy('dueDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const milestones: CollaborationMilestone[] = [];

      querySnapshot.forEach((doc) => {
        milestones.push(doc.data() as CollaborationMilestone);
      });

      return milestones;
    } catch (error) {
      console.error('Error getting milestones:', error);
      return [];
    }
  }

  /**
   * Update milestone
   */
  static async updateMilestone(
    milestoneId: string,
    updates: Partial<CollaborationMilestone>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, COLLECTIONS.MILESTONES, milestoneId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating milestone:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update milestone',
      };
    }
  }

  // ============================================================================
  // NONPROFIT MEMBERSHIP
  // ============================================================================

  /**
   * Add member to nonprofit
   */
  static async addNonprofitMember(
    data: Omit<NonprofitMember, 'joinedAt'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const memberRef = doc(
        db,
        COLLECTIONS.NONPROFIT_MEMBERS,
        `${data.nonprofitId}_${data.userId}`
      );

      const member: NonprofitMember = {
        ...data,
        joinedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(memberRef, member);

      return { success: true };
    } catch (error) {
      console.error('Error adding nonprofit member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add member',
      };
    }
  }

  /**
   * Get members of a nonprofit
   */
  static async getNonprofitMembers(nonprofitId: string): Promise<NonprofitMember[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NONPROFIT_MEMBERS),
        where('nonprofitId', '==', nonprofitId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      const members: NonprofitMember[] = [];

      querySnapshot.forEach((doc) => {
        members.push(doc.data() as NonprofitMember);
      });

      return members;
    } catch (error) {
      console.error('Error getting nonprofit members:', error);
      return [];
    }
  }

  /**
   * Get user's nonprofit memberships
   */
  static async getUserNonprofitMemberships(userId: string): Promise<NonprofitMember[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NONPROFIT_MEMBERS),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      const memberships: NonprofitMember[] = [];

      querySnapshot.forEach((doc) => {
        memberships.push(doc.data() as NonprofitMember);
      });

      return memberships;
    } catch (error) {
      console.error('Error getting user memberships:', error);
      return [];
    }
  }

  /**
   * Update nonprofit member
   */
  static async updateNonprofitMember(
    nonprofitId: string,
    userId: string,
    updates: Partial<NonprofitMember>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const memberRef = doc(
        db,
        COLLECTIONS.NONPROFIT_MEMBERS,
        `${nonprofitId}_${userId}`
      );

      await updateDoc(memberRef, updates);

      return { success: true };
    } catch (error) {
      console.error('Error updating nonprofit member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update member',
      };
    }
  }

  /**
   * Remove member from nonprofit
   */
  static async removeNonprofitMember(
    nonprofitId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const memberRef = doc(
        db,
        COLLECTIONS.NONPROFIT_MEMBERS,
        `${nonprofitId}_${userId}`
      );

      await deleteDoc(memberRef);

      return { success: true };
    } catch (error) {
      console.error('Error removing nonprofit member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove member',
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if user has permission in collaboration
   */
  static async userHasCollaborationPermission(
    userId: string,
    collaborationId: string,
    permission: keyof NonprofitMember['permissions']
  ): Promise<boolean> {
    try {
      const collaboration = await this.getCollaboration(collaborationId);
      if (!collaboration) return false;

      // Get all nonprofit IDs in collaboration
      const nonprofitIds = [
        collaboration.leadOrganization.nonprofitId,
        ...collaboration.partnerOrganizations.map((p) => p.nonprofitId),
      ];

      // Check if user is member of any participating nonprofit
      for (const nonprofitId of nonprofitIds) {
        const memberRef = doc(
          db,
          COLLECTIONS.NONPROFIT_MEMBERS,
          `${nonprofitId}_${userId}`
        );
        const memberSnap = await getDoc(memberRef);

        if (memberSnap.exists()) {
          const member = memberSnap.data() as NonprofitMember;
          if (member.status === 'active' && member.permissions[permission]) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking collaboration permission:', error);
      return false;
    }
  }

  /**
   * Get collaboration summary for dashboard
   */
  static async getCollaborationSummaries(
    nonprofitId: string
  ): Promise<CollaborationSummary[]> {
    try {
      const collaborations = await this.getCollaborationsByNonprofit(nonprofitId);
      const summaries: CollaborationSummary[] = [];

      for (const collab of collaborations) {
        // Get next milestone
        const milestones = await this.getMilestones(collab.id);
        const upcomingMilestones = milestones
          .filter((m) => m.status !== 'completed')
          .sort((a, b) => {
            const dateA = a.dueDate instanceof Timestamp ? a.dueDate.toDate() : new Date(a.dueDate);
            const dateB = b.dueDate instanceof Timestamp ? b.dueDate.toDate() : new Date(b.dueDate);
            return dateA.getTime() - dateB.getTime();
          });

        // Get recent activity
        const activities = await this.getActivities(collab.id, 1);

        summaries.push({
          id: collab.id,
          grantName: collab.grantName,
          leadOrganizationName: collab.leadOrganization.nonprofitName,
          partnerCount: collab.partnerOrganizations.length,
          status: collab.status,
          nextMilestone: upcomingMilestones[0]
            ? {
                name: upcomingMilestones[0].name,
                dueDate: upcomingMilestones[0].dueDate,
              }
            : undefined,
          recentActivity: activities[0]
            ? {
                type: activities[0].type,
                title: activities[0].title,
                date: activities[0].date,
              }
            : undefined,
          healthScore: 85, // TODO: Calculate actual health score
        });
      }

      return summaries;
    } catch (error) {
      console.error('Error getting collaboration summaries:', error);
      return [];
    }
  }
}

export default CollaborationService;

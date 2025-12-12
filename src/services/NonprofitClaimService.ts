/**
 * Nonprofit Claim Service
 * Handles nonprofit claiming and EIN verification
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import {
  NonprofitClaim,
  CreateClaimInput,
  ClaimStatus,
  EINLookupData
} from '@/types/resource-verification.types';

const CLAIMS_COLLECTION = 'nonprofitClaims';

// Convert Firestore doc to NonprofitClaim
const docToClaim = (data: DocumentData, id: string): NonprofitClaim => ({
  id,
  resourceId: data.resourceId,
  organizationName: data.organizationName,
  ein: data.ein,
  claimantUserId: data.claimantUserId,
  claimantEmail: data.claimantEmail,
  claimantName: data.claimantName,
  claimantTitle: data.claimantTitle,
  status: data.status || 'pending_verification',
  verificationMethod: data.verificationMethod || 'ein_lookup',
  verificationDocumentUrl: data.verificationDocumentUrl,
  einVerified: data.einVerified || false,
  einData: data.einData,
  reviewedBy: data.reviewedBy,
  reviewedAt: data.reviewedAt?.toDate(),
  reviewNotes: data.reviewNotes,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date()
});

export class NonprofitClaimService {
  /**
   * Create a new claim for a resource
   */
  static async createClaim(
    input: CreateClaimInput,
    userId: string
  ): Promise<NonprofitClaim> {
    try {
      // Check if resource is already claimed
      const existingClaim = await this.getClaimByResourceId(input.resourceId);
      if (existingClaim && existingClaim.status === 'claimed') {
        throw new Error('This resource has already been claimed');
      }

      // Check if user already has a pending claim for this resource
      const userClaims = await this.getClaimsByUser(userId);
      const pendingClaim = userClaims.find(
        c => c.resourceId === input.resourceId && c.status === 'pending_verification'
      );
      if (pendingClaim) {
        throw new Error('You already have a pending claim for this resource');
      }

      // Lookup EIN data
      const einData = await this.lookupEIN(input.ein);
      const einVerified = einData !== null;

      const claimData = {
        resourceId: input.resourceId,
        organizationName: input.organizationName,
        ein: input.ein.replace(/\D/g, ''), // Store only digits
        claimantUserId: userId,
        claimantEmail: input.claimantEmail,
        claimantName: input.claimantName,
        claimantTitle: input.claimantTitle,
        status: 'pending_verification' as ClaimStatus,
        verificationMethod: einVerified ? 'ein_lookup' : 'manual_review',
        verificationDocumentUrl: input.verificationDocumentUrl,
        einVerified,
        einData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, CLAIMS_COLLECTION), claimData);

      return {
        ...claimData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      } as NonprofitClaim;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  }

  /**
   * Lookup EIN using IRS database (via API)
   * In production, this would call a real EIN verification API
   */
  static async lookupEIN(ein: string): Promise<EINLookupData | null> {
    try {
      const cleanEIN = ein.replace(/\D/g, '');
      
      if (cleanEIN.length !== 9) {
        return null;
      }

      // Call our API endpoint for EIN lookup
      const response = await fetch(`/api/nonprofit/ein-lookup?ein=${cleanEIN}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.organization || null;
    } catch (error) {
      console.error('Error looking up EIN:', error);
      return null;
    }
  }

  /**
   * Get claim by ID
   */
  static async getClaimById(id: string): Promise<NonprofitClaim | null> {
    try {
      const docRef = doc(db, CLAIMS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;
      return docToClaim(docSnap.data(), docSnap.id);
    } catch (error) {
      console.error('Error getting claim:', error);
      return null;
    }
  }

  /**
   * Get claim by resource ID
   */
  static async getClaimByResourceId(resourceId: string): Promise<NonprofitClaim | null> {
    try {
      const q = query(
        collection(db, CLAIMS_COLLECTION),
        where('resourceId', '==', resourceId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      // Return the most recent claim
      const claims = snapshot.docs.map(doc => docToClaim(doc.data(), doc.id));
      return claims.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    } catch (error) {
      console.error('Error getting claim by resource:', error);
      return null;
    }
  }

  /**
   * Get claims by user
   */
  static async getClaimsByUser(userId: string): Promise<NonprofitClaim[]> {
    try {
      const q = query(
        collection(db, CLAIMS_COLLECTION),
        where('claimantUserId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToClaim(doc.data(), doc.id));
    } catch (error) {
      console.error('Error getting user claims:', error);
      return [];
    }
  }

  /**
   * Get all pending claims (for admin review)
   */
  static async getPendingClaims(): Promise<NonprofitClaim[]> {
    try {
      const q = query(
        collection(db, CLAIMS_COLLECTION),
        where('status', '==', 'pending_verification')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToClaim(doc.data(), doc.id));
    } catch (error) {
      console.error('Error getting pending claims:', error);
      return [];
    }
  }

  /**
   * Approve a claim
   */
  static async approveClaim(
    claimId: string,
    reviewerId: string,
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, CLAIMS_COLLECTION, claimId);
      await updateDoc(docRef, {
        status: 'claimed',
        reviewedBy: reviewerId,
        reviewedAt: Timestamp.now(),
        reviewNotes: notes,
        updatedAt: Timestamp.now()
      });

      // Update the resource to mark it as claimed
      const claim = await this.getClaimById(claimId);
      if (claim) {
        const { SandhillsResourceService } = await import('./SandhillsResourceService');
        await SandhillsResourceService.update(claim.resourceId, {
          // Add claimed info to resource
        }, reviewerId);
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      throw error;
    }
  }

  /**
   * Reject a claim
   */
  static async rejectClaim(
    claimId: string,
    reviewerId: string,
    notes: string
  ): Promise<void> {
    try {
      const docRef = doc(db, CLAIMS_COLLECTION, claimId);
      await updateDoc(docRef, {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: Timestamp.now(),
        reviewNotes: notes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error rejecting claim:', error);
      throw error;
    }
  }

  /**
   * Get claim statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    pending: number;
    claimed: number;
    rejected: number;
  }> {
    try {
      const snapshot = await getDocs(collection(db, CLAIMS_COLLECTION));
      const claims = snapshot.docs.map(doc => doc.data());

      return {
        total: claims.length,
        pending: claims.filter(c => c.status === 'pending_verification').length,
        claimed: claims.filter(c => c.status === 'claimed').length,
        rejected: claims.filter(c => c.status === 'rejected').length
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { total: 0, pending: 0, claimed: 0, rejected: 0 };
    }
  }
}

export default NonprofitClaimService;

/**
 * Resource Verification Service
 * Handles monthly verification workflow for Sandhills Resources
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import {
  ResourceVerification,
  VerificationResponse,
  CreateVerificationInput,
  VerificationStatus,
  VERIFICATION_SETTINGS
} from '@/types/resource-verification.types';
import { v4 as uuidv4 } from 'uuid';

const VERIFICATIONS_COLLECTION = 'resourceVerifications';
const RESPONSES_COLLECTION = 'verificationResponses';

// Generate secure verification token
const generateToken = (): string => {
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
};

// Convert Firestore doc to ResourceVerification
const docToVerification = (data: DocumentData, id: string): ResourceVerification => ({
  id,
  resourceId: data.resourceId,
  organizationName: data.organizationName,
  contactEmail: data.contactEmail,
  contactName: data.contactName,
  verificationToken: data.verificationToken,
  tokenExpiry: data.tokenExpiry?.toDate() || new Date(),
  status: data.status || 'pending',
  lastSentDate: data.lastSentDate?.toDate() || new Date(),
  lastVerifiedDate: data.lastVerifiedDate?.toDate(),
  verifiedBy: data.verifiedBy,
  responseNotes: data.responseNotes,
  reminderCount: data.reminderCount || 0,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date()
});

export class ResourceVerificationService {
  /**
   * Create a new verification request for a resource
   */
  static async createVerification(input: CreateVerificationInput): Promise<ResourceVerification> {
    try {
      const token = generateToken();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + VERIFICATION_SETTINGS.tokenExpiryDays);

      const verificationData = {
        resourceId: input.resourceId,
        organizationName: input.organizationName,
        contactEmail: input.contactEmail,
        contactName: input.contactName,
        verificationToken: token,
        tokenExpiry: Timestamp.fromDate(expiryDate),
        status: 'pending' as VerificationStatus,
        lastSentDate: Timestamp.now(),
        reminderCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, VERIFICATIONS_COLLECTION), verificationData);

      return {
        ...verificationData,
        id: docRef.id,
        tokenExpiry: expiryDate,
        lastSentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as ResourceVerification;
    } catch (error) {
      console.error('Error creating verification:', error);
      throw error;
    }
  }

  /**
   * Get verification by token (for verification portal)
   */
  static async getByToken(token: string): Promise<ResourceVerification | null> {
    try {
      const q = query(
        collection(db, VERIFICATIONS_COLLECTION),
        where('verificationToken', '==', token)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return docToVerification(doc.data(), doc.id);
    } catch (error) {
      console.error('Error getting verification by token:', error);
      return null;
    }
  }

  /**
   * Get verification by resource ID
   */
  static async getByResourceId(resourceId: string): Promise<ResourceVerification | null> {
    try {
      const q = query(
        collection(db, VERIFICATIONS_COLLECTION),
        where('resourceId', '==', resourceId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return docToVerification(doc.data(), doc.id);
    } catch (error) {
      console.error('Error getting verification by resource:', error);
      return null;
    }
  }

  /**
   * Get all pending verifications
   */
  static async getPendingVerifications(): Promise<ResourceVerification[]> {
    try {
      const q = query(
        collection(db, VERIFICATIONS_COLLECTION),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToVerification(doc.data(), doc.id));
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      return [];
    }
  }

  /**
   * Get verifications needing reminders
   */
  static async getVerificationsNeedingReminder(): Promise<ResourceVerification[]> {
    try {
      const verifications = await this.getPendingVerifications();
      const now = new Date();
      const reminderThreshold = new Date();
      reminderThreshold.setDate(now.getDate() - VERIFICATION_SETTINGS.reminderIntervalDays);

      return verifications.filter(v => 
        v.lastSentDate < reminderThreshold && 
        v.reminderCount < VERIFICATION_SETTINGS.maxReminders
      );
    } catch (error) {
      console.error('Error getting verifications needing reminder:', error);
      return [];
    }
  }

  /**
   * Mark verification as verified
   */
  static async markVerified(
    verificationId: string,
    verifiedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      // Update verification record
      const verificationRef = doc(db, VERIFICATIONS_COLLECTION, verificationId);
      const verificationSnap = await getDoc(verificationRef);
      
      if (!verificationSnap.exists()) {
        throw new Error('Verification not found');
      }
      
      const verificationData = verificationSnap.data();
      
      await updateDoc(verificationRef, {
        status: 'verified',
        lastVerifiedDate: Timestamp.now(),
        verifiedBy,
        responseNotes: notes,
        updatedAt: Timestamp.now()
      });

      // Also update the resource to show verified badge
      const resourceRef = doc(db, 'sandhillsResources', verificationData.resourceId);
      await updateDoc(resourceRef, {
        isVerified: true,
        verifiedDate: Timestamp.now(),
        verifiedBy,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking verification:', error);
      throw error;
    }
  }

  /**
   * Mark verification as needs update
   */
  static async markNeedsUpdate(verificationId: string, notes?: string): Promise<void> {
    try {
      const docRef = doc(db, VERIFICATIONS_COLLECTION, verificationId);
      await updateDoc(docRef, {
        status: 'needs_update',
        responseNotes: notes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking needs update:', error);
      throw error;
    }
  }

  /**
   * Increment reminder count
   */
  static async incrementReminderCount(verificationId: string): Promise<void> {
    try {
      const docRef = doc(db, VERIFICATIONS_COLLECTION, verificationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentCount = docSnap.data().reminderCount || 0;
        await updateDoc(docRef, {
          reminderCount: currentCount + 1,
          lastSentDate: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error incrementing reminder count:', error);
      throw error;
    }
  }

  /**
   * Regenerate verification token
   */
  static async regenerateToken(verificationId: string): Promise<string> {
    try {
      const token = generateToken();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + VERIFICATION_SETTINGS.tokenExpiryDays);

      const docRef = doc(db, VERIFICATIONS_COLLECTION, verificationId);
      await updateDoc(docRef, {
        verificationToken: token,
        tokenExpiry: Timestamp.fromDate(expiryDate),
        status: 'pending',
        reminderCount: 0,
        lastSentDate: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return token;
    } catch (error) {
      console.error('Error regenerating token:', error);
      throw error;
    }
  }

  /**
   * Save verification response
   */
  static async saveResponse(response: Omit<VerificationResponse, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, RESPONSES_COLLECTION), {
        ...response,
        responseDate: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    }
  }

  /**
   * Get verification statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    pending: number;
    verified: number;
    needsUpdate: number;
    unresponsive: number;
  }> {
    try {
      const snapshot = await getDocs(collection(db, VERIFICATIONS_COLLECTION));
      const verifications = snapshot.docs.map(doc => doc.data());

      return {
        total: verifications.length,
        pending: verifications.filter(v => v.status === 'pending').length,
        verified: verifications.filter(v => v.status === 'verified').length,
        needsUpdate: verifications.filter(v => v.status === 'needs_update').length,
        unresponsive: verifications.filter(v => v.status === 'unresponsive').length
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { total: 0, pending: 0, verified: 0, needsUpdate: 0, unresponsive: 0 };
    }
  }

  /**
   * Initialize verifications for all resources with contacts
   */
  static async initializeForAllResources(): Promise<number> {
    try {
      // Import here to avoid circular dependency
      const { SandhillsResourceService } = await import('./SandhillsResourceService');
      const resources = await SandhillsResourceService.getAll();
      
      let created = 0;
      for (const resource of resources) {
        const contactEmail = resource.contactPersonEmail || resource.generalContactPhone;
        if (!contactEmail || !contactEmail.includes('@')) continue;

        // Check if verification already exists
        const existing = await this.getByResourceId(resource.id);
        if (existing) continue;

        await this.createVerification({
          resourceId: resource.id,
          organizationName: resource.organization,
          contactEmail,
          contactName: resource.contactPerson || resource.generalContactName
        });
        created++;
      }

      return created;
    } catch (error) {
      console.error('Error initializing verifications:', error);
      throw error;
    }
  }
}

export default ResourceVerificationService;

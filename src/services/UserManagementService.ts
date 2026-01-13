import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { UserRole, UserPermissions } from '@/types/firebase/schema';

/**
 * Interface representing a user profile
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  organization: string;
  title?: string;
  isActive: boolean;
  pendingApproval?: boolean;
  permissions: UserPermissions;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
  lastLoginAt?: any; // Firebase Timestamp
  phoneNumber?: string;
  photoURL?: string;
}

/**
 * Interface for creating a new user
 */
export interface NewUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: UserRole;
  organization: string;
  title?: string;
  isActive?: boolean;
  pendingApproval?: boolean;
  permissions?: Partial<UserPermissions>;
}

/**
 * Centralized service for managing users
 */
export class UserManagementService {
  /**
   * Create a new user in Firebase Authentication and Firestore
   * @param userData - User data for the new user
   * @returns The created user object
   */
  static async createUser(userData: NewUserData): Promise<UserProfile> {
    try {
      console.log('Creating new user in Firebase Auth:', userData.email);
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      console.log('Firebase Auth user created with UID:', user.uid);
      
      // Set display name if provided
      const displayName = userData.displayName || 
        (userData.firstName && userData.lastName ? 
          `${userData.firstName} ${userData.lastName}` : 
          undefined);
      
      if (displayName) {
        await updateProfile(user, {
          displayName: displayName
        });
        console.log('User profile updated with display name:', displayName);
      }
      
      // Prepare default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(userData.role);
      
      // Prepare user profile data for Firestore
      // Note: Firestore doesn't accept undefined values, so we use empty strings or omit optional fields
      const userProfile: UserProfile = {
        uid: user.uid,
        email: userData.email.toLowerCase(),
        displayName: displayName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role,
        organization: userData.organization || '',
        title: userData.title || '',
        isActive: userData.isActive !== undefined ? userData.isActive : false,
        pendingApproval: userData.pendingApproval !== undefined ? userData.pendingApproval : true,
        permissions: { ...defaultPermissions, ...(userData.permissions || {}) },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(user.photoURL ? { photoURL: user.photoURL } : {}),
        ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
      };
      
      console.log('Saving user profile to Firestore with ID:', user.uid);
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('User profile saved to Firestore successfully');
      
      // Double-check that the user was created properly
      const savedUser = await this.getUserById(user.uid);
      if (!savedUser) {
        console.warn('User was created but could not be retrieved from Firestore - possible data consistency issue');
      } else {
        console.log('User retrieval verification successful');
      }
      
      return {
        ...userProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Get a user by their UID
   * @param uid - User ID
   * @returns User profile or null if not found
   */
  static async getUserById(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return this.formatUserProfile(userDoc.id, userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get a user by their email address
   * @param email - User email
   * @returns User profile or null if not found
   */
  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const q = query(
        collection(db, 'users'), 
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return this.formatUserProfile(userDoc.id, userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }
  
  /**
   * Get all users
   * @returns Array of user profiles
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      console.log('UserManagementService: Getting all users from Firestore...');
      
      // Add timestamp to query to prevent cached results (dev tool)
      const timestamp = Date.now();
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`UserManagementService: Retrieved ${querySnapshot.docs.length} users from Firestore`);
      
      const users = querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return this.formatUserProfile(doc.id, userData);
      });
      
      console.log('UserManagementService: Processed user data:', users.length);
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
  
  /**
   * Get all users pending approval
   * @returns Array of user profiles pending approval
   */
  static async getPendingApprovalUsers(): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'), 
        where('pendingApproval', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return this.formatUserProfile(doc.id, userData);
      });
    } catch (error) {
      console.error('Error getting pending approval users:', error);
      throw error;
    }
  }

  /**
   * Get all admin users
   * @returns Array of admin user profiles
   */
  static async getAdminUsers(): Promise<UserProfile[]> {
    try {
      console.log('Fetching admin users specifically from Firestore...');
      const q = query(
        collection(db, 'users'), 
        where('role', '==', UserRole.ADMIN),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Retrieved ${querySnapshot.size} admin users`);
      
      return querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return this.formatUserProfile(doc.id, userData);
      });
    } catch (error) {
      console.error('Error getting admin users:', error);
      throw error;
    }
  }
  
  /**
   * Update a user's profile
   * @param uid - User ID
   * @param updates - Profile updates
   * @returns Updated user profile
   */
  static async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      // Don't update uid, createdAt, or email fields
      const { uid: _, createdAt: __, email: ___, ...validUpdates } = updates;
      
      // Add updatedAt timestamp
      const updateData = {
        ...validUpdates,
        updatedAt: serverTimestamp()
      };
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', uid), updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Approve a pending user
   * @param uid - User ID
   * @returns Promise resolving when complete
   */
  static async approveUser(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        pendingApproval: false,
        isActive: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user
   * @param uid - User ID
   * @returns Promise resolving when complete
   */
  static async deleteUser(uid: string): Promise<void> {
    try {
      // Delete the user from Firestore
      await deleteDoc(doc(db, 'users', uid));
      
      // If needed, also delete from Auth system
      // This would require admin SDK in a server endpoint
      // Or handling through Firebase Functions
      
      // For client side deletion
      // const user = auth.currentUser;
      // if (user && user.uid === uid) {
      //   await deleteUser(user);
      // }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  /**
   * Toggle a user's active status
   * @param uid - User ID
   * @param isActive - New active status
   * @returns Promise resolving when complete
   */
  static async setUserActiveStatus(uid: string, isActive: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: isActive,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error setting user active status:', error);
      throw error;
    }
  }
  
  /**
   * Send password reset email to a user
   * @param email - User email address
   * @returns Promise resolving when email is sent
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
  
  /**
   * Update user password (requires the user to be currently signed in)
   * Note: This method can only update the password of the currently authenticated user
   * For admin password resets, use sendPasswordResetEmail instead
   * @param newPassword - New password
   * @returns Promise resolving when password is updated
   */
  static async updateCurrentUserPassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      await updatePassword(user, newPassword);
      console.log('Password updated successfully for user:', user.uid);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
  
  /**
   * Get default permissions for a role
   * @param role - User role
   * @returns Default permissions
   */
  static getDefaultPermissions(role: UserRole): UserPermissions {
    switch (role) {
      case UserRole.ADMIN:
        return {
          canCreateForms: true,
          canEditForms: true,
          canDeleteForms: true,
          canViewAnalytics: true,
          canManageUsers: true,
          canUploadFiles: true,
          canAccessAllOrganizations: true,
        };
      case UserRole.CHW_ASSOCIATION:
        return {
          canCreateForms: true,
          canEditForms: true,
          canDeleteForms: false,
          canViewAnalytics: true,
          canManageUsers: false,
          canUploadFiles: true,
          canAccessAllOrganizations: false,
        };
      case UserRole.NONPROFIT_STAFF:
        return {
          canCreateForms: false,
          canEditForms: false,
          canDeleteForms: false,
          canViewAnalytics: true,
          canManageUsers: false,
          canUploadFiles: true,
          canAccessAllOrganizations: false,
        };
      case UserRole.CHW:
      default:
        return {
          canCreateForms: false,
          canEditForms: false,
          canDeleteForms: false,
          canViewAnalytics: false,
          canManageUsers: false,
          canUploadFiles: true,
          canAccessAllOrganizations: false,
        };
    }
  }
  
  /**
   * Format a user profile from Firestore data
   * @param id - Document ID
   * @param data - Document data
   * @returns Formatted user profile
   */
  private static formatUserProfile(id: string, data: any): UserProfile {
    return {
      uid: id,
      email: data.email || '',
      displayName: data.displayName || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: data.role || UserRole.CHW,
      organization: data.organization || 'general',
      title: data.title || '',
      isActive: data.isActive !== undefined ? data.isActive : false,
      pendingApproval: data.pendingApproval || false,
      permissions: data.permissions || this.getDefaultPermissions(data.role || UserRole.CHW),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || undefined,
      phoneNumber: data.phoneNumber || '',
      photoURL: data.photoURL || '',
    };
  }
}

export default UserManagementService;

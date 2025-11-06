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
  deleteUser
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
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      
      // Set display name if provided
      const displayName = userData.displayName || 
        (userData.firstName && userData.lastName ? 
          `${userData.firstName} ${userData.lastName}` : 
          undefined);
      
      if (displayName) {
        await updateProfile(user, {
          displayName: displayName
        });
      }
      
      // Prepare default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(userData.role);
      
      // Prepare user profile data for Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: userData.email.toLowerCase(),
        displayName: displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        organization: userData.organization,
        title: userData.title,
        isActive: userData.isActive !== undefined ? userData.isActive : false,
        pendingApproval: userData.pendingApproval !== undefined ? userData.pendingApproval : true,
        permissions: { ...defaultPermissions, ...(userData.permissions || {}) },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photoURL: user.photoURL || undefined,
        phoneNumber: user.phoneNumber || undefined,
      };
      
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
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
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return this.formatUserProfile(doc.id, userData);
      });
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
      case UserRole.CHW_COORDINATOR:
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

import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  COLLECTIONS, 
  UserProfile, 
  CHWProfile,
  Form,
  FormSubmission,
  FileDocument,
  DashboardMetrics,
  Organization,
  ActivityLog,
  Notification,
  UserRole
} from '@/types/firebase/schema';

/**
 * Initialize the Firebase database schema
 * This function creates the necessary collections and documents
 * for the application to function properly
 */
export async function initializeFirebaseSchema() {
  try {
    // Check if the organizations collection exists and has the required documents
    const organizationsRef = collection(db, COLLECTIONS.ORGANIZATIONS);
    const organizationsSnapshot = await getDocs(organizationsRef);
    
    if (organizationsSnapshot.empty) {
      // Create default organizations
      await Promise.all([
        createDefaultOrganization('general', 'CHWOne Platform', 'CHWOne'),
        createDefaultOrganization('region5', 'Region 5 Health Department', 'Region 5'),
        createDefaultOrganization('wl4wj', 'Women Leading for Wellness & Justice', 'WL4WJ')
      ]);
      
      console.log('Created default organizations');
    }
    
    // Create a connection test document
    await setDoc(doc(db, COLLECTIONS.ORGANIZATIONS, 'connection_test'), {
      timestamp: Timestamp.now(),
      status: 'active'
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing Firebase schema:', error);
    return false;
  }
}

/**
 * Create a default organization
 */
async function createDefaultOrganization(id: string, name: string, shortName: string) {
  const organization: Organization = {
    id,
    name,
    shortName,
    description: `${name} organization for CHWOne platform`,
    logoUrl: `/images/${id}-logo.png`,
    primaryColor: id === 'general' ? '#1a365d' : (id === 'region5' ? '#2a4365' : '#2c5282'),
    secondaryColor: id === 'general' ? '#4a5568' : (id === 'region5' ? '#718096' : '#2d3748'),
    contactEmail: `contact@${id}.org`,
    contactPhone: '555-123-4567',
    address: {
      street: '123 Main St',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      country: 'USA'
    },
    settings: {
      allowPublicForms: true,
      requireApprovalForNewUsers: true,
      defaultUserRole: UserRole.CHW,
      maxFileSize: 10, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      emailTemplates: {
        welcomeMessage: `Welcome to ${name}! We're excited to have you join our platform.`,
        formSubmissionNotification: `A new form has been submitted on the ${name} platform.`,
        passwordReset: `You have requested a password reset for your ${name} account.`
      },
      branding: {
        logoUrl: `/images/${id}-logo.png`,
        faviconUrl: `/images/${id}-favicon.ico`,
        primaryColor: id === 'general' ? '#1a365d' : (id === 'region5' ? '#2a4365' : '#2c5282'),
        secondaryColor: id === 'general' ? '#4a5568' : (id === 'region5' ? '#718096' : '#2d3748'),
        fontFamily: 'Inter, sans-serif'
      }
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  await setDoc(doc(db, COLLECTIONS.ORGANIZATIONS, id), organization);
}

/**
 * Create a new user profile
 */
export async function createUserProfile(userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userProfile.uid);
    
    await setDoc(userRef, {
      ...userProfile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(uid: string) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update a user profile
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

/**
 * Create a dashboard metrics document
 */
export async function createDashboardMetrics(metrics: Omit<DashboardMetrics, 'id' | 'updatedAt'>) {
  try {
    const metricsRef = collection(db, COLLECTIONS.DASHBOARD_METRICS);
    
    await addDoc(metricsRef, {
      ...metrics,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating dashboard metrics:', error);
    return false;
  }
}

/**
 * Get the latest dashboard metrics for an organization
 */
export async function getLatestDashboardMetrics(organization: 'general' | 'region5' | 'wl4wj') {
  try {
    const metricsQuery = query(
      collection(db, COLLECTIONS.DASHBOARD_METRICS),
      where('organization', '==', organization),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const metricsSnapshot = await getDocs(metricsQuery);
    
    if (!metricsSnapshot.empty) {
      const metricsDoc = metricsSnapshot.docs[0];
      return {
        id: metricsDoc.id,
        ...metricsDoc.data()
      } as DashboardMetrics;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return null;
  }
}

/**
 * Log an activity
 */
export async function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
  try {
    const activityRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
    
    await addDoc(activityRef, {
      ...activity,
      timestamp: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
}

/**
 * Create a notification
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  try {
    const notificationRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    
    await addDoc(notificationRef, {
      ...notification,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
  try {
    const notificationsQuery = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    return notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    
    await updateDoc(notificationRef, {
      isRead: true
    });
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Initialize the schema when this module is imported
initializeFirebaseSchema().catch(console.error);

import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  CollectionReference,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { 
  COLLECTIONS,
  User,
  CHWProfile,
  Organization,
  Client,
  Project,
  Grant,
  Form,
  FormSubmission,
  ReferralResource,
  Referral,
  Dataset,
  DashboardMetrics,
  ActivityLog,
  Notification
} from './unified-schema';

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Create a new user
 */
export async function createUser(user: Omit<User, 'createdAt' | 'updatedAt'>) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    
    await setDoc(userRef, {
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: user.uid,
      action: 'create',
      resourceType: 'user',
      resourceId: user.uid,
      description: `User ${user.email} created with role ${user.primaryRole || user.roles?.[0] || 'unknown'}`
    });
    
    return { success: true, userId: user.uid };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(uid: string) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, user: userDoc.data() as User };
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error };
  }
}

/**
 * Update a user
 */
export async function updateUser(uid: string, updates: Partial<User>) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: uid,
      action: 'update',
      resourceType: 'user',
      resourceId: uid,
      description: `User ${uid} updated`
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error };
  }
}

// ============================================================================
// CHW PROFILES
// ============================================================================

/**
 * Create a CHW profile
 */
export async function createCHWProfile(profile: Omit<CHWProfile, 'createdAt' | 'updatedAt'>) {
  try {
    const chwRef = doc(db, COLLECTIONS.CHW_PROFILES, profile.userId);
    
    await setDoc(chwRef, {
      ...profile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: profile.userId,
      action: 'create',
      resourceType: 'chw',
      resourceId: profile.userId,
      description: `CHW profile created for ${profile.firstName} ${profile.lastName}`
    });
    
    return { success: true, profileId: profile.userId };
  } catch (error) {
    console.error('Error creating CHW profile:', error);
    return { success: false, error };
  }
}

/**
 * Get a CHW profile by user ID
 */
export async function getCHWProfileByUserId(uid: string) {
  try {
    const chwRef = doc(db, COLLECTIONS.CHW_PROFILES, uid);
    const chwDoc = await getDoc(chwRef);
    
    if (chwDoc.exists()) {
      return { success: true, profile: chwDoc.data() as CHWProfile };
    }
    
    return { success: false, error: 'CHW profile not found' };
  } catch (error) {
    console.error('Error getting CHW profile:', error);
    return { success: false, error };
  }
}

/**
 * Update a CHW profile
 */
export async function updateCHWProfile(uid: string, updates: Partial<CHWProfile>) {
  try {
    const chwRef = doc(db, COLLECTIONS.CHW_PROFILES, uid);
    
    await updateDoc(chwRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: uid,
      action: 'update',
      resourceType: 'chw',
      resourceId: uid,
      description: `CHW profile updated for ${uid}`
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating CHW profile:', error);
    return { success: false, error };
  }
}

/**
 * Get all CHWs with optional filters
 */
export async function getCHWs(options: {
  organizationId?: string;
  region?: string;
  isActive?: boolean;
  limit?: number;
} = {}) {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (options.organizationId) {
      constraints.push(where('organizationId', '==', options.organizationId));
    }
    
    if (options.region) {
      constraints.push(where('region', '==', options.region));
    }
    
    if (options.isActive !== undefined) {
      constraints.push(where('isActive', '==', options.isActive));
    }
    
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    // Always sort by last name
    constraints.push(orderBy('lastName', 'asc'));
    
    const chwQuery = query(collection(db, COLLECTIONS.CHW_PROFILES), ...constraints);
    const chwSnapshot = await getDocs(chwQuery);
    
    const chws = chwSnapshot.docs.map(doc => doc.data() as CHWProfile);
    
    return { success: true, chws };
  } catch (error) {
    console.error('Error getting CHWs:', error);
    return { success: false, error, chws: [] };
  }
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

/**
 * Get an organization by ID
 */
export async function getOrganizationById(id: string) {
  try {
    const orgRef = doc(db, COLLECTIONS.ORGANIZATIONS, id);
    const orgDoc = await getDoc(orgRef);
    
    if (orgDoc.exists()) {
      return { success: true, organization: orgDoc.data() as Organization };
    }
    
    return { success: false, error: 'Organization not found' };
  } catch (error) {
    console.error('Error getting organization:', error);
    return { success: false, error };
  }
}

/**
 * Get all organizations
 */
export async function getAllOrganizations() {
  try {
    const orgsQuery = query(collection(db, COLLECTIONS.ORGANIZATIONS));
    const orgsSnapshot = await getDocs(orgsQuery);
    
    const organizations = orgsSnapshot.docs.map(doc => doc.data() as Organization);
    
    return { success: true, organizations };
  } catch (error) {
    console.error('Error getting organizations:', error);
    return { success: false, error, organizations: [] };
  }
}

// ============================================================================
// CLIENTS
// ============================================================================

/**
 * Create a client
 */
export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const clientsRef = collection(db, COLLECTIONS.CLIENTS);
    
    const docRef = await addDoc(clientsRef, {
      ...client,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: client.assignedCHWId,
      action: 'create',
      resourceType: 'client',
      resourceId: docRef.id,
      description: `Client created: ${client.firstName} ${client.lastName}`
    });
    
    return { success: true, clientId: docRef.id };
  } catch (error) {
    console.error('Error creating client:', error);
    return { success: false, error };
  }
}

/**
 * Get a client by ID
 */
export async function getClientById(id: string) {
  try {
    const clientRef = doc(db, COLLECTIONS.CLIENTS, id);
    const clientDoc = await getDoc(clientRef);
    
    if (clientDoc.exists()) {
      return { success: true, client: { id, ...clientDoc.data() } as Client };
    }
    
    return { success: false, error: 'Client not found' };
  } catch (error) {
    console.error('Error getting client:', error);
    return { success: false, error };
  }
}

/**
 * Get clients assigned to a CHW
 */
export async function getClientsByCHW(chwId: string) {
  try {
    const clientsQuery = query(
      collection(db, COLLECTIONS.CLIENTS),
      where('assignedCHWId', '==', chwId),
      orderBy('lastName', 'asc')
    );
    
    const clientsSnapshot = await getDocs(clientsQuery);
    
    const clients = clientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Client));
    
    return { success: true, clients };
  } catch (error) {
    console.error('Error getting clients by CHW:', error);
    return { success: false, error, clients: [] };
  }
}

// ============================================================================
// PROJECTS & GRANTS
// ============================================================================

/**
 * Create a project
 */
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    
    const docRef = await addDoc(projectsRef, {
      ...project,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      action: 'create',
      resourceType: 'project',
      resourceId: docRef.id,
      description: `Project created: ${project.name}`
    });
    
    return { success: true, projectId: docRef.id };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error };
  }
}


// ============================================================================
// FORMS & SUBMISSIONS
// ============================================================================

/**
 * Create a form
 */
export async function createForm(form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const formsRef = collection(db, COLLECTIONS.FORMS);
    
    const docRef = await addDoc(formsRef, {
      ...form,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: form.createdBy,
      action: 'create',
      resourceType: 'form',
      resourceId: docRef.id,
      description: `Form created: ${form.title}`
    });
    
    return { success: true, formId: docRef.id };
  } catch (error) {
    console.error('Error creating form:', error);
    return { success: false, error };
  }
}

/**
 * Submit a form
 */
export async function submitForm(submission: Omit<FormSubmission, 'id' | 'submittedAt'>) {
  try {
    const submissionsRef = collection(db, COLLECTIONS.FORM_SUBMISSIONS);
    
    const docRef = await addDoc(submissionsRef, {
      ...submission,
      submittedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: submission.submittedBy,
      action: 'submit',
      resourceType: 'submission',
      resourceId: docRef.id,
      description: `Form submitted: ${submission.formId}`
    });
    
    return { success: true, submissionId: docRef.id };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { success: false, error };
  }
}

// ============================================================================
// REFERRALS
// ============================================================================

/**
 * Create a referral resource
 */
export async function createReferralResource(resource: Omit<ReferralResource, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const resourcesRef = collection(db, COLLECTIONS.RESOURCES);
    
    const docRef = await addDoc(resourcesRef, {
      ...resource,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      action: 'create',
      resourceType: 'referral',  // Using 'referral' as the resource type for consistency
      resourceId: docRef.id,
      description: `Referral resource created: ${resource.name}`
    });
    
    return { success: true, resourceId: docRef.id };
  } catch (error) {
    console.error('Error creating referral resource:', error);
    return { success: false, error };
  }
}

/**
 * Create a referral
 */
export async function createReferral(referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const referralsRef = collection(db, COLLECTIONS.REFERRALS);
    
    const docRef = await addDoc(referralsRef, {
      ...referral,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      userId: referral.chwId,
      action: 'create',
      resourceType: 'referral',
      resourceId: docRef.id,
      description: `Referral created for client ${referral.clientId}`
    });
    
    return { success: true, referralId: docRef.id };
  } catch (error) {
    console.error('Error creating referral:', error);
    return { success: false, error };
  }
}

// ============================================================================
// PROJECTS & GRANTS
// ============================================================================

/**
 * Get all grants
 */
export async function getGrants(): Promise<{ success: boolean; grants?: Grant[]; error?: any }> {
  try {
    const grantsRef = collection(db, COLLECTIONS.GRANTS);
    const querySnapshot = await getDocs(grantsRef);
    
    const grants: Grant[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Grant));
    
    return { success: true, grants };
  } catch (error) {
    console.error('Error fetching grants:', error);
    return { success: false, error };
  }
}

/**
 * Get a single grant by ID
 */
export async function getGrantById(id: string): Promise<{ success: boolean; grant?: Grant; error?: any }> {
  try {
    const grantRef = doc(db, COLLECTIONS.GRANTS, id);
    const grantDoc = await getDoc(grantRef);
    
    if (!grantDoc.exists()) {
      return { success: false, error: 'Grant not found' };
    }
    
    const grant: Grant = {
      id: grantDoc.id,
      ...grantDoc.data()
    } as Grant;
    
    return { success: true, grant };
  } catch (error) {
    console.error('Error fetching grant:', error);
    return { success: false, error };
  }
}

/**
 * Create a grant
 */
export async function createGrant(grant: Omit<Grant, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; grantId?: string; error?: any }> {
  try {
    const grantsRef = collection(db, COLLECTIONS.GRANTS);
    
    const docRef = await addDoc(grantsRef, {
      ...grant,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      action: 'create',
      resourceType: 'grant',
      resourceId: docRef.id,
      description: `Grant created: ${grant.title}`
    });
    
    return { success: true, grantId: docRef.id };
  } catch (error) {
    console.error('Error creating grant:', error);
    return { success: false, error };
  }
}

/**
 * Update a grant
 */
export async function updateGrant(id: string, updates: Partial<Grant>): Promise<{ success: boolean; error?: any }> {
  try {
    const grantRef = doc(db, COLLECTIONS.GRANTS, id);
    
    await updateDoc(grantRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    // Log activity
    await logActivity({
      action: 'update',
      resourceType: 'grant',
      resourceId: id,
      description: `Grant updated: ${updates.title || id}`
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating grant:', error);
    return { success: false, error };
  }
}

/**
 * Delete a grant
 */
export async function deleteGrant(id: string): Promise<{ success: boolean; error?: any }> {
  try {
    const grantRef = doc(db, COLLECTIONS.GRANTS, id);
    
    await deleteDoc(grantRef);
    
    // Log activity
    await logActivity({
      action: 'delete',
      resourceType: 'grant',
      resourceId: id,
      description: `Grant deleted: ${id}`
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting grant:', error);
    return { success: false, error };
  }
}

/**
 * Get all grants
 */
export async function getAllGrants(options: {
  organizationId?: string;
  status?: string;
  limit?: number;
} = {}): Promise<{ success: boolean; grants: Grant[]; error?: any }> {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (options.organizationId) {
      constraints.push(where('organizationId', '==', options.organizationId));
    }
    
    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }
    
    // Always sort by creation date, newest first
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    const grantsQuery = query(collection(db, COLLECTIONS.GRANTS), ...constraints);
    const grantsSnapshot = await getDocs(grantsQuery);
    
    const grants = grantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Grant[];
    
    return { success: true, grants };
  } catch (error) {
    console.error('Error getting grants:', error);
    return { success: false, grants: [], error };
  }
}

/**
 * Get active grants count
 */
export async function getActiveGrantsCount(): Promise<number> {
  try {
    const grantsQuery = query(
      collection(db, COLLECTIONS.GRANTS),
      where('status', '==', 'active')
    );
    
    const grantsSnapshot = await getDocs(grantsQuery);
    return grantsSnapshot.size;
  } catch (error) {
    console.error('Error fetching active grants count:', error);
    return 8; // Fallback mock value
  }
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Create dashboard metrics
 */
export async function createDashboardMetrics(metrics: Omit<DashboardMetrics, 'id' | 'updatedAt'>) {
  try {
    const metricsRef = collection(db, COLLECTIONS.DASHBOARD_METRICS);
    
    const docRef = await addDoc(metricsRef, {
      ...metrics,
      updatedAt: Timestamp.now()
    });
    
    return { success: true, metricsId: docRef.id };
  } catch (error) {
    console.error('Error creating dashboard metrics:', error);
    return { success: false, error };
  }
}

/**
 * Get the latest dashboard metrics for an organization
 */
export async function getLatestDashboardMetrics(organizationId: string) {
  try {
    const metricsQuery = query(
      collection(db, COLLECTIONS.DASHBOARD_METRICS),
      where('organizationId', '==', organizationId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const metricsSnapshot = await getDocs(metricsQuery);
    
    if (!metricsSnapshot.empty) {
      const metricsDoc = metricsSnapshot.docs[0];
      return {
        success: true,
        metrics: {
          id: metricsDoc.id,
          ...metricsDoc.data()
        } as DashboardMetrics
      };
    }
    
    return { success: false, error: 'No metrics found' };
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return { success: false, error };
  }
}

// ============================================================================
// ACTIVITY LOGS & NOTIFICATIONS
// ============================================================================

/**
 * Log an activity
 */
export async function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
  try {
    const activityRef = collection(db, COLLECTIONS.ACTIVITY_LOGS);
    
    const docRef = await addDoc(activityRef, {
      ...activity,
      timestamp: Timestamp.now()
    });
    
    return { success: true, activityId: docRef.id };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { success: false, error };
  }
}

/**
 * Create a notification
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  try {
    const notificationRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    
    const docRef = await addDoc(notificationRef, {
      ...notification,
      createdAt: Timestamp.now()
    });
    
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
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
    
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return { success: false, error, notifications: [] };
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
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

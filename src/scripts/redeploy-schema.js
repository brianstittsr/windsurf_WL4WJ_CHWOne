// Script to redeploy the database schema and add an admin user
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  getDoc
} = require('firebase/firestore');

// Firebase configuration - using the actual config from firebase-config.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBXH7JgXIWzi7j3iQvdlVtC7JYu4wRRJZ0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "chwone-platform.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "chwone-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "chwone-platform.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abc123def456ghi789jkl"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Collection constants
const COLLECTIONS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  CHW_PROFILES: 'chwProfiles',
};

// User roles
const UserRole = {
  ADMIN: 'admin',
  CHW: 'chw',
  CHW_COORDINATOR: 'chw_coordinator',
  NONPROFIT_STAFF: 'nonprofit_staff',
  WL4WJ_CHW: 'wl4wj_chw',
  CLIENT: 'client',
  VIEWER: 'viewer',
  DEMO: 'demo'
};

// Current schema version
const CURRENT_SCHEMA_VERSION = '1.0.0';

/**
 * Initialize the Firebase database schema
 */
async function initializeFirebaseSchema() {
  try {
    console.log('Starting Firebase schema initialization...');
    
    // Check if schema is already initialized
    const schemaVersionRef = doc(db, 'system', 'schema_version');
    const schemaVersionDoc = await getDoc(schemaVersionRef);
    
    if (schemaVersionDoc.exists()) {
      const currentVersion = schemaVersionDoc.data().version;
      console.log(`Schema already initialized (version ${currentVersion})`);
      
      // Force re-initialization
      console.log('Forcing schema re-initialization...');
    }
    
    // Initialize organizations
    await initializeOrganizations();
    
    // Create schema version document
    await setDoc(schemaVersionRef, {
      version: CURRENT_SCHEMA_VERSION,
      appliedAt: Timestamp.now(),
      description: 'Schema redeployment',
      changes: ['Redeployed default organizations', 'Set up initial collections']
    });
    
    // Create a connection test document
    await setDoc(doc(db, 'system', 'connection_test'), {
      timestamp: Timestamp.now(),
      status: 'active'
    });
    
    console.log(`Schema initialization complete (version ${CURRENT_SCHEMA_VERSION})`);
    return true;
  } catch (error) {
    console.error('Error initializing Firebase schema:', error);
    return false;
  }
}

/**
 * Initialize organizations collection with default organizations
 */
async function initializeOrganizations() {
  console.log('Initializing organizations...');
  
  // Create default organizations
  await Promise.all([
    createDefaultOrganization('general', 'CHWOne Platform', 'CHWOne'),
    createDefaultOrganization('region5', 'Region 5 Health Department', 'Region 5'),
    createDefaultOrganization('wl4wj', 'Women Leading for Wellness & Justice', 'WL4WJ')
  ]);
  
  console.log('Created default organizations');
}

/**
 * Create a default organization
 */
async function createDefaultOrganization(id, name, shortName) {
  const organization = {
    id,
    name,
    shortName,
    description: `${name} organization for CHWOne platform`,
    type: id === 'general' ? 'community_org' : (id === 'region5' ? 'health_department' : 'nonprofit'),
    
    // Contact Information
    contactEmail: `contact@${id}.org`,
    contactPhone: '555-123-4567',
    website: `https://www.${id}.org`,
    address: {
      street: '123 Main St',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      county: 'Mecklenburg',
      country: 'USA'
    },
    
    // Branding
    logoUrl: `/images/${id}-logo.png`,
    faviconUrl: `/images/${id}-favicon.ico`,
    primaryColor: id === 'general' ? '#1a365d' : (id === 'region5' ? '#2a4365' : '#2c5282'),
    secondaryColor: id === 'general' ? '#4a5568' : (id === 'region5' ? '#718096' : '#2d3748'),
    fontFamily: 'Inter, sans-serif',
    
    // Settings
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
      }
    },
    
    // Timestamps
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  await setDoc(doc(db, COLLECTIONS.ORGANIZATIONS, id), organization);
  console.log(`Created organization: ${name}`);
}

/**
 * Create an admin user
 */
async function createAdminUser(email, password, displayName) {
  try {
    console.log(`Creating admin user: ${email}...`);
    
    // Check if user already exists
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`User ${email} already exists, updating profile...`);
      
      // Update the user profile
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Update the user document
      await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: UserRole.ADMIN,
        organizationId: 'wl4wj',
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        hipaaTrainingCompleted: true,
        hipaaTrainingDate: Timestamp.now()
      }, { merge: true });
      
      console.log(`Updated existing admin user: ${email}`);
      return userCredential.user;
    } catch (signInError) {
      // User doesn't exist, create a new one
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Create a user document
      await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: UserRole.ADMIN,
        organizationId: 'wl4wj',
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        hipaaTrainingCompleted: true,
        hipaaTrainingDate: Timestamp.now()
      });
      
      console.log(`Created new admin user: ${email}`);
      return userCredential.user;
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Initialize the schema
    await initializeFirebaseSchema();
    
    // Create the admin user
    const adminUser = await createAdminUser(
      'brians@wl4wl.org', 
      'Yfhk9r76q@@123456', 
      'Brian Stitts'
    );
    
    console.log(`Successfully created admin user: ${adminUser.email}`);
    console.log('Script completed successfully!');
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the main function
main();

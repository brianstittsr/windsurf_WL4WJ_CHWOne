/**
 * Firebase Schema Initialization Script
 * 
 * This script initializes the Firebase schema and creates an admin user.
 * Run this script after setting up your Firebase configuration in .env.local
 * 
 * Usage: node scripts/initialize-firebase.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Starting Firebase schema initialization script...');
console.log('Checking environment variables...');

// Check for required Firebase configuration
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease add these variables to your .env.local file and try again.');
  process.exit(1);
}

console.log('All required environment variables are present.');
console.log('Initializing Firebase...');

// Import Firebase modules
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
  getDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  // Add other collections as needed
};

// Initialize schema
async function initializeFirebaseSchema() {
  try {
    console.log('Starting Firebase schema initialization...');
    
    // Check if schema is already initialized
    const schemaVersionRef = doc(db, 'system', 'schema_version');
    const schemaVersionDoc = await getDoc(schemaVersionRef);
    
    if (schemaVersionDoc.exists()) {
      const currentVersion = schemaVersionDoc.data().version;
      console.log(`Schema already initialized (version ${currentVersion})`);
      return true;
    }
    
    // Initialize organizations
    await initializeOrganizations();
    
    // Create admin user
    await createAdminUser();
    
    // Create schema version document
    await setDoc(schemaVersionRef, {
      version: '1.0.0',
      appliedAt: Timestamp.now(),
      description: 'Initial schema creation',
      changes: ['Created default organizations', 'Created admin user', 'Set up initial collections']
    });
    
    // Create a connection test document
    await setDoc(doc(db, 'system', 'connection_test'), {
      timestamp: Timestamp.now(),
      status: 'active'
    });
    
    console.log(`Schema initialization complete (version 1.0.0)`);
    return true;
  } catch (error) {
    console.error('Error initializing Firebase schema:', error);
    return false;
  }
}

// Initialize organizations
async function initializeOrganizations() {
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
  } else {
    console.log(`Found ${organizationsSnapshot.size} existing organizations`);
  }
}

// Create a default organization
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

// Create admin user
async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin user already exists
    const usersRef = collection(db, COLLECTIONS.USERS);
    const adminQuery = query(usersRef, where('email', '==', 'admin@example.com'));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      console.log('Admin user already exists');
      return true;
    }
    
    // Admin user credentials
    const email = 'admin@example.com';
    const password = 'admin123';
    const displayName = 'Admin User';
    
    console.log(`Creating admin user: ${email}`);
    
    try {
      // Try to create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: UserRole.ADMIN,
        organizationId: 'general', // Default organization
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        hipaaTrainingCompleted: true,
        hipaaTrainingDate: Timestamp.now()
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
      
      console.log(`Admin user created successfully with UID: ${user.uid}`);
      console.log('You can now log in with:');
      console.log(`Email: ${email}`);
      console.log('Password: admin123');
      
      return true;
    } catch (error) {
      // If user already exists, try to sign in and update the user document
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists in Authentication. Updating Firestore document...');
        
        try {
          // Sign in with existing user
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Create/update user document in Firestore
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            role: UserRole.ADMIN,
            organizationId: 'general', // Default organization
            isActive: true,
            isApproved: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            hipaaTrainingCompleted: true,
            hipaaTrainingDate: Timestamp.now()
          };
          
          await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
          
          console.log(`Admin user document updated successfully with UID: ${user.uid}`);
          return true;
        } catch (signInError) {
          console.error('Error signing in as admin user:', signInError);
          throw signInError;
        }
      } else {
        console.error('Error creating admin user:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    return false;
  }
}

// Run the initialization
initializeFirebaseSchema()
  .then(() => {
    console.log('Firebase initialization complete. You should now be able to log in with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    process.exit(0);
  })
  .catch(error => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });

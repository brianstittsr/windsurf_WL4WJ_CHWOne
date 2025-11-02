/**
 * Setup Demo Users Script
 * 
 * This script creates demo users for the CHWOne platform:
 * - Administrator: admin@example.com
 * - CHW Coordinator: coordinator@example.com
 * - Community Health Worker: chw@example.com
 * 
 * It also fixes Firebase configuration issues shown in the error message
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Firebase modules
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Manually define UserRole to avoid TypeScript import issues in a JS script
const UserRole = {
  ADMIN: 'admin',
  CHW: 'chw',
  CHW_COORDINATOR: 'chw_coordinator',
  NONPROFIT_STAFF: 'nonprofit_staff',
  CHW_ASSOCIATION: 'chw_association',
  WL4WJ_CHW: 'wl4wj_chw',
  CLIENT: 'client',
  VIEWER: 'viewer',
  DEMO: 'demo'
};

// Demo user credentials
const demoUsers = Object.values(UserRole).map(role => ({
  email: `demo-${role}@example.com`,
  password: 'pass123',
  displayName: `Demo ${role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
  role: role,
  organizationId: 'general',
  isActive: true,
  isApproved: true
}));

// Initialize Firebase Admin SDK
let admin;
try {
  admin = require('firebase-admin');

  const sanitizePrivateKey = (key) => {
    if (!key) return null;
    return key.replace(/\n/g, '\n');
  };

  if (getApps().length === 0) {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    let credential;

    if (serviceAccountPath) {
      console.log(`Initializing Firebase with service account from: ${serviceAccountPath}`);
      credential = admin.credential.applicationDefault();
    } else {
      console.log('Initializing Firebase with credentials from .env.local');
      const privateKey = sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error('Missing required Firebase Admin credentials in .env.local. Please provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
      }

      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      };
      credential = admin.credential.cert(serviceAccount);
    }

    admin.initializeApp({ credential });
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.log('Firebase Admin SDK already initialized');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error('\n\n--- Firebase Admin SDK Initialization Failed ---');
  console.error('This is likely due to an incorrectly formatted FIREBASE_PRIVATE_KEY in your .env.local file.');
  console.error('Please ensure your private key is wrapped in double quotes and contains literal \\n characters for newlines, like this:');
  console.error('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n[KEY_CONTENT]\\n-----END PRIVATE KEY-----\\n"');
  process.exit(1);
}

// Get Firestore and Auth instances
const db = getFirestore();
const auth = getAuth();

// Function to create or update a user
async function createOrUpdateUser(userData) {
  try {
    console.log(`Processing user: ${userData.email}`);
    
    // Check if user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(userData.email);
      console.log(`User ${userData.email} already exists in Auth with UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create the user in Firebase Auth
        userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true
        });
        console.log(`Created new user in Auth with UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    
    // Create or update the user document in Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    
    // Create user data for Firestore
    const userDocData = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      organizationId: userData.organizationId,
      isActive: userData.isActive,
      isApproved: userData.isApproved,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      hipaaTrainingCompleted: true,
      hipaaTrainingDate: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Set the user document
    await userRef.set(userDocData, { merge: true });
    console.log(`User document created/updated in Firestore for ${userData.email}`);
    
    return userRecord.uid;
  } catch (error) {
    console.error(`Error processing user ${userData.email}:`, error);
    throw error;
  }
}

// Function to create default organizations if they don't exist
async function createDefaultOrganizations() {
  try {
    console.log('Creating default organizations...');
    
    const organizations = [
      {
        id: 'general',
        name: 'General Organization',
        description: 'Default organization for all users',
        isActive: true
      },
      {
        id: 'region5',
        name: 'Region 5',
        description: 'Region 5 organization',
        isActive: true
      },
      {
        id: 'wl4wj',
        name: 'Women Leading for Wellness and Justice',
        description: 'WL4WJ organization',
        isActive: true
      }
    ];
    
    for (const org of organizations) {
      const orgRef = db.collection('organizations').doc(org.id);
      await orgRef.set({
        ...org,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Organization ${org.name} created/updated`);
    }
    
    console.log('Default organizations created successfully');
  } catch (error) {
    console.error('Error creating default organizations:', error);
    throw error;
  }
}

// Function to create schema version document
async function createSchemaVersion() {
  try {
    console.log('Creating schema version document...');
    
    const schemaRef = db.collection('system').doc('schema_version');
    await schemaRef.set({
      version: '1.0.0',
      appliedAt: admin.firestore.FieldValue.serverTimestamp(),
      description: 'Initial schema version'
    }, { merge: true });
    
    console.log('Schema version document created successfully');
  } catch (error) {
    console.error('Error creating schema version document:', error);
    throw error;
  }
}

// Function to verify Firebase configuration
async function verifyFirebaseConfig() {
  console.log('Verifying Firebase configuration...');
  
  // Check if required environment variables are set
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.log('Please add these variables to your .env.local file');
    return false;
  }
  
  console.log('All required Firebase configuration variables are present');
  return true;
}

// Main function to run the script
async function main() {
  console.log('Starting demo users setup...');
  
  try {
    // Verify Firebase configuration
    const configValid = await verifyFirebaseConfig();
    if (!configValid) {
      console.error('Firebase configuration is invalid. Please fix the issues and try again.');
      process.exit(1);
    }
    
    // Create default organizations
    await createDefaultOrganizations();
    
    // Create schema version document
    await createSchemaVersion();
    
    // Create or update demo users
    for (const userData of demoUsers) {
      await createOrUpdateUser(userData);
    }
    
    console.log('\nDemo users setup completed successfully!');
    console.log('\nYou can now log in with the following credentials:');
    
    demoUsers.forEach(user => {
      console.log(`\n${user.displayName}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error setting up demo users:', error);
    process.exit(1);
  }
}

// Run the script
main();

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

// Demo user credentials
const demoUsers = [
  {
    email: 'admin@example.com',
    password: 'password123',
    displayName: 'Administrator',
    role: 'admin',
    organizationId: 'general',
    isActive: true,
    isApproved: true
  },
  {
    email: 'coordinator@example.com',
    password: 'password123',
    displayName: 'CHW Coordinator',
    role: 'chw_coordinator',
    organizationId: 'general',
    isActive: true,
    isApproved: true
  },
  {
    email: 'chw@example.com',
    password: 'password123',
    displayName: 'Community Health Worker',
    role: 'chw',
    organizationId: 'general',
    isActive: true,
    isApproved: true
  }
];

// Initialize Firebase Admin SDK
let admin;
try {
  admin = require('firebase-admin');
  
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    // Initialize with service account
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle the private key format (replace \\n with \n)
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.log('Firebase Admin SDK already initialized');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
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

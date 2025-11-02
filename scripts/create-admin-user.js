/**
 * Create Admin User Script
 *
 * This script creates the main admin user (admin@example.com) needed for accessing
 * the setup-demo-users page and other admin functions.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Firebase modules
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const adminUser = {
  email: 'admin@example.com',
  password: 'admin123',
  displayName: 'Administrator',
  role: 'admin',
  organizationId: 'general',
  isActive: true,
  isApproved: true
};

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
        console.error('Missing required Firebase Admin credentials in .env.local');
        console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
        process.exit(1);
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
  console.error('\nFirebase Admin SDK setup failed. This could be due to:');
  console.error('1. Missing or incorrectly formatted FIREBASE_PRIVATE_KEY in .env.local');
  console.error('2. Invalid Firebase project credentials');
  console.error('\nFalling back to client-side creation...');
  console.log('\nTo create the admin user, please:');
  console.log('1. Go to your Firebase Console');
  console.log('2. Go to Authentication > Users');
  console.log('3. Click "Add User"');
  console.log('4. Email: admin@example.com');
  console.log('5. Password: admin123');
  console.log('6. Then manually create a user document in Firestore with role: "admin"');
  process.exit(1);
}

// Get Firestore and Auth instances
const db = getFirestore();
const auth = getAuth();

// Function to create admin user
async function createAdminUser() {
  try {
    console.log(`Creating admin user: ${adminUser.email}`);

    // Check if user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminUser.email);
      console.log(`Admin user already exists in Auth with UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create the user in Firebase Auth
        userRecord = await auth.createUser({
          email: adminUser.email,
          password: adminUser.password,
          displayName: adminUser.displayName,
          emailVerified: true
        });
        console.log(`Created admin user in Auth with UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Create or update the user document in Firestore
    const userRef = db.collection('users').doc(userRecord.uid);

    const userDocData = {
      uid: userRecord.uid,
      email: adminUser.email,
      displayName: adminUser.displayName,
      role: adminUser.role,
      organizationId: adminUser.organizationId,
      isActive: adminUser.isActive,
      isApproved: adminUser.isApproved,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      hipaaTrainingCompleted: true,
      hipaaTrainingDate: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(userDocData, { merge: true });
    console.log(`Admin user document created/updated in Firestore`);

    console.log('\n✅ Admin user setup completed successfully!');
    console.log('\nYou can now log in with:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log(`Role: ${adminUser.role}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Run the script
createAdminUser().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

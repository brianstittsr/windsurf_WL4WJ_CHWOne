/**
 * Check Admin User Script
 * 
 * This script checks if the admin user exists in Firebase Authentication
 * and creates it if it doesn't exist.
 * 
 * Usage: node scripts/check-admin-user.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Starting admin user check...');
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

// Check if admin user exists
async function checkAdminUser() {
  try {
    console.log('Checking if admin user exists...');
    
    // Try to sign in with admin credentials
    try {
      console.log('Attempting to sign in as admin...');
      const userCredential = await signInWithEmailAndPassword(auth, 'admin@example.com', 'admin123');
      console.log('Admin user exists in Authentication. User ID:', userCredential.user.uid);
      
      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));
      if (userDoc.exists()) {
        console.log('Admin user document exists in Firestore.');
        console.log('User data:', userDoc.data());
      } else {
        console.log('Admin user exists in Authentication but not in Firestore. Creating user document...');
        await createAdminUserDocument(userCredential.user);
      }
      
      return true;
    } catch (signInError) {
      console.log('Could not sign in as admin:', signInError.message);
      console.log('Admin user does not exist or credentials are incorrect. Creating admin user...');
      
      // Create admin user
      return await createAdminUser();
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
    return false;
  }
}

// Create admin user
async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Admin user credentials
    const email = 'admin@example.com';
    const password = 'admin123';
    const displayName = 'Admin User';
    
    console.log(`Creating admin user: ${email}`);
    
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await createAdminUserDocument(user);
      
      console.log(`Admin user created successfully with UID: ${user.uid}`);
      console.log('You can now log in with:');
      console.log(`Email: ${email}`);
      console.log('Password: admin123');
      
      return true;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    return false;
  }
}

// Create admin user document in Firestore
async function createAdminUserDocument(user) {
  try {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Admin User',
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
    console.log(`Admin user document created successfully for UID: ${user.uid}`);
    return true;
  } catch (error) {
    console.error('Error creating admin user document:', error);
    return false;
  }
}

// Run the check
checkAdminUser()
  .then(() => {
    console.log('Admin user check complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during admin user check:', error);
    process.exit(1);
  });

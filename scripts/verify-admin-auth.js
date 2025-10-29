/**
 * Verify Admin User in Firebase Authentication
 * 
 * This script checks if the admin user exists in Firebase Authentication
 * and attempts to create it if it doesn't exist.
 * 
 * Usage: node scripts/verify-admin-auth.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Admin user credentials
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';
const adminDisplayName = 'Admin User';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function verifyAdminAuth() {
  console.log(`Checking if admin user (${adminEmail}) exists in Firebase Authentication...`);
  
  try {
    // Try to sign in with admin credentials
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✅ Admin user exists and credentials are valid.');
    return true;
  } catch (error) {
    // Handle different error types
    if (error.code === 'auth/user-not-found') {
      console.log('❌ Admin user does not exist in Firebase Authentication.');
      console.log('Creating admin user...');
      
      try {
        // Create the admin user
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        
        // Update profile with display name
        await updateProfile(userCredential.user, { displayName: adminDisplayName });
        
        console.log('✅ Admin user created successfully!');
        console.log(`UID: ${userCredential.user.uid}`);
        console.log(`Email: ${userCredential.user.email}`);
        console.log(`Display Name: ${adminDisplayName}`);
        
        return true;
      } catch (createError) {
        console.error('❌ Error creating admin user:', createError.message);
        return false;
      }
    } else if (error.code === 'auth/invalid-credential') {
      console.error('❌ Admin user exists but password is incorrect.');
      console.log('To reset the password, you can:');
      console.log('1. Use the Firebase Console to reset the password');
      console.log('2. Delete the user in Firebase Console and run this script again');
      return false;
    } else {
      console.error(`❌ Error checking admin user: ${error.code} - ${error.message}`);
      return false;
    }
  }
}

// Run the verification
verifyAdminAuth()
  .then(success => {
    if (success) {
      console.log('Admin user verification completed successfully.');
    } else {
      console.log('Admin user verification failed.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

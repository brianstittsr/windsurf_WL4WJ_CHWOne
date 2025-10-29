/**
 * Reset Admin Password Script
 * 
 * This script resets the admin user's password in Firebase Authentication
 * using admin SDK (requires service account credentials).
 * 
 * Usage: node scripts/reset-admin-password.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Firebase modules
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

// Admin user email
const adminEmail = 'admin@example.com';
const newPassword = 'admin123';

// Initialize Firebase Admin SDK
// Note: This requires service account credentials
try {
  // Try to initialize with service account from environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Initialized Firebase Admin SDK with service account from environment variable');
  } else {
    // Try to initialize with application default credentials
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    console.log('Initialized Firebase Admin SDK with application default credentials');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  console.log('\nTo use this script, you need Firebase Admin SDK credentials:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Generate a new private key');
  console.log('3. Add the JSON content to your .env.local file as FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}');
  process.exit(1);
}

async function resetAdminPassword() {
  try {
    // Get user by email
    const userRecord = await getAuth().getUserByEmail(adminEmail);
    console.log(`Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Update password
    await getAuth().updateUser(userRecord.uid, {
      password: newPassword
    });
    
    console.log(`✅ Password reset successfully for ${adminEmail}`);
    console.log(`New password: ${newPassword}`);
    return true;
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    return false;
  }
}

// Run the password reset
resetAdminPassword()
  .then(success => {
    if (success) {
      console.log('Password reset completed successfully.');
    } else {
      console.log('Password reset failed.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

/**
 * Firebase Password Reset Script
 * 
 * This script resets the password for a specific user in Firebase Authentication.
 * 
 * Usage: node scripts/reset-password.js
 * 
 * Requirements:
 * - Environment variables from .env.local:
 *   - FIREBASE_PROJECT_ID
 *   - FIREBASE_CLIENT_EMAIL
 *   - FIREBASE_PRIVATE_KEY
 */

const admin = require('firebase-admin');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const TARGET_EMAIL = 'anab@wl4wj.org';
const NEW_PASSWORD = 'wl4wj2023';

// Initialize Firebase Admin
async function initializeFirebase() {
  try {
    // Check for required environment variables
    if (
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PROJECT_ID
    ) {
      console.error('❌ Missing required environment variables.');
      console.log('\nRequired variables in .env.local:');
      console.log('  - FIREBASE_PROJECT_ID');
      console.log('  - FIREBASE_CLIENT_EMAIL');
      console.log('  - FIREBASE_PRIVATE_KEY');
      return false;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
    console.log(`   Project: ${process.env.FIREBASE_PROJECT_ID}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    return false;
  }
}

// Reset password for user
async function resetPassword(email, newPassword) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`\n📧 Found user: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Display Name: ${userRecord.displayName || 'Not set'}`);
    
    // Update the password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });
    
    console.log(`\n✅ Password successfully reset for ${email}`);
    console.log(`   New password: ${newPassword}`);
    
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ User not found: ${email}`);
    } else if (error.code === 'auth/invalid-password') {
      console.error(`\n❌ Invalid password. Password must be at least 6 characters.`);
    } else {
      console.error(`\n❌ Error resetting password:`, error.message);
    }
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔐 Firebase Password Reset Script');
  console.log('==================================\n');
  
  const initialized = await initializeFirebase();
  if (!initialized) {
    process.exit(1);
  }
  
  const success = await resetPassword(TARGET_EMAIL, NEW_PASSWORD);
  
  if (success) {
    console.log('\n✨ Done! The user can now log in with the new password.');
  } else {
    console.log('\n⚠️  Password reset failed. Please check the error above.');
  }
  
  process.exit(success ? 0 : 1);
}

main();

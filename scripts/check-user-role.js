/**
 * Check and Update User Role Script
 * 
 * This script checks a user's role in Firestore and can update it to ADMIN.
 * 
 * Usage: node scripts/check-user-role.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const TARGET_EMAIL = 'anab@wl4wj.org';
const SET_AS_ADMIN = true; // Set to true to update the user to ADMIN role

// Initialize Firebase Admin
async function initializeFirebase() {
  try {
    if (
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PROJECT_ID
    ) {
      console.error('❌ Missing required environment variables.');
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
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    return false;
  }
}

// Check and update user role
async function checkAndUpdateUserRole(email, setAsAdmin) {
  const db = admin.firestore();
  const auth = admin.auth();
  
  try {
    // Get user from Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    console.log(`\n📧 Found user in Auth: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}`);
    
    // Check Firestore for user profile
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log(`\n⚠️  No user profile found in Firestore for ${email}`);
      
      if (setAsAdmin) {
        console.log('\n📝 Creating user profile with ADMIN role...');
        await usersRef.doc(userRecord.uid).set({
          email: email,
          uid: userRecord.uid,
          role: 'ADMIN',
          roles: ['ADMIN'],
          primaryRole: 'ADMIN',
          displayName: userRecord.displayName || 'Ana Blackburn',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true,
        });
        console.log('✅ User profile created with ADMIN role');
      }
      return;
    }
    
    // User exists in Firestore
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`\n📋 Current Firestore Profile:`);
    console.log(`   Document ID: ${userDoc.id}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Roles: ${JSON.stringify(userData.roles)}`);
    console.log(`   Primary Role: ${userData.primaryRole}`);
    console.log(`   Display Name: ${userData.displayName}`);
    console.log(`   Is Active: ${userData.isActive}`);
    
    // Check if user is admin
    const isAdmin = userData.role === 'ADMIN' || 
                    userData.role?.toUpperCase() === 'ADMIN' ||
                    userData.roles?.includes('ADMIN') ||
                    userData.roles?.some(r => r?.toUpperCase() === 'ADMIN');
    
    // Check if roles array includes ADMIN
    const rolesIncludeAdmin = userData.roles?.includes('ADMIN');
    
    console.log(`\n🔐 Is Admin: ${isAdmin ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   Roles array includes ADMIN: ${rolesIncludeAdmin ? 'YES ✅' : 'NO ❌'}`);
    
    // Fix: Ensure roles array includes ADMIN if role is ADMIN
    if (setAsAdmin || (userData.role === 'ADMIN' && !rolesIncludeAdmin)) {
      console.log('\n📝 Updating user roles to include ADMIN...');
      await userDoc.ref.update({
        role: 'ADMIN',
        roles: admin.firestore.FieldValue.arrayUnion('ADMIN'),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ User roles updated to include ADMIN');
      
      // Verify the update
      const updatedDoc = await userDoc.ref.get();
      const updatedData = updatedDoc.data();
      console.log(`\n📋 Updated Profile:`);
      console.log(`   Role: ${updatedData.role}`);
      console.log(`   Roles: ${JSON.stringify(updatedData.roles)}`);
      console.log(`   Primary Role: ${updatedData.primaryRole}`);
    }
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ User not found in Auth: ${email}`);
    } else {
      console.error(`\n❌ Error:`, error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('🔍 User Role Check Script');
  console.log('=========================\n');
  
  const initialized = await initializeFirebase();
  if (!initialized) {
    process.exit(1);
  }
  
  await checkAndUpdateUserRole(TARGET_EMAIL, SET_AS_ADMIN);
  
  console.log('\n✨ Done!');
  process.exit(0);
}

main();

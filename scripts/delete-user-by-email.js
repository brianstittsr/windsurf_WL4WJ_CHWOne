#!/usr/bin/env node

/**
 * Delete a User completely from Firebase (Auth + Firestore)
 * 
 * Usage: node scripts/delete-user-by-email.js email@example.com
 * Example: node scripts/delete-user-by-email.js anab@wl4wj.org
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    let credential;
    
    // Try environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } 
    // Try service account file
    else {
      try {
        const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
        const serviceAccount = require(serviceAccountPath);
        credential = admin.credential.cert(serviceAccount);
      } catch (fileError) {
        // Use application default credentials as fallback
        credential = admin.credential.applicationDefault();
      }
    }

    admin.initializeApp({ 
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    console.error('Make sure Firebase credentials are configured');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Delete user completely by email
 */
async function deleteUserByEmail(email) {
  try {
    console.log(`\n🔍 Searching for user: ${email}`);
    
    let userId = null;
    let authUserExists = false;
    
    // Step 1: Find user in Firebase Authentication
    try {
      const userRecord = await auth.getUserByEmail(email);
      userId = userRecord.uid;
      authUserExists = true;
      console.log(`\n✅ Found user in Firebase Auth:`);
      console.log(`   UID: ${userId}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Created: ${userRecord.metadata.creationTime}`);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log(`\n⚠️  User not found in Firebase Authentication`);
      } else {
        throw authError;
      }
    }
    
    // Step 2: Search Firestore collections
    const collectionsToCheck = ['users', 'chwProfiles'];
    const foundDocs = [];
    
    for (const collectionName of collectionsToCheck) {
      console.log(`\n🔍 Checking ${collectionName} collection...`);
      
      // Search by email
      const emailQuery = await db.collection(collectionName)
        .where('email', '==', email)
        .get();
      
      if (!emailQuery.empty) {
        emailQuery.forEach(doc => {
          foundDocs.push({ collection: collectionName, doc });
          const data = doc.data();
          console.log(`   ✅ Found document:`);
          console.log(`      ID: ${doc.id}`);
          console.log(`      Name: ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}`);
          console.log(`      Email: ${data.email || 'N/A'}`);
        });
      }
      
      // Also check by userId if we have it
      if (userId) {
        const userIdDoc = await db.collection(collectionName).doc(userId).get();
        if (userIdDoc.exists) {
          const alreadyFound = foundDocs.some(
            item => item.collection === collectionName && item.doc.id === userId
          );
          if (!alreadyFound) {
            foundDocs.push({ collection: collectionName, doc: userIdDoc });
            const data = userIdDoc.data();
            console.log(`   ✅ Found document by userId:`);
            console.log(`      ID: ${userIdDoc.id}`);
            console.log(`      Name: ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}`);
            console.log(`      Email: ${data.email || 'N/A'}`);
          }
        }
      }
    }
    
    if (!authUserExists && foundDocs.length === 0) {
      console.log(`\n⚠️  No data found for ${email}`);
      return;
    }
    
    // Step 3: Delete everything
    console.log(`\n🗑️  Deleting user data...`);
    
    // Delete Firestore documents
    const batch = db.batch();
    foundDocs.forEach(({ collection, doc }) => {
      console.log(`   Deleting from ${collection}: ${doc.id}`);
      batch.delete(doc.ref);
    });
    
    if (foundDocs.length > 0) {
      await batch.commit();
      console.log(`   ✅ Deleted ${foundDocs.length} Firestore document(s)`);
    }
    
    // Delete from Firebase Authentication
    if (authUserExists && userId) {
      await auth.deleteUser(userId);
      console.log(`   ✅ Deleted user from Firebase Authentication`);
    }
    
    console.log(`\n✅ Successfully deleted all data for ${email}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Firebase Auth: ${authUserExists ? 'Deleted' : 'Not found'}`);
    console.log(`   - Firestore docs: ${foundDocs.length} deleted`);
    foundDocs.forEach(({ collection }) => {
      console.log(`     • ${collection}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error deleting user:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/delete-user-by-email.js email@example.com');
    console.log('Example: node scripts/delete-user-by-email.js anab@wl4wj.org');
    process.exit(1);
  }
  
  const email = args[0];
  
  // Validate email format
  if (!email.includes('@')) {
    console.error('❌ Invalid email format');
    process.exit(1);
  }
  
  try {
    await deleteUserByEmail(email);
    console.log('\n✨ Operation completed successfully\n');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Operation failed\n');
    process.exit(1);
  }
}

main();

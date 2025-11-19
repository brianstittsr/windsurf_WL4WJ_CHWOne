#!/usr/bin/env node

/**
 * Delete a CHW Profile from Firebase Firestore
 * 
 * Usage: node scripts/delete-chw-profile.js "FirstName LastName"
 * Example: node scripts/delete-chw-profile.js "Ana Blackburn"
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

/**
 * Delete CHW profile by name
 */
async function deleteCHWProfile(fullName) {
  try {
    console.log(`\n🔍 Searching for CHW profile: ${fullName}`);
    
    // Split the full name into first and last name
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) {
      console.error('❌ Please provide both first and last name');
      return;
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    console.log(`   First Name: ${firstName}`);
    console.log(`   Last Name: ${lastName}`);
    
    // Query the chwProfiles collection
    const chwProfilesRef = db.collection('chwProfiles');
    
    // Search by first name and last name
    const snapshot = await chwProfilesRef
      .where('firstName', '==', firstName)
      .where('lastName', '==', lastName)
      .get();
    
    if (snapshot.empty) {
      console.log(`\n⚠️  No CHW profile found for "${fullName}"`);
      console.log('   Checking all profiles...\n');
      
      // List all profiles to help find the correct name
      const allProfiles = await chwProfilesRef.get();
      if (allProfiles.empty) {
        console.log('   No CHW profiles exist in the database');
      } else {
        console.log(`   Found ${allProfiles.size} CHW profile(s):`);
        allProfiles.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${data.firstName} ${data.lastName} (ID: ${doc.id})`);
        });
      }
      return;
    }
    
    console.log(`\n✅ Found ${snapshot.size} matching profile(s)`);
    
    // Delete each matching profile
    const batch = db.batch();
    let deleteCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n📋 Profile Details:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Name: ${data.firstName} ${data.lastName}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Certification: ${data.certificationNumber || 'N/A'}`);
      console.log(`   Region: ${data.region || 'N/A'}`);
      
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    // Commit the batch delete
    await batch.commit();
    
    console.log(`\n✅ Successfully deleted ${deleteCount} CHW profile(s) for "${fullName}"`);
    
  } catch (error) {
    console.error('\n❌ Error deleting CHW profile:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/delete-chw-profile.js "FirstName LastName"');
    console.log('Example: node scripts/delete-chw-profile.js "Ana Blackburn"');
    process.exit(1);
  }
  
  const fullName = args.join(' ');
  
  try {
    await deleteCHWProfile(fullName);
    console.log('\n✨ Operation completed successfully\n');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Operation failed\n');
    process.exit(1);
  }
}

main();

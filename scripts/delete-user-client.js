#!/usr/bin/env node

/**
 * Delete user from Firestore using Firebase Client SDK
 * Note: This can only delete Firestore data, not Firebase Auth users
 * For Auth deletion, you need Firebase Admin SDK with proper credentials
 * 
 * Usage: node scripts/delete-user-client.js anab@wl4wj.org
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteUserByEmail(email) {
  try {
    console.log(`\n🔍 Searching for user: ${email}`);
    
    const collectionsToCheck = ['users', 'chwProfiles'];
    let totalDeleted = 0;
    
    for (const collectionName of collectionsToCheck) {
      console.log(`\n📂 Checking ${collectionName} collection...`);
      
      // Query by email
      const q = query(collection(db, collectionName), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`   ⚠️  No documents found`);
      } else {
        console.log(`   ✅ Found ${querySnapshot.size} document(s)`);
        
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          console.log(`\n   📋 Document Details:`);
          console.log(`      ID: ${docSnapshot.id}`);
          console.log(`      Name: ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}`);
          console.log(`      Email: ${data.email || 'N/A'}`);
          
          // Delete the document
          await deleteDoc(doc(db, collectionName, docSnapshot.id));
          console.log(`      ✅ Deleted from ${collectionName}`);
          totalDeleted++;
        }
      }
    }
    
    if (totalDeleted === 0) {
      console.log(`\n⚠️  No Firestore data found for ${email}`);
      console.log(`\n⚠️  Note: This script cannot delete Firebase Auth users.`);
      console.log(`   To fully delete the user, you need to:`);
      console.log(`   1. Go to Firebase Console > Authentication`);
      console.log(`   2. Find the user by email: ${email}`);
      console.log(`   3. Click the three dots menu and select "Delete account"`);
    } else {
      console.log(`\n✅ Successfully deleted ${totalDeleted} Firestore document(s) for ${email}`);
      console.log(`\n⚠️  Important: Firebase Authentication user still exists!`);
      console.log(`   To complete the deletion:`);
      console.log(`   1. Go to: https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`);
      console.log(`   2. Search for: ${email}`);
      console.log(`   3. Delete the authentication user`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/delete-user-client.js email@example.com');
    console.log('Example: node scripts/delete-user-client.js anab@wl4wj.org');
    process.exit(1);
  }
  
  const email = args[0];
  
  if (!email.includes('@')) {
    console.error('❌ Invalid email format');
    process.exit(1);
  }
  
  try {
    await deleteUserByEmail(email);
    console.log('\n✨ Firestore cleanup completed\n');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Operation failed\n');
    process.exit(1);
  }
}

main();

/**
 * Create Admin Profile Script
 * 
 * This script creates an admin user profile in Firestore.
 * Run this with Node.js after installing firebase-admin.
 * 
 * Usage:
 *   node scripts/create-admin-profile.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
// and save it as 'serviceAccountKey.json' in the project root
try {
  const serviceAccount = require('../serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\n📝 To use this script:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the file as "serviceAccountKey.json" in project root');
  console.log('4. Run this script again\n');
  process.exit(1);
}

const db = admin.firestore();

// User details from your console logs
const USER_UID = 'jGnL4ZkY6YWMW2qC040cPpSYl0s1';
const USER_EMAIL = 'admin@example.com';
const DISPLAY_NAME = 'Admin User';

async function createAdminProfile() {
  try {
    console.log('\n🔄 Creating admin profile...');
    console.log(`   UID: ${USER_UID}`);
    console.log(`   Email: ${USER_EMAIL}`);
    
    const userRef = db.collection('users').doc(USER_UID);
    
    // Check if profile already exists
    const doc = await userRef.get();
    if (doc.exists) {
      console.log('\n⚠️  Profile already exists!');
      console.log('   Current data:', doc.data());
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('\n   Update existing profile? (y/n): ', resolve);
      });
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('\n❌ Cancelled');
        process.exit(0);
      }
    }
    
    // Create/update the profile
    const profileData = {
      uid: USER_UID,
      email: USER_EMAIL,
      displayName: DISPLAY_NAME,
      role: 'ADMIN',
      roles: ['ADMIN'],
      primaryRole: 'ADMIN',
      organizationType: 'NONPROFIT',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    };
    
    await userRef.set(profileData, { merge: true });
    
    console.log('\n✅ Admin profile created successfully!');
    console.log('\n📋 Profile Details:');
    console.log(JSON.stringify(profileData, null, 2));
    
    console.log('\n🎉 Next Steps:');
    console.log('1. Go back to your browser');
    console.log('2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');
    console.log('3. Check the lower right corner for the Role Switcher');
    console.log('4. Check console logs for: [AUTH] User document exists: true\n');
    
  } catch (error) {
    console.error('\n❌ Error creating profile:', error);
    process.exit(1);
  }
}

// Run the script
createAdminProfile()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

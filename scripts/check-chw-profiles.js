/**
 * Diagnostic Script: Check CHW Profiles in Firebase
 * 
 * This script checks the chwProfiles collection in Firebase to see:
 * - How many profiles exist
 * - What data they contain
 * - If any are being filtered out
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('❌ Error: serviceAccountKey.json not found');
  console.log('   Please download your Firebase service account key and save it as serviceAccountKey.json');
  console.log('   Get it from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCHWProfiles() {
  console.log('\n🔍 Checking CHW Profiles in Firebase...\n');
  console.log('='.repeat(60));
  
  try {
    // Get all documents from chwProfiles collection
    const chwProfilesRef = db.collection('chwProfiles');
    const snapshot = await chwProfilesRef.get();
    
    console.log(`\n📊 Total documents in chwProfiles collection: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('⚠️  No CHW profiles found in Firebase!');
      console.log('\nPossible reasons:');
      console.log('1. No users have registered as CHWs yet');
      console.log('2. Profiles were deleted');
      console.log('3. Wrong Firebase project connected');
      console.log('\nTo create profiles:');
      console.log('- Users can register at: /chw-profile or via CHW Wizard');
      console.log('- Or run a data migration script to import existing profiles');
      return;
    }
    
    // Analyze each profile
    let adminCount = 0;
    let nonAdminCount = 0;
    const profiles = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const profileInfo = {
        id: doc.id,
        name: `${data.firstName || 'Unknown'} ${data.lastName || 'Unknown'}`,
        email: data.email || 'No email',
        userId: data.userId || doc.id,
        status: data.status || 'unknown',
        createdAt: data.createdAt?.toDate?.() || 'unknown'
      };
      
      // Check if this user is an admin
      try {
        const userDoc = await db.collection('users').doc(data.userId || doc.id).get();
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isAdmin = userData.roles?.includes('ADMIN') || 
                         userData.primaryRole === 'ADMIN' || 
                         userData.role === 'ADMIN';
          
          profileInfo.isAdmin = isAdmin;
          if (isAdmin) {
            adminCount++;
          } else {
            nonAdminCount++;
          }
        } else {
          profileInfo.isAdmin = false;
          profileInfo.userDocMissing = true;
          nonAdminCount++;
        }
      } catch (error) {
        console.error(`Error checking user role for ${doc.id}:`, error.message);
        profileInfo.isAdmin = false;
        nonAdminCount++;
      }
      
      profiles.push(profileInfo);
    }
    
    // Display summary
    console.log('📈 Profile Summary:');
    console.log(`   Total Profiles: ${snapshot.size}`);
    console.log(`   Admin Profiles: ${adminCount} (filtered out from public view)`);
    console.log(`   Non-Admin Profiles: ${nonAdminCount} (shown in directory)`);
    console.log('\n' + '='.repeat(60));
    
    // Display each profile
    console.log('\n📋 Profile Details:\n');
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Status: ${profile.status}`);
      console.log(`   Is Admin: ${profile.isAdmin ? '✅ YES (filtered out)' : '❌ NO (shown)'}`);
      if (profile.userDocMissing) {
        console.log(`   ⚠️  Warning: User document missing in users collection`);
      }
      console.log(`   Created: ${profile.createdAt}`);
      console.log('');
    });
    
    console.log('='.repeat(60));
    
    // Recommendations
    if (nonAdminCount === 0 && adminCount > 0) {
      console.log('\n💡 Issue Found:');
      console.log('   All CHW profiles belong to admin users.');
      console.log('   Admin profiles are filtered out from the public directory.');
      console.log('\n   Solutions:');
      console.log('   1. Create non-admin CHW profiles for testing');
      console.log('   2. Or temporarily disable admin filtering in MockCHWProfiles.tsx');
    } else if (nonAdminCount > 0) {
      console.log(`\n✅ ${nonAdminCount} non-admin profile(s) should be visible in the directory`);
      console.log('   If they\'re not showing, check:');
      console.log('   1. Browser console for errors');
      console.log('   2. Firebase security rules are deployed');
      console.log('   3. User is authenticated');
    }
    
  } catch (error) {
    console.error('\n❌ Error checking CHW profiles:', error);
    console.error('\nDetails:', error.message);
  }
  
  console.log('\n');
  process.exit(0);
}

// Run the check
checkCHWProfiles();

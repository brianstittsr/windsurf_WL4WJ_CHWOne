/**
 * Script to update Ana Blackburn's profile picture
 * Run with: node scripts/update-ana-profile-picture.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Error loading service account:', error.message);
  console.log('Make sure firebase-service-account.json exists in the project root');
  process.exit(1);
}

const db = admin.firestore();

async function updateAnaProfilePicture() {
  const email = 'anab@wl4wj.org';
  const newProfilePicture = '/images/ChatGPT Image Jan 4, 2026, 07_53_02 PM.png';
  
  console.log(`Looking for user with email: ${email}`);
  
  try {
    // First find the user by email
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('email', '==', email).get();
    
    if (userQuery.empty) {
      console.log('User not found in users collection, checking chwProfiles...');
      
      // Try to find in chwProfiles by email
      const chwProfilesRef = db.collection('chwProfiles');
      const chwQuery = await chwProfilesRef.where('email', '==', email).get();
      
      if (chwQuery.empty) {
        console.log('User not found in chwProfiles either.');
        
        // Try searching by name
        console.log('Searching by name "Ana"...');
        const nameQuery = await chwProfilesRef.where('firstName', '==', 'Ana').get();
        
        if (!nameQuery.empty) {
          for (const doc of nameQuery.docs) {
            const data = doc.data();
            console.log(`Found profile: ${data.firstName} ${data.lastName} (${doc.id})`);
            
            // Update the profile picture
            await doc.ref.update({
              profilePicture: newProfilePicture,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Updated profile picture for ${data.firstName} ${data.lastName}`);
          }
        } else {
          console.log('No profiles found with firstName "Ana"');
        }
        return;
      }
      
      // Update chwProfile
      for (const doc of chwQuery.docs) {
        const data = doc.data();
        console.log(`Found CHW profile: ${data.firstName} ${data.lastName}`);
        
        await doc.ref.update({
          profilePicture: newProfilePicture,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Updated profile picture for ${data.firstName} ${data.lastName}`);
      }
      return;
    }
    
    // Update user document
    for (const doc of userQuery.docs) {
      const userData = doc.data();
      console.log(`Found user: ${userData.displayName || userData.email}`);
      
      // Update user profile picture
      await doc.ref.update({
        profilePicture: newProfilePicture,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Updated user profile picture`);
      
      // Also update chwProfile if exists
      const chwProfileRef = db.collection('chwProfiles').doc(doc.id);
      const chwProfileDoc = await chwProfileRef.get();
      
      if (chwProfileDoc.exists) {
        await chwProfileRef.update({
          profilePicture: newProfilePicture,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Updated CHW profile picture`);
      }
    }
    
    console.log('\n✅ Profile picture update complete!');
    console.log(`New image: ${newProfilePicture}`);
    
  } catch (error) {
    console.error('Error updating profile picture:', error);
  }
  
  process.exit(0);
}

updateAnaProfilePicture();

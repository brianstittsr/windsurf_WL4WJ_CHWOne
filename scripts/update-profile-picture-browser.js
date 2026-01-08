/**
 * Browser Console Script to Update Ana Blackburn's Profile Picture
 * 
 * Instructions:
 * 1. Log in to the CHWOne app as an admin
 * 2. Open browser Developer Tools (F12)
 * 3. Go to the Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 */

// This script uses the Firebase SDK that's already loaded in the app
(async function updateAnaProfilePicture() {
  const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
  const { db } = await import('/src/lib/firebase.js');
  
  const email = 'anab@wl4wj.org';
  const newProfilePicture = '/images/ChatGPT Image Jan 4, 2026, 07_53_02 PM.png';
  
  console.log(`Looking for user with email: ${email}`);
  
  try {
    // Search in chwProfiles collection
    const chwProfilesRef = collection(db, 'chwProfiles');
    const q = query(chwProfilesRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Profile not found by email, searching by name...');
      
      // Try by first name
      const nameQuery = query(chwProfilesRef, where('firstName', '==', 'Ana'));
      const nameSnapshot = await getDocs(nameQuery);
      
      if (!nameSnapshot.empty) {
        for (const docSnap of nameSnapshot.docs) {
          const data = docSnap.data();
          console.log(`Found: ${data.firstName} ${data.lastName}`);
          
          await updateDoc(doc(db, 'chwProfiles', docSnap.id), {
            profilePicture: newProfilePicture
          });
          console.log('✅ Profile picture updated!');
        }
      } else {
        console.log('❌ No profile found');
      }
      return;
    }
    
    // Update found profile
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      console.log(`Found: ${data.firstName} ${data.lastName}`);
      
      await updateDoc(doc(db, 'chwProfiles', docSnap.id), {
        profilePicture: newProfilePicture
      });
      console.log('✅ Profile picture updated!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
})();

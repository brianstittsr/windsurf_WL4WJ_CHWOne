// Script to remove Fiesta Family Services tag from Ana Blackburn's profile
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase config:', { projectId: config.projectId });

const app = initializeApp(config);
const db = getFirestore(app);

async function removeTag() {
  const uid = '3pyD951SKJTwiSfHoqpfsFHz8GJ3'; // Ana Blackburn's UID
  
  try {
    // Update users collection
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      const tags = data.organizationTags || [];
      console.log('Current user tags:', tags.length);
      
      // Filter out Fiesta Family Services
      const filtered = tags.filter(t => !t.name.includes('Fiesta'));
      console.log('After filtering:', filtered.length);
      
      await updateDoc(userRef, { organizationTags: filtered });
      console.log('✅ Updated users collection');
    }
    
    // Update chwProfiles collection
    const chwRef = doc(db, 'chwProfiles', uid);
    const chwSnap = await getDoc(chwRef);
    
    if (chwSnap.exists()) {
      const data = chwSnap.data();
      const tags = data.organizationTags || [];
      const filtered = tags.filter(t => !t.name.includes('Fiesta'));
      
      await updateDoc(chwRef, { organizationTags: filtered });
      console.log('✅ Updated chwProfiles collection');
    }
    
    console.log('Done! Fiesta Family Services removed from Ana Blackburn.');
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

removeTag();

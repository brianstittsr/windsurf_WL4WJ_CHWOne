/**
 * Fix User Document Script
 * 
 * This script checks if the admin user document exists in Firestore
 * and creates it if it doesn't.
 * 
 * Usage: node scripts/fix-user-document.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Starting user document fix...');

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user credentials
const email = 'admin@example.com';
const password = 'admin123';

async function fixUserDocument() {
  try {
    console.log(`Attempting to sign in as ${email}...`);
    
    // Sign in with admin credentials
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`Successfully signed in as ${email} (${user.uid})`);
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('User document exists in Firestore:');
      console.log(userDoc.data());
      return true;
    } else {
      console.log('User document does not exist in Firestore. Creating it now...');
      
      // Create user document
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Admin User',
        role: 'admin',
        organizationId: 'general', // Default organization
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        hipaaTrainingCompleted: true,
        hipaaTrainingDate: Timestamp.now()
      };
      
      await setDoc(userDocRef, userData);
      console.log('User document created successfully!');
      
      // Verify document was created
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        console.log('Verification successful. User document now exists in Firestore.');
        return true;
      } else {
        console.error('Verification failed. User document was not created.');
        return false;
      }
    }
  } catch (error) {
    console.error('Error fixing user document:', error);
    return false;
  }
}

// Run the fix
fixUserDocument()
  .then(success => {
    if (success) {
      console.log('User document fix completed successfully.');
    } else {
      console.error('User document fix failed.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during user document fix:', error);
    process.exit(1);
  });

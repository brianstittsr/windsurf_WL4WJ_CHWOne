import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  try {
    const { enableIndexedDbPersistence } = require('firebase/firestore');
    enableIndexedDbPersistence(db).catch((err) => {
      console.error('Firebase persistence error:', err.code);
    });
  } catch (error) {
    console.error('Error enabling persistence:', error);
  }
}

// Use emulators in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  try {
    const { connectAuthEmulator } = require('firebase/auth');
    const { connectStorageEmulator } = require('firebase/storage');
    
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    
    console.log('Using Firebase emulators');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

// Handle Firebase errors gracefully
const handleFirebaseError = (error: any) => {
  console.error('Firebase error:', error);
  
  // Check for permission errors
  if (error.code === 'permission-denied') {
    console.error('Firebase permission denied. Check your security rules.');
    return { type: 'permission', message: 'You do not have permission to access this data.' };
  }
  
  // Check for offline errors
  if (error.code === 'unavailable' || error.code === 'failed-precondition') {
    console.error('Firebase unavailable. App will use cached data if available.');
    return { type: 'offline', message: 'You are currently offline. Some features may be limited.' };
  }
  
  // Other errors
  return { type: 'unknown', message: 'An error occurred. Please try again later.' };
};

export { app, auth, db, storage, handleFirebaseError };

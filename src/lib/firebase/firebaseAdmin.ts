import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      // Check if we have all required environment variables
      if (
        !process.env.FIREBASE_PRIVATE_KEY ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PROJECT_ID
      ) {
        console.warn('Firebase Admin SDK environment variables are missing. Using mock mode.');
        return null;
      }

      // Initialize the app with credentials
      const app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key needs to be properly formatted
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });

      return app;
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      return null;
    }
  }
  
  return getApps()[0];
};

// Initialize the admin app
const adminApp = initializeFirebaseAdmin();

// Get Firestore and Auth instances if admin app is initialized
const adminDb = adminApp ? getFirestore(adminApp) : null;
const adminAuth = adminApp ? getAuth(adminApp) : null;

// Helper function to check if admin is initialized
const isAdminInitialized = () => {
  return !!adminApp;
};

export { adminApp, adminDb, adminAuth, isAdminInitialized };

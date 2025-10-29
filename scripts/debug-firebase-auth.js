/**
 * Debug Firebase Authentication
 * 
 * This script tests Firebase authentication with the admin user credentials
 * and provides detailed error information.
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Print configuration (with masked values for security)
console.log('Firebase Configuration:');
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (value) {
    const maskedValue = typeof value === 'string' 
      ? value.substring(0, 5) + '...' + value.substring(value.length - 5)
      : value;
    console.log(`- ${key}: ${maskedValue}`);
  } else {
    console.log(`- ${key}: MISSING`);
  }
});

// Initialize Firebase
console.log('\nInitializing Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test admin login
console.log('\nTesting admin login...');
const email = 'admin@example.com';
const password = 'admin123';

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log('\n✅ Login successful!');
    console.log('User:', userCredential.user.email);
    console.log('User ID:', userCredential.user.uid);
    
    // Check if user is admin
    console.log('\nChecking user claims...');
    return userCredential.user.getIdTokenResult();
  })
  .then((idTokenResult) => {
    console.log('Token claims:', JSON.stringify(idTokenResult.claims, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Login failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide specific guidance based on error code
    switch(error.code) {
      case 'auth/invalid-credential':
        console.error('\nPossible causes:');
        console.error('- Incorrect email or password');
        console.error('- User does not exist');
        console.error('- User account has been disabled');
        break;
      case 'auth/user-not-found':
        console.error('\nThe admin user does not exist. You need to create it first.');
        console.error('Run: npm run initialize-firebase');
        break;
      case 'auth/wrong-password':
        console.error('\nIncorrect password for the admin account.');
        break;
      case 'auth/invalid-email':
        console.error('\nThe email format is invalid.');
        break;
      case 'auth/network-request-failed':
        console.error('\nNetwork error. Check your internet connection.');
        break;
      case 'auth/admin-restricted-operation':
        console.error('\nThis operation is restricted to admin only.');
        console.error('Possible causes:');
        console.error('- Firebase Authentication service is not enabled in Firebase Console');
        console.error('- Email/password authentication method is not enabled');
        console.error('- The Firebase project may be in a restricted state');
        break;
      default:
        console.error('\nUnknown error. Check Firebase Console for more details.');
    }
    
    process.exit(1);
  });

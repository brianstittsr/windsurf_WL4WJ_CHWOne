/**
 * Verify Firebase Configuration Script
 * 
 * This script checks if the Firebase configuration in .env.local is valid
 * and provides detailed information about any issues.
 * 
 * Usage: node scripts/verify-firebase-config.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Verifying Firebase Configuration...');

// Firebase configuration keys to check
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Check if each variable exists and is not empty
const configStatus = {};
let hasErrors = false;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const exists = !!value;
  const isEmpty = exists && value.trim() === '';
  const isPlaceholder = exists && (
    value.includes('your_') || 
    value.includes('xxxxx') || 
    value.includes('YOUR_') || 
    value.includes('example')
  );
  
  configStatus[varName] = {
    exists,
    isEmpty,
    isPlaceholder,
    value: exists ? (value.length > 10 ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : value) : undefined
  };
  
  if (!exists || isEmpty || isPlaceholder) {
    hasErrors = true;
  }
});

// Display results
console.log('\nFirebase Configuration Status:');
console.log('============================');

Object.entries(configStatus).forEach(([varName, status]) => {
  const icon = status.exists && !status.isEmpty && !status.isPlaceholder ? '✅' : '❌';
  console.log(`${icon} ${varName}:`);
  
  if (!status.exists) {
    console.log('   Missing - Variable not found in .env.local');
  } else if (status.isEmpty) {
    console.log('   Empty - Variable exists but has no value');
  } else if (status.isPlaceholder) {
    console.log('   Placeholder - Contains default or example value');
    console.log(`   Current value: ${status.value}`);
  } else {
    console.log('   Valid');
    console.log(`   Value preview: ${status.value}`);
  }
  
  console.log('');
});

// Provide guidance based on results
if (hasErrors) {
  console.log('\n❌ CONFIGURATION ERRORS DETECTED');
  console.log('==============================');
  console.log('Your Firebase configuration is incomplete or contains placeholder values.');
  console.log('Please update your .env.local file with the correct values from your Firebase project.');
  console.log('\nHow to get Firebase configuration:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Click the gear icon (Project settings)');
  console.log('4. Scroll down to "Your apps" section');
  console.log('5. Select your web app or create a new one');
  console.log('6. Copy the configuration values to your .env.local file');
  console.log('\nExample .env.local format:');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:a1b2c3d4e5f6g7h8i9j0');
} else {
  console.log('\n✅ CONFIGURATION VALID');
  console.log('====================');
  console.log('Your Firebase configuration appears to be valid.');
  console.log('If you are still experiencing issues, please check:');
  console.log('1. Firebase project status in the Firebase Console');
  console.log('2. Authentication service is enabled in Firebase Console');
  console.log('3. Firestore database is created and accessible');
  console.log('4. Security rules allow the operations you are attempting');
}

// Test Firebase initialization
console.log('\nTesting Firebase initialization...');
try {
  const { initializeApp } = require('firebase/app');
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
  
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Test authentication
  console.log('\nTesting Firebase Authentication...');
  const { getAuth, signInAnonymously } = require('firebase/auth');
  const auth = getAuth(app);
  
  signInAnonymously(auth)
    .then(() => {
      console.log('✅ Firebase Authentication is working (anonymous sign-in successful)');
      process.exit(0);
    })
    .catch((error) => {
      console.log(`❌ Firebase Authentication error: ${error.code} - ${error.message}`);
      process.exit(1);
    });
} catch (error) {
  console.log(`❌ Firebase initialization error: ${error.message}`);
  process.exit(1);
}

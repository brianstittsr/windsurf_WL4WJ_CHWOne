/**
 * Verify Demo Users Script
 * 
 * This script checks if the demo users exist in Firebase Authentication
 * and creates them if they don't.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Firebase modules
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

// Demo user credentials
const demoUsers = [
  {
    email: 'admin@example.com',
    password: 'admin123', // Changed to match the login form
    displayName: 'Administrator'
  },
  {
    email: 'coordinator@example.com',
    password: 'password123',
    displayName: 'CHW Coordinator'
  },
  {
    email: 'chw@example.com',
    password: 'password123',
    displayName: 'Community Health Worker'
  }
];

// Initialize Firebase Admin SDK
try {
  // Check if Firebase is already initialized
  if (admin.apps.length === 0) {
    // Initialize with service account
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle the private key format (replace \\n with \n)
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.log('Firebase Admin SDK already initialized');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

// Get Auth instance
const auth = getAuth();

// Function to verify and create a user
async function verifyAndCreateUser(userData) {
  try {
    console.log(`Checking user: ${userData.email}`);
    
    // Check if user exists in Firebase Auth
    try {
      const userRecord = await auth.getUserByEmail(userData.email);
      console.log(`✅ User ${userData.email} exists in Firebase Auth with UID: ${userRecord.uid}`);
      
      // Update the password to ensure it matches what we expect
      await auth.updateUser(userRecord.uid, {
        password: userData.password
      });
      console.log(`✅ Password updated for ${userData.email}`);
      
      return userRecord.uid;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`❌ User ${userData.email} does not exist in Firebase Auth. Creating...`);
        
        // Create the user in Firebase Auth
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true
        });
        
        console.log(`✅ Created user ${userData.email} with UID: ${userRecord.uid}`);
        return userRecord.uid;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error processing user ${userData.email}:`, error);
    return null;
  }
}

// Main function to run the script
async function main() {
  console.log('Verifying demo users in Firebase Authentication...');
  
  try {
    // Verify and create demo users
    for (const userData of demoUsers) {
      await verifyAndCreateUser(userData);
    }
    
    console.log('\nDemo users verification completed!');
    console.log('\nYou can now log in with the following credentials:');
    
    demoUsers.forEach(user => {
      console.log(`\n${user.displayName}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });
    
  } catch (error) {
    console.error('Error verifying demo users:', error);
    process.exit(1);
  }
}

// Run the script
main();

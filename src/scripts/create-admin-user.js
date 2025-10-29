/**
 * Script to create an admin user in Firebase
 * 
 * This script initializes the Firebase schema and creates an admin user
 * with the specified credentials.
 */

// Import Firebase modules
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/firebaseConfig.js';
import { initializeFirebaseSchema } from '../lib/schema/initialize-schema.js';
import { UserRole, COLLECTIONS } from '../lib/schema/unified-schema.js';

async function createAdminUser() {
  try {
    console.log('Starting admin user creation...');
    
    // First, initialize the Firebase schema
    console.log('Initializing Firebase schema...');
    await initializeFirebaseSchema();
    
    // Admin user credentials
    const email = 'admin@example.com';
    const password = 'admin123';
    const displayName = 'Admin User';
    
    console.log(`Creating admin user: ${email}`);
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: UserRole.ADMIN,
      organizationId: 'general', // Default organization
      isActive: true,
      isApproved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      hipaaTrainingCompleted: true,
      hipaaTrainingDate: Timestamp.now()
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
    
    console.log(`Admin user created successfully with UID: ${user.uid}`);
    console.log('You can now log in with:');
    console.log(`Email: ${email}`);
    console.log('Password: admin123');
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error };
  }
}

// Execute the function
createAdminUser()
  .then(result => {
    if (result.success) {
      console.log('Admin user creation completed successfully');
    } else {
      console.error('Admin user creation failed');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

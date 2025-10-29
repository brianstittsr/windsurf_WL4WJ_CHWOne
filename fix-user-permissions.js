/**
 * Script to check and fix user permissions in Firebase
 * 
 * This script helps diagnose and fix common permission issues with user documents.
 * It can be used to:
 * 1. Check if users have the correct fields required by security rules
 * 2. Add missing fields to user documents
 * 3. Grant admin permissions to specific users
 */

// Import Firebase Admin SDK
const admin = require('firebase-admin');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK with service account
try {
  // Try to load service account from environment variable first
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fall back to service account file
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    } else {
      console.error('Service account file not found. Please create firebase-service-account.json');
      console.error('You can download this from Firebase Console > Project Settings > Service accounts');
      process.exit(1);
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to check user documents
async function checkUsers() {
  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found in the database.');
      return;
    }
    
    console.log(`Found ${usersSnapshot.size} users in the database.`);
    
    const usersWithIssues = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const issues = [];
      
      // Check required fields
      if (!userData.role) issues.push('Missing role');
      if (!userData.organizationId) issues.push('Missing organizationId');
      if (userData.isActive === undefined) issues.push('Missing isActive');
      if (userData.isApproved === undefined) issues.push('Missing isApproved');
      if (!userData.createdAt) issues.push('Missing createdAt');
      if (!userData.updatedAt) issues.push('Missing updatedAt');
      
      // Check role validity
      const validRoles = ['admin', 'chw', 'chw_coordinator', 'nonprofit_staff', 'wl4wj_chw', 'client', 'viewer', 'demo'];
      if (userData.role && !validRoles.includes(userData.role)) {
        issues.push(`Invalid role: ${userData.role}`);
      }
      
      if (issues.length > 0) {
        usersWithIssues.push({
          id: doc.id,
          email: userData.email || 'No email',
          displayName: userData.displayName || 'No name',
          issues,
          data: userData
        });
      }
    });
    
    if (usersWithIssues.length === 0) {
      console.log('All users have the required fields.');
      return;
    }
    
    console.log(`Found ${usersWithIssues.length} users with issues:`);
    usersWithIssues.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email} (${user.displayName})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Issues: ${user.issues.join(', ')}`);
    });
    
    return usersWithIssues;
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

// Function to fix user document
async function fixUser(userId, fixes) {
  try {
    await admin.firestore().collection('users').doc(userId).update(fixes);
    console.log(`User ${userId} updated successfully.`);
    return true;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return false;
  }
}

// Function to make a user an admin
async function makeAdmin(email) {
  try {
    // Find user by email
    const usersSnapshot = await admin.firestore().collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`No user found with email: ${email}`);
      return false;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    // Update user role to admin
    await admin.firestore().collection('users').doc(userId).update({
      role: 'admin',
      isApproved: true,
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: {
        canAccessAllOrganizations: true,
        canManageUsers: true,
        canManageCHWs: true,
        canCreateForms: true,
        canEditForms: true,
        canDeleteForms: true,
        canViewAnalytics: true,
        canManageProjects: true,
        canManageGrants: true,
        canUploadFiles: true
      }
    });
    
    console.log(`User ${email} (${userId}) has been made an admin.`);
    return true;
  } catch (error) {
    console.error(`Error making user an admin:`, error);
    return false;
  }
}

// Function to create admin user if it doesn't exist
async function createAdminIfNeeded() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    
    // Check if user already exists
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log(`Admin user already exists with UID: ${userRecord.uid}`);
      
      // Check if user document exists in Firestore
      const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        console.log('Admin user exists in Authentication but not in Firestore. Creating Firestore document...');
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          displayName: 'Admin User',
          role: 'admin',
          organizationId: 'general',
          isActive: true,
          isApproved: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          permissions: {
            canAccessAllOrganizations: true,
            canManageUsers: true,
            canManageCHWs: true,
            canCreateForms: true,
            canEditForms: true,
            canDeleteForms: true,
            canViewAnalytics: true,
            canManageProjects: true,
            canManageGrants: true,
            canUploadFiles: true
          }
        });
        console.log('Admin user document created in Firestore.');
      } else {
        // Make sure user has admin role
        await makeAdmin(email);
      }
      
      return userRecord.uid;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new admin user
        console.log('Admin user does not exist. Creating new admin user...');
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: 'Admin User',
          emailVerified: true
        });
        
        // Create user document in Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          displayName: 'Admin User',
          role: 'admin',
          organizationId: 'general',
          isActive: true,
          isApproved: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          permissions: {
            canAccessAllOrganizations: true,
            canManageUsers: true,
            canManageCHWs: true,
            canCreateForms: true,
            canEditForms: true,
            canDeleteForms: true,
            canViewAnalytics: true,
            canManageProjects: true,
            canManageGrants: true,
            canUploadFiles: true
          }
        });
        
        console.log(`Admin user created with UID: ${userRecord.uid}`);
        return userRecord.uid;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
}

// Main menu
async function showMenu() {
  console.log('\n=== User Permissions Management ===');
  console.log('1. Check users for permission issues');
  console.log('2. Fix a user with issues');
  console.log('3. Make a user an admin');
  console.log('4. Create/verify admin@example.com user');
  console.log('5. Exit');
  
  rl.question('\nSelect an option (1-5): ', async (answer) => {
    switch (answer) {
      case '1':
        await checkUsers();
        showMenu();
        break;
      case '2':
        rl.question('Enter user ID to fix: ', async (userId) => {
          rl.question('Enter JSON fixes (e.g., {"role": "admin", "isApproved": true}): ', async (fixesStr) => {
            try {
              const fixes = JSON.parse(fixesStr);
              await fixUser(userId, fixes);
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
            showMenu();
          });
        });
        break;
      case '3':
        rl.question('Enter user email to make admin: ', async (email) => {
          await makeAdmin(email);
          showMenu();
        });
        break;
      case '4':
        await createAdminIfNeeded();
        showMenu();
        break;
      case '5':
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option');
        showMenu();
    }
  });
}

// Start the script
console.log('User Permissions Management Tool');
showMenu();

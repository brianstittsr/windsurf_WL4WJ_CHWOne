// Demo Users Setup Script
// Run this in the browser console after logging in as admin
// This script creates demo accounts for all user roles

// Define all user roles
const UserRole = {
  ADMIN: 'admin',
  CHW: 'chw',
  CHW_COORDINATOR: 'chw_coordinator',
  NONPROFIT_STAFF: 'nonprofit_staff',
  CHW_ASSOCIATION: 'chw_association',
  WL4WJ_CHW: 'wl4wj_chw',
  CLIENT: 'client',
  VIEWER: 'viewer',
  DEMO: 'demo'
};

// Import Firebase modules (these should be available in the browser)
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

// Function to create a demo user
async function createDemoUser(role, displayName, email) {
  try {
    console.log(`Creating user: ${email}`);

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, 'pass123');
    const user = userCredential.user;

    console.log(`✓ Auth user created: ${user.uid}`);

    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: email,
      displayName: displayName,
      role: role,
      organizationId: 'general',
      isActive: true,
      isApproved: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      hipaaTrainingCompleted: true,
      hipaaTrainingDate: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log(`✓ Firestore profile created for: ${email}`);

    return user;
  } catch (error) {
    console.error(`✗ Error creating user ${email}:`, error);
    throw error;
  }
}

// Main function to create all demo users
async function setupDemoUsers() {
  console.log('🚀 Starting demo users setup...');
  console.log('Password for all demo accounts: pass123');

  const usersCreated = [];

  try {
    // Create a demo user for each role
    for (const [roleKey, roleValue] of Object.entries(UserRole)) {
      const displayName = `Demo ${roleValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
      const email = `demo-${roleValue}@example.com`;

      const user = await createDemoUser(roleValue, displayName, email);
      usersCreated.push({
        role: roleValue,
        displayName,
        email,
        uid: user.uid
      });
    }

    console.log('✅ All demo users created successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('==========================');

    usersCreated.forEach(user => {
      console.log(`\n🎭 ${user.displayName} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: pass123`);
      console.log(`   UID: ${user.uid}`);
    });

    console.log('\n💡 Tip: You can now log in with any of these accounts to test different roles!');
    console.log('   Make sure to log out first if you want to test a different role.');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you are logged in as an admin user');
    console.log('2. Check that you have proper Firestore permissions');
    console.log('3. Try refreshing the page and running the script again');
  }
}

// Auto-run the setup
setupDemoUsers();

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { UserRole } from '../src/types/firebase/schema';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Missing required Firebase Admin SDK configuration');
  process.exit(1);
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdminUser() {
  const email = 'admin@example.com';
  const password = 'admin123';
  
  try {
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`User ${email} already exists, updating...`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new admin user
        userRecord = await auth.createUser({
          email,
          password,
          emailVerified: true,
        });
        console.log(`Created new admin user: ${email}`);
      } else {
        throw error;
      }
    }

    // Set custom claims for admin access
    await auth.setCustomUserClaims(userRecord.uid, {
      role: UserRole.ADMIN,
      isAdmin: true,
    });

    // Create/update user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      displayName: 'Admin User',
      role: UserRole.ADMIN,
      organization: 'general',
      isActive: true,
      permissions: {
        canCreateForms: true,
        canEditForms: true,
        canDeleteForms: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canUploadFiles: true,
        canAccessAllOrganizations: true,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile, { merge: true });
    console.log('Admin user profile updated in Firestore');
    
    console.log('✅ Admin setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdminUser();

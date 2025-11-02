'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button, Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { UserRole } from '@/types/firebase/schema';

function SetupDemoUsersPageContent() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Check authentication and authorization
  useEffect(() => {
    console.log('Auth state check:', { loading, currentUser: !!currentUser, userProfile: userProfile?.role, autoLoginAttempted });

    if (!loading) {
      if (!currentUser && !autoLoginAttempted) {
        // Auto-login as admin if not logged in and we haven't tried yet
        console.log('Not logged in, auto-logging in as admin...');
        setAutoLoginAttempted(true);
        autoLoginAsAdmin();
      } else if (currentUser && userProfile && userProfile.role !== UserRole.ADMIN) {
        console.log('User logged in but not admin:', userProfile.role);
        setError('Access denied. Only administrators can set up demo users.');
      } else if (currentUser && userProfile && userProfile.role === UserRole.ADMIN) {
        console.log('Admin user logged in successfully');
      }
    }
  }, [currentUser, userProfile, loading, autoLoginAttempted]);

  const autoLoginAsAdmin = async () => {
    try {
      console.log('Not logged in, attempting to create and login as admin...');
      const auth = getAuth();

      // Try to create the admin user first
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@example.com', 'admin123');
        console.log('Admin user created successfully');

        // Create the user profile in Firestore
        const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const db = getFirestore();

        const adminProfile = {
          uid: userCredential.user.uid,
          email: 'admin@example.com',
          displayName: 'Administrator',
          role: 'admin',
          organizationId: 'general',
          isActive: true,
          isApproved: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          hipaaTrainingCompleted: true,
          hipaaTrainingDate: serverTimestamp()
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), adminProfile);
        console.log('Admin user profile created in Firestore');

      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          console.log('Admin user already exists, proceeding to login');
        } else {
          console.error('Error creating admin user:', createError);
          setError(`Failed to create admin user: ${createError.message}`);
          return;
        }
      }

      // Now try to sign in
      await signInWithEmailAndPassword(auth, 'admin@example.com', 'admin123');
      console.log('Successfully logged in as admin');

    } catch (error: any) {
      console.error('Auto-login failed:', error);
      setError(`Failed to auto-login as admin: ${error.message}`);
    }
  };

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const setupDemoUsers = async () => {
    setIsRunning(true);
    setError(null);
    setResults([]);

    try {
      addLog('🚀 Starting demo users setup...');
      addLog('Password for all demo accounts: pass123');

      // Import Firebase modules dynamically to ensure they're available
      let getAuth, createUserWithEmailAndPassword, getFirestore, doc, setDoc, serverTimestamp;
      try {
        const authModule = await import('firebase/auth');
        const firestoreModule = await import('firebase/firestore');

        getAuth = authModule.getAuth;
        createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
        getFirestore = firestoreModule.getFirestore;
        doc = firestoreModule.doc;
        setDoc = firestoreModule.setDoc;
        serverTimestamp = firestoreModule.serverTimestamp;
      } catch (importError) {
        throw new Error(`Failed to import Firebase modules: ${importError}`);
      }

      const auth = getAuth();
      const db = getFirestore();

      // Verify Firebase is properly initialized
      if (!auth || !db) {
        throw new Error('Firebase services not properly initialized');
      }

      addLog('✓ Firebase services initialized successfully');

      const usersCreated: Array<{ role: UserRole; displayName: string; email: string; uid: string }> = [];

      // Create a demo user for each role
      for (const role of Object.values(UserRole)) {
        try {
          const displayName = `Demo ${role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
          const email = `demo-${role}@example.com`;

          addLog(`Creating user: ${email}`);

          // Create user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, 'pass123');
          const user = userCredential.user;

          addLog(`✓ Auth user created: ${user.uid}`);

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
          addLog(`✓ Firestore profile created for: ${email}`);

          usersCreated.push({ role, displayName, email, uid: user.uid });

          // Add a small delay between user creations to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          addLog(`✗ Error creating user for role ${role}: ${error.message}`);
          // Continue with other users even if one fails
        }
      }

      addLog('✅ Demo users setup completed!');
      addLog(`Created ${usersCreated.length} demo accounts`);

      setCompleted(true);

    } catch (error: any) {
      addLog(`❌ Setup failed: ${error.message}`);
      setError(error.message);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && userProfile?.role !== UserRole.ADMIN) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Setup Demo Users
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This page will automatically log you in as an administrator and create demo accounts for all user roles in the system.
        All accounts will use the password: <strong>pass123</strong>
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Demo Accounts to be Created:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          {Object.values(UserRole).map(role => (
            <li key={role}>
              <strong>{`demo-${role}@example.com`}</strong> - {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </li>
          ))}
        </Box>
      </Paper>

      {!completed && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={setupDemoUsers}
          disabled={isRunning}
          sx={{ mb: 3 }}
        >
          {isRunning ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating Demo Users...
            </>
          ) : (
            'Create Demo Users'
          )}
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {completed && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ Demo users setup completed successfully!
        </Alert>
      )}

      {results.length > 0 && (
        <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Setup Log:
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {results.map((result, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {result}
              </div>
            ))}
          </Box>
        </Paper>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        This page automatically logs you in as an administrator. No manual login required.
        {error && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setError(null);
                setAutoLoginAttempted(false);
              }}
              sx={{ mr: 1 }}
            >
              Try Auto-Login Again
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => router.push('/login')}
            >
              Manual Login
            </Button>
          </Box>
        )}
      </Typography>
    </Box>
  );
}

// Wrapper component that provides AuthProvider context
export default function SetupDemoUsersPage() {
  return (
    <AuthProvider>
      <SetupDemoUsersPageContent />
    </AuthProvider>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserRole, OrganizationType } from '@/types/firebase/schema';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  TextField,
  AppBar,
  Toolbar,
} from '@mui/material';

function CreateAdminProfileContent() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    checkUserProfile();
  }, [currentUser]);

  const checkUserProfile = async () => {
    if (!currentUser) {
      setCheckingProfile(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      setProfileExists(userDoc.exists());
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setDisplayName(data.displayName || currentUser.displayName || '');
      } else {
        setDisplayName(currentUser.displayName || currentUser.email?.split('@')[0] || '');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const createAdminProfile = async () => {
    if (!currentUser) {
      setMessage({ type: 'error', text: 'No user is currently signed in' });
      return;
    }

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a display name' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);

      const adminProfile = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: displayName.trim(),
        role: UserRole.ADMIN,
        roles: [UserRole.ADMIN],
        primaryRole: UserRole.ADMIN,
        organizationType: OrganizationType.NONPROFIT,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      await setDoc(userDocRef, adminProfile, { merge: true });

      setMessage({
        type: 'success',
        text: 'Admin profile created successfully! Refreshing page...',
      });

      // Reload page to trigger auth state update
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error creating admin profile:', error);
      setMessage({
        type: 'error',
        text: `Error creating profile: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">
            You must be signed in to create an admin profile. Please login first.
          </Alert>
          <Button variant="contained" href="/login" sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create Admin Profile
          </Typography>

          {profileExists && userProfile && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>Profile Already Exists!</strong>
              <br />
              Role: {userProfile.role}
              <br />
              Display Name: {userProfile.displayName}
              <br />
              <br />
              If you need to update your role to ADMIN, use the button below.
            </Alert>
          )}

          {profileExists && !userProfile && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Profile exists but couldn't be loaded. Try refreshing the page or check Firestore permissions.
            </Alert>
          )}

          {!profileExists && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No user profile found in Firestore. Create an admin profile to access admin features.
            </Alert>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current User Information
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>UID:</strong> {currentUser.uid}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {currentUser.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Profile Exists:</strong> {profileExists ? 'Yes' : 'No'}
                </Typography>
                {userProfile && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Current Role:</strong> {userProfile.role}
                  </Typography>
                )}
              </Box>

              <TextField
                fullWidth
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                sx={{ mb: 3 }}
                helperText="This will be your display name in the platform"
              />

              {message && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                  {message.text}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={createAdminProfile}
                disabled={loading || !displayName.trim()}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : profileExists ? (
                  'Update to Admin Role'
                ) : (
                  'Create Admin Profile'
                )}
              </Button>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>What this does:</strong>
                  <br />
                  • Creates a user document in Firestore at: users/{currentUser.uid}
                  <br />
                  • Sets role to "ADMIN"
                  <br />
                  • Adds ADMIN to roles array
                  <br />
                  • Sets primaryRole to ADMIN
                  <br />
                  • Makes the Admin Role Switcher visible
                  <br />
                  • Grants access to admin features
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manual Firestore Setup (Alternative)
              </Typography>
              <Typography variant="body2" paragraph>
                If you prefer to create the profile manually in Firebase Console:
              </Typography>
              <ol style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)' }}>
                <li>Go to Firebase Console → Firestore Database</li>
                <li>Navigate to the "users" collection</li>
                <li>Create a document with ID: <code>{currentUser.uid}</code></li>
                <li>Add these fields:</li>
              </ol>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem',
                }}
              >
                {JSON.stringify(
                  {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: displayName || 'Your Name',
                    role: 'ADMIN',
                    roles: ['ADMIN'],
                    primaryRole: 'ADMIN',
                    organizationType: 'NONPROFIT',
                    createdAt: 'Timestamp',
                    updatedAt: 'Timestamp',
                    isActive: true,
                  },
                  null,
                  2
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
  );
}

export default function CreateAdminProfilePage() {
  return (
    <AuthProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <AppBar position="static" sx={{ mb: 4 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CHWOne Platform
            </Typography>
            <Button color="inherit" href="/">
              Home
            </Button>
            <Button color="inherit" href="/login">
              Login
            </Button>
          </Toolbar>
        </AppBar>
        <CreateAdminProfileContent />
      </Box>
    </AuthProvider>
  );
}

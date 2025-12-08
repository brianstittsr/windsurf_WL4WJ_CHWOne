'use client';

import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
  Paper,
} from '@mui/material';
import { CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';

/**
 * Setup Admin Page
 * 
 * This is a standalone page that doesn't require AuthContext.
 * It directly uses Firebase Auth and Firestore to create an admin profile.
 * 
 * Navigate to: /setup-admin
 */

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);
  const [displayName, setDisplayName] = useState('');

  // Check auth state and profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        setDisplayName(user.displayName || user.email?.split('@')[0] || 'Admin User');
        
        // Check if profile exists
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          setProfileExists(userDoc.exists());
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setMessage({
              type: 'info',
              text: `Profile already exists with role: ${data.role}`
            });
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
      
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const createProfile = async () => {
    if (!currentUser) {
      setMessage({ type: 'error', text: 'No user is signed in' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      const profileData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: displayName || currentUser.displayName || 'Admin User',
        role: UserRole.ADMIN,
        roles: [UserRole.ADMIN],
        primaryRole: UserRole.ADMIN,
        organizationType: OrganizationType.NONPROFIT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      await setDoc(userRef, profileData, { merge: true });

      setMessage({
        type: 'success',
        text: 'Admin profile created successfully! Reloading page...'
      });
      
      setProfileExists(true);

      // Reload after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard/regions';
      }, 2000);

    } catch (error) {
      console.error('Error creating profile:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Warning color="warning" sx={{ mr: 1, fontSize: 40 }} />
              <Typography variant="h5">Not Signed In</Typography>
            </Box>
            <Typography variant="body1" paragraph>
              You must be signed in to create an admin profile.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/login"
              fullWidth
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            🔧 Setup Admin Profile
          </Typography>

          {message && (
            <Alert 
              severity={message.type} 
              sx={{ mb: 3 }}
              icon={
                message.type === 'success' ? <CheckCircle /> :
                message.type === 'error' ? <ErrorIcon /> :
                message.type === 'warning' ? <Warning /> : undefined
              }
            >
              {message.text}
            </Alert>
          )}

          <Card sx={{ mb: 3, bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="subtitle2" color="info.dark" gutterBottom>
                Current User
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {currentUser.email}
              </Typography>
              <Typography variant="body2">
                <strong>UID:</strong> {currentUser.uid}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Profile Status:</strong>{' '}
                {profileExists ? (
                  <span style={{ color: 'green' }}>✅ Exists</span>
                ) : (
                  <span style={{ color: 'orange' }}>⚠️ Not Found</span>
                )}
              </Typography>
            </CardContent>
          </Card>

          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            sx={{ mb: 3 }}
            helperText="Your name as it will appear in the app"
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={createProfile}
            disabled={loading || !displayName}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creating Profile...
              </>
            ) : profileExists ? (
              'Update Admin Profile'
            ) : (
              'Create Admin Profile'
            )}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            This will create a Firestore document at: users/{currentUser.uid}
          </Typography>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              What This Does:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Creates your user profile in Firestore</li>
              <li>Sets your role to ADMIN</li>
              <li>Enables the Role Switcher in lower right corner</li>
              <li>Grants access to all admin features</li>
              <li>Redirects to dashboard after creation</li>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

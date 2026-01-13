'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Card, 
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';

function AddAdminContent() {
  const [email, setEmail] = useState('brians@wl4wl.org');
  const [password, setPassword] = useState('Yfhk9r76q@@123456');
  const [displayName, setDisplayName] = useState('Brian Stitts');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAdminUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get auth and firestore instances
      const auth = getAuth();
      const db = getFirestore();
      
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Add user document to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: 'admin',
        organizationId: 'wl4wj',
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        hipaaTrainingCompleted: true,
        hipaaTrainingDate: Timestamp.now()
      });
      
      setSuccess(true);
      console.log('Admin user created successfully:', userCredential.user);
    } catch (err: any) {
      setError(err.message || 'Failed to create admin user');
      console.error('Error creating admin user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>Add Admin User</Typography>
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Admin user created successfully!
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              required
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={createAdminUser}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Creating...' : 'Create Admin User'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function AddAdminPage() {
  return (
    <AuthProvider>
      <UnifiedLayout>
        <AddAdminContent />
      </UnifiedLayout>
    </AuthProvider>
  );
}

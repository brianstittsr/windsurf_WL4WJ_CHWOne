'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebaseConfig';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';

/**
 * AuthDebugger Component
 * 
 * This component helps debug authentication issues by displaying:
 * - Current authentication state
 * - User document from Firestore (if available)
 * - Any errors encountered
 * 
 * Add this component to pages where you're experiencing permission issues.
 */
export default function AuthDebugger() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [firestoreUser, setFirestoreUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  // Function to fix user document
  const fixUserDocument = async () => {
    if (!authUser) {
      setFixResult('No authenticated user. Please sign in first.');
      return;
    }
    
    setFixing(true);
    setFixResult(null);
    setError(null);
    
    try {
      // Create user document if it doesn't exist
      const userDocRef = doc(db, 'users', authUser.uid);
      
      // Create user data
      const userData = {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName || 'Admin User',
        role: 'admin',
        organizationId: 'general', // Default organization
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        hipaaTrainingCompleted: true,
        hipaaTrainingDate: Timestamp.now()
      };
      
      // Set the document
      await setDoc(userDocRef, userData);
      
      // Verify document was created
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        setFirestoreUser(verifyDoc.data());
        setFixResult('User document created successfully!');
      } else {
        setFixResult('Failed to create user document. Please try again.');
      }
    } catch (err) {
      console.error('Error fixing user document:', err);
      setFixResult(`Error fixing user document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFixing(false);
    }
  };
  
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      setAuthUser(user);
      
      if (user) {
        try {
          // Try to fetch the user document from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            console.log('User document found:', userDoc.data());
            setFirestoreUser(userDoc.data());
          } else {
            console.error('User document not found in Firestore');
            setError('User document not found in Firestore. This may cause permission issues.');
          }
        } catch (err) {
          console.error('Error fetching user document:', err);
          setError(`Error fetching user document: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
      
      setLoading(false);
    });
    
    // Clean up the listener
    return () => unsubscribe();
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        m: 2, 
        maxWidth: '100%',
        border: '1px dashed red',
        position: 'fixed',
        bottom: 0,
        right: 0,
        zIndex: 9999,
        maxHeight: '50vh',
        overflow: 'auto',
        opacity: 0.9
      }}
    >
      <Typography variant="h6" gutterBottom>Auth Debugger</Typography>
      
      {loading ? (
        <Typography>Loading authentication state...</Typography>
      ) : (
        <Box>
          <Typography variant="subtitle1">Authentication Status:</Typography>
          {authUser ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                UID: {authUser.uid}
                <br />
                Email: {authUser.email}
                <br />
                Email Verified: {authUser.emailVerified ? 'Yes' : 'No'}
                <br />
                Display Name: {authUser.displayName || 'Not set'}
              </Typography>
            </Box>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>Not authenticated</Alert>
          )}

          <Typography variant="subtitle1">Firestore User Document:</Typography>
          {firestoreUser ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                Role: {firestoreUser.role}
                <br />
                Organization: {firestoreUser.organizationId}
                <br />
                Active: {firestoreUser.isActive ? 'Yes' : 'No'}
                <br />
                Approved: {firestoreUser.isApproved ? 'Yes' : 'No'}
              </Typography>
            </Box>
          ) : authUser ? (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" sx={{ mb: 1 }}>
                User authenticated but no Firestore document found!
              </Alert>
              <Button 
                variant="contained" 
                color="warning"
                onClick={fixUserDocument}
                disabled={fixing}
                size="small"
                sx={{ mt: 1 }}
              >
                {fixing ? 'Fixing...' : 'Fix User Document'}
              </Button>
            </Box>
          ) : (
            <Typography variant="body2">Not available (not authenticated)</Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          
          {fixResult && (
            <Alert severity={fixResult.includes('successfully') ? 'success' : 'warning'} sx={{ mt: 2 }}>
              {fixResult}
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}

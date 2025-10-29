'use client';

import React, { useEffect, useState } from 'react';
import { auth, db, isValidConfig } from '@/lib/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { Box, Typography, Paper, Button, TextField, Alert, CircularProgress, Divider, List, ListItem, ListItemText } from '@mui/material';

export default function FirebaseDebugger() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('admin@example.com');
  const [password, setPassword] = useState<string>('admin123');
  const [configStatus, setConfigStatus] = useState<boolean>(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [configDetails, setConfigDetails] = useState<{[key: string]: boolean}>({});
  const [schemaStatus, setSchemaStatus] = useState<{exists: boolean, version?: string}>({ exists: false });

  useEffect(() => {
    // Check Firebase configuration
    setConfigStatus(isValidConfig);
    if (!isValidConfig) {
      setError('Firebase configuration is invalid or missing required fields');
    }
    
    // Check config details
    // NOTE: In Next.js client components, we must reference env vars directly by name
    // Using process.env[key] with a variable doesn't work due to Next.js static analysis
    const details: {[key: string]: boolean} = {
      'NEXT_PUBLIC_FIREBASE_API_KEY': !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      'NEXT_PUBLIC_FIREBASE_APP_ID': !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    
    setConfigDetails(details);
    
    // Check schema
    checkSchema();
  }, []);
  
  const checkSchema = async () => {
    try {
      const schemaVersionRef = doc(db, 'system', 'schema_version');
      const schemaVersionDoc = await getDoc(schemaVersionRef);
      
      if (schemaVersionDoc.exists()) {
        const data = schemaVersionDoc.data();
        setSchemaStatus({
          exists: true,
          version: data.version
        });
      } else {
        setSchemaStatus({ exists: false });
      }
    } catch (err) {
      console.error('Error checking schema:', err);
      setSchemaStatus({ exists: false });
    }
  };

  const checkFirebaseConnection = async () => {
    setStatus('loading');
    setError(null);
    setMessage('');
    
    try {
      // Check Firestore connection
      const collectionsSnapshot = await getDocs(collection(db, 'system'));
      setMessage('Successfully connected to Firestore');
      
      // List available collections
      const collectionsRef = await getDocs(collection(db, '_'));
      const collectionsList: string[] = [];
      collectionsRef.forEach((doc) => {
        collectionsList.push(doc.id);
      });
      setCollections(collectionsList);
      
      setStatus('success');
    } catch (err: any) {
      console.error('Firebase connection error:', err);
      setError(`Firebase connection error: ${err.message || err.toString()}`);
      setStatus('error');
    }
  };

  const testAdminLogin = async () => {
    setStatus('loading');
    setError(null);
    setMessage('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage(`Successfully logged in as ${userCredential.user.email}`);
      setStatus('success');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Login error: ${err.code} - ${err.message}`);
      setStatus('error');
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 9999,
        p: 2,
        width: 400,
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <Typography variant="h6" gutterBottom>Firebase Debugger</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Configuration Status:</Typography>
        <Alert severity={configStatus ? 'success' : 'error'}>
          {configStatus ? 'Firebase configuration is valid' : 'Firebase configuration is invalid'}
        </Alert>
        
        <Typography variant="subtitle2" sx={{ mt: 1 }}>Config Details:</Typography>
        <List dense>
          {Object.entries(configDetails).map(([key, exists]) => (
            <ListItem key={key} sx={{ py: 0 }}>
              <ListItemText 
                primary={key} 
                secondary={exists ? '✅ Present' : '❌ Missing'}
                primaryTypographyProps={{ fontSize: '0.8rem' }}
                secondaryTypographyProps={{ 
                  color: exists ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Typography variant="subtitle2" sx={{ mt: 1 }}>Schema Status:</Typography>
        <Alert severity={schemaStatus.exists ? 'success' : 'warning'}>
          {schemaStatus.exists 
            ? `Schema initialized (version ${schemaStatus.version})` 
            : 'Schema not initialized - run npm run initialize-firebase'}
        </Alert>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={checkFirebaseConnection}
          disabled={status === 'loading'}
          fullWidth
          sx={{ mb: 1 }}
        >
          {status === 'loading' ? <CircularProgress size={24} /> : 'Check Firebase Connection'}
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Test Admin Login:</Typography>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="dense"
          size="small"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="dense"
          size="small"
        />
        <Button 
          variant="contained" 
          onClick={testAdminLogin}
          disabled={status === 'loading'}
          fullWidth
          sx={{ mt: 1 }}
        >
          {status === 'loading' ? <CircularProgress size={24} /> : 'Test Login'}
        </Button>
      </Box>
      
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {collections.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Available Collections:</Typography>
          <ul>
            {collections.map((collection) => (
              <li key={collection}>{collection}</li>
            ))}
          </ul>
        </Box>
      )}
      
      <Typography variant="caption" color="text.secondary">
        This debugger only appears in development mode
      </Typography>
    </Paper>
  );
}

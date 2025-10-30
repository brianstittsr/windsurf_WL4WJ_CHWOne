'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Button, List, ListItem, Paper, Alert } from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon } from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider } from '@/contexts/AuthContext';

function NavTestContent() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [debugInfo, setDebugInfo] = useState({});
  
  const routes = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/login', label: 'Login' },
    { path: '/chws', label: 'CHWs' },
    { path: '/projects', label: 'Projects' },
    { path: '/grants', label: 'Grants' },
    { path: '/admin', label: 'Admin' }
  ];
  
  const testNavigation = (path: string) => {
    try {
      console.log(`Testing navigation to: ${path}`);
      router.push(path);
      setTestResults(prev => ({ ...prev, [path]: true }));
    } catch (error) {
      console.error(`Navigation failed to ${path}:`, error);
      setTestResults(prev => ({ ...prev, [path]: false }));
    }
  };
  
  useEffect(() => {
    setDebugInfo({
      currentPath: window.location.pathname,
      offlineMode: localStorage.getItem('forceOfflineMode'),
      networkError: localStorage.getItem('firebaseNetworkError'),
      testResults
    });
  }, [testResults]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Navigation Test Page
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page tests navigation to different routes. Click each button to test.
      </Alert>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Navigation Routes:
        </Typography>
        
        <List>
          {routes.map(route => (
            <ListItem key={route.path} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" fontWeight="bold">{route.label}</Typography>
                <Typography variant="body2" color="text.secondary">{route.path}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {testResults[route.path] !== undefined && (
                  testResults[route.path] ? 
                    <CheckIcon color="success" /> : 
                    <ErrorIcon color="error" />
                )}
                <Button 
                  variant="contained" 
                  onClick={() => testNavigation(route.path)}
                  sx={{ minWidth: 100 }}
                >
                  Test
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Debugging Info:
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default function NavTestPage() {
  return (
    <AuthProvider>
      <UnifiedLayout>
        <NavTestContent />
      </UnifiedLayout>
    </AuthProvider>
  );
}

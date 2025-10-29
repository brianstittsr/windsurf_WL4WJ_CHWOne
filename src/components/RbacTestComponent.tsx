'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';

/**
 * RbacTestComponent
 * 
 * This component tests if RBAC has been properly disabled by checking:
 * - User role (should be ADMIN)
 * - User approval status (should be true)
 * - Available permissions (should include '*')
 */
export default function RbacTestComponent() {
  const { currentUser, userProfile } = useAuth();
  const [rbacStatus, setRbacStatus] = useState<'enabled' | 'disabled' | 'unknown'>('unknown');
  
  useEffect(() => {
    // Check if RBAC is disabled based on user profile
    if (userProfile) {
      const isAdmin = userProfile.role === 'ADMIN';
      const isApproved = userProfile.approved === true;
      const hasAllPermissions = Array.isArray(userProfile.permissions) && 
        userProfile.permissions.includes('*');
      
      if (isAdmin && isApproved && hasAllPermissions) {
        setRbacStatus('disabled');
      } else {
        setRbacStatus('enabled');
      }
    }
  }, [userProfile]);
  
  if (!currentUser || !userProfile) {
    return (
      <Alert severity="info">
        Please log in to test RBAC status
      </Alert>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        RBAC Status Test
      </Typography>
      
      <Alert 
        severity={rbacStatus === 'disabled' ? 'success' : 'error'}
        sx={{ mb: 3 }}
      >
        RBAC is {rbacStatus === 'disabled' ? 'successfully disabled' : 'still enabled'}
      </Alert>
      
      <Typography variant="subtitle1" gutterBottom>
        User Profile:
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText 
            primary="Email" 
            secondary={currentUser.email || 'No email'} 
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText 
            primary="Display Name" 
            secondary={userProfile.displayName || currentUser.displayName || 'No name'} 
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText 
            primary="Role" 
            secondary={userProfile.role || 'No role'}
            secondaryTypographyProps={{
              color: userProfile.role === 'ADMIN' ? 'success.main' : 'error.main',
              fontWeight: 'bold'
            }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText 
            primary="Approved" 
            secondary={userProfile.approved === true ? 'Yes' : 'No'}
            secondaryTypographyProps={{
              color: userProfile.approved === true ? 'success.main' : 'error.main',
              fontWeight: 'bold'
            }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText 
            primary="Permissions" 
            secondary={
              Array.isArray(userProfile.permissions) 
                ? userProfile.permissions.join(', ') 
                : 'No permissions'
            }
            secondaryTypographyProps={{
              color: Array.isArray(userProfile.permissions) && 
                userProfile.permissions.includes('*') 
                  ? 'success.main' 
                  : 'error.main',
              fontWeight: 'bold'
            }}
          />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          If RBAC is properly disabled, you should see:
          <ul>
            <li>Role: ADMIN</li>
            <li>Approved: Yes</li>
            <li>Permissions: * (wildcard)</li>
          </ul>
        </Typography>
      </Box>
    </Paper>
  );
}

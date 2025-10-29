/**
 * Test RBAC Disabled Functionality
 * 
 * This script helps test that RBAC functionality has been properly disabled
 * by creating test users with various credentials and verifying access.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting RBAC disabled testing...');

// Create a test component to verify RBAC is disabled
const testComponentPath = path.resolve(process.cwd(), 'src/components/RbacTestComponent.tsx');
const testComponentContent = `'use client';

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
`;

fs.writeFileSync(testComponentPath, testComponentContent);
console.log(`Created test component at ${testComponentPath}`);

// Create a test page to verify RBAC is disabled
const testPagePath = path.resolve(process.cwd(), 'src/app/rbac-test/page.tsx');
const testPageContent = `'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import RbacTestComponent from '@/components/RbacTestComponent';

export default function RbacTestPage() {
  return (
    <AuthProvider>
      <UnifiedLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            RBAC Disabled Test Page
          </Typography>
          
          <Typography variant="body1" paragraph>
            This page tests whether RBAC (Role-Based Access Control) has been successfully disabled.
            If RBAC is disabled, all users should have admin privileges and full access to all features.
          </Typography>
          
          <RbacTestComponent />
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Testing Instructions:
            </Typography>
            
            <ol>
              <li>
                <Typography variant="body1" paragraph>
                  Log in with any user account (existing or newly created)
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Check that the user automatically has ADMIN role and full permissions
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Verify that all menu items and features are accessible
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Try creating a new user and confirm they also have full access
                </Typography>
              </li>
            </ol>
          </Box>
        </Container>
      </UnifiedLayout>
    </AuthProvider>
  );
}
`;

fs.writeFileSync(testPagePath, testPageContent);
console.log(`Created test page at ${testPagePath}`);

// Update the main navigation to include the test page
const updateNavigation = () => {
  const unifiedLayoutPath = path.resolve(process.cwd(), 'src/components/Layout/UnifiedLayout.tsx');
  
  if (fs.existsSync(unifiedLayoutPath)) {
    let content = fs.readFileSync(unifiedLayoutPath, 'utf8');
    
    // Find the menuItems array
    const menuItemsRegex = /const menuItems = \[\s*{[^]*?\}\s*\];/s;
    const menuItemsMatch = content.match(menuItemsRegex);
    
    if (menuItemsMatch) {
      // Add the RBAC test page to the menu items
      const updatedMenuItems = menuItemsMatch[0].replace(
        /const menuItems = \[\s*/,
        `const menuItems = [
    {
      href: '/rbac-test',
      label: 'RBAC Test',
      roles: ['ADMIN', 'USER', 'CHW', 'MANAGER']
    },
    `
      );
      
      content = content.replace(menuItemsRegex, updatedMenuItems);
      fs.writeFileSync(unifiedLayoutPath, content);
      console.log('Added RBAC test page to navigation menu');
    } else {
      console.log('Could not find menuItems array in UnifiedLayout.tsx');
    }
  }
};

updateNavigation();

console.log('\nRBAC testing setup completed!');
console.log('\nTo test that RBAC is disabled:');
console.log('1. Restart your development server');
console.log('2. Navigate to http://localhost:3000/rbac-test');
console.log('3. Log in with any user account');
console.log('4. Verify that the user has admin privileges');
console.log('\nIf RBAC is properly disabled, all users should have:');
console.log('- Role: ADMIN');
console.log('- Approved: Yes');
console.log('- Permissions: * (wildcard)');

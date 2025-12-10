'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import { UserRole } from '@/types/firebase/schema';

function TestRoleSwitcherContent() {
  const { userProfile, currentUser } = useAuth();

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Role Switcher Debug Page
          </Typography>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current User Info
              </Typography>
              <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(
                  {
                    uid: currentUser?.uid,
                    email: currentUser?.email,
                    userProfile: userProfile,
                    role: userProfile?.role,
                    roles: userProfile?.roles,
                    primaryRole: userProfile?.primaryRole,
                    isAdmin: userProfile?.role === UserRole.ADMIN,
                    hasAdminInRoles: userProfile?.roles?.includes(UserRole.ADMIN),
                  },
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                UserRole Enum Values
              </Typography>
              <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(UserRole, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body2" paragraph>
                1. Check the console logs for AdminRoleSwitcher debug messages
              </Typography>
              <Typography variant="body2" paragraph>
                2. Verify your user role is "ADMIN" in the user info above
              </Typography>
              <Typography variant="body2" paragraph>
                3. The Role Switcher should appear in the lower right corner if you are an admin
              </Typography>
              <Typography variant="body2" paragraph>
                4. Open browser DevTools (F12) and check the Console tab for detailed logs
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  console.log('=== Manual Debug Trigger ===');
                  console.log('userProfile:', userProfile);
                  console.log('currentUser:', currentUser);
                }}
              >
                Log Current State to Console
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Note:</strong> If the Role Switcher is not visible, check:
              <br />
              • You are logged in as a user with ADMIN role
              <br />
              • The MainLayout component is being used
              <br />
              • No CSS z-index conflicts
              <br />• Browser console for error messages
            </Typography>
          </Box>

          {!userProfile && currentUser && (
            <Card sx={{ mt: 3, bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.dark">
                  ⚠️ No User Profile Found
                </Typography>
                <Typography variant="body2" paragraph>
                  You are authenticated but don't have a user profile document in Firestore.
                  This is why the Role Switcher is not visible.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  href="/create-admin-profile"
                  fullWidth
                >
                  Create Admin Profile Now
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}

export default function TestRoleSwitcherPage() {
  return (
    <AuthProvider>
      <TestRoleSwitcherContent />
    </AuthProvider>
  );
}

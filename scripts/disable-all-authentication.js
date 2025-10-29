/**
 * Disable All Authentication
 * 
 * This script completely disables all authentication requirements in the CHWOne platform.
 * It allows anyone to access all parts of the application without needing to log in.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting authentication disabling process...');

// Paths to the files we need to modify
const paths = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  dashboardPage: path.resolve(process.cwd(), 'src/app/dashboard/page.tsx'),
  unifiedLayout: path.resolve(process.cwd(), 'src/components/Layout/UnifiedLayout.tsx'),
  mainLayout: path.resolve(process.cwd(), 'src/components/Layout/MainLayout.tsx'),
  globalCss: path.resolve(process.cwd(), 'src/app/globals.css')
};

// Create backups of all files
Object.entries(paths).forEach(([key, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.auth-disabled-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${key} at ${backupPath}`);
  } else {
    console.log(`Warning: ${key} not found at ${filePath}`);
  }
});

// 1. Create a mock authentication context that always returns a logged-in user
if (fs.existsSync(paths.authContext)) {
  let content = fs.readFileSync(paths.authContext, 'utf8');
  
  // Replace the AuthProvider component with a mock that always returns a logged-in user
  content = content.replace(
    `export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string>('firebase');
  const [firebaseError, setFirebaseError] = useState(false);`,
    `export function AuthProvider({ children }: { children: React.ReactNode }) {
  // AUTHENTICATION DISABLED: Always provide a mock user
  const mockUser = {
    uid: 'mock-user-always-authenticated',
    email: 'auto-login@example.com',
    displayName: 'Auto Login User',
    emailVerified: true,
    getIdToken: () => Promise.resolve('mock-token-always-valid')
  };
  
  const mockProfile = {
    uid: 'mock-user-always-authenticated',
    email: 'auto-login@example.com',
    displayName: 'Auto Login User',
    role: 'ADMIN',
    approved: true,
    permissions: ['*'],
    organization: 'general',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  console.log('%c[AUTH] Authentication disabled - using mock user', 'background: purple; color: white;');
  
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser as any);
  const [userProfile, setUserProfile] = useState<any | null>(mockProfile);
  const [loading, setLoading] = useState(false); // Never show loading state
  const [error, setError] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string>('mock');
  const [firebaseError, setFirebaseError] = useState(false);`
  );
  
  // Replace the useEffect for auth state with a mock that does nothing
  content = content.replace(
    `// Listen for Firebase auth state changes with timeout protection
  useEffect(() => {`,
    `// AUTHENTICATION DISABLED: No need to listen for auth state changes
  useEffect(() => {
    // Do nothing - we're always authenticated
    return () => {};
  }, []);
  
  // Original auth state listener (disabled)
  const originalAuthStateListener = () => {`
  );
  
  // Close the original auth state listener function that we've wrapped
  content = content.replace(
    `  }, []);`,
    `  };`
  );
  
  // Replace all authentication methods with mocks
  content = content.replace(
    `// Sign in with email and password
  const signIn = async (email: string, password: string) => {`,
    `// AUTHENTICATION DISABLED: Mock sign in that always succeeds
  const signIn = async (email: string, password: string) => {
    console.log('%c[AUTH] Mock sign in - always succeeds', 'background: purple; color: white;', { email });
    return mockUser as any;
  };
  
  // Original sign in method (disabled)
  const originalSignIn = async (email: string, password: string) => {`
  );
  
  // Close the original signIn function
  content = content.replace(
    `  };`,
    `  };`,
  );
  
  // Replace signOut with a mock
  content = content.replace(
    `// Sign out
  const signOut = async () => {`,
    `// AUTHENTICATION DISABLED: Mock sign out that does nothing
  const signOut = async () => {
    console.log('%c[AUTH] Mock sign out - does nothing', 'background: purple; color: white;');
    return Promise.resolve();
  };
  
  // Original sign out method (disabled)
  const originalSignOut = async () => {`
  );
  
  fs.writeFileSync(paths.authContext, content);
  console.log('Updated AuthContext.tsx with mock authentication');
}

// 2. Modify the dashboard page to skip authentication checks
if (fs.existsSync(paths.dashboardPage)) {
  let content = fs.readFileSync(paths.dashboardPage, 'utf8');
  
  // Replace the authentication check with a mock that always succeeds
  content = content.replace(
    `  if (!currentUser) {`,
    `  // AUTHENTICATION DISABLED: Skip authentication check
  if (false) { // Always false to bypass authentication check
    // Original authentication check (disabled)`
  );
  
  fs.writeFileSync(paths.dashboardPage, content);
  console.log('Updated dashboard/page.tsx to bypass authentication checks');
}

// 3. Modify the UnifiedLayout to always show all navigation items
if (fs.existsSync(paths.unifiedLayout)) {
  let content = fs.readFileSync(paths.unifiedLayout, 'utf8');
  
  // Always show the desktop menu
  content = content.replace(
    `          {/* Desktop Menu - Only show when logged in */}
          {!isMobile && currentUser && (`,
    `          {/* AUTHENTICATION DISABLED: Always show desktop menu */}
          {!isMobile && (`
  );
  
  // Always show the mobile menu button
  content = content.replace(
    `          {/* Mobile Menu Button - Only show when logged in */}
          {isMobile && currentUser && (`,
    `          {/* AUTHENTICATION DISABLED: Always show mobile menu button */}
          {isMobile && (`
  );
  
  // Always show the user menu
  content = content.replace(
    `          {/* Login Button or User Menu */}
          <Box sx={{ ml: 2 }}>
            {currentUser ? (`,
    `          {/* AUTHENTICATION DISABLED: Always show user menu */}
          <Box sx={{ ml: 2 }}>
            {true ? ( // Always true to show user menu`
  );
  
  fs.writeFileSync(paths.unifiedLayout, content);
  console.log('Updated UnifiedLayout.tsx to always show navigation');
}

// 4. Create a global authentication bypass script
const authBypassPath = path.resolve(process.cwd(), 'src/lib/auth-bypass.ts');
const authBypassContent = `/**
 * Authentication Bypass
 * 
 * This module provides mock authentication functions and utilities
 * to bypass all authentication requirements in the application.
 */

// Mock user object that is always authenticated
export const mockUser = {
  uid: 'mock-user-always-authenticated',
  email: 'auto-login@example.com',
  displayName: 'Auto Login User',
  emailVerified: true,
  getIdToken: () => Promise.resolve('mock-token-always-valid')
};

// Mock user profile with admin privileges
export const mockProfile = {
  uid: 'mock-user-always-authenticated',
  email: 'auto-login@example.com',
  displayName: 'Auto Login User',
  role: 'ADMIN',
  approved: true,
  permissions: ['*'],
  organization: 'general',
  isActive: true,
  createdAt: new Date().toISOString()
};

// Mock authentication check that always returns true
export const isAuthenticated = () => true;

// Mock permission check that always returns true
export const hasPermission = () => true;

// Mock role check that always returns true
export const hasRole = () => true;

// Log authentication bypass status
console.log('%c[AUTH_BYPASS] Authentication completely disabled', 'background: red; color: white; font-size: 14px; padding: 5px;');
`;

fs.writeFileSync(authBypassPath, authBypassContent);
console.log(`Created auth-bypass.ts at ${authBypassPath}`);

// 5. Add global CSS to hide authentication UI elements
if (fs.existsSync(paths.globalCss)) {
  let content = fs.readFileSync(paths.globalCss, 'utf8');
  
  // Add CSS to hide authentication UI elements
  const authDisabledCss = `
/* Authentication Disabled - Hide Auth UI Elements */
.auth-only {
  display: none !important;
}

/* Add a banner to indicate authentication is disabled */
body::before {
  content: "AUTHENTICATION DISABLED";
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 5px;
  font-weight: bold;
  z-index: 100000;
  font-size: 12px;
}
`;

  content += authDisabledCss;
  
  fs.writeFileSync(paths.globalCss, content);
  console.log('Updated globals.css with authentication disabled styles');
}

// 6. Create a login page bypass
const loginPagePath = path.resolve(process.cwd(), 'src/app/login/page.tsx');
if (fs.existsSync(loginPagePath)) {
  const loginPageContent = `'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Box, CircularProgress } from '@mui/material';

/**
 * Login Page Bypass
 * 
 * This component automatically redirects to the dashboard
 * since authentication is disabled.
 */
export default function LoginPageBypass() {
  const router = useRouter();
  
  useEffect(() => {
    console.log('%c[LOGIN] Authentication disabled - redirecting to dashboard', 'background: purple; color: white;');
    
    // Short delay to show the message
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [router]);
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}
    >
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1a365d' }}>
          Authentication Disabled
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          You are being automatically redirected to the dashboard...
        </Typography>
        
        <CircularProgress size={40} sx={{ color: '#1a365d' }} />
      </Box>
    </Box>
  );
}
`;

  // Create backup of login page
  if (fs.existsSync(loginPagePath)) {
    const backupPath = `${loginPagePath}.auth-disabled-backup`;
    fs.copyFileSync(loginPagePath, backupPath);
    console.log(`Created backup of login page at ${backupPath}`);
  }
  
  fs.writeFileSync(loginPagePath, loginPageContent);
  console.log('Updated login page with automatic redirect');
}

// 7. Create a README file explaining the changes
const readmePath = path.resolve(process.cwd(), 'AUTHENTICATION_DISABLED.md');
const readmeContent = `# Authentication Completely Disabled

This document explains the changes made to completely disable authentication in the CHWOne platform.

## What Was Changed

1. **Mock Authentication Context**
   - Replaced the real authentication context with a mock that always returns a logged-in user
   - Disabled all authentication state listeners
   - Replaced sign-in and sign-out functions with mocks that always succeed

2. **Bypassed Authentication Checks**
   - Modified the dashboard page to skip all authentication checks
   - Updated layouts to always show navigation items regardless of authentication state
   - Created a global authentication bypass module

3. **Login Page Bypass**
   - Replaced the login page with an automatic redirect to the dashboard
   - Added a brief message explaining that authentication is disabled

4. **Visual Indicators**
   - Added a banner to the bottom of all pages indicating that authentication is disabled
   - Added console logs with distinctive styling to indicate authentication bypass

## Files Modified

1. **AuthContext.tsx**: Replaced with mock authentication that always succeeds
2. **dashboard/page.tsx**: Bypassed authentication checks
3. **UnifiedLayout.tsx**: Always shows navigation regardless of authentication state
4. **globals.css**: Added styles to hide authentication UI elements and show a warning banner
5. **login/page.tsx**: Replaced with automatic redirect to dashboard

## New Files Created

1. **auth-bypass.ts**: Provides mock authentication functions and utilities

## Security Implications

**WARNING**: Disabling authentication removes all security from the application. This should only be used in:

- Development environments
- Testing scenarios
- Demos where security is not a concern
- Situations where the application is completely isolated from the internet

Do not use this configuration in production environments or any environment accessible from the internet.

## Restoring Authentication

To restore authentication functionality, you can:

1. Revert the changes using the backup files (*.auth-disabled-backup)
2. Run \`git checkout\` on the modified files if using version control
3. Delete the auth-bypass.ts file

Created: ${new Date().toISOString()}
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created explanation file at ${readmePath}`);

console.log('\nAuthentication disabling process completed!');
console.log('\nAll authentication requirements have been removed from the application.');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Navigate to any page - you will be automatically logged in');
console.log('3. The login page will automatically redirect to the dashboard');
console.log('\nWARNING: This configuration is not secure and should not be used in production.');

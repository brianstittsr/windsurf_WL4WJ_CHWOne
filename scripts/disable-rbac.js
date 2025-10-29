/**
 * Disable RBAC Login Functionality
 * 
 * This script disables all Role-Based Access Control (RBAC) functionality in the CHWOne platform.
 * It removes role checks, permission validations, and ensures all users can access all features.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting RBAC disabling process...');

// Paths to the files we need to modify
const paths = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  userRoles: path.resolve(process.cwd(), 'src/types/firebase/schema.ts'),
  rbacUtils: path.resolve(process.cwd(), 'src/utils/rbac.ts'),
  dashboardContent: path.resolve(process.cwd(), 'src/components/Dashboard/DashboardContent.tsx'),
  mainLayout: path.resolve(process.cwd(), 'src/components/Layout/MainLayout.tsx'),
  unifiedLayout: path.resolve(process.cwd(), 'src/components/Layout/UnifiedLayout.tsx')
};

// Create backups of all files
Object.entries(paths).forEach(([key, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.rbac-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${key} at ${backupPath}`);
  } else {
    console.log(`Warning: ${key} not found at ${filePath}`);
  }
});

// 1. Modify the AuthContext to bypass role checks
if (fs.existsSync(paths.authContext)) {
  let content = fs.readFileSync(paths.authContext, 'utf8');
  
  // Bypass user approval check
  content = content.replace(
    `// Check user approval with timeout protection
  const checkUserApproval = async (user: User) => {
    if (!user) return;
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('User approval check timed out')), 5000);
    });
    
    try {
      // Race between the actual operation and the timeout
      const result = await Promise.race([
        safeGetDocument('users', user.uid),
        timeoutPromise
      ]) as any;
      
      if (result && result.success && result.data) {
        const userData = result.data;
        setUserProfile(userData);
        
        // If user is not approved, sign them out
        if (userData.approved === false) {
          setError('Your account is pending approval. Please contact an administrator.');
          await signOut();
        }
      }
    } catch (error) {
      logError('AUTH', 'Error checking user approval', error);
      // On timeout or error, just continue without user profile
      // This prevents the app from locking up
    }
  };`,
    `// RBAC DISABLED: User approval check bypassed
  const checkUserApproval = async (user: User) => {
    if (!user) return;
    
    try {
      // Try to get user data but don't enforce any restrictions
      const result = await safeGetDocument('users', user.uid);
      
      if (result && result.success && result.data) {
        // Set user profile with admin role and approved status
        const userData = {
          ...result.data,
          role: 'ADMIN', // Force admin role
          approved: true, // Force approved status
          permissions: ['*'] // Grant all permissions
        };
        setUserProfile(userData);
        console.log('RBAC DISABLED: User automatically approved with admin privileges');
      } else {
        // Create default admin profile if no user data exists
        const defaultProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Admin User',
          role: 'ADMIN',
          approved: true,
          permissions: ['*'],
          createdAt: new Date().toISOString()
        };
        setUserProfile(defaultProfile);
        console.log('RBAC DISABLED: Created default admin profile');
      }
    } catch (error) {
      logError('AUTH', 'Error checking user data', error);
      
      // Create default admin profile on error
      const defaultProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Admin User',
        role: 'ADMIN',
        approved: true,
        permissions: ['*'],
        createdAt: new Date().toISOString()
      };
      setUserProfile(defaultProfile);
      console.log('RBAC DISABLED: Created default admin profile after error');
    }
  };`
  );
  
  // Modify sign up to automatically approve users
  content = content.replace(
    `// Create user profile
      await safeUpdateDocument('users', result.user.uid, {
        email,
        displayName,
        role,
        approved: false,
        createdAt: new Date().toISOString()
      });`,
    `// Create user profile with admin role and auto-approval
      await safeUpdateDocument('users', result.user.uid, {
        email,
        displayName,
        role: 'ADMIN', // Force admin role regardless of input
        approved: true, // Auto-approve all users
        permissions: ['*'], // Grant all permissions
        createdAt: new Date().toISOString()
      });
      
      console.log('RBAC DISABLED: New user created with admin privileges');`
  );
  
  fs.writeFileSync(paths.authContext, content);
  console.log('Updated AuthContext.tsx to bypass role checks');
}

// 2. Modify the schema.ts file to simplify roles
if (fs.existsSync(paths.userRoles)) {
  let content = fs.readFileSync(paths.userRoles, 'utf8');
  
  // Simplify user roles to just ADMIN
  content = content.replace(
    /export enum UserRole \{[^}]*\}/s,
    `export enum UserRole {
  ADMIN = 'ADMIN'
  // All other roles removed - RBAC disabled
}`
  );
  
  // Add a comment about RBAC being disabled
  content = content.replace(
    /export interface User \{/,
    `// RBAC DISABLED: All users are treated as admins
export interface User {`
  );
  
  fs.writeFileSync(paths.userRoles, content);
  console.log('Updated schema.ts to simplify roles');
}

// 3. Modify the RBAC utility if it exists
if (fs.existsSync(paths.rbacUtils)) {
  let content = fs.readFileSync(paths.rbacUtils, 'utf8');
  
  // Replace permission check functions to always return true
  content = content.replace(
    /export function hasPermission[^}]*\}/s,
    `export function hasPermission(user: any, permission: string): boolean {
  // RBAC DISABLED: All permission checks return true
  console.log('RBAC DISABLED: Permission check bypassed for', permission);
  return true;
}`
  );
  
  content = content.replace(
    /export function checkRole[^}]*\}/s,
    `export function checkRole(user: any, role: string): boolean {
  // RBAC DISABLED: All role checks return true
  console.log('RBAC DISABLED: Role check bypassed for', role);
  return true;
}`
  );
  
  fs.writeFileSync(paths.rbacUtils, content);
  console.log('Updated rbac.ts to bypass permission checks');
}

// 4. Modify the MainLayout and UnifiedLayout to show all menu items
const updateLayoutFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the menu items filtering logic and replace it
    const menuFilterPattern = /const filteredMenuItems = menuItems\.filter\([^;]*\);/s;
    if (menuFilterPattern.test(content)) {
      content = content.replace(
        menuFilterPattern,
        `// RBAC DISABLED: Show all menu items regardless of role
      const filteredMenuItems = menuItems; // No filtering`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${path.basename(filePath)} to show all menu items`);
    } else {
      console.log(`Could not find menu filtering logic in ${path.basename(filePath)}`);
    }
  }
};

updateLayoutFile(paths.mainLayout);
updateLayoutFile(paths.unifiedLayout);

// 5. Create a global RBAC override file
const rbacOverridePath = path.resolve(process.cwd(), 'src/utils/rbac-override.ts');
const rbacOverrideContent = `/**
 * RBAC Override
 * 
 * This file provides global overrides for RBAC functionality.
 * It ensures all permission and role checks return true.
 */

// Global flag to indicate RBAC is disabled
export const RBAC_DISABLED = true;

/**
 * Check if a user has a specific permission
 * Always returns true when RBAC is disabled
 */
export function hasPermission(user: any, permission: string): boolean {
  return true;
}

/**
 * Check if a user has a specific role
 * Always returns true when RBAC is disabled
 */
export function checkRole(user: any, role: string): boolean {
  return true;
}

/**
 * Get user's role
 * Always returns 'ADMIN' when RBAC is disabled
 */
export function getUserRole(user: any): string {
  return 'ADMIN';
}

/**
 * Check if user is approved
 * Always returns true when RBAC is disabled
 */
export function isUserApproved(user: any): boolean {
  return true;
}

/**
 * Get all permissions for a user
 * Returns wildcard permission when RBAC is disabled
 */
export function getUserPermissions(user: any): string[] {
  return ['*'];
}
`;

fs.writeFileSync(rbacOverridePath, rbacOverrideContent);
console.log('Created rbac-override.ts with global RBAC overrides');

// 6. Create a README file explaining the changes
const readmePath = path.resolve(process.cwd(), 'RBAC_DISABLED.md');
const readmeContent = `# RBAC Functionality Disabled

This document explains the changes made to disable Role-Based Access Control (RBAC) in the CHWOne platform.

## What Was Changed

1. **User Approval Bypassed**
   - All users are automatically approved
   - No approval checks are performed
   - No users will be signed out due to lack of approval

2. **Admin Role Enforced**
   - All users are assigned the ADMIN role
   - Role checks always return true
   - All users have access to all features

3. **Permission Checks Bypassed**
   - All permission checks return true
   - Permission validation is skipped
   - All users have full permissions

4. **Menu Items Unfiltered**
   - All menu items are shown to all users
   - No menu filtering based on roles
   - All navigation options are available

## Files Modified

1. **AuthContext.tsx**: Bypassed user approval checks and auto-approved all users
2. **schema.ts**: Simplified user roles to just ADMIN
3. **rbac.ts**: Modified permission checks to always return true
4. **MainLayout.tsx & UnifiedLayout.tsx**: Removed menu filtering based on roles
5. **rbac-override.ts**: Created new file with global RBAC overrides

## Security Implications

**WARNING**: Disabling RBAC removes all access control from the application. This should only be used in:

- Development environments
- Testing scenarios
- Single-user deployments
- Situations where all users should have full access

Do not use this configuration in production environments where access control is required.

## Restoring RBAC

To restore RBAC functionality, you can:

1. Revert the changes using the backup files (*.rbac-backup)
2. Run \`git checkout\` on the modified files if using version control
3. Re-implement the RBAC checks as needed

Created: ${new Date().toISOString()}
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created explanation file at ${readmePath}`);

console.log('\nRBAC disabling process completed!');
console.log('\nAll users will now be treated as admins with full permissions.');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Test logging in with any user');
console.log('3. Verify all features are accessible');
console.log('\nWARNING: This configuration is not secure for production use.');

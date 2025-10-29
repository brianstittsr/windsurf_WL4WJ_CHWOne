# Firebase Permissions Fix Guide

This guide provides solutions for the "Missing or insufficient permissions" error in the CHWOne application.

## Understanding the Error

The "Missing or insufficient permissions" error occurs when:

1. Your Firebase security rules are too restrictive
2. The user isn't properly authenticated
3. The authenticated user doesn't have the required permissions

## Quick Fix: Use Development Rules

For development and testing, you can use the permissive development rules:

1. Run the deploy-rules.js script:
   ```
   node deploy-rules.js
   ```

2. Select option 2 to toggle to development rules
3. Select option 1 to deploy the rules

This will allow all read/write operations during development.

## Environment Variables

Make sure your Vercel deployment has these environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Authentication Debugging

1. The AuthDebugger component has been added to help diagnose authentication issues
2. It will appear in development mode at the bottom-right corner of the page
3. It shows:
   - Current authentication state
   - User document from Firestore
   - Any errors encountered

## Common Issues and Solutions

### 1. User Not Authenticated

**Symptoms:**
- AuthDebugger shows "Not authenticated"
- Console error: "User is not authenticated. Log in first."

**Solution:**
- Make sure to log in before accessing protected resources
- Check that the login process is working correctly
- Verify Firebase configuration in .env.local

### 2. User Document Missing

**Symptoms:**
- User is authenticated but AuthDebugger shows "User document not found"
- Console error: "User document not found in Firestore"

**Solution:**
- Ensure the user document is created in the 'users' collection after registration
- Check the user document has the required fields (role, organizationId, etc.)
- Verify the user document ID matches the authentication UID

### 3. Incorrect User Role

**Symptoms:**
- Permission denied despite being authenticated
- AuthDebugger shows an unexpected role

**Solution:**
- Update the user document with the correct role (e.g., 'admin', 'chw', etc.)
- Check that the role matches one of the values in the security rules

### 4. Organization Access Issues

**Symptoms:**
- Permission denied for organization-specific resources
- Console error mentions "hasOrgAccess"

**Solution:**
- Ensure the user document has the correct organizationId
- For admin users, add a permissions.canAccessAllOrganizations: true field

## Admin User Setup

If you need to create an admin user:

1. Use the admin credentials:
   - Email: admin@example.com
   - Password: admin123

2. If these don't work, check that the admin user was created during schema initialization
3. You can manually create an admin user in the Firebase console

## Production Deployment

Before deploying to production:

1. Switch back to production rules:
   ```
   node deploy-rules.js
   ```
   
2. Select option 2 to toggle to production rules
3. Select option 1 to deploy the rules
4. Make sure all users have the correct permissions in their user documents

## Need More Help?

If you're still experiencing permission issues:

1. Check the browser console for detailed error messages
2. Look at the Firebase Authentication and Firestore sections in the Firebase console
3. Verify that your security rules match your application's access patterns
4. Consider temporarily enabling debug mode in Firebase for more detailed logs

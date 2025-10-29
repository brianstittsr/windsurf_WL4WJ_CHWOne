# Firebase Authentication Troubleshooting Guide

## Common Login Issues

If you're experiencing issues logging into the CHWOne platform, follow these troubleshooting steps:

## 1. Fix Next.js Server Component Error

The application is currently showing a Next.js error related to Server Components:

```
Error: × `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component.
```

This error prevents the application from starting properly. We've fixed this by:

1. Creating a Client Component wrapper (`ClientAuthDebugger.tsx`)
2. Updating the layout file to use this wrapper

After these changes, restart the development server:

```bash
npm run dev
```

## 2. Verify Firebase Configuration

Ensure your `.env.local` file contains all required Firebase configuration variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

All of these values must be correct and match your Firebase project settings.

## 3. Initialize Firebase Schema

The application requires a properly initialized Firebase schema with:
- Default organizations
- Admin user
- Schema version document

Run our initialization script:

```bash
npm run initialize-firebase
```

This script will:
1. Check your Firebase configuration
2. Create default organizations (general, region5, wl4wj)
3. Create an admin user with the following credentials:
   - Email: admin@example.com
   - Password: admin123
4. Set up the schema version document

## 4. Try Admin Login

After running the initialization script, try logging in with the admin credentials:

- Email: admin@example.com
- Password: admin123

## 5. Check Browser Console for Errors

If you're still experiencing issues, check your browser's developer console (F12) for specific error messages:

- **auth/configuration-not-found**: Firebase configuration is missing or incorrect
- **auth/user-not-found**: User doesn't exist in Firebase Authentication
- **auth/wrong-password**: Password is incorrect
- **auth/invalid-credential**: General authentication error

## 6. Verify Firestore Database

Check your Firebase console to ensure:

1. The `users` collection exists
2. There's a document for the admin user with:
   - `role`: "admin"
   - `isActive`: true
   - `isApproved`: true

## 7. Manual User Creation (If Needed)

If the admin user doesn't exist or you need to create a new user:

1. Go to Firebase Console > Authentication
2. Click "Add User"
3. Enter email and password
4. Then create a corresponding document in the `users` collection with:
   ```json
   {
     "uid": "[user's UID from Authentication]",
     "email": "admin@example.com",
     "displayName": "Admin User",
     "role": "admin",
     "organizationId": "general",
     "isActive": true,
     "isApproved": true,
     "createdAt": "[timestamp]",
     "updatedAt": "[timestamp]"
   }
   ```

## 8. Check Firebase Rules

Ensure your Firestore security rules allow reading and writing to the necessary collections:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own user document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admins to read and write all documents
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 9. Reset Firebase Configuration (Last Resort)

If all else fails, you can reset your Firebase configuration:

1. Delete the `.firebase` directory
2. Run `firebase logout` and then `firebase login` again
3. Re-initialize Firebase with `firebase init`
4. Update your `.env.local` file with fresh configuration
5. Run the initialization script again

## Need More Help?

If you're still experiencing issues after following these steps, please:

1. Note the specific error message from the browser console
2. Check the Firebase Authentication logs in Firebase Console
3. Verify your Firebase project settings
4. Contact the development team with these details

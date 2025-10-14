# Firebase Setup for Vercel Deployment

This guide explains how to properly configure Firebase for your Vercel deployment to fix permission issues.

## 1. Firebase Security Rules

Update your Firebase security rules to allow access from your Vercel deployment:

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users for public data
    match /public/{document=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read CHW data
    match /chws/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.token.admin == true || request.auth.token.chw_coordinator == true);
    }
    
    // Allow authenticated users to read resources
    match /resources/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.token.admin == true || request.auth.token.chw_coordinator == true);
    }
    
    // Allow authenticated users to read and write their own forms
    match /forms/{formId} {
      allow read: if true;
      allow write: if request.auth != null && (request.auth.token.admin == true || request.auth.token.chw_coordinator == true);
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Storage Rules

```javascript
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 2. Create a Firebase Service Account

For server-side operations in Vercel, you need a service account:

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to Project Settings > Service accounts
4. Click "Generate new private key"
5. Save the JSON file securely

## 3. Add Environment Variables to Vercel

Add these environment variables to your Vercel project:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin (Service Account)
FIREBASE_PRIVATE_KEY='"your-private-key"' # Note the double quotes inside single quotes
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PROJECT_ID=your-project-id

# Authentication Configuration
NEXT_PUBLIC_AUTH_PROVIDER=firebase
```

## 4. Configure Firebase for Your Vercel Domain

1. Go to Firebase Console > Authentication > Settings > Authorized domains
2. Add your Vercel deployment domain (e.g., `chwone-platform.vercel.app`)

## 5. Update Your Code

1. Use the provided `firebaseConfig.ts` for Firebase initialization
2. Use `firebaseAdmin.ts` for server-side operations
3. Use `dataAccess.ts` for Firestore operations with error handling
4. Use `mockData.ts` for fallback data when Firebase is unavailable
5. Update your AuthContext to handle Firebase errors gracefully
6. Use the static home page to avoid server-side rendering issues

## 6. Deploy to Vercel

After making these changes, deploy your application to Vercel:

```bash
git add .
git commit -m "Fix Firebase permissions for Vercel deployment"
git push
```

## 7. Verify Deployment

1. Check Vercel deployment logs for any errors
2. Test authentication functionality
3. Test data access functionality
4. Monitor Firebase console for any permission errors

## Troubleshooting

If you still encounter permission issues:

1. Check Firebase console > Authentication > Users to ensure users exist
2. Check Firebase console > Firestore > Data to ensure collections exist
3. Check Firebase console > Storage to ensure files exist
4. Check Vercel environment variables for correct values
5. Check Firebase security rules for any syntax errors
6. Check Firebase service account permissions

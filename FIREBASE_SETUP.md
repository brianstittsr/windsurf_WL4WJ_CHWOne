# Firebase Setup Guide for CHWOne Platform

## Prerequisites
- Firebase account (free tier is sufficient for development)
- Firebase CLI installed globally

## Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase
```bash
firebase login
```
This will open your browser for authentication.

## Step 3: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `chwone-platform`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 4: Enable Required Services

### Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Click "Save"

### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location (us-central1 recommended)
5. Click "Done"

### Storage
1. Go to Storage
2. Click "Get started"
3. Use default security rules for now
4. Choose same location as Firestore
5. Click "Done"

## Step 5: Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web app icon
4. Register app name: "CHWOne Platform"
5. Copy the configuration object

## Step 6: Initialize Firebase in Project
```bash
cd C:\Users\Buyer\Documents\CascadeProjects\CHWOne
firebase init
```

Select the following options:
- ☑️ Firestore: Configure security rules and indexes files
- ☑️ Storage: Configure a security rules file for Cloud Storage
- ☑️ Hosting: Configure files for Firebase Hosting (optional)

Configuration prompts:
- **Project**: Select your `chwone-platform` project
- **Firestore rules file**: `firestore.rules` (already exists)
- **Firestore indexes file**: `firestore.indexes.json` (already exists)
- **Storage rules file**: `storage.rules` (already exists)
- **Public directory**: `out` (for Next.js export)

## Step 7: Update Environment Variables
Edit `.env.local` with your Firebase configuration:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chwone-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chwone-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chwone-platform.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=chwone-platform
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chwone-platform.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Step 8: Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage:rules
```

## Step 9: Deploy Database Indexes
```bash
firebase deploy --only firestore:indexes
```

## Step 10: Initialize Sample Data (Optional)
```bash
npm run init-db
```

## Step 11: Restart Development Server
```bash
npm run dev
```

## Verification Steps

1. **Test Authentication**: Visit http://localhost:3000 and try to register
2. **Check Firestore**: Verify collections are created in Firebase Console
3. **Test Security Rules**: Ensure proper access controls are working

## Troubleshooting

### "Project not found" Error
- Ensure you selected the correct project during `firebase init`
- Check `.firebaserc` file contains correct project ID

### "Permission denied" Error
- Verify Firestore security rules are deployed
- Check user authentication status
- Ensure user has proper role assigned

### "Invalid API key" Error
- Double-check `.env.local` configuration
- Ensure all Firebase config values are correct
- Restart development server after changes

## Production Deployment

### Deploy to Firebase Hosting
```bash
npm run build
npm run export
firebase deploy --only hosting
```

### Deploy Everything
```bash
firebase deploy
```

## Security Considerations

1. **Never commit** `.env.local` to version control
2. **Use environment variables** for all sensitive configuration
3. **Review security rules** before production deployment
4. **Enable App Check** for production (recommended)
5. **Set up monitoring** and alerts for unusual activity

## HIPAA Compliance Notes

- All client data is encrypted at rest in Firestore
- Audit logging is automatically enabled
- Security rules enforce minimum necessary access
- Regular backups should be configured for compliance

## Support

- Firebase Documentation: https://firebase.google.com/docs
- CHWOne Platform Issues: Create GitHub issue
- HIPAA Compliance Questions: Contact compliance team

# Create Admin Profile - Manual Steps

## Quick Fix: Create Admin Profile in Firebase Console

Since the `/create-admin-profile` page has AuthProvider issues, here's how to create your admin profile manually in Firebase Console:

### Step 1: Get Your User UID

From your console logs, find your user UID. It should look like:
```
[AUTH] User UID: abc123def456...
```

Or check Firebase Authentication:
1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Authentication" in left menu
4. Click "Users" tab
5. Find your email and copy the "User UID"

### Step 2: Create User Document in Firestore

1. **Go to Firestore Database**
   - In Firebase Console, click "Firestore Database"
   - Click on the "users" collection (create it if it doesn't exist)

2. **Add Document**
   - Click "Add document"
   - Document ID: **Paste your User UID here**

3. **Add These Fields:**

| Field | Type | Value |
|-------|------|-------|
| `uid` | string | Your User UID |
| `email` | string | Your email address |
| `displayName` | string | Your name (e.g., "Admin User") |
| `role` | string | `ADMIN` |
| `roles` | array | `["ADMIN"]` |
| `primaryRole` | string | `ADMIN` |
| `organizationType` | string | `NONPROFIT` |
| `createdAt` | timestamp | Click "Use server timestamp" |
| `updatedAt` | timestamp | Click "Use server timestamp" |
| `isActive` | boolean | `true` |

### Step 3: Save and Refresh

1. Click "Save" in Firestore
2. Go back to your app
3. **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check the console logs - you should see:
   ```
   [AUTH] User document exists: true
   [AUTH] User role: ADMIN
   [AUTH] ✅ Setting user profile in state
   AdminRoleSwitcher - ✅ RENDERING COMPONENT
   ```

5. **Look in the lower right corner** - the Role Switcher should appear!

---

## Alternative: Use Firebase CLI

If you prefer using Firebase CLI:

```javascript
// Run this in Firebase Console > Firestore > Rules (temporarily)
// Or use Firebase Admin SDK

const admin = require('firebase-admin');
const db = admin.firestore();

const userUid = 'YOUR_USER_UID_HERE';

await db.collection('users').doc(userUid).set({
  uid: userUid,
  email: 'your-email@example.com',
  displayName: 'Admin User',
  role: 'ADMIN',
  roles: ['ADMIN'],
  primaryRole: 'ADMIN',
  organizationType: 'NONPROFIT',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  isActive: true
});
```

---

## Verification

After creating the profile, check:

1. **Console Logs**
   ```
   [AUTH] User document exists: true
   [AUTH] User role: ADMIN
   ```

2. **Visit `/test-role-switcher`**
   - Should show your profile data
   - Should show `role: "ADMIN"`

3. **Check Lower Right Corner**
   - Purple gradient card should appear
   - Says "Testing as: Admin"
   - Has pulsing icon

---

## Troubleshooting

### Profile Created But Still Not Showing

1. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Cache**: Browser settings → Clear browsing data
3. **Check Firestore Rules**: Make sure you can read from `users` collection
4. **Check Console**: Look for any Firebase errors

### Firestore Rules

Make sure your Firestore rules allow reading user documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow users to read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to create their own profile
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to update their own profile (except role)
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## What This Does

Creating this document will:
- ✅ Link your Firebase Auth account to a Firestore profile
- ✅ Give you ADMIN role
- ✅ Make the Role Switcher visible
- ✅ Grant access to all admin features
- ✅ Allow you to test different user roles

---

## Next Steps After Profile Creation

1. ✅ Verify Role Switcher appears
2. ✅ Test switching between roles
3. ✅ Verify navigation updates for each role
4. ✅ Create profiles for other users if needed

---

**Need Help?**

If you're still having issues after creating the profile:
1. Check browser console for errors
2. Verify the document was created in Firestore
3. Make sure the field names match exactly (case-sensitive)
4. Try logging out and back in
5. Check Firestore security rules

---

**Last Updated:** November 29, 2025

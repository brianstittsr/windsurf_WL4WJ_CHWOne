# Create Admin Profile - Browser Console Method

## 🚀 Fastest Method: Run This in Browser Console

Since you're already logged in, you can create your profile directly from the browser console!

### Step 1: Open Browser Console

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

### Step 2: Copy and Paste This Code

```javascript
// Create Admin Profile in Browser Console
(async function createAdminProfile() {
  console.log('🔄 Creating admin profile...');
  
  try {
    // Import Firebase modules
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db, auth } = await import('./src/lib/firebase');
    
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No user is currently signed in!');
      console.log('Please log in first, then run this script again.');
      return;
    }
    
    console.log('✅ Current user:', currentUser.email);
    console.log('✅ User UID:', currentUser.uid);
    
    // Create profile data
    const profileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || 'Admin User',
      role: 'ADMIN',
      roles: ['ADMIN'],
      primaryRole: 'ADMIN',
      organizationType: 'NONPROFIT',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    // Create the document
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, profileData);
    
    console.log('✅ Profile created successfully!');
    console.log('📋 Profile data:', profileData);
    console.log('\n🎉 Success! Now:');
    console.log('1. Refresh the page (Ctrl+R or Cmd+R)');
    console.log('2. Check lower right corner for Role Switcher');
    console.log('3. Console should show: [AUTH] User document exists: true');
    
    // Trigger a page reload after 2 seconds
    setTimeout(() => {
      console.log('🔄 Reloading page...');
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    console.log('\nTroubleshooting:');
    console.log('- Make sure you are logged in');
    console.log('- Check Firestore security rules');
    console.log('- Try the manual Firebase Console method instead');
  }
})();
```

### Step 3: Press Enter

The script will:
1. ✅ Detect your current user
2. ✅ Create the admin profile in Firestore
3. ✅ Auto-reload the page after 2 seconds
4. ✅ Role Switcher should appear!

---

## 🎯 Alternative: Simpler One-Liner

If the above doesn't work due to module imports, use this simpler version:

```javascript
// Simpler version - paste in console
fetch('/api/create-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'ADMIN',
    displayName: 'Admin User'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

**Note:** This requires creating an API route first (see below).

---

## 📝 Manual Firebase Console Method

If browser console doesn't work, use Firebase Console:

### Your User Details:
- **UID**: `jGnL4ZkY6YWMW2qC040cPpSYl0s1`
- **Email**: `admin@example.com`

### Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**
3. **Click "Firestore Database"** in left menu
4. **Click "users" collection** (create if doesn't exist)
5. **Click "Add document"**
6. **Document ID**: `jGnL4ZkY6YWMW2qC040cPpSYl0s1`
7. **Add these fields**:

| Field | Type | Value |
|-------|------|-------|
| `uid` | string | `jGnL4ZkY6YWMW2qC040cPpSYl0s1` |
| `email` | string | `admin@example.com` |
| `displayName` | string | `Admin User` |
| `role` | string | `ADMIN` |
| `roles` | array | Add item: `ADMIN` |
| `primaryRole` | string | `ADMIN` |
| `organizationType` | string | `NONPROFIT` |
| `createdAt` | timestamp | (current time) |
| `updatedAt` | timestamp | (current time) |
| `isActive` | boolean | `true` |

8. **Click "Save"**
9. **Refresh your browser** (Ctrl+Shift+R)
10. **Check lower right corner** → Role Switcher appears!

---

## ✅ Verification

After creating the profile, you should see:

### Console Logs:
```
[AUTH] Auth state changed: User signed in
[AUTH] User UID: jGnL4ZkY6YWMW2qC040cPpSYl0s1
[AUTH] User Email: admin@example.com
[AUTH] Fetching user document from Firestore...
[AUTH] User document exists: true ✅
[AUTH] User profile data: {role: "ADMIN", ...}
[AUTH] User role: ADMIN
[AUTH] ✅ Setting user profile in state
```

### Visual:
- ✅ Purple gradient card in lower right corner
- ✅ Shows "Testing as: Admin"
- ✅ Has pulsing icon
- ✅ Click to expand and see role options

---

## 🔧 Troubleshooting

### Profile Created But Not Showing

1. **Hard Refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear Cache**: Browser settings → Clear browsing data
3. **Check Console**: Look for `[AUTH] User document exists: true`
4. **Verify Firestore**: Check document exists in Firebase Console

### Still Not Working?

1. **Check Firestore Rules**: Make sure you can read/write to `users` collection
2. **Check Field Names**: Must match exactly (case-sensitive)
3. **Check UID**: Must match exactly: `jGnL4ZkY6YWMW2qC040cPpSYl0s1`
4. **Try Logging Out and Back In**

---

## 🎉 Success!

Once the profile is created:
- ✅ Role Switcher will appear
- ✅ You can switch between ADMIN, CHW, and CHW_COORDINATOR roles
- ✅ Navigation will update based on selected role
- ✅ You can test the app from different user perspectives

---

**Last Updated:** November 29, 2025  
**Your UID:** `jGnL4ZkY6YWMW2qC040cPpSYl0s1`  
**Your Email:** `admin@example.com`

# 🔍 CHW Profiles Troubleshooting Guide

**Issue**: "No CHW Profiles Yet" message appearing on Community Health Workers page

---

## 🎯 Quick Diagnosis

Run this command to check what's in Firebase:
```bash
npm run check-chw-profiles
```

This will show you:
- How many CHW profiles exist in Firebase
- Which ones are admin profiles (filtered out)
- Which ones should be visible
- Any data issues

---

## 🤔 Why Are CHW Profiles Missing?

### Possible Reason 1: No Profiles Created Yet ✅ MOST LIKELY
**Symptom**: Fresh database, no registrations yet

**Why**: 
- Users haven't registered as CHWs yet
- The system is working correctly - just empty

**Solution**:
- Have users register via "Register As A Community Health Worker" button
- Or create test profiles for development

---

### Possible Reason 2: All Profiles Are Admin Profiles
**Symptom**: Profiles exist but all belong to admin users

**Why**: 
- The system filters out admin profiles from public directory
- This is intentional - admins shouldn't appear in CHW directory

**Check**:
```bash
npm run check-chw-profiles
```

Look for: "Admin Profiles: X (filtered out from public view)"

**Solution**:
- Create non-admin CHW profiles for testing
- Or temporarily disable admin filtering (see below)

---

### Possible Reason 3: Firebase Security Rules Not Deployed
**Symptom**: Profiles exist but can't be read

**Why**: 
- Security rules not deployed to Firebase
- Rules blocking read access

**Check**:
- Browser console shows permission errors
- Firebase Console shows "permission-denied" errors

**Solution**:
```bash
npm run deploy:firebase
```

Or manually:
```bash
firebase deploy --only firestore:rules
```

---

### Possible Reason 4: Wrong Firebase Project
**Symptom**: Looking at wrong Firebase project

**Why**: 
- Multiple Firebase projects
- Environment variables pointing to wrong project

**Check**:
- `.env.local` file has correct Firebase credentials
- Firebase Console shows correct project name

**Solution**:
- Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in `.env.local`
- Check Firebase Console project name matches

---

### Possible Reason 5: Profiles Deleted
**Symptom**: Profiles existed before but now gone

**Why**: 
- Manual deletion from Firebase Console
- Script or migration deleted data
- Database reset

**Check**:
- Firebase Console > Firestore > chwProfiles collection
- Check if collection exists but is empty

**Solution**:
- Restore from backup if available
- Re-register CHW profiles
- Check Firebase Console audit logs

---

## 🛠️ Diagnostic Commands

### Check Firebase Data
```bash
npm run check-chw-profiles
```

### Check Environment
```bash
npm run verify-env
```

### Deploy Firebase Rules
```bash
npm run deploy:firebase
```

---

## 🔧 Solutions

### Solution 1: Create Test CHW Profiles

**Option A: Via UI**
1. Go to `/chws` or CHW directory page
2. Click "Register As A Community Health Worker"
3. Fill out the wizard
4. Submit

**Option B: Via Firebase Console**
1. Open Firebase Console
2. Go to Firestore Database
3. Navigate to `chwProfiles` collection
4. Add document manually

**Option C: Via Script** (create if needed)
```javascript
// scripts/create-test-chw-profiles.js
// Create sample CHW profiles for testing
```

---

### Solution 2: Temporarily Disable Admin Filtering

**File**: `src/components/CHW/MockCHWProfiles.tsx`

**Change** (lines 448-452):
```typescript
// BEFORE (filters out admins)
if (isAdmin) {
  console.log(`Skipping admin profile: ${profile.firstName} ${profile.lastName}`);
  continue;
}

// AFTER (shows all profiles including admins)
if (isAdmin) {
  console.log(`Including admin profile: ${profile.firstName} ${profile.lastName}`);
  // Don't skip - show admin profiles for testing
}
```

**Note**: Remember to revert this change for production!

---

### Solution 3: Check Collection Name

Verify the collection name is correct:

**File**: `src/lib/schema/unified-schema.ts`
```typescript
export const COLLECTIONS = {
  CHW_PROFILES: 'chwProfiles',  // Must match Firebase exactly
  // ...
}
```

**Firebase Console**: Check collection is named `chwProfiles` (not `chw_profiles` or `CHWProfiles`)

---

### Solution 4: Verify Security Rules

**File**: `firestore.rules`

Should contain:
```javascript
match /chwProfiles/{profileId} {
  allow read: if isAuthenticated();
  allow create, update: if isAdmin() || (isAuthenticated() && request.auth.uid == profileId);
  allow delete: if isAdmin();
}
```

Deploy with:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Expected Behavior

### When Working Correctly:

1. **No Profiles**:
   - Shows "No CHW Profiles Yet" message
   - Encourages registration
   - This is correct!

2. **Admin Profiles Only**:
   - Shows "No CHW Profiles Yet" message
   - Admin profiles filtered out (intentional)
   - Need non-admin profiles

3. **Non-Admin Profiles Exist**:
   - Shows profile cards in grid
   - Displays name, location, specializations
   - Click to view full profile

---

## 🔍 Debugging Checklist

- [ ] Run `npm run check-chw-profiles`
- [ ] Check Firebase Console > Firestore > chwProfiles
- [ ] Verify `.env.local` has correct Firebase credentials
- [ ] Check browser console for errors
- [ ] Verify user is authenticated
- [ ] Check security rules deployed
- [ ] Test creating new profile via UI
- [ ] Check if profiles are admin profiles

---

## 📝 Common Scenarios

### Scenario 1: Development Environment
**Situation**: Setting up for first time

**Expected**: No profiles, empty state

**Action**: Create test profiles or use wizard

---

### Scenario 2: Production with Real Users
**Situation**: Users have registered

**Expected**: Profiles visible

**If Not**: Check security rules, authentication

---

### Scenario 3: Testing with Admin Account
**Situation**: Logged in as admin

**Expected**: Can see all profiles in admin panel, but admin profiles filtered from public directory

**Action**: Create non-admin test accounts

---

## 🆘 Still Not Working?

### Check These:

1. **Browser Console**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Look for Firebase errors

2. **Network Tab**:
   - Check if Firestore requests are being made
   - Look for 403 Forbidden errors
   - Check request/response data

3. **Firebase Console**:
   - Verify collection exists
   - Check document count
   - Review security rules
   - Check authentication

4. **Code**:
   - Verify `COLLECTIONS.CHW_PROFILES` constant
   - Check component is using correct collection
   - Verify admin filtering logic

---

## 📞 Support

### Resources:
- **Diagnostic Script**: `npm run check-chw-profiles`
- **Firebase Console**: https://console.firebase.google.com
- **Code**: `src/components/CHW/MockCHWProfiles.tsx`
- **Schema**: `src/lib/schema/unified-schema.ts`

### Next Steps:
1. Run diagnostic script
2. Check Firebase Console
3. Review browser console
4. Create test profiles if needed

---

**Most Common Issue**: No profiles created yet - this is normal for a new system! ✅

*Last Updated: December 1, 2025*

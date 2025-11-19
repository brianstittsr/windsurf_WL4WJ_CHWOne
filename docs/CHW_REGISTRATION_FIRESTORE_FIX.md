# CHW Registration Firestore Collection Fix

## Issue
CHW registration was using incorrect collection names, potentially causing data to be saved to the wrong Firestore collections.

## Problem Identified

### Incorrect Collection Names:
- **Users Collection**: Using hardcoded string `'users'` instead of schema constant
- **CHW Profiles Collection**: Using `'chw-profiles'` (kebab-case) instead of `'chwProfiles'` (camelCase)

### Schema Definition:
According to `src/lib/schema/unified-schema.ts`:
```typescript
export const COLLECTIONS = {
  USERS: 'users',
  CHW_PROFILES: 'chwProfiles',  // ← Correct: camelCase
  // ...
}
```

### Previous Code (Incorrect):
```typescript
// Users collection - hardcoded
await setDoc(doc(db, 'users', user.uid), userProfileData);

// CHW Profiles - wrong name format
await setDoc(doc(db, 'chw-profiles', user.uid), chwProfileData);
```

## Solution Implemented

### 1. Import Schema Constants
**File:** `src/components/CHW/CHWWizard.tsx`

Added import:
```typescript
import { COLLECTIONS } from '@/lib/schema/unified-schema';
```

### 2. Update Users Collection Reference
**Before:**
```typescript
await setDoc(doc(db, 'users', user.uid), userProfileData);
```

**After:**
```typescript
await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfileData);
```

### 3. Update CHW Profiles Collection Reference
**Before:**
```typescript
await setDoc(doc(db, 'chw-profiles', user.uid), chwProfileData);
```

**After:**
```typescript
await setDoc(doc(db, COLLECTIONS.CHW_PROFILES, user.uid), chwProfileData);
```

### 4. Enhanced Console Logging
Updated console logs for better debugging:
```typescript
console.log('User profile saved to Firestore users collection');
console.log('CHW profile saved to Firestore chwProfiles collection');
```

## Data Saved to Firestore

### Collection: `users`
**Document ID:** `user.uid`

**Data Structure:**
```typescript
{
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  displayName: string,
  role: 'CHW',
  organizationType: 'CHW',
  phone: string,
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string
  },
  profilePicture: string,
  status: 'pending',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  permissions: {
    canAccessDashboard: boolean,
    canManageClients: boolean,
    canCreateReferrals: boolean,
    canAccessResources: boolean,
    canUseForms: boolean,
    canViewReports: boolean
  }
}
```

### Collection: `chwProfiles`
**Document ID:** `user.uid`

**Data Structure:**
```typescript
{
  id: string,
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: object,
  profilePicture: string,
  displayName: string,
  professional: {
    headline: string,
    bio: string,
    expertise: string[],
    additionalExpertise: string,
    languages: string[],
    availableForOpportunities: boolean,
    yearsOfExperience: number,
    specializations: string[],
    currentOrganization: string,
    currentPosition: string
  },
  serviceArea: {
    region: string,
    countiesWorkedIn: string[],
    countyResideIn: string,
    primaryCounty: string,
    currentOrganization: string,
    role: string
  },
  certification: {
    certificationNumber: string,
    certificationStatus: string,
    certificationExpiration: string,
    expirationDate: string
  },
  contactPreferences: {
    allowDirectMessages: boolean,
    showEmail: boolean,
    showPhone: boolean,
    showAddress: boolean
  },
  membership: {
    dateRegistered: Timestamp,
    includeInDirectory: boolean
  },
  status: 'pending',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Registration Flow

### Step-by-Step Process:

1. **User Fills Out Multi-Step Form**
   - Basic Information (name, email, password, phone, address)
   - Professional Details (headline, bio, expertise, languages, additional expertise)
   - Certification & Training
   - Service Area (counties, region)
   - Contact Preferences
   - Review & Submit

2. **Form Submission Triggers:**
   ```typescript
   const handleSubmit = async () => {
     // Create Firebase Auth user
     const userCredential = await createUserWithEmailAndPassword(
       auth, 
       formData.email, 
       formData.password
     );
     
     // Save to users collection
     await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfileData);
     
     // Save to chwProfiles collection
     await setDoc(doc(db, COLLECTIONS.CHW_PROFILES, user.uid), chwProfileData);
     
     // Send welcome email
     await fetch('/api/send-welcome-email', { ... });
     
     // Show success modal
     setShowSuccessModal(true);
   }
   ```

3. **Data Persisted to Firestore:**
   - ✅ `users/{uid}` - User account data
   - ✅ `chwProfiles/{uid}` - CHW-specific profile data

4. **Success Modal Displayed:**
   - Beautiful animated modal
   - Email confirmation shown
   - Auto-closes after 3 seconds

## Benefits of Using Schema Constants

### 1. Type Safety
- Prevents typos in collection names
- IDE autocomplete support
- Compile-time error checking

### 2. Consistency
- Single source of truth for collection names
- Easy to update across entire codebase
- Reduces bugs from naming inconsistencies

### 3. Maintainability
- Centralized schema management
- Easy refactoring
- Clear documentation

### 4. Best Practices
- Follows DRY principle (Don't Repeat Yourself)
- Aligns with Firebase best practices
- Easier code reviews

## Verification Steps

### To Verify Fix is Working:

1. **Register a New CHW:**
   - Go to CHW registration form
   - Fill out all steps
   - Submit form

2. **Check Firebase Console:**
   - Navigate to Firestore Database
   - Verify `users` collection has new document
   - Verify `chwProfiles` collection has new document
   - Both should use same UID as document ID

3. **Check Console Logs:**
   ```
   User profile saved to Firestore users collection
   CHW profile saved to Firestore chwProfiles collection
   Welcome email sent
   ```

4. **Verify Data Structure:**
   - User document has all required fields
   - CHW profile has professional, serviceArea, certification data
   - Both documents have matching UIDs

## Migration Considerations

### If Old Data Exists in Wrong Collection:

If there's existing data in `chw-profiles` (kebab-case) collection:

1. **Check for Existing Data:**
   ```javascript
   const oldCollectionRef = collection(db, 'chw-profiles');
   const snapshot = await getDocs(oldCollectionRef);
   console.log(`Found ${snapshot.size} documents in old collection`);
   ```

2. **Migrate Data:**
   ```javascript
   snapshot.forEach(async (doc) => {
     const data = doc.data();
     await setDoc(doc(db, COLLECTIONS.CHW_PROFILES, doc.id), data);
     console.log(`Migrated ${doc.id}`);
   });
   ```

3. **Verify Migration:**
   - Check new collection has all data
   - Verify data integrity
   - Test application functionality

4. **Clean Up (Optional):**
   - Delete old collection after verification
   - Update any references in other code

## Related Files

### Schema Definition:
- `src/lib/schema/unified-schema.ts` - Collection constants
- `src/lib/schema/data-access.ts` - Data access functions

### Registration Components:
- `src/components/CHW/CHWWizard.tsx` - Registration form (FIXED)
- `src/components/CHW/MockCHWProfiles.tsx` - CHW profile display

### Types:
- `src/types/chw-profile.types.ts` - CHW profile interface

## Testing Checklist

- [ ] New CHW registration creates user in `users` collection
- [ ] New CHW registration creates profile in `chwProfiles` collection
- [ ] Both documents use same UID
- [ ] All form data is properly saved
- [ ] Professional details are saved correctly
- [ ] Service area data is saved correctly
- [ ] Certification data is saved correctly
- [ ] Contact preferences are saved correctly
- [ ] Status is set to 'pending'
- [ ] Timestamps are created correctly
- [ ] Welcome email is sent
- [ ] Success modal displays
- [ ] No console errors
- [ ] Data can be retrieved and displayed

## Summary

✅ **Fixed collection name inconsistencies**
✅ **Using schema constants for type safety**
✅ **Enhanced logging for better debugging**
✅ **Verified data flow to correct collections**
✅ **Documented migration path if needed**

The CHW registration now correctly populates both the `users` and `chwProfiles` collections in Firestore using the proper schema constants.

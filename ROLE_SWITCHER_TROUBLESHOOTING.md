# Role Switcher Troubleshooting Guide

## Issue: Role Switcher Not Visible

### Quick Diagnostic Steps

#### 1. **Visit the Debug Page**
Navigate to: `/test-role-switcher`

This page will show:
- Your current user profile data
- Your role and roles array
- Whether you're detected as an admin
- All UserRole enum values

#### 2. **Check Browser Console**
Open DevTools (F12) and look for these logs:

```
=== AdminRoleSwitcher Debug ===
userProfile: {...}
userProfile.role: "ADMIN"
Is ADMIN?: true
===============================
AdminRoleSwitcher - ✅ RENDERING COMPONENT
```

If you see "Not showing" instead, the component is not rendering because you're not detected as an admin.

#### 3. **Verify Your User Role**

The component checks for admin status in two ways:
```typescript
const isAdmin = userProfile?.role === UserRole.ADMIN || 
                userProfile?.roles?.includes(UserRole.ADMIN);
```

Your user must have:
- `role: "ADMIN"` OR
- `roles: ["ADMIN", ...]` (array containing ADMIN)

### Common Issues & Solutions

#### Issue 1: User Role is Not ADMIN
**Symptoms:**
- Console shows: `Is ADMIN?: false`
- Component not rendering

**Solution:**
Update your user document in Firestore:
1. Go to Firebase Console → Firestore Database
2. Find your user document in the `users` collection
3. Set the `role` field to `"ADMIN"`
4. Or add `"ADMIN"` to the `roles` array
5. Refresh the page

#### Issue 2: UserProfile Not Loading
**Symptoms:**
- Console shows: `userProfile: null` or `undefined`
- Component not rendering

**Solution:**
1. Check if you're logged in
2. Check AuthContext is properly initialized
3. Verify Firestore rules allow reading user documents
4. Check browser console for Firebase errors

#### Issue 3: Component Rendering But Not Visible
**Symptoms:**
- Console shows: `✅ RENDERING COMPONENT`
- But you don't see it on screen

**Solution:**
1. Check for CSS z-index conflicts
2. Verify the component has `position: fixed` and `z-index: 9999`
3. Check if another element is covering it
4. Try scrolling to bottom-right corner
5. Check browser zoom level (should be 100%)
6. Inspect element in DevTools to see if it's in the DOM

#### Issue 4: MainLayout Not Being Used
**Symptoms:**
- No console logs from AdminRoleSwitcher at all

**Solution:**
1. Verify your page uses `<MainLayout>` wrapper
2. Check that MainLayout.tsx has the import and component:
   ```tsx
   import AdminRoleSwitcher from '@/components/Admin/AdminRoleSwitcher';
   // ...
   <AdminRoleSwitcher />
   ```

### Manual Testing Steps

1. **Login as Admin**
   ```
   Email: your-admin@email.com
   Password: your-password
   ```

2. **Navigate to Any Page**
   - The switcher should appear in lower right corner
   - It should be visible on ALL pages that use MainLayout

3. **Check Console Logs**
   ```
   F12 → Console Tab
   Look for "AdminRoleSwitcher" logs
   ```

4. **Inspect Element**
   ```
   F12 → Elements Tab
   Search for "AdminRoleSwitcher" or "Testing as:"
   Verify it's in the DOM
   Check computed styles
   ```

### Debug Checklist

- [ ] Logged in as a user
- [ ] User has ADMIN role in Firestore
- [ ] On a page that uses MainLayout
- [ ] Console shows AdminRoleSwitcher logs
- [ ] Console shows "✅ RENDERING COMPONENT"
- [ ] No JavaScript errors in console
- [ ] Browser zoom is 100%
- [ ] Checked lower right corner of screen
- [ ] Tried scrolling to see if it's off-screen
- [ ] Inspected DOM to verify component exists

### Expected Behavior

When working correctly:
1. Component appears in **lower right corner**
2. Shows **purple gradient card**
3. Displays "Testing as: [Role Name]"
4. Shows "Actual: ADMIN" badge
5. Click to expand shows list of roles
6. Has a **pulsing icon** when collapsed

### Visual Reference

**Collapsed State:**
```
┌─────────────────────────┐
│ 👤 Testing as:          │
│    Admin                │
│ [Actual: ADMIN]         │
└─────────────────────────┘
     ↻ (pulsing)
```

**Location:** Bottom-right corner, 20px from edges

### Still Not Working?

If you've tried all the above and it's still not visible:

1. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

2. **Check Build**
   - Restart dev server: `npm run dev`
   - Check for build errors

3. **Verify File Exists**
   - Check: `src/components/Admin/AdminRoleSwitcher.tsx`
   - Check: Import in `src/components/Layout/MainLayout.tsx`

4. **Test in Different Browser**
   - Try Chrome, Firefox, or Edge
   - Rule out browser-specific issues

5. **Check for TypeScript Errors**
   - Run: `npm run build`
   - Fix any compilation errors

### Contact Support

If none of these solutions work, provide:
1. Screenshot of `/test-role-switcher` page
2. Console logs (F12 → Console)
3. Your user role from Firestore
4. Browser and version
5. Any error messages

---

## Quick Fix Commands

### Update User to Admin (Firebase Console)
```javascript
// In Firestore Console, update user document:
{
  role: "ADMIN",
  roles: ["ADMIN"]
}
```

### Force Component to Always Show (Temporary Debug)
```typescript
// In AdminRoleSwitcher.tsx, temporarily comment out the check:
// if (!userProfile || !isAdmin) {
//   return null;
// }
```

### Check Component in DOM
```javascript
// In browser console:
document.querySelector('[class*="MuiCard"]')
// Should find the component if it's rendering
```

---

**Last Updated:** November 29, 2025

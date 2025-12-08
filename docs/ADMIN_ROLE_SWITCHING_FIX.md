# Admin Role Switching Fix

## Issue

When an admin user tried to switch roles using the Role Switcher, they received an error:

```
Error switching role: Error: User does not have this role
```

This happened because the `switchRole` function in `AuthContext` was checking if the user had the target role in their `roles` array. Since admins only had `["ADMIN"]` in their roles, they couldn't switch to CHW or CHW_COORDINATOR roles for testing purposes.

## Root Cause

**File:** `src/contexts/AuthContext.tsx`

The original code:
```typescript
// Check if user has this role
const userRoles = state.profile.roles || [state.profile.role];
if (!userRoles.includes(role)) {
  throw new Error('User does not have this role');
}
```

This prevented admins from switching to roles they didn't explicitly have in their `roles` array.

## Solution

Updated the `switchRole` function to allow admins to switch to any role for testing purposes:

```typescript
// Check if user has this role (admins can switch to any role for testing)
const userRoles = state.profile.roles || [state.profile.role];
const isAdmin = userRoles.includes(UserRole.ADMIN);

if (!isAdmin && !userRoles.includes(role)) {
  throw new Error('User does not have this role');
}
```

### Logic:
1. **Check if user is an admin** by looking for `UserRole.ADMIN` in their roles
2. **If admin:** Allow switching to any role (bypass the role check)
3. **If not admin:** Only allow switching to roles they have in their `roles` array

## Benefits

✅ **Admins can test all user perspectives** without needing multiple accounts  
✅ **Non-admin users are still restricted** to their assigned roles  
✅ **Security maintained** - only admins bypass the role check  
✅ **No database changes needed** - admins don't need all roles in their profile  

## How It Works

### For Admin Users:
1. Click the Role Switcher in the lower right corner
2. Select any role (ADMIN, CHW, CHW_COORDINATOR, etc.)
3. The `primaryRole` is updated in Firestore
4. Page reloads to show the new role's interface
5. Navigation and dashboard update based on selected role

### For Non-Admin Users:
1. Can only switch between roles in their `roles` array
2. Example: A user with `roles: ["CHW", "CHW_COORDINATOR"]` can switch between those two
3. Cannot switch to ADMIN or other roles they don't have

## Testing

### Test as Admin:
1. Log in as admin user
2. Open Role Switcher (lower right corner)
3. Click "Community Health Worker"
4. ✅ Should switch successfully and reload
5. Check navigation - should show CHW-specific menu items
6. Switch back to "Admin"
7. ✅ Should return to admin interface

### Test as Non-Admin:
1. Log in as CHW user (with only CHW role)
2. Try to switch to ADMIN role
3. ❌ Should show error: "User does not have this role"
4. ✅ Security check working correctly

## Related Components

### AuthContext.tsx
- Contains the `switchRole` function
- Handles role validation and Firestore updates

### AdminRoleSwitcher.tsx
- Visual component in lower right corner
- Shows current role and available options
- Calls `switchRole` from AuthContext

### RoleSwitcher.tsx
- Alternative role switcher in layout
- Also uses `switchRole` from AuthContext
- Displays role menu in app bar

## User Profile Structure

Admin users should have:
```typescript
{
  uid: "...",
  email: "admin@example.com",
  role: "ADMIN",
  roles: ["ADMIN"],
  primaryRole: "ADMIN",  // Changes when switching roles
  // ... other fields
}
```

When admin switches to CHW:
```typescript
{
  // ... same fields
  primaryRole: "CHW",  // Updated to CHW
  // role and roles array stay the same
}
```

## Security Notes

- ✅ Only users with `ADMIN` in their `roles` array can bypass role checks
- ✅ Role switching updates `primaryRole`, not the `roles` array
- ✅ The user's actual permissions (`roles` array) remain unchanged
- ✅ Non-admin users cannot escalate their privileges
- ✅ All role switches are logged to Firestore with timestamps

## Future Enhancements

Consider adding:
- **Audit log** for role switches (who switched to what, when)
- **Session-based role switching** (temporary, doesn't update Firestore)
- **Role switch history** in admin dashboard
- **Notification** when admin is testing as another role
- **Quick reset** button to return to admin role

---

**Fixed:** November 29, 2025  
**Issue:** Admins couldn't switch roles for testing  
**Resolution:** Allow admins to bypass role validation check

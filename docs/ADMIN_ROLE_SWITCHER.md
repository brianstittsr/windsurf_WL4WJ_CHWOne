# Admin Role Switcher

## Overview
The Admin Role Switcher is a powerful testing tool that allows administrators to view the platform from the perspective of different user roles without logging out or switching accounts.

## Features

### 🎯 **Admin-Only Access**
- Only visible to users with `UserRole.ADMIN`
- Automatically hidden for all other user roles
- Always visible regardless of which role the admin is currently viewing as

### 📍 **Fixed Position**
- Located in the **lower right corner** of the screen
- Fixed positioning with `z-index: 9999` to stay on top
- Visible on all pages when logged in as admin

### 🎨 **Visual Design**
- **Gradient purple card** with white text
- **Pulsing indicator** when collapsed to draw attention
- **Smooth expand/collapse** animation
- **Material-UI components** for consistency

### 🔄 **Role Switching**
Available roles to test:
1. **Admin** - Full platform access (actual role)
2. **Community Health Worker (CHW)** - CHW profile and tools
3. **Nonprofit Staff** - Nonprofit organization view
4. **CHW Association** - Association management
5. **CHW Coordinator** - Coordinator tools
6. **Client** - Client portal view
7. **Viewer** - Read-only access

### 💡 **Smart Features**
- **Current role indicator** - Shows which role you're testing as
- **Actual role badge** - Always displays "Actual: ADMIN"
- **Role descriptions** - Each role has a helpful description
- **Active role highlight** - Checkmark on current role
- **Disabled current role** - Can't switch to role you're already viewing
- **Auto-reload** - Page reloads after role switch to apply new context

## User Interface

### Collapsed State
```
┌─────────────────────────┐
│ 👤 Testing as:          │
│    Community Health...  │
│ [Actual: ADMIN]         │
└─────────────────────────┘
     ↻ (pulsing icon)
```

### Expanded State
```
┌─────────────────────────────────┐
│ 👤 Testing as:                  │
│    Community Health Worker      │
│ [Actual: ADMIN]                 │
│                                 │
│ Switch to Role:                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Admin ✓                  │ │
│ │    Full platform access     │ │
│ ├─────────────────────────────┤ │
│ │ 👤 Community Health Worker  │ │
│ │    CHW profile and tools    │ │
│ ├─────────────────────────────┤ │
│ │ 🏢 Nonprofit Staff          │ │
│ │    Nonprofit org view       │ │
│ ├─────────────────────────────┤ │
│ │ 👥 CHW Association          │ │
│ │    Association management   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [↔ Close]                       │
└─────────────────────────────────┘
```

## Technical Implementation

### Component Location
```
src/components/Admin/AdminRoleSwitcher.tsx
```

### Integration
Added to `MainLayout.tsx` so it appears on all pages:
```typescript
import AdminRoleSwitcher from '@/components/Admin/AdminRoleSwitcher';

// Inside MainLayout component
<AdminRoleSwitcher />
```

### Key Functions

#### Role Detection
```typescript
// Only show for admin users
if (!userProfile || userProfile.role !== UserRole.ADMIN) {
  return null;
}
```

#### Role Switching
```typescript
const handleRoleSwitch = async (role: UserRole) => {
  await switchRole(role);
  window.location.reload(); // Apply new role context
};
```

#### Current Role Display
```typescript
const currentRole = userProfile.primaryRole || userProfile.role;
const actualRole = userProfile.role; // Always ADMIN
```

## Usage Workflow

### For Administrators

1. **Login as Admin**
   - Component automatically appears in lower right corner
   - Shows current viewing role (defaults to Admin)

2. **Switch to Test Role**
   - Click the component to expand
   - Select a role from the list
   - Page reloads with new role context

3. **View as Different User**
   - Navigation updates based on selected role
   - Permissions apply as if you were that role
   - Admin switcher remains visible

4. **Switch Back to Admin**
   - Click switcher again
   - Select "Admin" from list
   - Full admin access restored

### Example Scenarios

#### Testing CHW View
1. Click switcher → Select "Community Health Worker"
2. Page reloads showing CHW-specific navigation
3. See only "My Profile" and CHW tools
4. Test CHW workflows and features
5. Switch back to Admin when done

#### Testing Nonprofit View
1. Click switcher → Select "Nonprofit Staff"
2. See nonprofit organization dashboard
3. Test grant management features
4. Verify nonprofit-specific permissions
5. Switch to another role or back to Admin

#### Testing Client Portal
1. Click switcher → Select "Client"
2. View client-facing interface
3. Test client workflows
4. Verify limited access is working
5. Switch back to Admin

## Benefits

### 🚀 **Faster Testing**
- No need to create multiple test accounts
- No logging in/out between roles
- Instant role switching

### 🔍 **Better QA**
- Test all user perspectives quickly
- Verify role-based access control
- Catch permission issues early

### 🎯 **Accurate Simulation**
- See exactly what users see
- Test with real navigation and permissions
- Verify UI/UX for each role

### 🛡️ **Security**
- Only admins can access
- Actual admin role never changes
- Can always switch back to full admin

## Styling

### Colors
- **Background**: Purple gradient (`#667eea` to `#764ba2`)
- **Text**: White with varying opacity
- **Border**: Primary color (2px solid)
- **Hover**: Lighter white overlay

### Animations
- **Pulse effect** on collapsed indicator
- **Smooth expand/collapse** transition
- **Hover states** on role options

### Responsive Design
- Fixed width: 320px max
- Adapts to mobile screens
- Always accessible in corner

## Future Enhancements

### Potential Additions
1. **Session History** - Track which roles were tested
2. **Quick Notes** - Add notes while testing each role
3. **Screenshot Tool** - Capture views for documentation
4. **Role Comparison** - Side-by-side view of different roles
5. **Keyboard Shortcuts** - Quick role switching with hotkeys
6. **Role Presets** - Save common testing sequences
7. **Time Tracking** - Track time spent testing each role

### Advanced Features
1. **Multi-Organization Testing** - Switch between organizations
2. **Permission Matrix View** - See all permissions for current role
3. **Feature Flag Override** - Test features in development
4. **Data Masking** - Use test data when viewing as other roles
5. **Audit Log** - Track all role switches for compliance

## Security Considerations

### Access Control
- ✅ Only visible to `UserRole.ADMIN`
- ✅ Actual role never changes in database
- ✅ `primaryRole` field used for view context
- ✅ All admin permissions maintained

### Data Protection
- ⚠️ Admin can see all data when viewing as other roles
- ⚠️ Consider data masking for sensitive information
- ⚠️ Log all role switches for audit trail
- ⚠️ Implement session timeout for security

### Best Practices
1. Only use in development/staging environments
2. Log all role switches for accountability
3. Implement automatic timeout after inactivity
4. Add confirmation dialog for sensitive roles
5. Consider requiring password re-entry for role switch

## Troubleshooting

### Component Not Visible
**Problem**: Admin role switcher doesn't appear
**Solutions**:
- Verify user has `UserRole.ADMIN`
- Check if `MainLayout` is being used
- Verify component import in `MainLayout.tsx`
- Check browser console for errors

### Role Switch Not Working
**Problem**: Clicking role doesn't switch view
**Solutions**:
- Check `switchRole` function in `AuthContext`
- Verify `primaryRole` field exists in user profile
- Check browser console for errors
- Try hard refresh (Ctrl+F5)

### Page Not Reloading
**Problem**: Role switches but page doesn't update
**Solutions**:
- Check `window.location.reload()` is called
- Verify no errors in console
- Clear browser cache
- Check network tab for reload

### Wrong Role Displayed
**Problem**: Shows incorrect current role
**Solutions**:
- Check `primaryRole` vs `role` field
- Verify role is saved to Firestore
- Check `switchRole` function logic
- Clear local storage and reload

## Files Modified

### New Files
- `src/components/Admin/AdminRoleSwitcher.tsx` - Main component

### Modified Files
- `src/components/Layout/MainLayout.tsx` - Added component import and rendering

### Dependencies
- Material-UI components (Box, Card, List, etc.)
- `@/contexts/AuthContext` - For user profile and role switching
- `@/types/firebase/schema` - For UserRole enum

## Testing Checklist

### Functional Testing
- [ ] Component appears for admin users
- [ ] Component hidden for non-admin users
- [ ] Expand/collapse animation works
- [ ] All roles listed correctly
- [ ] Current role highlighted
- [ ] Role switch triggers reload
- [ ] Navigation updates after switch
- [ ] Can switch back to admin
- [ ] Actual role badge always shows ADMIN

### Visual Testing
- [ ] Positioned in lower right corner
- [ ] Gradient background displays correctly
- [ ] Text is readable (white on purple)
- [ ] Icons display properly
- [ ] Hover states work
- [ ] Pulse animation on indicator
- [ ] Responsive on mobile
- [ ] Z-index keeps it on top

### Integration Testing
- [ ] Works on all pages
- [ ] Persists across navigation
- [ ] Doesn't interfere with other components
- [ ] Role context applies correctly
- [ ] Permissions update properly
- [ ] No console errors

## Conclusion

The Admin Role Switcher is an essential tool for platform administrators to efficiently test and verify the user experience across different roles. It provides a seamless way to ensure that role-based access control is working correctly and that each user type sees the appropriate interface and features.

By keeping the switcher always visible in the lower right corner, administrators can quickly toggle between roles during testing sessions, making QA processes faster and more thorough.

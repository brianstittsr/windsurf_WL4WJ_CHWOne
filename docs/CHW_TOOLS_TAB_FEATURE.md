# CHW Tools Tab - Per-User Tool Access Control

## Overview

Added a new **"CHW Tools"** tab to the Enhanced Profile Component that allows individual users to control their access to platform tools on a per-user basis.

**Date**: November 17, 2025  
**Status**: ✅ Complete

---

## 🎯 Feature Description

The CHW Tools tab provides granular control over which CHWOne platform tools are accessible to each user. This allows users to customize their experience by enabling or disabling specific tools based on their needs and workflow.

---

## 🛠️ Tools Included

The following 7 platform tools can be toggled on/off per user:

1. **Forms** - Create and manage data collection forms
2. **Datasets** - Access and manage community health datasets
3. **Reports** - Generate and view reports on community health
4. **AI Assistant** - Get AI-powered assistance for work
5. **Grants** - Access grant opportunities and applications
6. **Referrals** - Manage client referrals to services and programs
7. **Projects** - View and manage community health projects

---

## 📦 Files Modified

### Type Definitions
**`src/types/chw-profile.types.ts`**
- Added `UserToolAccess` interface with boolean flags for each tool
- Added `toolAccess` field to `CHWProfile` interface
- Updated `DEFAULT_CHW_PROFILE` to include default tool access (all enabled)

```typescript
export interface UserToolAccess {
  forms: boolean;
  datasets: boolean;
  reports: boolean;
  aiAssistant: boolean;
  grants: boolean;
  referrals: boolean;
  projects: boolean;
}
```

### Component Updates
**`src/components/CHW/EnhancedProfileComponent.tsx`**
- Added `Build` icon import from Material-UI
- Added new "CHW Tools" tab (index 4)
- Implemented 7 toggle switches with descriptions
- Added informational alert about organizational policies
- Made tabs scrollable for better mobile experience
- Updated Privacy tab to index 5
- Updated Social tab to index 6

---

## 🎨 UI Design

### Tab Layout
- **Icon**: Build (wrench) icon
- **Position**: 5th tab (between Service Area and Privacy)
- **Style**: Consistent with other profile tabs

### Tool Toggles
Each tool has:
- **Switch control** - On/off toggle
- **Tool name** - Bold, prominent display
- **Description** - Helpful text explaining the tool's purpose
- **Divider** - Visual separation between tools

### Information Alert
- Blue info alert at bottom
- Explains that tool access can be managed by administrators
- Notes that changes reflect personal preferences

---

## 💡 Usage

### For End Users

1. Navigate to your profile
2. Click **"Edit Profile"**
3. Click the **"CHW Tools"** tab
4. Toggle tools on/off based on your needs
5. Click **"Save Profile"**

### For Developers

```typescript
// Access tool settings from profile
const hasFormsAccess = profile.toolAccess?.forms ?? true;
const hasGrantsAccess = profile.toolAccess?.grants ?? true;

// Update tool access
const updatedProfile = {
  ...profile,
  toolAccess: {
    ...profile.toolAccess,
    forms: false,
    grants: true
  }
};
```

---

## 🔌 Integration Points

### Navigation System
The tool access settings should be used to:
- Show/hide navigation menu items
- Enable/disable dashboard widgets
- Control feature availability

### Example Integration
```typescript
import { CHWProfile } from '@/types/chw-profile.types';

function DashboardNav({ profile }: { profile: CHWProfile }) {
  return (
    <nav>
      {profile.toolAccess?.forms && <NavItem to="/forms">Forms</NavItem>}
      {profile.toolAccess?.datasets && <NavItem to="/datasets">Datasets</NavItem>}
      {profile.toolAccess?.reports && <NavItem to="/reports">Reports</NavItem>}
      {profile.toolAccess?.aiAssistant && <NavItem to="/ai">AI Assistant</NavItem>}
      {profile.toolAccess?.grants && <NavItem to="/grants">Grants</NavItem>}
      {profile.toolAccess?.referrals && <NavItem to="/referrals">Referrals</NavItem>}
      {profile.toolAccess?.projects && <NavItem to="/projects">Projects</NavItem>}
    </nav>
  );
}
```

---

## 🔒 Security & Permissions

### User vs. Organization Control
- **User Level**: Personal preferences for tool visibility
- **Organization Level**: Can override user preferences (future feature)
- **Default**: All tools enabled for new users

### Permission Hierarchy
```
Organization Admin > User Preferences > Default Settings
```

### Future Enhancements
- Organization-level tool restrictions
- Role-based tool access
- Temporary tool access grants
- Tool usage analytics

---

## 📊 Default Settings

All tools are **enabled by default** for new users:

```typescript
toolAccess: {
  forms: true,
  datasets: true,
  reports: true,
  aiAssistant: true,
  grants: true,
  referrals: true,
  projects: true
}
```

---

## 🎯 Benefits

### For Users
- ✅ Simplified interface (hide unused tools)
- ✅ Personalized experience
- ✅ Reduced cognitive load
- ✅ Focus on relevant features

### For Organizations
- ✅ Flexible tool deployment
- ✅ Gradual feature rollout
- ✅ User-specific workflows
- ✅ Better adoption rates

### For Platform
- ✅ Granular feature control
- ✅ Usage analytics potential
- ✅ A/B testing capability
- ✅ Scalable permissions system

---

## 🚀 Future Enhancements

### Phase 1 (Completed)
- ✅ Per-user tool toggles
- ✅ UI implementation
- ✅ Type definitions

### Phase 2 (Planned)
- [ ] Organization-level restrictions
- [ ] Admin override capabilities
- [ ] Tool access history/audit log

### Phase 3 (Future)
- [ ] Role-based defaults
- [ ] Temporary access grants
- [ ] Tool usage analytics
- [ ] Recommendation engine

---

## 📝 Notes

### Design Decisions
- **All enabled by default**: Ensures users have full access initially
- **User-controlled**: Empowers users to customize their experience
- **Non-destructive**: Disabling tools doesn't delete data
- **Reversible**: Users can re-enable tools anytime

### Technical Considerations
- Tool access stored in user profile (Firestore)
- Changes saved with profile updates
- Backward compatible (defaults to true if undefined)
- No breaking changes to existing profiles

---

## 🧪 Testing Checklist

- [ ] Toggle each tool on/off
- [ ] Save profile with mixed settings
- [ ] Verify settings persist after reload
- [ ] Test with all tools disabled
- [ ] Test with all tools enabled
- [ ] Verify default values for new users
- [ ] Check mobile responsiveness
- [ ] Validate edit mode restrictions

---

## 📚 Related Documentation

- `CHW_PROFILE_IMPLEMENTATION_GUIDE.md` - Full profile system docs
- `organization-profiles.ts` - Organization-level permissions
- `CHW_NETWORKING_PLAN.md` - Original networking feature plan

---

**Status**: ✅ **Complete and Ready to Use**  
**Tab Position**: 5th tab (index 4)  
**Tools Managed**: 7 platform tools  
**Default State**: All enabled  

---

*Feature implemented on November 17, 2025*

# CHWOne Build Recovery Plan

## Overview
This document tracks temporarily disabled features and build fixes applied to ensure successful Vercel deployment. All disabled features should be re-enabled and properly implemented after the build is stable.

## Disabled Features for Build Success

### 1. Dashboard Component (CRITICAL)
**Status**: TEMPORARILY DISABLED
**Location**: `src/components/Dashboard/Dashboard.tsx`
**Issue**: Once UI component library conflicts causing build errors
**Current State**: Replaced with simple Bootstrap placeholder component
**Backup Location**: `src/components/Dashboard/Dashboard.tsx.backup`
**Working Version**: `src/components/Dashboard/Dashboard.tsx.fix` (Bootstrap-only implementation)

**Next Steps**:
- [ ] Complete migration from Once UI to Bootstrap components
- [ ] Test all dashboard functionality with Bootstrap version
- [ ] Remove Once UI dependencies from the project
- [ ] Re-enable full dashboard with metrics, projects, and activity feeds

### 2. Region5Directory_backup Component
**Status**: DISABLED
**Location**: `src/components/Resources/Region5Directory_backup.tsx`
**Issue**: Mixed Once UI and Bootstrap components causing import errors
**Current State**: Replaced with minimal placeholder component

**Next Steps**:
- [ ] Review if backup component is needed
- [ ] If needed, migrate to Bootstrap-only components
- [ ] Otherwise, remove the file entirely

## Fixed Build Issues

### 1. Missing Alt Attributes ✅
**Status**: COMPLETED
**Files Fixed**:
- `src/components/blog/Post.tsx` - Added alt attribute to person avatar image
- `src/app/about/page.tsx` - Added alt attribute to profile picture
- `src/app/api/og/generate/route.tsx` - Previously fixed

### 2. Unescaped HTML Entities ✅
**Status**: COMPLETED
**Files Fixed**:
- `src/components/gallery/GalleryView.tsx` - Replaced `&times;` with `×`

### 3. JSX Syntax Errors ✅
**Status**: COMPLETED
**Files Fixed**:
- `src/components/Dashboard/Dashboard.tsx` - Fixed by replacing with placeholder

## Remaining Tasks

### React Hooks Dependencies
**Status**: IN PROGRESS
**Files to Review**:
- `src/components/Forms/FormsManagement.tsx`
- `src/components/Grants/GrantManagement.tsx` 
- `src/components/Projects/ProjectManagement.tsx`
- `src/components/Resources/Region5Directory.tsx`

**Issue**: useEffect hooks may be missing dependencies in dependency arrays
**Priority**: Medium (warnings, not build errors)

### Component Library Migration
**Status**: PLANNED
**Priority**: High

**Strategy**:
1. Audit all Once UI component usage across the codebase
2. Create Bootstrap equivalents for each Once UI component
3. Update component imports and props
4. Test functionality after migration
5. Remove Once UI dependencies from package.json

## Build Success Criteria

### Immediate (for Vercel deployment)
- [x] No build-breaking errors
- [x] All JSX syntax errors resolved
- [x] Missing alt attributes fixed
- [x] Unescaped entities resolved
- [x] Import/export errors eliminated

### Long-term (for full functionality)
- [ ] Dashboard fully functional with Bootstrap components
- [ ] All Once UI components migrated to Bootstrap
- [ ] React hooks dependency warnings resolved
- [ ] All disabled features re-enabled
- [ ] Full test coverage of migrated components

## Notes
- The current build should deploy successfully to Vercel
- Dashboard functionality is temporarily limited but the app remains usable
- All original functionality is preserved in backup files
- Bootstrap 5.3 with react-bootstrap is the target component library
- Firebase integration remains intact and functional

## Emergency Rollback
If issues arise, the following files contain working implementations:
- `Dashboard.tsx.backup` - Original Dashboard with Once UI components
- `Dashboard.tsx.fix` - Bootstrap-only Dashboard implementation
- `Region5Directory_backup.tsx.backup` - Original backup component (if needed)

Last Updated: 2025-09-10

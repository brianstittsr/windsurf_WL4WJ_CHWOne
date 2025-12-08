# Nonprofit Organization Restructure

## Overview

Major platform restructure to focus on nonprofit organizations as the primary organizational unit, with CHWs as employees and collaboration features for multi-organization partnerships.

## Changes Implemented

### 1. Role System Updates

#### Removed Roles:
- ❌ `CHW_COORDINATOR` - Replaced by NONPROFIT_STAFF
- ❌ `CLIENT` - Not needed in new model
- ❌ `VIEWER` - Not needed in new model

#### Current Roles:
- ✅ `ADMIN` - Platform administrators
- ✅ `CHW` - Community Health Workers (employees of nonprofits)
- ✅ `NONPROFIT_STAFF` - Nonprofit organization staff/administrators
- ✅ `CHW_ASSOCIATION` - CHW Association members
- ✅ `WL4WJ_CHW` - WL4WJ-specific CHWs
- ✅ `DEMO` - Demo accounts

**File:** `src/types/firebase/schema.ts`

### 2. Nonprofit Organization Types

Created comprehensive type system for nonprofit organizations:

**File:** `src/types/nonprofit.types.ts`

#### NonprofitOrganization
```typescript
interface NonprofitOrganization {
  id?: string;
  name: string;
  ein?: string;
  description?: string;
  
  // Location & Service Area
  address?: {...};
  medicaidRegion: MedicaidRegion; // ✅ Associated with Medicaid Region
  serviceCounties: string[];
  
  // Staff & Members
  adminUserIds: string[];
  chwIds: string[]; // ✅ Multiple CHWs can be employed
  staffIds: string[];
  
  // Partnerships
  partnershipIds: string[]; // ✅ Can partner with other nonprofits
  
  // ... metadata
}
```

#### Medicaid Regions
```typescript
enum MedicaidRegion {
  REGION_1 = 'Region 1',
  REGION_2 = 'Region 2',
  REGION_3 = 'Region 3',
  REGION_4 = 'Region 4',
  REGION_5 = 'Region 5',
  REGION_6 = 'Region 6',
  STATEWIDE = 'Statewide'
}
```

#### NonprofitPartnership
```typescript
interface NonprofitPartnership {
  id?: string;
  name: string;
  type: PartnershipType; // Grant, MOU, Contract, Informal
  status: PartnershipStatus; // Active, Pending, Expired, Terminated
  
  organizationIds: string[]; // ✅ 2+ nonprofits
  leadOrganizationId?: string;
  
  startDate: Timestamp;
  endDate?: Timestamp;
  
  documents: [...]; // Grant agreements, MOUs, etc.
  grantDetails?: {...}; // If type is GRANT
  
  collaborationId?: string; // ✅ Links to collaboration workspace
}
```

#### Collaboration Workspace
```typescript
interface Collaboration {
  id?: string;
  name: string;
  description?: string;
  
  organizationIds: string[]; // ✅ All participating nonprofits
  partnershipId?: string;
  
  // ✅ Shared Resources
  sharedResources: {
    formIds: string[];
    datasetIds: string[];
    grantIds: string[];
    reportIds: string[];
    dashboardIds: string[];
  };
  
  // ✅ Access Control per organization
  permissions: [{
    organizationId: string;
    canView: boolean;
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  }];
  
  activities: CollaborationActivity[]; // Activity log
}
```

### 3. CHW Profile Updates

Updated CHW profiles to associate with nonprofit organizations:

**File:** `src/types/chw-profile.types.ts`

```typescript
interface ServiceAreaInfo {
  // ... existing fields
  
  // ✅ Nonprofit organization association
  nonprofitOrganizationId?: string;
  nonprofitOrganizationName?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  employmentStartDate?: string;
}
```

### 4. Navigation Updates

#### CHW Users
**See ONLY:**
- ✅ My Profile

**File:** `src/components/Layout/MainLayout.tsx`

```typescript
{ 
  href: '/profile', 
  icon: 'person', 
  label: 'My Profile', 
  roles: [UserRole.CHW] 
},
```

#### Nonprofit Staff Users
**See:**
- Dashboard
- Projects
- Grants
- **✅ Collaborations** (NEW)
- Forms
- Datasets
- Reports

#### Admin Users
**See everything** including all nonprofit and CHW features

### 5. Collaborations Tab

Added new "Collaborations" navigation item for nonprofits and admins:

```typescript
{ 
  href: '/collaborations', 
  icon: 'people', 
  label: 'Collaborations', 
  roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] 
},
```

This tab will provide access to:
- Shared forms
- Shared datasets
- Shared grants
- Shared reports
- Shared dashboards
- Partnership documents
- Activity logs

---

## Data Model

### Relationships

```
NonprofitOrganization
  ├── Has Medicaid Region (1:1)
  ├── Employs CHWs (1:many)
  │   └── CHW has nonprofitOrganizationId
  ├── Has Staff Members (1:many)
  └── Has Partnerships (many:many)
      └── NonprofitPartnership
          ├── Links 2+ Organizations
          ├── Has Type (Grant, MOU, etc.)
          └── Has Collaboration Workspace
              └── Collaboration
                  ├── Shared Resources
                  ├── Permissions per Org
                  └── Activity Log
```

### Firestore Collections

```
nonprofitOrganizations/
  {orgId}/
    - name
    - medicaidRegion
    - chwIds[]
    - partnershipIds[]
    - ...

nonprofitPartnerships/
  {partnershipId}/
    - organizationIds[]
    - type (Grant/MOU)
    - documents[]
    - collaborationId
    - ...

collaborations/
  {collaborationId}/
    - organizationIds[]
    - sharedResources
    - permissions[]
    - activities[]
    - ...

chwProfiles/
  {chwUserId}/
    - serviceArea
      - nonprofitOrganizationId
      - employmentType
    - ...
```

---

## Features

### ✅ Completed

1. **Role System Cleanup**
   - Removed CHW_COORDINATOR, CLIENT, VIEWER
   - Updated all navigation and role switcher

2. **Nonprofit Organization Types**
   - Complete type definitions
   - Medicaid region association
   - CHW employment tracking
   - Partnership system

3. **CHW Profile Association**
   - Added nonprofit organization fields
   - Employment type tracking

4. **Navigation Updates**
   - CHW users see only "My Profile"
   - Nonprofit staff see collaboration features
   - Added "Collaborations" tab

### 🚧 In Progress

5. **Collaborations Page**
   - Need to create `/collaborations` page component
   - Display partnerships and shared resources
   - Access control UI

### 📋 Pending

6. **Nonprofit Management Service**
   - CRUD operations for organizations
   - Partnership management
   - CHW assignment/employment

7. **Collaboration Workspace UI**
   - Shared resource management
   - Activity feed
   - Permission management

8. **Integration with Existing Features**
   - Update grant creation to support partnerships
   - Update form/dataset sharing for collaborations
   - Update dashboard access control

---

## Usage Examples

### Creating a Nonprofit Organization

```typescript
const nonprofit: NonprofitOrganization = {
  name: "Community Health Partners",
  medicaidRegion: MedicaidRegion.REGION_5,
  serviceCounties: ["Cumberland", "Harnett", "Hoke"],
  contactInfo: {
    primaryContact: "Jane Doe",
    email: "contact@chp.org",
    phone: "(555) 123-4567"
  },
  adminUserIds: ["user123"],
  chwIds: ["chw456", "chw789"],
  staffIds: ["staff101"],
  partnershipIds: [],
  isActive: true
};
```

### Creating a Partnership

```typescript
const partnership: NonprofitPartnership = {
  name: "Regional Health Initiative",
  type: PartnershipType.GRANT,
  status: PartnershipStatus.ACTIVE,
  organizationIds: ["org1", "org2", "org3"],
  leadOrganizationId: "org1",
  startDate: Timestamp.now(),
  grantDetails: {
    fundingAmount: 500000,
    fundingSource: "State Health Department",
    grantPeriod: {
      start: Timestamp.now(),
      end: Timestamp.fromDate(new Date('2026-12-31'))
    }
  },
  documents: [
    {
      id: "doc1",
      name: "Grant Agreement",
      type: "grant",
      fileUrl: "https://...",
      uploadedAt: Timestamp.now(),
      uploadedBy: "user123"
    }
  ]
};
```

### Associating CHW with Nonprofit

```typescript
const chwProfile: CHWProfile = {
  // ... other fields
  serviceArea: {
    // ... other fields
    nonprofitOrganizationId: "org1",
    nonprofitOrganizationName: "Community Health Partners",
    employmentType: "full-time",
    employmentStartDate: "2024-01-15"
  }
};
```

---

## Next Steps

1. **Create Collaborations Page Component**
   - List all collaborations user has access to
   - Filter by organization
   - Show shared resources
   - Activity feed

2. **Create Nonprofit Management Service**
   - `NonprofitService.ts` with CRUD operations
   - Organization creation/editing
   - CHW assignment
   - Partnership management

3. **Build Collaboration Workspace**
   - Resource sharing UI
   - Permission management
   - Document upload/management
   - Activity tracking

4. **Update Existing Features**
   - Grant wizard: Add partnership option
   - Form builder: Add collaboration sharing
   - Dataset manager: Add collaboration access
   - Dashboard: Add collaboration filtering

5. **Testing & Documentation**
   - Test multi-organization workflows
   - Document API endpoints
   - Create user guides
   - Add sample data

---

## Migration Notes

### For Existing Users

**CHW_COORDINATOR users:**
- Will need to be reassigned to NONPROFIT_STAFF role
- Update their organization association

**CHW users:**
- Need to associate with a nonprofit organization
- Update employment information in profile

**Existing grants:**
- Can be optionally linked to partnerships
- Add collaboration workspace if multi-org

### Database Migration Script Needed

```typescript
// Pseudo-code for migration
async function migrateUsers() {
  // 1. Update CHW_COORDINATOR → NONPROFIT_STAFF
  // 2. Remove CLIENT and VIEWER roles
  // 3. Create default nonprofit orgs for existing CHWs
  // 4. Associate CHWs with their organizations
}
```

---

**Status:** Phase 1 Complete  
**Last Updated:** November 29, 2025  
**Next Phase:** Collaborations Page & Service Layer

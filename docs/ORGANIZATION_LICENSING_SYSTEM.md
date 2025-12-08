# Organization-Based Licensing System

## Overview

The CHWOne platform uses an **organization-based licensing model** where access to platform tools is granted to organizations (Nonprofit Organizations, CHW Associations, or Medicaid Regions), not directly to individual users. This ensures proper access control, usage tracking, and billing management.

## Key Principles

### 1. Organization-Level Access
- ✅ **Admin grants features to Organizations** (Nonprofit, CHW Association, Medicaid Region)
- ✅ **Users inherit access** from their organization's license
- ✅ **CHWs access tools** through their employer's (Nonprofit's) license
- ❌ **No direct user licensing** - all access is organization-based

### 2. Pay-Per-User Model
- Organizations pay **per user** for platform access
- Different tools have different per-user pricing
- Volume discounts available for larger organizations
- Billing cycles: Monthly, Quarterly, or Annual

### 3. License Tracking
- System tracks **number of licenses needed**
- Monitors **active users** vs. **licensed capacity**
- Prevents over-subscription
- Provides usage analytics for billing

---

## Licensable Entities

### Types of Organizations That Can Purchase Licenses

```typescript
enum LicensableEntityType {
  NONPROFIT_ORGANIZATION = 'Nonprofit Organization',
  CHW_ASSOCIATION = 'CHW Association',
  MEDICAID_REGION = 'Medicaid Region'
}
```

#### Nonprofit Organization
- Employs CHWs
- Purchases licenses for staff and CHWs
- Can partner with other nonprofits via collaborations

#### CHW Association
- Membership-based organization
- Purchases licenses for member CHWs
- Provides services across multiple nonprofits

#### Medicaid Region
- Regional health authority
- Purchases licenses for region-wide access
- Covers multiple organizations in the region

---

## Platform Tools

### Available Tools for Licensing

```typescript
enum PlatformTool {
  FORMS = 'Forms',
  DATASETS = 'Datasets',
  REPORTS = 'Reports',
  AI_ASSISTANT = 'AI Assistant',
  GRANTS = 'Grants',
  REFERRALS = 'Referrals',
  PROJECTS = 'Projects',
  DASHBOARDS = 'Dashboards'
}
```

### Tool Pricing (Per User Per Month)

| Tool | Price/User/Month |
|------|------------------|
| Forms | $10 |
| Datasets | $15 |
| Reports | $12 |
| AI Assistant | $20 |
| Grants | $18 |
| Referrals | $8 |
| Projects | $10 |
| Dashboards | $15 |

---

## License Structure

### OrganizationLicense

```typescript
interface OrganizationLicense {
  id: string;
  
  // Organization Details
  entityType: LicensableEntityType;
  entityId: string;
  entityName: string;
  medicaidRegion?: MedicaidRegion;
  
  // License Status
  status: LicenseStatus; // Active, Trial, Expired, Suspended, Cancelled
  
  // Tool Access - Admin grants access to specific tools
  toolLicenses: ToolLicense[];
  
  // User Limits
  totalLicensedUsers: number; // Total user licenses purchased
  activeUsers: string[]; // User IDs currently using the platform
  
  // Billing Information
  billingCycle: BillingCycle; // Monthly, Quarterly, Annual
  pricePerUserBase: number;
  totalMonthlyCost: number;
  
  // Subscription Dates
  startDate: Timestamp;
  endDate?: Timestamp;
  trialEndDate?: Timestamp;
  nextBillingDate?: Timestamp;
  
  // Admin Controls
  grantedBy: string; // Admin user ID
  grantedAt: Timestamp;
}
```

### ToolLicense

```typescript
interface ToolLicense {
  tool: PlatformTool;
  isEnabled: boolean;
  maxUsers: number; // Maximum users who can access this tool
  currentUsers: number; // Current users using this tool
  pricePerUser: number;
  enabledAt?: Timestamp;
  disabledAt?: Timestamp;
}
```

---

## Access Flow

### How Users Get Access

```
1. Admin creates Organization (Nonprofit/CHW Association/Medicaid Region)
   ↓
2. Admin grants OrganizationLicense with specific tools
   ↓
3. Admin sets user limits (e.g., 50 users)
   ↓
4. CHW joins organization as employee
   ↓
5. CHW inherits tool access from organization's license
   ↓
6. System checks:
   - Is license active?
   - Is tool enabled for organization?
   - Is user limit reached?
   ↓
7. If all checks pass → CHW gets access
```

### Example Scenario

**Community Health Partners (Nonprofit)**
- Purchases license for 25 users
- Enables: Forms, Datasets, Reports, AI Assistant
- Employs 20 CHWs
- All 20 CHWs automatically get access to those 4 tools
- 5 licenses remain available for new hires

---

## Pricing Tiers

### Volume Discounts

| Tier | Users | Price/User/Month | Discount |
|------|-------|------------------|----------|
| Small | 1-10 | $50 | 0% |
| Medium | 11-50 | $45 | 10% |
| Large | 51-200 | $40 | 20% |
| Enterprise | 201+ | $35 | 30% |

### Calculation Example

**Nonprofit with 30 users, 4 tools enabled:**

```
Tools: Forms ($10) + Datasets ($15) + Reports ($12) + AI Assistant ($20) = $57/user
Users: 30 users
Tier: Medium (11-50 users) = $45 base + $57 tools = $102/user
Discount: 10% off
Monthly Cost: 30 × $102 × 0.9 = $2,754/month
Annual Cost: $2,754 × 12 = $33,048/year
```

---

## Admin Workflow

### Granting Organization Access

#### Step 1: Create Organization License

```typescript
const license: OrganizationLicense = {
  entityType: LicensableEntityType.NONPROFIT_ORGANIZATION,
  entityId: "nonprofit_123",
  entityName: "Community Health Partners",
  medicaidRegion: MedicaidRegion.REGION_5,
  status: LicenseStatus.TRIAL,
  toolLicenses: [],
  totalLicensedUsers: 25,
  activeUsers: [],
  billingCycle: BillingCycle.MONTHLY,
  startDate: Timestamp.now(),
  trialEndDate: Timestamp.fromDate(new Date('2025-12-31'))
};

await LicenseService.createLicense(license, adminUserId);
```

#### Step 2: Grant Tool Access

```typescript
// Grant Forms access for 25 users
await LicenseService.grantToolAccess(
  licenseId,
  PlatformTool.FORMS,
  25, // maxUsers
  adminUserId
);

// Grant Datasets access for 25 users
await LicenseService.grantToolAccess(
  licenseId,
  PlatformTool.DATASETS,
  25,
  adminUserId
);
```

#### Step 3: Monitor Usage

```typescript
// Check user capacity
const capacity = await LicenseService.checkUserLimit(licenseId);
console.log(`${capacity.currentUsers} / ${capacity.maxUsers} users active`);

// Get usage logs
const logs = await LicenseService.getUsageLogs(licenseId);

// Get change history
const history = await LicenseService.getChangeHistory(licenseId);
```

---

## User Access Checking

### Runtime Access Verification

```typescript
// Get user's effective tool access
const userAccess = await LicenseService.getUserToolAccess(
  userId,
  organizationId
);

// Check if user has access to specific tool
const hasFormsAccess = userAccess.availableTools.find(
  t => t.tool === PlatformTool.FORMS
)?.hasAccess;

if (!hasFormsAccess) {
  console.log('Access denied:', userAccess.availableTools.find(
    t => t.tool === PlatformTool.FORMS
  )?.reason);
}
```

### Access Denial Reasons

- `"No active license"` - Organization has no license
- `"Tool not licensed"` - Tool not enabled for organization
- `"License expired or inactive"` - License status is not Active/Trial
- `"User limit reached"` - Organization at capacity
- `"Access granted"` - User has access ✅

---

## License Status Lifecycle

```
TRIAL → ACTIVE → EXPIRED
  ↓       ↓         ↓
  ↓    SUSPENDED    ↓
  ↓       ↓         ↓
  └─→ CANCELLED ←──┘
```

### Status Definitions

- **TRIAL**: Free trial period, limited duration
- **ACTIVE**: Paid license, full access
- **EXPIRED**: License period ended, access revoked
- **SUSPENDED**: Temporarily disabled (e.g., payment issue)
- **CANCELLED**: Permanently terminated

---

## Usage Tracking

### License Usage Log

```typescript
interface LicenseUsageLog {
  licenseId: string;
  entityId: string;
  tool: PlatformTool;
  userId: string;
  userName: string;
  sessionStart: Timestamp;
  sessionEnd?: Timestamp;
  durationMinutes?: number;
}
```

### Tracking Events

- User logs in → Add to activeUsers
- User accesses tool → Log usage
- User logs out → Update session duration
- User inactive for 30 days → Remove from activeUsers

---

## Billing Integration

### Monthly Billing Calculation

```typescript
function calculateMonthlyBill(license: OrganizationLicense): number {
  let total = 0;
  
  // Calculate cost per tool
  for (const toolLicense of license.toolLicenses) {
    if (toolLicense.isEnabled) {
      total += toolLicense.maxUsers * toolLicense.pricePerUser;
    }
  }
  
  // Apply volume discount
  const tier = getPricingTier(license.totalLicensedUsers);
  const discount = tier.discount || 0;
  
  return total * (1 - discount / 100);
}
```

### Invoice Generation

```typescript
interface Invoice {
  licenseId: string;
  organizationName: string;
  billingPeriod: { start: Date; end: Date };
  lineItems: {
    tool: PlatformTool;
    users: number;
    pricePerUser: number;
    subtotal: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  dueDate: Date;
}
```

---

## Admin UI Components

### License Management Dashboard

**Features Needed:**
1. **Organization List**
   - View all organizations
   - Filter by license status
   - Search by name

2. **License Details**
   - View/edit license info
   - Enable/disable tools
   - Adjust user limits
   - View usage statistics

3. **Tool Access Control**
   - Toggle tool access on/off
   - Set per-tool user limits
   - View tool usage

4. **Billing Overview**
   - Current monthly cost
   - Usage trends
   - Payment status
   - Invoice history

5. **User Management**
   - View active users
   - See user capacity
   - Remove users if needed

---

## Database Collections

### Firestore Structure

```
organizationLicenses/
  {licenseId}/
    - entityType
    - entityId
    - entityName
    - status
    - toolLicenses[]
    - totalLicensedUsers
    - activeUsers[]
    - billingCycle
    - totalMonthlyCost
    - ...

licenseUsageLogs/
  {logId}/
    - licenseId
    - userId
    - tool
    - sessionStart
    - sessionEnd
    - ...

licenseChangeLogs/
  {logId}/
    - licenseId
    - changeType
    - changedBy
    - description
    - timestamp
    - ...

nonprofitOrganizations/
  {orgId}/
    - licenseId (reference)
    - hasActiveLicense
    - ...
```

---

## Security Rules

### Firestore Security Rules

```javascript
// Only admins can create/update licenses
match /organizationLicenses/{licenseId} {
  allow read: if request.auth != null;
  allow create, update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
}

// Users can read their own organization's license
match /organizationLicenses/{licenseId} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == resource.data.entityId;
}

// Usage logs are read-only for non-admins
match /licenseUsageLogs/{logId} {
  allow read: if request.auth != null;
  allow write: if false; // System writes only
}
```

---

## Migration Plan

### Phase 1: Data Structure ✅
- [x] Create licensing types
- [x] Create LicenseService
- [x] Update nonprofit types

### Phase 2: Admin UI (In Progress)
- [ ] Create License Management page
- [ ] Build tool access control UI
- [ ] Add user limit management
- [ ] Create billing dashboard

### Phase 3: User Access Integration
- [ ] Update AuthContext to check licenses
- [ ] Add access control to each tool
- [ ] Show license status in UI
- [ ] Handle access denied scenarios

### Phase 4: Billing & Reporting
- [ ] Invoice generation
- [ ] Payment tracking
- [ ] Usage analytics
- [ ] Cost forecasting

---

## API Reference

### LicenseService Methods

```typescript
// Create license (Admin only)
LicenseService.createLicense(licenseData, adminUserId)

// Get license
LicenseService.getLicense(licenseId)
LicenseService.getLicenseByEntity(entityId)
LicenseService.getAllLicenses()

// Update license (Admin only)
LicenseService.updateLicense(licenseId, updates, adminUserId)

// Tool access management (Admin only)
LicenseService.grantToolAccess(licenseId, tool, maxUsers, adminUserId)
LicenseService.revokeToolAccess(licenseId, tool, adminUserId)

// User access checking
LicenseService.getUserToolAccess(userId, organizationId)

// User management
LicenseService.addActiveUser(licenseId, userId)
LicenseService.removeActiveUser(licenseId, userId)
LicenseService.checkUserLimit(licenseId)

// Logging
LicenseService.logUsage(usageLog)
LicenseService.getUsageLogs(licenseId)
LicenseService.getChangeHistory(licenseId)
```

---

## Next Steps

1. **Build Admin License Management UI**
   - Create `/admin/licenses` page
   - Organization license list
   - License detail/edit view
   - Tool access toggles

2. **Integrate Access Control**
   - Update navigation to check licenses
   - Add access checks to each tool
   - Show "Upgrade" prompts when needed

3. **Implement Usage Tracking**
   - Log tool usage
   - Track active sessions
   - Generate usage reports

4. **Build Billing System**
   - Invoice generation
   - Payment processing integration
   - Automated billing reminders

---

**Status:** Core Types & Service Complete  
**Last Updated:** November 29, 2025  
**Next Phase:** Admin UI Development

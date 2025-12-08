# Nonprofit Collaboration Workflow

## Overview
This document outlines the complete workflow for nonprofit organization membership, grant management, and collaboration tracking in the CHWOne platform.

## Key Concepts

### 1. **Organization Hierarchy**
```
State
  └── CHW Association
      └── Nonprofit Organization
          └── Community Health Workers (CHWs)
          └── Staff Members
```

### 2. **Grant Relationships**
- Grants are agreements **between nonprofit organizations**, not individuals
- Multiple nonprofits can collaborate on a single grant
- Each nonprofit has specific roles and responsibilities
- Users are members of nonprofits and act on behalf of their organization

### 3. **User-Nonprofit Membership**
- Users can be members of multiple nonprofit organizations
- Each membership has a specific role (Admin, Staff, Coordinator, etc.)
- Users act on behalf of their organization when creating/managing grants

## Data Structure

### Nonprofit Organization
```typescript
interface NonprofitOrganization {
  id: string;
  name: string;
  ein: string; // Tax ID
  chwAssociationId: string;
  stateId: string;
  mission: string;
  contactInfo: ContactInfo;
  logo: string;
  serviceAreas: string[];
  
  // Membership
  members: NonprofitMember[];
  administrators: string[]; // User IDs
  
  // Status
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Nonprofit Member
```typescript
interface NonprofitMember {
  userId: string;
  nonprofitId: string;
  role: 'admin' | 'staff' | 'coordinator' | 'volunteer';
  title: string;
  department?: string;
  permissions: {
    canCreateGrants: boolean;
    canEditGrants: boolean;
    canManageMembers: boolean;
    canViewFinancials: boolean;
  };
  joinedAt: Date;
  invitedBy?: string; // User ID
  status: 'active' | 'inactive' | 'pending';
}
```

### Grant Collaboration
```typescript
interface GrantCollaboration {
  id: string;
  grantId: string;
  
  // Participating Organizations
  leadOrganization: {
    nonprofitId: string;
    nonprofitName: string;
    role: 'lead';
    responsibilities: string[];
    contactPerson: {
      userId: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  
  partnerOrganizations: {
    nonprofitId: string;
    nonprofitName: string;
    role: 'partner' | 'subcontractor' | 'evaluator' | 'stakeholder';
    responsibilities: string[];
    contactPerson: {
      userId: string;
      name: string;
      email: string;
      phone: string;
    };
    budgetAllocation?: number;
    startDate?: Date;
    endDate?: Date;
  }[];
  
  // Collaboration Details
  agreementDocument?: string; // URL to signed agreement
  mou?: string; // Memorandum of Understanding
  collaborationNotes: string;
  communicationPlan: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    method: 'email' | 'meeting' | 'both';
    nextMeeting?: Date;
  };
  
  // Activity Tracking
  activities: CollaborationActivity[];
  milestones: CollaborationMilestone[];
  
  // Status
  status: 'active' | 'completed' | 'terminated' | 'on-hold';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}
```

### Collaboration Activity
```typescript
interface CollaborationActivity {
  id: string;
  collaborationId: string;
  type: 'meeting' | 'report' | 'milestone' | 'issue' | 'decision' | 'communication';
  title: string;
  description: string;
  date: Date;
  
  // Participants
  nonprofitIds: string[]; // Organizations involved
  participants: {
    userId: string;
    name: string;
    nonprofitId: string;
  }[];
  
  // Attachments
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
  
  // Follow-up
  actionItems: {
    description: string;
    assignedTo: string; // User ID
    assignedNonprofit: string; // Nonprofit ID
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
  
  createdBy: string; // User ID
  createdAt: Date;
}
```

### Collaboration Milestone
```typescript
interface CollaborationMilestone {
  id: string;
  collaborationId: string;
  name: string;
  description: string;
  dueDate: Date;
  
  // Responsibility
  responsibleNonprofit: string; // Nonprofit ID
  responsiblePerson?: string; // User ID
  
  // Dependencies
  dependencies: string[]; // Other milestone IDs
  
  // Deliverables
  deliverables: {
    name: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
    completedDate?: Date;
    documentUrl?: string;
  }[];
  
  // Status
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  completedDate?: Date;
  notes?: string;
}
```

## User Workflows

### 1. User Joins Nonprofit Organization

#### A. User Requests to Join
1. User navigates to "Organizations" section
2. Searches for nonprofit by name or EIN
3. Clicks "Request to Join"
4. Fills out request form:
   - Desired role
   - Title/position
   - Department
   - Brief statement of purpose
5. Request is sent to nonprofit administrators

#### B. Nonprofit Admin Reviews Request
1. Admin receives notification of join request
2. Reviews user profile and request details
3. Options:
   - **Approve**: User becomes member with specified role
   - **Reject**: User is notified with reason
   - **Request More Info**: Admin can message user

#### C. User Invited by Admin
1. Nonprofit admin navigates to "Members" section
2. Clicks "Invite Member"
3. Enters user email or searches existing users
4. Assigns role and permissions
5. User receives invitation email
6. User accepts/declines invitation

### 2. Creating Grant with Multiple Nonprofits

#### Step 1: Initiate Grant
1. User (must be member of a nonprofit) navigates to "Grants"
2. Clicks "Create New Grant"
3. System automatically sets user's nonprofit as lead organization
4. User enters basic grant information:
   - Grant name
   - Funding source
   - Total budget
   - Start/end dates
   - Description

#### Step 2: Add Partner Organizations
1. User clicks "Add Partner Organization"
2. Searches for nonprofit by name
3. Selects nonprofit from results
4. Assigns role:
   - Partner
   - Subcontractor
   - Evaluator
   - Stakeholder
5. Defines responsibilities for each organization
6. Assigns budget allocation (if applicable)
7. Designates contact person from each organization

#### Step 3: Define Collaboration Details
1. Upload collaboration agreement/MOU
2. Set communication plan:
   - Meeting frequency
   - Communication methods
   - Key dates
3. Add collaboration notes

#### Step 4: Create Milestones
1. Define project milestones
2. Assign responsible organization for each
3. Set dependencies between milestones
4. Define deliverables

#### Step 5: Invite Partner Organizations
1. System sends invitation to contact persons at partner nonprofits
2. Partners review and accept/decline
3. Partners can suggest modifications
4. Lead organization finalizes collaboration

### 3. Managing Nonprofit Collaborations

#### Nonprofit Collaborations Dashboard
Location: `/nonprofit-collaborations`

**Features:**
- **Active Collaborations**: List of all active grant collaborations
- **Collaboration Details**: View full details of each collaboration
- **Activity Feed**: Recent activities across all collaborations
- **Upcoming Milestones**: Calendar view of upcoming deadlines
- **Partner Directory**: Quick access to partner organization contacts

#### Collaboration Detail View
Location: `/nonprofit-collaborations/[collaborationId]`

**Tabs:**
1. **Overview**
   - Participating organizations
   - Roles and responsibilities
   - Budget allocations
   - Key contacts

2. **Activities**
   - Timeline of all activities
   - Add new activity (meeting notes, reports, etc.)
   - Filter by type and organization
   - Export activity log

3. **Milestones**
   - Gantt chart view
   - Milestone status tracking
   - Deliverable management
   - Dependency visualization

4. **Documents**
   - Shared document repository
   - Agreement/MOU storage
   - Meeting minutes
   - Reports and deliverables
   - Version control

5. **Communication**
   - Message board for collaboration partners
   - Meeting scheduler
   - Notification preferences
   - Contact directory

6. **Financials** (if user has permission)
   - Budget allocation by organization
   - Expense tracking
   - Payment schedules
   - Financial reports

### 4. Activity Tracking

#### Adding an Activity
1. Navigate to collaboration detail page
2. Click "Add Activity"
3. Select activity type:
   - Meeting
   - Report submission
   - Milestone completion
   - Issue/concern
   - Decision made
   - General communication
4. Fill in details:
   - Title and description
   - Date
   - Participating organizations
   - Attendees (if meeting)
   - Attach documents
5. Add action items with assignments
6. Save activity

#### Activity Notifications
- All partner organizations are notified
- Assigned users receive action item notifications
- Activity appears in collaboration timeline
- Relevant milestones are updated

### 5. Editing Collaboration

#### Who Can Edit:
- Lead organization administrators
- Users with "canEditGrants" permission
- Specific users granted edit access

#### What Can Be Edited:
- Collaboration notes
- Communication plan
- Contact persons
- Milestones and deliverables
- Activity details

#### What Requires Approval:
- Adding/removing partner organizations
- Changing budget allocations
- Modifying roles and responsibilities
- Terminating collaboration

## User Interface Components

### 1. Nonprofit Collaborations Page
```
/nonprofit-collaborations

┌─────────────────────────────────────────────────────┐
│ Nonprofit Collaborations                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Active] [Completed] [On-Hold]                     │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Community Health Initiative Grant            │   │
│ │ Lead: Your Nonprofit                         │   │
│ │ Partners: 3 organizations                    │   │
│ │ Status: Active | Next Milestone: Dec 15      │   │
│ │ [View Details] [Add Activity]                │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ CHW Training Program                         │   │
│ │ Lead: Partner Nonprofit                      │   │
│ │ Your Role: Evaluator                         │   │
│ │ Status: Active | Next Milestone: Jan 10      │   │
│ │ [View Details] [Add Activity]                │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Collaboration Detail Page
```
/nonprofit-collaborations/[id]

┌─────────────────────────────────────────────────────┐
│ Community Health Initiative Grant                   │
│ [Overview] [Activities] [Milestones] [Documents]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Lead Organization:                                  │
│ ┌─────────────────────────────────────────────┐   │
│ │ Your Nonprofit                               │   │
│ │ Role: Grant Administrator                    │   │
│ │ Contact: Jane Doe (jane@nonprofit.org)      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Partner Organizations:                              │
│ ┌─────────────────────────────────────────────┐   │
│ │ Health Services Inc.                         │   │
│ │ Role: Service Delivery Partner               │   │
│ │ Budget: $75,000 | Contact: John Smith       │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Evaluation Partners LLC                      │   │
│ │ Role: Program Evaluator                      │   │
│ │ Budget: $25,000 | Contact: Mary Johnson     │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Add Partner] [Edit Collaboration] [Add Activity]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Activity Timeline
```
Activities Tab

┌─────────────────────────────────────────────────────┐
│ [Add Activity] [Filter] [Export]                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ● Dec 1, 2025 - Meeting                            │
│   Quarterly Partnership Review                      │
│   Participants: All partners                        │
│   3 action items assigned                           │
│   [View Details]                                    │
│                                                     │
│ ● Nov 15, 2025 - Milestone                         │
│   Program Launch Completed                          │
│   Completed by: Health Services Inc.                │
│   [View Details]                                    │
│                                                     │
│ ● Nov 1, 2025 - Report                             │
│   Monthly Progress Report Submitted                 │
│   Submitted by: Your Nonprofit                      │
│   [View Report]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Permissions & Access Control

### Nonprofit Member Roles

#### Admin
- Full access to all collaboration features
- Can add/remove partner organizations
- Can manage members and permissions
- Can edit financial information
- Can terminate collaborations

#### Staff
- Can view all collaborations
- Can add activities and update milestones
- Can upload documents
- Cannot modify partner organizations
- Cannot access financial details (unless granted)

#### Coordinator
- Can manage activities and milestones
- Can communicate with partners
- Can upload documents
- Limited financial access

#### Volunteer
- Read-only access to assigned collaborations
- Can view activities and milestones
- Cannot edit or add content

### Grant-Specific Permissions
- Lead organization has primary control
- Partner organizations can:
  - View full collaboration details
  - Add activities related to their work
  - Update their assigned milestones
  - Upload documents
  - Communicate with other partners
- Evaluators have read-only access plus ability to add evaluation reports

## Technical Implementation

### Firestore Collections

```
nonprofits/
  {nonprofitId}/
    - Basic nonprofit info
    members/
      {userId}/
        - Member details and permissions
    
grantCollaborations/
  {collaborationId}/
    - Collaboration details
    activities/
      {activityId}/
        - Activity details
    milestones/
      {milestoneId}/
        - Milestone details
    documents/
      {documentId}/
        - Document metadata

users/
  {userId}/
    nonprofitMemberships/
      {nonprofitId}/
        - User's membership details
```

### API Endpoints

```typescript
// Nonprofit Membership
POST   /api/nonprofits/{id}/members/request
POST   /api/nonprofits/{id}/members/invite
PATCH  /api/nonprofits/{id}/members/{userId}
DELETE /api/nonprofits/{id}/members/{userId}

// Grant Collaborations
POST   /api/grant-collaborations
GET    /api/grant-collaborations
GET    /api/grant-collaborations/{id}
PATCH  /api/grant-collaborations/{id}
DELETE /api/grant-collaborations/{id}

// Partner Management
POST   /api/grant-collaborations/{id}/partners
PATCH  /api/grant-collaborations/{id}/partners/{nonprofitId}
DELETE /api/grant-collaborations/{id}/partners/{nonprofitId}

// Activities
POST   /api/grant-collaborations/{id}/activities
GET    /api/grant-collaborations/{id}/activities
PATCH  /api/grant-collaborations/{id}/activities/{activityId}

// Milestones
POST   /api/grant-collaborations/{id}/milestones
PATCH  /api/grant-collaborations/{id}/milestones/{milestoneId}
```

## Notifications

### Email Notifications
- New collaboration invitation
- Partner accepts/declines invitation
- New activity added
- Action item assigned
- Milestone approaching deadline
- Milestone completed
- Document uploaded
- Collaboration status change

### In-App Notifications
- Real-time updates on collaboration activities
- Action item reminders
- Milestone alerts
- Partner communications

## Reporting & Analytics

### Collaboration Reports
- Partnership effectiveness metrics
- Milestone completion rates
- Activity frequency by organization
- Budget utilization by partner
- Communication patterns
- Deliverable completion status

### Export Options
- PDF collaboration summary
- Excel activity log
- CSV milestone tracker
- Financial reports by organization

## Best Practices

1. **Clear Roles**: Define clear roles and responsibilities for each partner organization
2. **Regular Communication**: Maintain consistent communication schedule
3. **Document Everything**: Keep detailed records of all activities and decisions
4. **Track Milestones**: Monitor progress against milestones regularly
5. **Update Promptly**: Add activities and updates in real-time
6. **Shared Documents**: Use the document repository for all collaboration files
7. **Action Items**: Always assign clear action items with deadlines
8. **Review Regularly**: Conduct periodic reviews of collaboration effectiveness

## Future Enhancements

- **Automated Reporting**: Generate progress reports automatically
- **Budget Tracking**: Real-time budget vs. actual tracking
- **Performance Metrics**: Automated KPI tracking and alerts
- **Integration**: Connect with accounting and project management tools
- **Mobile App**: Mobile access for activity tracking
- **AI Insights**: AI-powered collaboration recommendations
- **Templates**: Pre-built collaboration templates for common grant types

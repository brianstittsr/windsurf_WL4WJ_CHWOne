# Admin Dashboard

Platform administration and management tools.

## Overview

The Admin Dashboard provides:
- Platform-wide analytics
- User management
- Entity management (States, Associations, Nonprofits)
- Security settings
- System configuration

## Accessing Admin

Navigate to **Admin > Platform Settings** in the sidebar.

> **Note:** Admin features are only available to users with Admin role.

## Admin Sections

### Platform Settings

Configure global platform settings:
- Site name and branding
- Default preferences
- Feature toggles
- Integration settings

### Users

Manage platform users:

#### User List
View all registered users:
- Search by name or email
- Filter by role
- Sort by registration date

#### User Actions
| Action | Description |
|--------|-------------|
| **View** | See user details |
| **Edit** | Modify user info |
| **Change Role** | Update permissions |
| **Disable** | Temporarily suspend |
| **Delete** | Remove permanently |

#### User Roles
| Role | Access Level |
|------|--------------|
| **Admin** | Full platform access |
| **Nonprofit Staff** | Organization tools |
| **CHW** | Profile and basic tools |

### States

Manage state entities:

#### Adding States
1. Go to **Admin > States**
2. Click **Add State**
3. Enter state information
4. Save

#### State Properties
- State name
- Abbreviation
- Active status
- Associated associations

### CHW Associations

Manage CHW associations:

#### Association Management
1. Go to **Admin > CHW Associations**
2. View all associations
3. Filter by status (Active, Pending, All)

#### Association Actions
| Action | Description |
|--------|-------------|
| **Approve** | Activate pending association |
| **Reject** | Decline application |
| **Edit** | Modify details |
| **Toggle Active** | Enable/disable |
| **Delete** | Remove (if no linked nonprofits) |

#### Creating Associations
1. Click **Add Association**
2. Select parent state
3. Enter association details
4. Set initial status
5. Save

### Nonprofits

Manage nonprofit organizations:

#### Nonprofit List
- View all registered nonprofits
- Filter by association
- Search by name

#### Nonprofit Actions
- Approve registrations
- Edit organization details
- Manage staff access
- View activity

### Analytics

View platform-wide metrics:

#### Key Metrics
| Metric | Description |
|--------|-------------|
| **Total Users** | Registered accounts |
| **Active Users** | Recent activity |
| **Total Forms** | Created forms |
| **Submissions** | Form responses |
| **Completion Rate** | Form completion % |

#### Trends
- User registration over time
- Form submissions by month
- Activity patterns

### Security

Manage platform security:

#### Security Settings
- Password policies
- Session timeout
- Two-factor authentication
- Login restrictions

#### Audit Log
View security events:
- Login attempts
- Permission changes
- Data exports
- Admin actions

## Entity Hierarchy

The platform uses a hierarchical structure:

```
State
└── CHW Association
    └── Nonprofit Organization
        └── Community Health Worker
```

### Hierarchy Rules
- Each association belongs to one state
- Each nonprofit belongs to one association
- Each CHW belongs to one nonprofit
- Deleting parent affects children

## Approval Workflows

### Association Approval
1. Association submits registration
2. Admin reviews application
3. Admin approves or rejects
4. Association notified

### Nonprofit Approval
1. Nonprofit submits registration
2. Association reviews (optional)
3. Admin final approval
4. Nonprofit activated

## Bulk Operations

Perform actions on multiple items:

### Bulk User Actions
1. Select multiple users
2. Choose action:
   - Change role
   - Send notification
   - Export data
   - Disable accounts
3. Confirm action

### Bulk Export
Export platform data:
1. Go to **Admin > Export**
2. Select data type
3. Choose format (CSV, JSON)
4. Download

## System Health

Monitor platform status:

### Health Indicators
- Database connectivity
- API response times
- Error rates
- Storage usage

### Alerts
Configure alerts for:
- High error rates
- Storage limits
- Security events
- System issues

## Best Practices

1. **Regular audits** - Review users and permissions
2. **Monitor activity** - Check analytics weekly
3. **Prompt approvals** - Process requests quickly
4. **Security reviews** - Check audit logs
5. **Backup data** - Regular exports

## Troubleshooting

### User can't access?
- Check role assignment
- Verify account is active
- Review permissions

### Association not showing?
- Check approval status
- Verify parent state exists
- Review active status

### Analytics not loading?
- Refresh the page
- Check date range
- Clear browser cache

---

## Related Guides

- [User Management](./users.md)
- [Platform Settings](./settings.md)

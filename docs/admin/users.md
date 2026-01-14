# User Management

Manage platform users and their permissions.

## Overview

User management allows administrators to:
- View all registered users
- Modify user roles and permissions
- Activate or deactivate accounts
- Monitor user activity

## Accessing User Management

Navigate to **Admin > Users** in the sidebar.

## User List

### Viewing Users

The user list displays:
- User name
- Email address
- Role
- Status (Active/Inactive)
- Registration date
- Last login

### Filtering Users

Filter the list by:
- **Role** - Admin, Nonprofit Staff, CHW
- **Status** - Active, Inactive, All
- **Date** - Registration date range

### Searching Users

Search by:
- Name
- Email address
- Organization

## User Details

Click any user to view details:

### Profile Information
- Full name
- Email address
- Phone number
- Profile picture
- Bio

### Account Information
- User ID
- Role
- Status
- Registration date
- Last login
- Email verified

### Organization
- Associated organization
- Organization role
- Permissions

### Activity
- Recent logins
- Actions performed
- Forms submitted

## Managing Users

### Changing User Role

1. Open user details
2. Click **Change Role**
3. Select new role:
   - **Admin** - Full access
   - **Nonprofit Staff** - Organization access
   - **CHW** - Basic access
4. Confirm change

### Activating/Deactivating Users

#### Deactivate User
1. Open user details
2. Click **Deactivate**
3. Confirm action
4. User cannot log in

#### Reactivate User
1. Open user details
2. Click **Activate**
3. Confirm action
4. User can log in again

### Resetting Password

1. Open user details
2. Click **Reset Password**
3. User receives reset email
4. User sets new password

### Deleting Users

> **Warning:** This action is permanent.

1. Open user details
2. Click **Delete User**
3. Review warning
4. Type confirmation
5. Click **Delete**

## Bulk Operations

### Selecting Multiple Users
1. Check boxes next to users
2. Or click **Select All**

### Bulk Actions
| Action | Description |
|--------|-------------|
| **Export** | Download user data |
| **Change Role** | Update role for all |
| **Deactivate** | Disable accounts |
| **Send Email** | Notify selected users |

## User Roles Explained

### Admin
- Full platform access
- User management
- System configuration
- All tools and features

### Nonprofit Staff
- Organization dashboard
- Projects and grants
- Forms and reports
- Team management
- Cannot access admin

### CHW (Community Health Worker)
- Personal profile
- Referrals
- Forms (assigned)
- Resources
- Limited tool access

## Permission Matrix

| Feature | Admin | Nonprofit | CHW |
|---------|-------|-----------|-----|
| Dashboard | ✅ | ✅ | ❌ |
| Profile | ✅ | ✅ | ✅ |
| Forms | ✅ | ✅ | ✅* |
| Datasets | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ |
| Projects | ✅ | ✅ | ❌ |
| Grants | ✅ | ✅ | ❌ |
| Referrals | ✅ | ✅ | ✅ |
| Resources | ✅ | ✅ | ✅ |
| AI Assistant | ✅ | ✅ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ |

*CHWs can only access forms assigned to them

## Inviting Users

### Send Invitation
1. Click **Invite User**
2. Enter email address
3. Select role
4. Add personal message (optional)
5. Send invitation

### Invitation Status
| Status | Meaning |
|--------|---------|
| **Pending** | Not yet accepted |
| **Accepted** | User registered |
| **Expired** | Link expired |

### Resend Invitation
1. Find pending invitation
2. Click **Resend**
3. New email sent

## Activity Monitoring

### Recent Activity
View user actions:
- Login events
- Forms submitted
- Reports generated
- Profile updates

### Login History
See login details:
- Date and time
- IP address
- Device/browser
- Location (approximate)

## Exporting User Data

### Export Options
1. Click **Export Users**
2. Select fields to include
3. Choose format (CSV, Excel)
4. Download file

### Exportable Fields
- Name
- Email
- Role
- Status
- Registration date
- Last login
- Organization

## Best Practices

1. **Regular audits** - Review users monthly
2. **Prompt deactivation** - Disable departed users
3. **Role accuracy** - Ensure correct permissions
4. **Monitor activity** - Watch for unusual patterns
5. **Secure passwords** - Enforce strong passwords

## Troubleshooting

### User can't log in?
- Check account is active
- Verify email is correct
- Reset password if needed
- Check for multiple accounts

### Role change not working?
- Refresh the page
- User may need to log out/in
- Check for conflicts

### Can't delete user?
- Check for linked data
- May need to reassign items
- Contact support if stuck

---

## Related Guides

- [Admin Dashboard](./dashboard.md)
- [Platform Settings](./settings.md)

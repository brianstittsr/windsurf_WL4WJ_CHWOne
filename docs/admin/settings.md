# Platform Settings

Configure global platform settings and preferences.

## Overview

Platform Settings allow administrators to:
- Configure site branding
- Set default preferences
- Manage feature toggles
- Configure integrations

## Accessing Settings

Navigate to **Admin > Platform Settings** in the sidebar.

## General Settings

### Site Information

| Setting | Description |
|---------|-------------|
| **Site Name** | Platform display name |
| **Site URL** | Primary domain |
| **Support Email** | Help contact email |
| **Logo** | Platform logo image |

### Default Preferences

| Setting | Options |
|---------|---------|
| **Language** | English (default) |
| **Timezone** | Eastern, Central, etc. |
| **Date Format** | MM/DD/YYYY, DD/MM/YYYY |
| **Currency** | USD (default) |

## Feature Toggles

Enable or disable platform features:

| Feature | Description |
|---------|-------------|
| **AI Assistant** | Enable AI chat |
| **Form Builder** | Allow form creation |
| **Report Generator** | Enable reports |
| **Collaborations** | Multi-org features |
| **CHW Directory** | Public directory |

### Toggling Features

1. Find the feature
2. Click the toggle switch
3. Confirm if prompted
4. Feature is enabled/disabled

## Security Settings

### Password Policy

Configure password requirements:

| Setting | Options |
|---------|---------|
| **Minimum Length** | 8-16 characters |
| **Require Uppercase** | Yes/No |
| **Require Numbers** | Yes/No |
| **Require Symbols** | Yes/No |
| **Password Expiry** | Never, 30, 60, 90 days |

### Session Settings

| Setting | Options |
|---------|---------|
| **Session Timeout** | 15, 30, 60 minutes |
| **Remember Me Duration** | 7, 14, 30 days |
| **Max Sessions** | 1-5 concurrent |

### Two-Factor Authentication

| Setting | Options |
|---------|---------|
| **2FA Enabled** | Yes/No |
| **Required for Admins** | Yes/No |
| **Methods** | Authenticator app, SMS |

## Email Settings

### SMTP Configuration

| Setting | Description |
|---------|-------------|
| **SMTP Host** | Mail server address |
| **SMTP Port** | Server port (587, 465) |
| **Username** | SMTP username |
| **Password** | SMTP password |
| **From Address** | Sender email |
| **From Name** | Sender display name |

### Email Templates

Customize system emails:
- Welcome email
- Password reset
- Invitation
- Notifications

## Integration Settings

### Firebase

| Setting | Description |
|---------|-------------|
| **Project ID** | Firebase project |
| **API Key** | Authentication key |
| **Auth Domain** | Auth domain URL |

### AI Services

| Setting | Description |
|---------|-------------|
| **Provider** | OpenAI, Anthropic, etc. |
| **API Key** | Service API key |
| **Model** | Default model |

## Notification Settings

### System Notifications

| Type | Default |
|------|---------|
| **New User Registration** | Admin notified |
| **Form Submission** | Owner notified |
| **Grant Updates** | Team notified |
| **Security Alerts** | Admin notified |

### Email Frequency

| Setting | Options |
|---------|---------|
| **Immediate** | Send as events occur |
| **Daily Digest** | Once per day |
| **Weekly Digest** | Once per week |

## Backup Settings

### Automatic Backups

| Setting | Options |
|---------|---------|
| **Enabled** | Yes/No |
| **Frequency** | Daily, Weekly |
| **Retention** | 7, 14, 30 days |
| **Storage** | Cloud storage location |

### Manual Backup

1. Go to **Settings > Backup**
2. Click **Create Backup**
3. Wait for completion
4. Download if needed

## Maintenance Mode

### Enabling Maintenance

1. Go to **Settings > Maintenance**
2. Toggle **Maintenance Mode**
3. Set custom message
4. Save

### During Maintenance
- Users see maintenance page
- Admins can still access
- Scheduled tasks paused

## Audit Settings

### Audit Log

| Setting | Options |
|---------|---------|
| **Enabled** | Yes/No |
| **Retention** | 30, 60, 90 days |
| **Events Logged** | Login, changes, exports |

### Viewing Audit Log

1. Go to **Admin > Security**
2. Click **Audit Log**
3. Filter by event type
4. Export if needed

## Applying Changes

### Save Settings

1. Make changes
2. Click **Save Settings**
3. Confirm if prompted
4. Changes take effect

### Reverting Changes

1. Click **Revert to Defaults**
2. Confirm action
3. Settings reset

## Best Practices

1. **Document changes** - Keep record of modifications
2. **Test features** - Verify after toggling
3. **Secure credentials** - Protect API keys
4. **Regular backups** - Enable automatic backups
5. **Monitor logs** - Review audit regularly

## Troubleshooting

### Settings not saving?
- Check all required fields
- Verify admin permissions
- Try refreshing page

### Email not working?
- Verify SMTP settings
- Test with simple email
- Check spam filters

### Feature toggle not working?
- Clear browser cache
- Users may need to refresh
- Check for dependencies

---

## Related Guides

- [Admin Dashboard](./dashboard.md)
- [User Management](./users.md)

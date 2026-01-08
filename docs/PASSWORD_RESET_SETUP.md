# Password Reset Feature

## Overview

The CHWOne platform now includes a complete password reset feature that integrates with Firebase Authentication. Users can request a password reset link via email, which allows them to securely reset their password.

## Features

✅ **Forgot Password Page** (`/forgot-password`)
- Clean, user-friendly interface
- Email validation
- Firebase integration for sending reset emails
- Success/error feedback
- Link back to login page

✅ **Firebase Integration**
- Uses Firebase's `sendPasswordResetEmail()` function
- Secure password reset links
- Links expire after 1 hour
- No server-side code required

✅ **Error Handling**
- User not found
- Invalid email format
- Too many requests (rate limiting)
- Network errors

## User Flow

1. User clicks "Forgot password?" on login page
2. User enters their email address
3. System sends password reset email via Firebase
4. User receives email with reset link
5. User clicks link and is taken to Firebase's password reset page
6. User enters new password
7. User can log in with new password

## Firebase Configuration

### Email Templates

Firebase automatically sends password reset emails. To customize the email template:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to **Authentication** > **Templates**
4. Click on **Password reset** template
5. Customize the email template:
   - Subject line
   - Email body
   - Sender name
   - Reply-to email

### Recommended Email Template

```
Subject: Reset your CHWOne password

Hi %DISPLAY_NAME%,

We received a request to reset your password for your CHWOne account.

Click the link below to reset your password:
%LINK%

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

Thanks,
The CHWOne Team
```

### Action URL Configuration

Configure where users are redirected after clicking the reset link:

1. Go to **Authentication** > **Settings** > **Authorized domains**
2. Add your production domain (e.g., `chwone.vercel.app`)
3. Go to **Authentication** > **Templates** > **Password reset**
4. Set the action URL to: `https://your-domain.com/__/auth/action`

## Security Features

### Rate Limiting
Firebase automatically rate limits password reset requests to prevent abuse:
- Maximum 5 requests per email per hour
- Returns `auth/too-many-requests` error when limit exceeded

### Link Expiration
- Password reset links expire after 1 hour
- Links can only be used once
- Old links are invalidated when a new one is requested

### Email Verification
- Only sends reset emails to registered accounts
- Does not reveal whether an email exists (security best practice)

## Testing

### Test the Feature

1. Navigate to `/login`
2. Click "Forgot password?"
3. Enter a registered email (e.g., `admin@example.com`)
4. Check the email inbox
5. Click the reset link
6. Enter a new password
7. Log in with the new password

### Test Accounts

- **Email:** admin@example.com
- **Original Password:** admin123

## Code Structure

### Frontend Component
```
src/app/forgot-password/page.tsx
```
- React component with form
- Material-UI styling
- Firebase integration
- Error handling

### Firebase Function Used
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebaseConfig';

await sendPasswordResetEmail(auth, email);
```

## Error Messages

| Error Code | User Message |
|------------|--------------|
| `auth/user-not-found` | "No account found with this email address" |
| `auth/invalid-email` | "Invalid email address" |
| `auth/too-many-requests` | "Too many requests. Please try again later" |
| Network error | "Failed to send password reset email. Please try again" |

## Troubleshooting

### Email Not Received

**Possible causes:**
1. Email in spam/junk folder
2. Email address not registered
3. Firebase email service not configured
4. Email provider blocking Firebase emails

**Solutions:**
1. Check spam folder
2. Verify email is registered in Firebase Console
3. Configure SMTP settings in Firebase
4. Whitelist Firebase email addresses

### Link Not Working

**Possible causes:**
1. Link expired (>1 hour old)
2. Link already used
3. Incorrect action URL configuration

**Solutions:**
1. Request a new reset link
2. Check Firebase action URL settings
3. Verify authorized domains in Firebase Console

### Too Many Requests Error

**Cause:** Rate limit exceeded (>5 requests per hour)

**Solution:** Wait 1 hour before requesting another reset link

## Production Checklist

Before deploying to production:

- [ ] Customize Firebase email template
- [ ] Configure action URL for your domain
- [ ] Add production domain to authorized domains
- [ ] Test password reset flow end-to-end
- [ ] Configure custom SMTP (optional, for branded emails)
- [ ] Set up email monitoring/logging
- [ ] Document support process for password issues

## Custom SMTP (Optional)

For branded emails with your own domain:

1. Go to Firebase Console > **Authentication** > **Templates**
2. Click **Customize email templates**
3. Enable **Custom SMTP**
4. Configure your SMTP settings:
   - SMTP server
   - Port (587 for TLS)
   - Username
   - Password
   - From address

## Support

If users have issues resetting their password:

1. Verify their email is registered in Firebase Console
2. Check Firebase logs for errors
3. Manually reset password via Firebase Console:
   - Go to **Authentication** > **Users**
   - Find the user
   - Click three dots menu > **Reset password**
   - Firebase will send a reset email

## Related Files

- `/src/app/forgot-password/page.tsx` - Forgot password page
- `/src/app/login/page.tsx` - Login page with forgot password link
- `/src/lib/firebase/firebaseConfig.ts` - Firebase configuration
- `/docs/PASSWORD_RESET_SETUP.md` - This documentation

## Future Enhancements

Potential improvements:
- [ ] Custom password reset page (instead of Firebase default)
- [ ] Password strength requirements
- [ ] Password history (prevent reusing old passwords)
- [ ] Two-factor authentication
- [ ] Account recovery options (security questions, phone)
- [ ] Admin ability to force password reset

# Offline Mode for Firebase Authentication

This feature allows you to use the application even when Firebase authentication services are unavailable.

## What is Offline Mode?

Offline Mode provides a fallback authentication mechanism when:
- You have no internet connection
- Firebase authentication services are down
- Your network blocks Firebase authentication endpoints
- You're experiencing the `auth/network-request-failed` error

## How to Use Offline Mode

### Automatic Fallback

If you try to log in and encounter a network error, the application will automatically:
1. Enable offline mode
2. Attempt to authenticate you using the offline credentials
3. Allow you to use the application with limited functionality

### Manual Toggle

You can manually toggle offline mode in two ways:

#### 1. From the Error Screen

If you see the "Authentication Service Unavailable" error screen, click the "Toggle Offline Mode" button.

#### 2. From the Browser Console

```
// To enable offline mode
localStorage.setItem('forceOfflineMode', 'true');

// To disable offline mode
localStorage.setItem('forceOfflineMode', 'false');
```

After toggling, refresh the page for the changes to take effect.

## Default Offline Credentials

When in offline mode, you can log in with:

- **Email**: admin@example.com
- **Password**: admin123

## Limitations in Offline Mode

While in offline mode:
- You can only use predefined mock users
- Database operations will not work
- Changes will not be synchronized with Firebase
- Some features may be disabled or limited

## Troubleshooting

If you're still having issues with Firebase authentication:

1. Check your internet connection
2. Verify your Firebase configuration in `.env.local`
3. Make sure Firebase Authentication is enabled in your Firebase console
4. Check if your Firebase project has reached its quota limits
5. Try using a different browser or disabling browser extensions

## Returning to Online Mode

To return to online mode:
1. Click the "Toggle Offline Mode" button if on the error screen
2. Or set `localStorage.setItem('forceOfflineMode', 'false')` in the console
3. Refresh the page

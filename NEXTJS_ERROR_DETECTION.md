# Next.js Error Detection

This document explains how to use the Next.js error detection script to identify errors that appear on the dashboard after login.

## What This Script Does

The script adds a global error handler to the application that:

1. Captures JavaScript errors and unhandled promise rejections
2. Logs detailed error information to the console
3. Displays a visible error message on the page that you can interact with
4. Makes the error message clickable and dismissible

## How to Use

1. Run the development server:
   ```
   npm run dev
   ```

2. Navigate to the dashboard by logging in
3. When an error occurs, you will see:
   - A red error box at the top of the page with details
   - Complete error information in the browser console

4. You can click the "Dismiss" button to close the error message

## Common Next.js Errors

Some common Next.js errors that might appear after login:

1. **Hydration Mismatch**: Differences between server and client rendering
2. **Missing Dependencies**: Required modules not installed or imported
3. **Invalid Hook Calls**: React hooks used incorrectly
4. **Route Conflicts**: Multiple pages trying to handle the same route
5. **API Route Errors**: Issues with API routes or server components

## Restoring Original Layout

If you want to remove the error detection script, you can restore the original layout file from the backup:

```
cp src/app/layout.tsx.error-check-backup src/app/layout.tsx
```

Created: 2025-10-18T22:52:53.257Z

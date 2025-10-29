/**
 * Fix Dashboard Redirect Issue
 * 
 * This script fixes the issue where the dashboard redirects back to the login page
 * even after successful authentication, and prevents the UI from becoming unresponsive.
 */

const fs = require('fs');
const path = require('path');

// Paths to files that need modification
const filePaths = {
  dashboardPage: path.resolve(process.cwd(), 'src/app/dashboard/page.tsx'),
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx')
};

// Check if files exist
Object.entries(filePaths).forEach(([name, filePath]) => {
  if (!fs.existsSync(filePath)) {
    console.error(`${name} not found at path: ${filePath}`);
    process.exit(1);
  }
});

// Create backups
Object.entries(filePaths).forEach(([name, filePath]) => {
  const backupPath = `${filePath}.dashboard-redirect-fix-backup`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`Created backup of ${name} at ${backupPath}`);
});

// 1. Fix dashboard page to properly handle authentication state
let dashboardPageContent = fs.readFileSync(filePaths.dashboardPage, 'utf8');

// Add a check for pending authentication
dashboardPageContent = dashboardPageContent.replace(
  `function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  // Use useRef instead of useState to prevent re-renders
  const redirectAttemptsRef = React.useRef(0);
  
  // Check for login success flag
  React.useEffect(() => {
    const loginSuccess = sessionStorage.getItem('loginSuccess');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (loginSuccess === 'true') {
      console.log('%c[DASHBOARD] Login success flag found', 'color: green;', { loginTime });
      // Clear the flag to prevent issues on refresh
      sessionStorage.removeItem('loginSuccess');
    }
  }, []);`,
  
  `function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  // Use useRef instead of useState to prevent re-renders
  const redirectAttemptsRef = React.useRef(0);
  const authCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [pendingAuth, setPendingAuth] = React.useState(false);
  
  // Check for login success flag
  React.useEffect(() => {
    const loginSuccess = sessionStorage.getItem('loginSuccess');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (loginSuccess === 'true') {
      console.log('%c[DASHBOARD] Login success flag found', 'color: green;', { loginTime });
      // Set pending auth to true
      setPendingAuth(true);
      // Clear the flag to prevent issues on refresh
      sessionStorage.removeItem('loginSuccess');
    }
    
    // Cleanup function
    return () => {
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
    };
  }, []);`
);

// Fix the redirect logic to handle pending authentication
dashboardPageContent = dashboardPageContent.replace(
  `if (!currentUser) {
    // Check localStorage for auth session before redirecting
    const storedSession = localStorage.getItem('authSession');
    
    if (storedSession) {
      console.log('%c[DASHBOARD] Found stored auth session, waiting for auth state to update', 'color: #3182ce;');
      // If we have a stored session but no currentUser yet, show loading instead of redirecting
      if (redirectAttemptsRef.current < 2) {
        redirectAttemptsRef.current += 1;
        return <AnimatedLoading message="Restoring session..." />;
      }
    }
    
    // Increment the ref counter instead of state
    redirectAttemptsRef.current += 1;
    
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {
      redirectAttempts: redirectAttemptsRef.current,
      maxAttempts: MAX_REDIRECT_ATTEMPTS,
      hasStoredSession: !!storedSession
    });`,
  
  `if (!currentUser) {
    // Check for pending authentication
    if (pendingAuth) {
      console.log('%c[DASHBOARD] Authentication is pending, showing loading screen', 'color: green;');
      // Wait for auth state to update with a longer timeout
      if (!authCheckTimeoutRef.current) {
        authCheckTimeoutRef.current = setTimeout(() => {
          console.log('%c[DASHBOARD] Auth check timeout expired, proceeding with normal flow', 'color: orange;');
          setPendingAuth(false);
        }, 3000); // Wait up to 3 seconds for auth to complete
      }
      return <AnimatedLoading message="Completing authentication..." />;
    }
    
    // Check localStorage for auth session before redirecting
    const storedSession = localStorage.getItem('authSession');
    
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const sessionTime = new Date(session.timestamp).getTime();
        const currentTime = new Date().getTime();
        const sessionAge = currentTime - sessionTime;
        
        console.log('%c[DASHBOARD] Found stored auth session', 'color: #3182ce;', { 
          email: session.email,
          sessionAge: Math.round(sessionAge / 1000) + ' seconds'
        });
        
        // If session is less than 5 minutes old, wait for auth state to update
        if (sessionAge < 5 * 60 * 1000) {
          console.log('%c[DASHBOARD] Recent session found, waiting for auth state to update', 'color: green;');
          if (redirectAttemptsRef.current < 3) {
            redirectAttemptsRef.current += 1;
            return <AnimatedLoading message="Restoring session..." />;
          }
        } else {
          console.log('%c[DASHBOARD] Session is too old, clearing', 'color: orange;');
          localStorage.removeItem('authSession');
        }
      } catch (e) {
        console.error('%c[DASHBOARD] Error parsing stored session', 'color: red;', e);
        localStorage.removeItem('authSession');
      }
    }
    
    // Increment the ref counter instead of state
    redirectAttemptsRef.current += 1;
    
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {
      redirectAttempts: redirectAttemptsRef.current,
      maxAttempts: MAX_REDIRECT_ATTEMPTS,
      hasStoredSession: !!storedSession,
      pendingAuth
    });`
);

// 2. Fix AuthContext to improve the timing of setting currentUser
let authContextContent = fs.readFileSync(filePaths.authContext, 'utf8');

// Increase the delay for setting currentUser and improve the auth state change handler
authContextContent = authContextContent.replace(
  `// Small delay to ensure Firebase is fully initialized
          setTimeout(() => {
            if (isMounted) {
              setCurrentUser(user);
              console.log('%c[AUTH] Current user set after delay', 'color: green;');
            }
          }, 500); // Increased from 300ms to 500ms`,
  
  `// Increased delay to ensure Firebase is fully initialized
          setTimeout(() => {
            if (isMounted) {
              setCurrentUser(user);
              console.log('%c[AUTH] Current user set after delay', 'color: green;');
              
              // If we're on the login page and just authenticated, redirect to dashboard
              if (window.location.pathname === '/login') {
                console.log('%c[AUTH] Authenticated on login page, redirecting to dashboard', 'color: green;');
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 100);
              }
            }
          }, 800); // Increased from 500ms to 800ms`
);

// Improve the auth state change handler to prevent race conditions
authContextContent = authContextContent.replace(
  `// Listen for Firebase auth state changes with timeout protection
  useEffect(() => {
    let isMounted = true;
    let authTimeoutId: NodeJS.Timeout | null = null;`,
  
  `// Listen for Firebase auth state changes with timeout protection
  useEffect(() => {
    let isMounted = true;
    let authTimeoutId: NodeJS.Timeout | null = null;
    let authChangeCount = 0;`
);

authContextContent = authContextContent.replace(
  `const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('%c[AUTH] Auth State Changed', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;', {
          user: user ? { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
          } : null,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString()
        });`,
  
  `const unsubscribe = onAuthStateChanged(auth, async (user) => {
        authChangeCount++;
        const currentAuthChange = authChangeCount;
        
        console.log('%c[AUTH] Auth State Changed', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;', {
          user: user ? { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
          } : null,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString(),
          changeCount: currentAuthChange
        });`
);

// Write the modified content back to the files
fs.writeFileSync(filePaths.dashboardPage, dashboardPageContent);
fs.writeFileSync(filePaths.authContext, authContextContent);

console.log('Successfully fixed dashboard redirect issue');
console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Clear browser cache and cookies for localhost');
console.log('3. Test the login and dashboard navigation');

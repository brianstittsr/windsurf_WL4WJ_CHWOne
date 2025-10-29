/**
 * Fix Login Flow
 * 
 * This script implements a comprehensive fix for the login flow,
 * addressing issues with authentication state persistence and navigation.
 */

const fs = require('fs');
const path = require('path');

// Paths to files that need modification
const filePaths = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  loginPage: path.resolve(process.cwd(), 'src/app/login/page.tsx'),
  dashboardPage: path.resolve(process.cwd(), 'src/app/dashboard/page.tsx')
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
  const backupPath = `${filePath}.login-fix-backup`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`Created backup of ${name} at ${backupPath}`);
});

// 1. Fix AuthContext.tsx to improve auth state persistence
let authContextContent = fs.readFileSync(filePaths.authContext, 'utf8');

// Add localStorage persistence for auth state
authContextContent = authContextContent.replace(
  `// Listen for Firebase auth state changes with timeout protection
  useEffect(() => {
    let isMounted = true;
    let authTimeoutId: NodeJS.Timeout | null = null;`,
  
  `// Listen for Firebase auth state changes with timeout protection
  useEffect(() => {
    let isMounted = true;
    let authTimeoutId: NodeJS.Timeout | null = null;
    
    // Check for stored auth session
    const storedSession = localStorage.getItem('authSession');
    if (storedSession && !currentUser) {
      try {
        const session = JSON.parse(storedSession);
        console.log('%c[AUTH] Found stored session', 'color: #1a365d;', { 
          email: session.email,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('%c[AUTH] Error parsing stored session', 'color: red;', e);
        localStorage.removeItem('authSession');
      }
    }`
);

// Update the currentUser setter to persist to localStorage
authContextContent = authContextContent.replace(
  `if (user) {
          console.log('%c[AUTH] Setting current user', 'color: green;', { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          
          // Small delay to ensure Firebase is fully initialized
          setTimeout(() => {
            if (isMounted) {
              setCurrentUser(user);
              console.log('%c[AUTH] Current user set after delay', 'color: green;');
            }
          }, 300); // Increased from 100ms to 300ms`,
  
  `if (user) {
          console.log('%c[AUTH] Setting current user', 'color: green;', { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          
          // Store minimal auth session in localStorage
          try {
            localStorage.setItem('authSession', JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              timestamp: new Date().toISOString()
            }));
            console.log('%c[AUTH] Stored auth session in localStorage', 'color: green;');
          } catch (e) {
            console.error('%c[AUTH] Error storing auth session', 'color: red;', e);
          }
          
          // Small delay to ensure Firebase is fully initialized
          setTimeout(() => {
            if (isMounted) {
              setCurrentUser(user);
              console.log('%c[AUTH] Current user set after delay', 'color: green;');
            }
          }, 500); // Increased from 300ms to 500ms`
);

// Update signOut to clear localStorage
authContextContent = authContextContent.replace(
  `await firebaseSignOut(auth);
      
      setCurrentUser(null);
      setUserProfile(null);`,
  
  `await firebaseSignOut(auth);
      
      // Clear auth session from localStorage
      localStorage.removeItem('authSession');
      console.log('%c[AUTH] Cleared auth session from localStorage', 'color: green;');
      
      setCurrentUser(null);
      setUserProfile(null);`
);

// 2. Fix login page to use a more reliable navigation method
let loginPageContent = fs.readFileSync(filePaths.loginPage, 'utf8');

// Replace the navigation code with a more reliable approach
loginPageContent = loginPageContent.replace(
  `// Force a longer delay to ensure auth state is fully updated
      console.log('[LOGIN] Setting navigation timeout with 1000ms delay');
      setTimeout(() => {
        console.log('[LOGIN] Navigation timeout fired, preparing to navigate');
        try {
          if (redirectUrl) {
            console.log('[LOGIN] Navigating to redirect URL:', redirectUrl);
            sessionStorage.removeItem('redirectAfterLogin');
            // Use router instead of window.location for better Next.js integration
            router.push(redirectUrl);
          } else {
            console.log('[LOGIN] Navigating to dashboard');
            router.push('/dashboard');
          }
        } catch (navError) {
          console.error('[LOGIN] Navigation error:', navError);
          // Fallback to window.location if router fails
          window.location.href = redirectUrl || '/dashboard';
        }
      }, 1000); // Increased timeout to 1000ms`,
  
  `// Force a longer delay to ensure auth state is fully updated
      console.log('[LOGIN] Setting navigation timeout with 1500ms delay');
      setTimeout(() => {
        console.log('[LOGIN] Navigation timeout fired, preparing to navigate');
        try {
          // Store login success flag
          sessionStorage.setItem('loginSuccess', 'true');
          sessionStorage.setItem('loginTime', new Date().toISOString());
          
          if (redirectUrl) {
            console.log('[LOGIN] Navigating to redirect URL:', redirectUrl);
            sessionStorage.removeItem('redirectAfterLogin');
            
            // Use window.location for more reliable navigation after login
            window.location.href = redirectUrl;
          } else {
            console.log('[LOGIN] Navigating to dashboard');
            window.location.href = '/dashboard';
          }
        } catch (navError) {
          console.error('[LOGIN] Navigation error:', navError);
          // Fallback
          window.location.href = redirectUrl || '/dashboard';
        }
      }, 1500); // Increased timeout to 1500ms`
);

// 3. Fix dashboard page to better handle auth state
let dashboardPageContent = fs.readFileSync(filePaths.dashboardPage, 'utf8');

// Add check for login success flag
dashboardPageContent = dashboardPageContent.replace(
  `function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  // Use useRef instead of useState to prevent re-renders
  const redirectAttemptsRef = React.useRef(0);`,
  
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
  }, []);`
);

// Add localStorage check for auth session
dashboardPageContent = dashboardPageContent.replace(
  `if (!currentUser) {
    // Increment the ref counter instead of state
    redirectAttemptsRef.current += 1;
    
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {
      redirectAttempts: redirectAttemptsRef.current,
      maxAttempts: MAX_REDIRECT_ATTEMPTS
    });`,
  
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
    });`
);

// Write the modified content back to the files
fs.writeFileSync(filePaths.authContext, authContextContent);
fs.writeFileSync(filePaths.loginPage, loginPageContent);
fs.writeFileSync(filePaths.dashboardPage, dashboardPageContent);

console.log('Successfully fixed login flow issues');
console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Clear browser cache and cookies for localhost');
console.log('3. Test the login and dashboard navigation');

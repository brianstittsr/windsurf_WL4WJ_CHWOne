/**
 * Fix Navigation Issues
 * 
 * This script addresses navigation issues between login and dashboard
 * by modifying how navigation is handled and fixing potential race conditions.
 */

const fs = require('fs');
const path = require('path');

// Paths to files
const filePaths = {
  loginPage: path.resolve(process.cwd(), 'src/app/login/page.tsx'),
  dashboardPage: path.resolve(process.cwd(), 'src/app/dashboard/page.tsx'),
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx')
};

// Check if files exist
Object.entries(filePaths).forEach(([name, path]) => {
  if (!fs.existsSync(path)) {
    console.error(`${name} not found at path: ${path}`);
    process.exit(1);
  }
});

// Create backups
Object.entries(filePaths).forEach(([name, path]) => {
  const backupPath = `${path}.nav-backup`;
  fs.copyFileSync(path, backupPath);
  console.log(`Created backup of ${name} at ${backupPath}`);
});

// Fix login page navigation
let loginPageContent = fs.readFileSync(filePaths.loginPage, 'utf8');

// Replace window.location.href with router.push and increase timeout
loginPageContent = loginPageContent.replace(
  `// Force a small delay to ensure auth state is updated
      setTimeout(() => {
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectUrl;
        } else {
          window.location.href = '/dashboard';
        }
      }, 500);`,
  
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
      }, 1000); // Increased timeout to 1000ms`
);

// Fix dashboard page to prevent redirect loops
let dashboardPageContent = fs.readFileSync(filePaths.dashboardPage, 'utf8');

// Add a redirect counter to prevent infinite loops
dashboardPageContent = dashboardPageContent.replace(
  `function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  const { currentUser, loading } = useAuth();`,
  
  `// Track redirect attempts to prevent loops
const MAX_REDIRECT_ATTEMPTS = 3;
let redirectAttempts = 0;

function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  const { currentUser, loading } = useAuth();`
);

// Add redirect attempt tracking
dashboardPageContent = dashboardPageContent.replace(
  `if (!currentUser) {
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;');
    router.push('/login');
    return null;
  }`,
  
  `if (!currentUser) {
    redirectAttempts++;
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {
      redirectAttempts,
      maxAttempts: MAX_REDIRECT_ATTEMPTS
    });
    
    // Prevent redirect loops by checking redirect attempts
    if (redirectAttempts <= MAX_REDIRECT_ATTEMPTS) {
      router.push('/login');
    } else {
      console.error('%c[DASHBOARD] Too many redirect attempts, showing error instead', 'background: red; color: white;');
      return (
        <div style={{ 
          padding: '2rem', 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center',
          marginTop: '4rem'
        }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Authentication Error</h2>
          <p style={{ marginBottom: '1rem' }}>
            There was a problem with authentication. Please try signing in again.
          </p>
          <button 
            onClick={() => {
              redirectAttempts = 0;
              router.push('/login');
            }}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      );
    }
    return null;
  }
  
  // Reset redirect counter on successful render
  redirectAttempts = 0;`
);

// Fix AuthContext to improve auth state handling
let authContextContent = fs.readFileSync(filePaths.authContext, 'utf8');

// Add a delay before setting currentUser to ensure Firebase is ready
authContextContent = authContextContent.replace(
  `if (user) {
          console.log('%c[AUTH] Setting current user', 'color: green;', { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          setCurrentUser(user);`,
  
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
          }, 100);`
);

// Write the modified content back to the files
fs.writeFileSync(filePaths.loginPage, loginPageContent);
fs.writeFileSync(filePaths.dashboardPage, dashboardPageContent);
fs.writeFileSync(filePaths.authContext, authContextContent);

console.log('Successfully fixed navigation issues');
console.log('Please restart your development server for changes to take effect.');

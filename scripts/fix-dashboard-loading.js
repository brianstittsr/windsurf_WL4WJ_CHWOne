/**
 * Fix Dashboard Loading Issue
 * 
 * This script addresses issues with the dashboard not loading after login
 * by improving the authentication state management and navigation.
 */

const fs = require('fs');
const path = require('path');

// Paths to files that need modification
const filePaths = {
  loginPage: path.resolve(process.cwd(), 'src/app/login/page.tsx'),
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
  const backupPath = `${filePath}.dashboard-fix-backup`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`Created backup of ${name} at ${backupPath}`);
});

// 1. Fix login page navigation
let loginPageContent = fs.readFileSync(filePaths.loginPage, 'utf8');

// Replace window.location.href with router.push for better Next.js integration
loginPageContent = loginPageContent.replace(
  `// Force a small delay to ensure auth state is updated
      console.log('%c[LOGIN] Setting navigation timeout', 'color: #2a4365;');
      setTimeout(() => {
        console.log('%c[LOGIN] Navigation timeout fired', 'background: #2a4365; color: white; padding: 2px 4px; border-radius: 2px;');
        if (redirectUrl) {
          console.log('%c[LOGIN] Navigating to redirect URL:', 'color: #2a4365;', redirectUrl);
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectUrl;
        } else {
          console.log('%c[LOGIN] Navigating to dashboard', 'color: #2a4365;');
          window.location.href = '/dashboard';
        }
      }, 1000);`,
  
  `// Force a longer delay to ensure auth state is fully updated
      console.log('%c[LOGIN] Setting navigation timeout', 'color: #2a4365;');
      setTimeout(() => {
        console.log('%c[LOGIN] Navigation timeout fired', 'background: #2a4365; color: white; padding: 2px 4px; border-radius: 2px;');
        try {
          if (redirectUrl) {
            console.log('%c[LOGIN] Navigating to redirect URL:', 'color: #2a4365;', redirectUrl);
            sessionStorage.removeItem('redirectAfterLogin');
            // Use router for better Next.js integration
            router.push(redirectUrl);
          } else {
            console.log('%c[LOGIN] Navigating to dashboard', 'color: #2a4365;');
            // Use router for better Next.js integration
            router.push('/dashboard');
          }
        } catch (navError) {
          console.error('%c[LOGIN] Navigation error:', 'background: red; color: white;', navError);
          // Fallback to window.location if router fails
          window.location.href = redirectUrl || '/dashboard';
        }
      }, 1500); // Increased timeout to 1500ms for better reliability`
);

// 2. Fix dashboard page to improve auth state handling
let dashboardPageContent = fs.readFileSync(filePaths.dashboardPage, 'utf8');

// Make redirectAttempts a state variable to ensure it persists correctly
dashboardPageContent = dashboardPageContent.replace(
  `// Track redirect attempts to prevent loops
const MAX_REDIRECT_ATTEMPTS = 3;
let redirectAttempts = 0;

function Dashboard() {`,
  
  `// Track redirect attempts to prevent loops
const MAX_REDIRECT_ATTEMPTS = 3;

function Dashboard() {
  // Use React state for redirect attempts to ensure it works correctly
  const [redirectAttempts, setRedirectAttempts] = React.useState(0);`
);

// Update the redirect logic to use state
dashboardPageContent = dashboardPageContent.replace(
  `if (!currentUser) {
    redirectAttempts++;
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {
      redirectAttempts,
      maxAttempts: MAX_REDIRECT_ATTEMPTS
    });
    
    // Prevent redirect loops by checking redirect attempts
    if (redirectAttempts <= MAX_REDIRECT_ATTEMPTS) {
      router.push('/login');
    } else {`,
  
  `if (!currentUser) {
    const newAttempts = redirectAttempts + 1;
    setRedirectAttempts(newAttempts);
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {
      redirectAttempts: newAttempts,
      maxAttempts: MAX_REDIRECT_ATTEMPTS
    });
    
    // Prevent redirect loops by checking redirect attempts
    if (newAttempts <= MAX_REDIRECT_ATTEMPTS) {
      // Add a small delay before redirecting to ensure state is updated
      setTimeout(() => {
        router.push('/login');
      }, 100);
    } else {`
);

// Update the reset logic
dashboardPageContent = dashboardPageContent.replace(
  `// Reset redirect counter on successful render
  redirectAttempts = 0;`,
  
  `// Reset redirect counter on successful render
  React.useEffect(() => {
    if (currentUser && redirectAttempts > 0) {
      setRedirectAttempts(0);
    }
  }, [currentUser, redirectAttempts]);`
);

// Update the button click handler
dashboardPageContent = dashboardPageContent.replace(
  `onClick={() => {
              redirectAttempts = 0;
              router.push('/login');
            }}`,
  
  `onClick={() => {
              setRedirectAttempts(0);
              router.push('/login');
            }}`
);

// 3. Fix AuthContext to ensure auth state is properly set
let authContextContent = fs.readFileSync(filePaths.authContext, 'utf8');

// Increase the delay for setting currentUser to ensure Firebase is fully initialized
authContextContent = authContextContent.replace(
  `// Small delay to ensure Firebase is fully initialized
          setTimeout(() => {
            if (isMounted) {
              setCurrentUser(user);
              console.log('%c[AUTH] Current user set after delay', 'color: green;');
            }
          }, 100);`,
  
  `// Increased delay to ensure Firebase is fully initialized
          setTimeout(() => {
            if (isMounted) {
              setCurrentUser(user);
              console.log('%c[AUTH] Current user set after delay', 'color: green;');
            }
          }, 300); // Increased from 100ms to 300ms`
);

// Write the modified content back to the files
fs.writeFileSync(filePaths.loginPage, loginPageContent);
fs.writeFileSync(filePaths.dashboardPage, dashboardPageContent);
fs.writeFileSync(filePaths.authContext, authContextContent);

console.log('Successfully fixed dashboard loading issues');
console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Test the login and dashboard navigation');

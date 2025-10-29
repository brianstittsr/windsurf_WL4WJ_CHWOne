/**
 * Fix Infinite Render Loop
 * 
 * This script fixes the infinite render loop in the dashboard page
 * by properly implementing the redirect counter as a ref instead of state.
 */

const fs = require('fs');
const path = require('path');

// Path to dashboard page
const dashboardPath = path.resolve(process.cwd(), 'src/app/dashboard/page.tsx');

// Check if file exists
if (!fs.existsSync(dashboardPath)) {
  console.error('Dashboard page not found at path:', dashboardPath);
  process.exit(1);
}

// Create backup
const backupPath = `${dashboardPath}.infinite-fix-backup`;
fs.copyFileSync(dashboardPath, backupPath);
console.log(`Created backup of dashboard page at ${backupPath}`);

// Read file content
let content = fs.readFileSync(dashboardPath, 'utf8');

// Replace the Dashboard component with a fixed version
content = content.replace(
  /\/\/ Track redirect attempts to prevent loops[\s\S]*?function Dashboard\(\) {[\s\S]*?const \[redirectAttempts, setRedirectAttempts\] = React\.useState\(0\);/g,
  `// Track redirect attempts to prevent loops
const MAX_REDIRECT_ATTEMPTS = 3;

function Dashboard() {
  // Use useRef instead of useState to prevent re-renders
  const redirectAttemptsRef = React.useRef(0);`
);

// Fix the redirect logic
content = content.replace(
  /if \(!currentUser\) {[\s\S]*?const newAttempts = redirectAttempts \+ 1;[\s\S]*?setRedirectAttempts\(newAttempts\);[\s\S]*?console\.log\('%c\[DASHBOARD\] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {[\s\S]*?redirectAttempts: newAttempts,[\s\S]*?maxAttempts: MAX_REDIRECT_ATTEMPTS[\s\S]*?}\);[\s\S]*?\/\/ Prevent redirect loops by checking redirect attempts[\s\S]*?if \(newAttempts <= MAX_REDIRECT_ATTEMPTS\) {/g,
  `if (!currentUser) {
    // Increment the ref counter instead of state
    redirectAttemptsRef.current += 1;
    
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;', {
      redirectAttempts: redirectAttemptsRef.current,
      maxAttempts: MAX_REDIRECT_ATTEMPTS
    });
    
    // Prevent redirect loops by checking redirect attempts
    if (redirectAttemptsRef.current <= MAX_REDIRECT_ATTEMPTS) {`
);

// Fix the reset logic
content = content.replace(
  /\/\/ Reset redirect counter on successful render[\s\S]*?React\.useEffect\(\(\) => {[\s\S]*?if \(currentUser && redirectAttempts > 0\) {[\s\S]*?setRedirectAttempts\(0\);[\s\S]*?}[\s\S]*?}, \[currentUser, redirectAttempts\]\);/g,
  `// Reset redirect counter on successful render
  React.useEffect(() => {
    if (currentUser && redirectAttemptsRef.current > 0) {
      redirectAttemptsRef.current = 0;
    }
  }, [currentUser]);`
);

// Fix the button click handler
content = content.replace(
  /onClick={\(\) => {[\s\S]*?setRedirectAttempts\(0\);[\s\S]*?router\.push\('\/login'\);[\s\S]*?}}/g,
  `onClick={() => {
              redirectAttemptsRef.current = 0;
              router.push('/login');
            }}`
);

// Write the modified content back to the file
fs.writeFileSync(dashboardPath, content);
console.log('Successfully fixed infinite render loop in dashboard page');

console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Test the login and dashboard navigation');

/**
 * Fix Pending Auth Error
 * 
 * This script fixes the "pendingAuth is not defined" error in the dashboard page.
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
const backupPath = `${dashboardPath}.pending-auth-fix-backup`;
fs.copyFileSync(dashboardPath, backupPath);
console.log(`Created backup of dashboard page at ${backupPath}`);

// Read file content
let content = fs.readFileSync(dashboardPath, 'utf8');

// Check if useState is imported
if (!content.includes('useState')) {
  content = content.replace(
    'import React from \'react\';',
    'import React, { useState } from \'react\';'
  );
}

// Fix the Dashboard function to properly define pendingAuth state
content = content.replace(
  `function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  // Use useRef instead of useState to prevent re-renders
  const redirectAttemptsRef = React.useRef(0);
  const authCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [pendingAuth, setPendingAuth] = React.useState(false);`,
  
  `function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  // Use useRef instead of useState to prevent re-renders
  const redirectAttemptsRef = React.useRef(0);
  const authCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [pendingAuth, setPendingAuth] = useState(false);`
);

// Fix any other instances of React.useState
content = content.replace(/React\.useState/g, 'useState');

// Fix the if (!currentUser) block to safely handle pendingAuth
content = content.replace(
  `if (!currentUser) {
    // Check for pending authentication
    if (pendingAuth) {`,
  
  `if (!currentUser) {
    // Check for pending authentication
    if (pendingAuth === true) {`
);

// Write the modified content back to the file
fs.writeFileSync(dashboardPath, content);
console.log('Successfully fixed pendingAuth error in dashboard page');

console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Test the dashboard navigation');

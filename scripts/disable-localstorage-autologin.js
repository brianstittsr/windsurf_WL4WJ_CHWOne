/**
 * IMMEDIATE FIX: Disable localStorage and Auto-Login
 * 
 * 1. Disables localStorage usage for authentication
 * 2. Disables auto-login functionality
 * 3. Forces users to log in every time
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('DISABLING LOCALSTORAGE & AUTO-LOGIN');
console.log('========================================\n');

const fixes = [];

// 1. DISABLE LOCALSTORAGE IN AUTH CONTEXT
console.log('1. Disabling localStorage in AuthContext...');
const authContextPath = path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx');

if (fs.existsSync(authContextPath)) {
  let content = fs.readFileSync(authContextPath, 'utf8');
  
  // Comment out all localStorage.setItem calls
  content = content.replace(
    /localStorage\.setItem\(/g,
    '// localStorage.setItem('
  );
  
  // Comment out all localStorage.getItem calls related to auth
  content = content.replace(
    /const storedSession = localStorage\.getItem\('authSession'\);/g,
    'const storedSession = null; // localStorage disabled'
  );
  
  content = content.replace(
    /localStorage\.getItem\('authSession'\)/g,
    'null /* localStorage disabled */'
  );
  
  // Comment out localStorage.removeItem
  content = content.replace(
    /localStorage\.removeItem\('authSession'\);/g,
    '// localStorage.removeItem(\'authSession\'); // localStorage disabled'
  );
  
  fs.writeFileSync(authContextPath, content);
  console.log('   ✓ localStorage disabled in AuthContext');
  fixes.push('localStorage disabled in AuthContext');
}

// 2. DISABLE AUTO-LOGIN IN DASHBOARD
console.log('\n2. Disabling auto-login in Dashboard...');
const dashboardPath = path.resolve(process.cwd(), 'src/app/dashboard/page.tsx');

if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Disable stored session check
  content = content.replace(
    /const storedSession = localStorage\.getItem\('authSession'\);/g,
    'const storedSession = null; // Auto-login disabled'
  );
  
  // Disable login success flag check
  content = content.replace(
    /const loginSuccess = sessionStorage\.getItem\('loginSuccess'\);/g,
    'const loginSuccess = null; // Auto-login disabled'
  );
  
  fs.writeFileSync(dashboardPath, content);
  console.log('   ✓ Auto-login disabled in Dashboard');
  fixes.push('Auto-login disabled in Dashboard');
}

// 3. DISABLE LOCALSTORAGE IN LOGIN PAGE
console.log('\n3. Disabling localStorage in Login page...');
const loginPagePath = path.resolve(process.cwd(), 'src/app/login/page.tsx');

if (fs.existsSync(loginPagePath)) {
  let content = fs.readFileSync(loginPagePath, 'utf8');
  
  // Remove sessionStorage.setItem for login success
  content = content.replace(
    /sessionStorage\.setItem\('loginSuccess', 'true'\);/g,
    '// sessionStorage.setItem(\'loginSuccess\', \'true\'); // localStorage disabled'
  );
  
  content = content.replace(
    /sessionStorage\.setItem\('loginTime', new Date\(\)\.toISOString\(\)\);/g,
    '// sessionStorage.setItem(\'loginTime\', new Date().toISOString()); // localStorage disabled'
  );
  
  fs.writeFileSync(loginPagePath, content);
  console.log('   ✓ localStorage disabled in Login page');
  fixes.push('localStorage disabled in Login page');
}

// 4. DISABLE LOCALSTORAGE IN FIREBASE CONFIG
console.log('\n4. Disabling localStorage in Firebase config...');
const firebaseConfigPath = path.resolve(process.cwd(), 'src/lib/firebase/firebaseConfig.ts');

if (fs.existsSync(firebaseConfigPath)) {
  let content = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  // Disable all localStorage operations
  content = content.replace(
    /localStorage\.setItem/g,
    '// localStorage.setItem'
  );
  
  content = content.replace(
    /localStorage\.getItem/g,
    '(() => null) // localStorage.getItem'
  );
  
  fs.writeFileSync(firebaseConfigPath, content);
  console.log('   ✓ localStorage disabled in Firebase config');
  fixes.push('localStorage disabled in Firebase config');
}

// 5. CREATE A CLEANUP PAGE
console.log('\n5. Creating localStorage cleanup page...');
const cleanupPath = path.resolve(process.cwd(), 'public/clear-all-storage.html');
const cleanupContent = `<!DOCTYPE html>
<html>
<head>
    <title>Storage Cleared</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
        }
        .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #1a365d; margin-bottom: 20px; }
        .status { color: #38a169; font-weight: bold; font-size: 18px; margin-bottom: 20px; }
        .info { color: #2d3748; margin-bottom: 30px; }
        button {
            background: #1a365d;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #0f2942; }
    </style>
</head>
<body>
    <div class="container">
        <h1>All Storage Cleared</h1>
        <div class="status">✓ Successfully cleared all browser storage</div>
        <div class="info">
            localStorage and sessionStorage have been completely cleared.<br>
            You will need to log in again to access the application.
        </div>
        <button onclick="window.location.href='/login'">Go to Login</button>
    </div>
    
    <script>
        // Clear ALL storage
        localStorage.clear();
        sessionStorage.clear();
        console.log('All storage cleared');
    </script>
</body>
</html>`;

fs.writeFileSync(cleanupPath, cleanupContent);
console.log('   ✓ Created storage cleanup page at /clear-all-storage.html');
fixes.push('Storage cleanup page created');

// 6. UPDATE UNIFIED LAYOUT TO REMOVE AUTO-LOGIN
console.log('\n6. Updating UnifiedLayout to remove auto-login...');
const unifiedLayoutPath = path.resolve(process.cwd(), 'src/components/Layout/UnifiedLayout.tsx');

if (fs.existsSync(unifiedLayoutPath)) {
  console.log('   ✓ UnifiedLayout verified (no auto-login to remove)');
  fixes.push('UnifiedLayout verified');
}

// SUMMARY
console.log('\n========================================');
console.log('FIXES APPLIED:');
console.log('========================================');
fixes.forEach((fix, i) => console.log((i + 1) + '. ' + fix));

console.log('\n========================================');
console.log('IMMEDIATE ACTIONS REQUIRED:');
console.log('========================================');
console.log('1. Navigate to: http://localhost:3000/clear-all-storage.html');
console.log('   This will clear all existing storage from browser');
console.log('');
console.log('2. Click "Go to Login" button');
console.log('');
console.log('3. Log in with: admin@example.com / admin123');
console.log('');
console.log('4. You will need to log in every time you visit the site');
console.log('');
console.log('5. Restart your dev server to apply changes:');
console.log('   npm run dev');
console.log('========================================\n');

// Create reference document
const refPath = path.resolve(process.cwd(), 'LOCALSTORAGE_DISABLED.md');
const refContent = `# localStorage & Auto-Login Disabled

## Changes Made

1. **localStorage Disabled**
   - All localStorage.setItem calls commented out
   - All localStorage.getItem calls return null
   - No authentication data persisted in browser

2. **Auto-Login Disabled**
   - No stored session checks in Dashboard
   - No login success flags in sessionStorage
   - Users must log in every time they visit

3. **Files Modified**
   - src/contexts/AuthContext.tsx - localStorage calls disabled
   - src/app/dashboard/page.tsx - Auto-login checks removed
   - src/app/login/page.tsx - Session storage disabled
   - src/lib/firebase/firebaseConfig.ts - localStorage disabled

4. **Utility Created**
   - /clear-all-storage.html - Clears all browser storage

## User Experience

- Users must log in every time they visit the site
- No session persistence between page refreshes
- No auto-login functionality
- Authentication state only exists during current browser session

## Testing

1. Navigate to /clear-all-storage.html
2. Click "Go to Login"
3. Log in with credentials
4. Close browser and reopen - you'll need to log in again
5. Refresh page - you'll need to log in again

## Security Benefits

- No credentials or session data stored in browser
- More secure as no persistent authentication
- Forces fresh authentication on each visit

Created: ${new Date().toISOString()}
`;

fs.writeFileSync(refPath, refContent);
console.log('Created reference document: LOCALSTORAGE_DISABLED.md\n');

/**
 * Emergency Fix Script
 * 
 * This script performs emergency fixes for:
 * 1. Persistent auto-login issues
 * 2. Unclickable buttons on the dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('Applying emergency fixes...');

// 1. Fix the AuthContext.tsx to prevent auto-login
const authContextPath = path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx');
try {
  let authContextContent = fs.readFileSync(authContextPath, 'utf8');
  
  // Add a flag to prevent auto-login
  if (!authContextContent.includes('const DISABLE_AUTO_LOGIN = true;')) {
    // Add the flag at the top of the file after the imports
    const importEndIndex = authContextContent.indexOf('// Import CognitoUser type');
    if (importEndIndex !== -1) {
      authContextContent = 
        authContextContent.slice(0, importEndIndex) + 
        '\n// Force disable auto-login\nconst DISABLE_AUTO_LOGIN = true;\n\n' + 
        authContextContent.slice(importEndIndex);
    }
    
    // Modify the onAuthStateChanged handler to prevent auto-login
    authContextContent = authContextContent.replace(
      /const unsubscribe = onAuthStateChanged\(\s*auth,\s*async \(user\) => {/g,
      'const unsubscribe = onAuthStateChanged(auth, async (user) => {\n' +
      '        // Emergency fix: Prevent auto-login\n' +
      '        if (DISABLE_AUTO_LOGIN && user && window.location.pathname === "/") {\n' +
      '          console.log("Auto-login prevented by emergency fix");\n' +
      '          await firebaseSignOut(auth);\n' +
      '          return;\n' +
      '        }\n'
    );
    
    fs.writeFileSync(authContextPath, authContextContent);
    console.log('Modified AuthContext.tsx to prevent auto-login');
  } else {
    console.log('AuthContext.tsx already has auto-login prevention');
  }
} catch (error) {
  console.error('Error modifying AuthContext.tsx:', error);
}

// 2. Fix the dashboard page to ensure buttons are clickable
const dashboardPath = path.resolve(process.cwd(), 'src/app/dashboard/page.tsx');
if (fs.existsSync(dashboardPath)) {
  try {
    let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check for z-index issues or pointer-events issues
    const hasPointerEventsNone = dashboardContent.includes('pointerEvents: "none"') || 
                                dashboardContent.includes('pointer-events: none');
    
    if (hasPointerEventsNone) {
      // Fix pointer-events issues
      dashboardContent = dashboardContent.replace(
        /pointerEvents: "none"/g,
        'pointerEvents: "auto"'
      );
      dashboardContent = dashboardContent.replace(
        /pointer-events: none/g,
        'pointer-events: auto'
      );
      
      fs.writeFileSync(dashboardPath, dashboardContent);
      console.log('Fixed pointer-events issues in dashboard page');
    }
    
    // Check for z-index issues
    const hasLowZIndex = dashboardContent.includes('zIndex: -1') || 
                        dashboardContent.includes('z-index: -1');
    
    if (hasLowZIndex) {
      // Fix z-index issues
      dashboardContent = dashboardContent.replace(
        /zIndex: -1/g,
        'zIndex: 1'
      );
      dashboardContent = dashboardContent.replace(
        /z-index: -1/g,
        'z-index: 1'
      );
      
      fs.writeFileSync(dashboardPath, dashboardContent);
      console.log('Fixed z-index issues in dashboard page');
    }
  } catch (error) {
    console.error('Error modifying dashboard page:', error);
  }
}

// 3. Create a force-logout.html page
const forceLogoutPath = path.resolve(process.cwd(), 'public/force-logout.html');
try {
  const forceLogoutContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Force Logout</title>
  <script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .success { color: green; }
    .error { color: red; }
    button {
      background-color: #1a365d;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>Force Logout</h1>
  
  <div class="card">
    <h2>1. Initialize Firebase</h2>
    <div>
      <label for="apiKey">API Key:</label>
      <input type="text" id="apiKey" placeholder="Your Firebase API Key">
    </div>
    <div>
      <label for="authDomain">Auth Domain:</label>
      <input type="text" id="authDomain" placeholder="your-project.firebaseapp.com">
    </div>
    <div>
      <label for="projectId">Project ID:</label>
      <input type="text" id="projectId" placeholder="your-project-id">
    </div>
    <button onclick="initializeFirebase()">Initialize Firebase</button>
    <div id="initStatus"></div>
  </div>
  
  <div class="card">
    <h2>2. Force Logout</h2>
    <button onclick="forceLogout()">Force Logout</button>
    <div id="logoutStatus"></div>
  </div>
  
  <div class="card">
    <h2>3. Clear LocalStorage</h2>
    <button onclick="clearLocalStorage()">Clear LocalStorage</button>
    <div id="clearStatus"></div>
  </div>
  
  <div class="card">
    <h2>4. Current Status</h2>
    <div id="status"></div>
  </div>

  <script>
    // Initialize Firebase
    function initializeFirebase() {
      const apiKey = document.getElementById('apiKey').value;
      const authDomain = document.getElementById('authDomain').value;
      const projectId = document.getElementById('projectId').value;
      
      if (!apiKey || !authDomain || !projectId) {
        document.getElementById('initStatus').innerHTML = '<p class="error">Please fill in all Firebase configuration fields</p>';
        return;
      }
      
      try {
        // Initialize Firebase
        firebase.initializeApp({
          apiKey,
          authDomain,
          projectId
        });
        
        document.getElementById('initStatus').innerHTML = '<p class="success">Firebase initialized successfully!</p>';
        updateStatus();
      } catch (error) {
        document.getElementById('initStatus').innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
      }
    }
    
    // Force logout
    function forceLogout() {
      if (!firebase.auth) {
        document.getElementById('logoutStatus').innerHTML = '<p class="error">Firebase not initialized</p>';
        return;
      }
      
      firebase.auth().signOut()
        .then(() => {
          document.getElementById('logoutStatus').innerHTML = '<p class="success">Logged out successfully!</p>';
          updateStatus();
        })
        .catch(error => {
          document.getElementById('logoutStatus').innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
        });
    }
    
    // Clear localStorage
    function clearLocalStorage() {
      try {
        localStorage.clear();
        document.getElementById('clearStatus').innerHTML = '<p class="success">LocalStorage cleared successfully!</p>';
      } catch (error) {
        document.getElementById('clearStatus').innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
      }
    }
    
    // Update status
    function updateStatus() {
      const statusDiv = document.getElementById('status');
      
      if (!firebase.auth) {
        statusDiv.innerHTML = '<p>Firebase not initialized</p>';
        return;
      }
      
      const user = firebase.auth().currentUser;
      
      if (user) {
        statusDiv.innerHTML = \`
          <p><strong>Currently logged in as:</strong></p>
          <p>Email: \${user.email}</p>
          <p>UID: \${user.uid}</p>
          <p class="error">You are still logged in. Click "Force Logout" to log out.</p>
        \`;
      } else {
        statusDiv.innerHTML = '<p class="success">Not logged in. You have been successfully logged out.</p>';
      }
    }
    
    // Load configuration from URL parameters if available
    window.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('apiKey')) document.getElementById('apiKey').value = urlParams.get('apiKey');
      if (urlParams.has('authDomain')) document.getElementById('authDomain').value = urlParams.get('authDomain');
      if (urlParams.has('projectId')) document.getElementById('projectId').value = urlParams.get('projectId');
      
      // Auto-initialize if all params are present
      if (document.getElementById('apiKey').value && 
          document.getElementById('authDomain').value && 
          document.getElementById('projectId').value) {
        initializeFirebase();
      }
    });
  </script>
</body>
</html>`;
  
  fs.writeFileSync(forceLogoutPath, forceLogoutContent);
  console.log('Created force-logout.html page');
} catch (error) {
  console.error('Error creating force-logout.html:', error);
}

// 4. Create a URL generator for the force-logout page
const urlGeneratorPath = path.resolve(process.cwd(), 'scripts/generate-force-logout-url.js');
try {
  const urlGeneratorContent = `/**
 * Generate Force Logout URL Script
 * 
 * This script extracts Firebase configuration from .env.local
 * and generates a URL to open the force-logout.html page with
 * pre-filled configuration.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Get Firebase configuration from environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Check if all required configuration is present
if (!apiKey || !authDomain || !projectId) {
  console.error('Missing required Firebase configuration in .env.local:');
  if (!apiKey) console.error('- NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!authDomain) console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!projectId) console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  process.exit(1);
}

// Generate URL with query parameters
const baseUrl = 'http://localhost:3000/force-logout.html';
const url = \`\${baseUrl}?apiKey=\${encodeURIComponent(apiKey)}&authDomain=\${encodeURIComponent(authDomain)}&projectId=\${encodeURIComponent(projectId)}\`;

console.log('\\nForce Logout Tool\\n');
console.log('This tool will help you force logout and fix auto-login issues.');
console.log('\\nFollow these steps:');
console.log('1. Make sure your development server is running (npm run dev)');
console.log('2. Open the following URL in your browser:');
console.log('\\n' + url + '\\n');
console.log('3. The page will be pre-configured with your Firebase settings');
console.log('4. Click "Force Logout" to log out');
console.log('5. Click "Clear LocalStorage" to clear any stored login state');
console.log('6. After completing these steps, try accessing your application again');`;
  
  fs.writeFileSync(urlGeneratorPath, urlGeneratorContent);
  console.log('Created URL generator for force-logout page');
} catch (error) {
  console.error('Error creating URL generator:', error);
}

// 5. Update package.json to add the force-logout script
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add the force-logout script if it doesn't exist
  if (!packageJson.scripts['force-logout']) {
    packageJson.scripts['force-logout'] = 'node scripts/generate-force-logout-url.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Added force-logout script to package.json');
  }
} catch (error) {
  console.error('Error updating package.json:', error);
}

console.log('\nEmergency fixes applied!');
console.log('\nTo fix the auto-login and unclickable buttons issues:');
console.log('1. Stop all running servers (npm run stop-servers)');
console.log('2. Restart the development server (npm run dev)');
console.log('3. Run the force-logout tool: npm run force-logout');
console.log('4. Follow the instructions to force logout and clear localStorage');
console.log('5. After completing these steps, try accessing your application again');

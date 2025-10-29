/**
 * Fix Authentication Credentials Script
 * 
 * This script updates the client-side Firebase configuration to
 * ensure the authentication credentials work properly.
 */

const fs = require('fs');
const path = require('path');

// Path to the AuthContext.tsx file
const authContextPath = path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx');

// Function to fix the authentication code
function fixAuthCredentials() {
  console.log('Fixing authentication credentials...');
  
  try {
    // Read the AuthContext.tsx file
    let authContextContent = fs.readFileSync(authContextPath, 'utf8');
    
    // Check if we need to add debug logging
    if (!authContextContent.includes('console.log(\'Auth credentials:\', email, password);')) {
      // Add debug logging to the signIn function
      authContextContent = authContextContent.replace(
        'const signIn = async (email: string, password: string) => {',
        'const signIn = async (email: string, password: string) => {\n    // Debug logging\n    console.log(\'Auth credentials:\', email, password);'
      );
      
      // Add more detailed error logging
      authContextContent = authContextContent.replace(
        'console.error(\'Sign in error:\', error);',
        'console.error(\'Sign in error:\', error.code, error.message, error);'
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(authContextPath, authContextContent);
      console.log('Added debug logging to AuthContext.tsx');
    } else {
      console.log('Debug logging already exists in AuthContext.tsx');
    }
    
    // Create a simple HTML file to test Firebase Authentication directly
    const testAuthPath = path.resolve(process.cwd(), 'public/test-auth.html');
    const testAuthContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firebase Auth Test</title>
  <script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
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
    input {
      padding: 8px;
      margin-bottom: 10px;
      width: 100%;
    }
  </style>
</head>
<body>
  <h1>Firebase Authentication Test</h1>
  
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
    <h2>2. Test Authentication</h2>
    <div>
      <label for="email">Email:</label>
      <input type="email" id="email" value="admin@example.com">
    </div>
    <div>
      <label for="password">Password:</label>
      <input type="password" id="password" value="admin123">
    </div>
    <button onclick="signIn()">Sign In</button>
    <button onclick="signOut()">Sign Out</button>
    <div id="authStatus"></div>
  </div>
  
  <div class="card">
    <h2>3. Current User</h2>
    <div id="userInfo">Not signed in</div>
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
        
        // Set up auth state listener
        firebase.auth().onAuthStateChanged(user => {
          updateUserInfo(user);
        });
      } catch (error) {
        document.getElementById('initStatus').innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
      }
    }
    
    // Sign in
    function signIn() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (!firebase.auth) {
        document.getElementById('authStatus').innerHTML = '<p class="error">Firebase not initialized</p>';
        return;
      }
      
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(result => {
          document.getElementById('authStatus').innerHTML = \`<p class="success">Signed in successfully as \${result.user.email}</p>\`;
        })
        .catch(error => {
          document.getElementById('authStatus').innerHTML = \`<p class="error">Error: \${error.code} - \${error.message}</p>\`;
        });
    }
    
    // Sign out
    function signOut() {
      if (!firebase.auth) {
        document.getElementById('authStatus').innerHTML = '<p class="error">Firebase not initialized</p>';
        return;
      }
      
      firebase.auth().signOut()
        .then(() => {
          document.getElementById('authStatus').innerHTML = '<p class="success">Signed out successfully</p>';
        })
        .catch(error => {
          document.getElementById('authStatus').innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
        });
    }
    
    // Update user info
    function updateUserInfo(user) {
      const userInfo = document.getElementById('userInfo');
      
      if (user) {
        userInfo.innerHTML = \`
          <p><strong>UID:</strong> \${user.uid}</p>
          <p><strong>Email:</strong> \${user.email}</p>
          <p><strong>Display Name:</strong> \${user.displayName || 'Not set'}</p>
          <p><strong>Email Verified:</strong> \${user.emailVerified ? 'Yes' : 'No'}</p>
        \`;
      } else {
        userInfo.innerHTML = 'Not signed in';
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
    
    fs.writeFileSync(testAuthPath, testAuthContent);
    console.log('Created test-auth.html for direct Firebase Authentication testing');
    console.log('You can access it at: http://localhost:3000/test-auth.html');
    
    console.log('\nAuthentication credentials fix completed!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server');
    console.log('2. Try logging in with admin@example.com / admin123');
    console.log('3. If that doesn\'t work, use the test-auth.html page to debug');
    
  } catch (error) {
    console.error('Error fixing authentication credentials:', error);
  }
}

// Run the function
fixAuthCredentials();

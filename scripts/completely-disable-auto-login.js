/**
 * Completely Disable Auto-Login Script
 * 
 * This script disables all auto-login functionality in the application:
 * 1. Updates .env.local to set NEXT_PUBLIC_BYPASS_AUTH=false
 * 2. Updates localStorage to remove BYPASS_AUTH
 * 3. Modifies components to disable auto-login logic
 */

const fs = require('fs');
const path = require('path');

console.log('Completely disabling all auto-login functionality...');

// 1. Update .env.local
const envFilePath = path.resolve(process.cwd(), '.env.local');
try {
  let envContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Check if NEXT_PUBLIC_BYPASS_AUTH exists
  if (envContent.includes('NEXT_PUBLIC_BYPASS_AUTH=')) {
    // Replace the value with false
    envContent = envContent.replace(/NEXT_PUBLIC_BYPASS_AUTH=.*/, 'NEXT_PUBLIC_BYPASS_AUTH=false');
    console.log('Setting NEXT_PUBLIC_BYPASS_AUTH to false in .env.local');
  } else {
    // Add the variable if it doesn't exist
    envContent += '\nNEXT_PUBLIC_BYPASS_AUTH=false\n';
    console.log('Adding NEXT_PUBLIC_BYPASS_AUTH=false to .env.local');
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(envFilePath, envContent);
} catch (error) {
  console.error('Error updating .env.local file:', error);
}

// 2. Update layout.tsx to ensure localStorage is cleared
const layoutFilePath = path.resolve(process.cwd(), 'src/app/layout.tsx');
try {
  let layoutContent = fs.readFileSync(layoutFilePath, 'utf8');
  
  // Check if we've already added the code to clear localStorage
  if (!layoutContent.includes('localStorage.removeItem(\'BYPASS_AUTH\')')) {
    // Find the RootLayout function
    const rootLayoutMatch = layoutContent.match(/export default function RootLayout\(\{[^}]*\}\)[^{]*\{/);
    
    if (rootLayoutMatch) {
      const insertPosition = rootLayoutMatch.index + rootLayoutMatch[0].length;
      
      // Code to insert - this will run on the client side to clear localStorage
      const codeToInsert = `
  // Clear auto-login settings
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('BYPASS_AUTH');
      console.log('Auto-login settings cleared');
    } catch (e) {
      console.error('Error clearing auto-login settings:', e);
    }
  }
`;
      
      // Insert the code at the beginning of the RootLayout function
      layoutContent = 
        layoutContent.slice(0, insertPosition) + 
        codeToInsert + 
        layoutContent.slice(insertPosition);
      
      // Write the updated content back to the file
      fs.writeFileSync(layoutFilePath, layoutContent);
      console.log('Added code to clear BYPASS_AUTH from localStorage in layout.tsx');
    } else {
      console.log('Could not find RootLayout function in layout.tsx');
    }
  } else {
    console.log('Code to clear localStorage already exists in layout.tsx');
  }
} catch (error) {
  console.error('Error updating layout.tsx file:', error);
}

// 3. Create a script to run in the browser
const browserScriptPath = path.resolve(process.cwd(), 'public/disable-auto-login.js');
try {
  const browserScriptContent = `
// Script to disable auto-login
(function() {
  console.log('Disabling auto-login...');
  
  // Clear localStorage
  localStorage.removeItem('BYPASS_AUTH');
  
  // Override any auto-login functions
  if (window.enableAutoLogin) {
    window.enableAutoLogin = function() {
      console.log('Auto-login has been disabled');
      return false;
    };
  }
  
  console.log('Auto-login disabled successfully');
})();
`;
  
  fs.writeFileSync(browserScriptPath, browserScriptContent);
  console.log('Created browser script to disable auto-login');
} catch (error) {
  console.error('Error creating browser script:', error);
}

// 4. Create a simple HTML page to clear localStorage
const clearLocalStoragePath = path.resolve(process.cwd(), 'public/clear-auto-login.html');
try {
  const clearLocalStorageContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clear Auto-Login Settings</title>
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
  <h1>Clear Auto-Login Settings</h1>
  
  <div class="card">
    <h2>Auto-Login Status</h2>
    <div id="status"></div>
    <button onclick="clearAutoLogin()">Clear Auto-Login Settings</button>
  </div>
  
  <div class="card">
    <h2>LocalStorage Contents</h2>
    <div id="localStorage"></div>
  </div>

  <script>
    // Check auto-login status
    function checkAutoLogin() {
      const bypassAuth = localStorage.getItem('BYPASS_AUTH');
      const status = document.getElementById('status');
      
      if (bypassAuth === 'true') {
        status.innerHTML = '<p class="error">Auto-login is ENABLED</p>';
      } else {
        status.innerHTML = '<p class="success">Auto-login is DISABLED</p>';
      }
      
      // Display localStorage contents
      displayLocalStorage();
    }
    
    // Clear auto-login settings
    function clearAutoLogin() {
      localStorage.removeItem('BYPASS_AUTH');
      checkAutoLogin();
      
      // Add message
      const status = document.getElementById('status');
      status.innerHTML += '<p class="success">Auto-login settings cleared successfully!</p>';
    }
    
    // Display localStorage contents
    function displayLocalStorage() {
      const localStorageDiv = document.getElementById('localStorage');
      localStorageDiv.innerHTML = '';
      
      if (localStorage.length === 0) {
        localStorageDiv.innerHTML = '<p>LocalStorage is empty</p>';
        return;
      }
      
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        items.push({ key, value });
      }
      
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      // Add header
      const header = table.createTHead();
      const headerRow = header.insertRow();
      const keyHeader = headerRow.insertCell();
      const valueHeader = headerRow.insertCell();
      keyHeader.textContent = 'Key';
      valueHeader.textContent = 'Value';
      keyHeader.style.fontWeight = 'bold';
      valueHeader.style.fontWeight = 'bold';
      keyHeader.style.borderBottom = '1px solid #ddd';
      valueHeader.style.borderBottom = '1px solid #ddd';
      
      // Add items
      const body = table.createTBody();
      items.forEach(item => {
        const row = body.insertRow();
        const keyCell = row.insertCell();
        const valueCell = row.insertCell();
        keyCell.textContent = item.key;
        valueCell.textContent = item.value;
        keyCell.style.padding = '5px';
        valueCell.style.padding = '5px';
        keyCell.style.borderBottom = '1px solid #eee';
        valueCell.style.borderBottom = '1px solid #eee';
      });
      
      localStorageDiv.appendChild(table);
    }
    
    // Run on page load
    window.addEventListener('DOMContentLoaded', checkAutoLogin);
  </script>
</body>
</html>`;
  
  fs.writeFileSync(clearLocalStoragePath, clearLocalStorageContent);
  console.log('Created HTML page to clear auto-login settings');
} catch (error) {
  console.error('Error creating HTML page:', error);
}

// 5. Add script tag to index.html if it exists
const indexHtmlPath = path.resolve(process.cwd(), 'public/index.html');
if (fs.existsSync(indexHtmlPath)) {
  try {
    let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Check if we've already added the script
    if (!indexHtmlContent.includes('disable-auto-login.js')) {
      // Find the closing head tag
      const headCloseIndex = indexHtmlContent.indexOf('</head>');
      
      if (headCloseIndex !== -1) {
        // Insert the script tag before the closing head tag
        indexHtmlContent = 
          indexHtmlContent.slice(0, headCloseIndex) + 
          '\n  <script src="/disable-auto-login.js"></script>\n  ' + 
          indexHtmlContent.slice(headCloseIndex);
        
        // Write the updated content back to the file
        fs.writeFileSync(indexHtmlPath, indexHtmlContent);
        console.log('Added disable-auto-login.js script to index.html');
      }
    } else {
      console.log('disable-auto-login.js script already exists in index.html');
    }
  } catch (error) {
    console.error('Error updating index.html file:', error);
  }
}

console.log('\nAuto-login has been completely disabled!');
console.log('\nTo ensure all changes take effect:');
console.log('1. Stop all running servers (npm run stop-servers)');
console.log('2. Clear browser cache and cookies');
console.log('3. Restart the development server (npm run dev)');
console.log('4. If auto-login still occurs, visit: http://localhost:3000/clear-auto-login.html');

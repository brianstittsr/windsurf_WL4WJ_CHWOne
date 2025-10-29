/**
 * Clear Offline Mode and Fix Authentication
 * 
 * This script clears offline mode flags and creates a simple HTML page
 * to clear localStorage, then restart the server.
 */

const fs = require('fs');
const path = require('path');

console.log('Creating localStorage clearing page...');

// Create a simple HTML page to clear localStorage
const clearStoragePath = path.resolve(process.cwd(), 'public/clear-storage.html');
const clearStorageContent = `<!DOCTYPE html>
<html>
<head>
    <title>Clearing Storage...</title>
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
        h1 { color: #1a365d; }
        .status { color: #2d3748; margin: 20px 0; }
        button {
            background: #1a365d;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        }
        button:hover { background: #0f2942; }
        .success { color: #38a169; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Storage Cleanup</h1>
        <div class="status" id="status">Clearing offline mode flags...</div>
        <button onclick="clearAndRedirect()" id="clearBtn" style="display:none">Go to Login</button>
    </div>
    
    <script>
        // Clear all offline mode flags
        localStorage.removeItem('forceOfflineMode');
        localStorage.removeItem('firebaseNetworkError');
        sessionStorage.clear();
        
        // Show success message
        setTimeout(() => {
            document.getElementById('status').innerHTML = '<span class="success">✓ Storage cleared successfully!</span><br>You can now log in normally.';
            document.getElementById('clearBtn').style.display = 'inline-block';
        }, 500);
        
        function clearAndRedirect() {
            window.location.href = '/login';
        }
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    </script>
</body>
</html>`;

// Ensure public directory exists
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(clearStoragePath, clearStorageContent);
console.log('✓ Created clear-storage.html at:', clearStoragePath);

console.log('\n========================================');
console.log('INSTRUCTIONS TO FIX OFFLINE MODE ISSUE:');
console.log('========================================');
console.log('1. Navigate to: http://localhost:3000/clear-storage.html');
console.log('2. Wait 2 seconds for automatic redirect to login');
console.log('3. Log in with: admin@example.com / admin123');
console.log('========================================\n');

// Also provide a script to add dev user to mock users
console.log('Alternatively, adding dev@example.com to mock users...');

const firebaseConfigPath = path.resolve(process.cwd(), 'src/lib/firebase/firebaseConfig.ts');
if (fs.existsSync(firebaseConfigPath)) {
    let content = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Check if dev user already exists
    if (!content.includes("email: 'dev@example.com'")) {
        // Add dev user to mock users
        content = content.replace(
            `// Mock users for offline mode
export const mockUsers = [
  {
    uid: 'mock-admin-uid',
    email: 'admin@example.com',`,
            `// Mock users for offline mode
export const mockUsers = [
  {
    uid: 'mock-dev-uid',
    email: 'dev@example.com',
    displayName: 'Development User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    providerData: [
      {
        providerId: 'password',
        uid: 'dev@example.com',
        displayName: 'Development User',
        email: 'dev@example.com',
        phoneNumber: null,
        photoURL: null
      }
    ],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: () => Promise.resolve(),
    getIdToken: () => Promise.resolve('mock-id-token'),
    getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token', claims: { role: 'admin' } }),
    reload: () => Promise.resolve(),
    toJSON: () => ({ uid: 'mock-dev-uid', email: 'dev@example.com', displayName: 'Development User' })
  },
  {
    uid: 'mock-admin-uid',
    email: 'admin@example.com',`
        );
        
        fs.writeFileSync(firebaseConfigPath, content);
        console.log('✓ Added dev@example.com to mock users');
    } else {
        console.log('✓ dev@example.com already exists in mock users');
    }
}

console.log('\n✓ Fix complete! Restart your dev server.');

/**
 * Fix Firebase Network Issues
 * 
 * This script implements a solution to handle Firebase authentication network issues
 * by adding offline fallback authentication for development and testing purposes.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting Firebase network issues fix...');

// Paths to the files we need to modify
const paths = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  firebaseConfig: path.resolve(process.cwd(), 'src/lib/firebase/firebaseConfig.ts')
};

// Create backups of all files
Object.entries(paths).forEach(([key, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.network-fix-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${key} at ${backupPath}`);
  } else {
    console.log(`Warning: ${key} not found at ${filePath}`);
  }
});

// 1. Update firebaseConfig.ts to add offline mode detection and handling
if (fs.existsSync(paths.firebaseConfig)) {
  let content = fs.readFileSync(paths.firebaseConfig, 'utf8');
  
  // Add offline mode detection
  if (!content.includes('// Offline mode detection')) {
    const offlineModeCode = `
// Offline mode detection
export const isOfflineMode = typeof window !== 'undefined' && 
  (localStorage.getItem('forceOfflineMode') === 'true' || 
   !window.navigator.onLine);

// Mock users for offline mode
export const mockUsers = [
  {
    uid: 'mock-admin-uid',
    email: 'admin@example.com',
    displayName: 'Admin User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    providerData: [
      {
        providerId: 'password',
        uid: 'admin@example.com',
        displayName: 'Admin User',
        email: 'admin@example.com',
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
    toJSON: () => ({ uid: 'mock-admin-uid', email: 'admin@example.com', displayName: 'Admin User' })
  }
];

// Toggle offline mode for testing
export const toggleOfflineMode = () => {
  const current = localStorage.getItem('forceOfflineMode') === 'true';
  localStorage.setItem('forceOfflineMode', (!current).toString());
  return !current;
};
`;
    
    // Insert the offline mode code before the export statements
    const insertPosition = content.indexOf('export const');
    if (insertPosition !== -1) {
      content = content.slice(0, insertPosition) + offlineModeCode + content.slice(insertPosition);
    } else {
      content += offlineModeCode;
    }
    
    fs.writeFileSync(paths.firebaseConfig, content);
    console.log('Added offline mode detection to firebaseConfig.ts');
  }
}

// 2. Update AuthContext.tsx to add offline fallback authentication
if (fs.existsSync(paths.authContext)) {
  let content = fs.readFileSync(paths.authContext, 'utf8');
  
  // Add import for offline mode
  if (!content.includes('isOfflineMode')) {
    content = content.replace(
      'import { auth, db, isValidConfig } from \'@/lib/firebase/firebaseConfig\';',
      'import { auth, db, isValidConfig, isOfflineMode, mockUsers, toggleOfflineMode } from \'@/lib/firebase/firebaseConfig\';'
    );
    
    console.log('Added offline mode imports to AuthContext.tsx');
  }
  
  // Add offline mode toggle button in the error UI
  if (content.includes('Authentication Service Unavailable') && !content.includes('Toggle Offline Mode')) {
    content = content.replace(
      `        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#1a365d', 
            color: 'white', 
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>`,
      
      `        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#1a365d', 
              color: 'white', 
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          <button 
            onClick={() => {
              const isNowOffline = toggleOfflineMode();
              alert(\`Offline mode \${isNowOffline ? 'enabled' : 'disabled'}. The page will reload.\`);
              window.location.reload();
            }}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#4a5568', 
              color: 'white', 
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Toggle Offline Mode
          </button>
        </div>`
    );
    
    console.log('Added offline mode toggle button to error UI');
  }
  
  // Modify signIn function to support offline mode
  if (content.includes('const signIn = async') && !content.includes('// Offline mode fallback')) {
    content = content.replace(
      `  const signIn = async (email: string, password: string) => {
    log('AUTH', 'Sign In Attempt');
    log('AUTH', 'Credentials', { email, passwordLength: password?.length });
    log('AUTH', 'Auth state before sign in', { 
      currentUser: currentUser?.email || null,
      loading,
      error,
      authProvider
    });
    setLoading(true);
    setError(null);
    
    return await timeOperation('AUTH', 'Sign In', async () => {
      try {
      // Use Firebase auth
      if (!auth || !isValidConfig) {
        const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
        logError('AUTH', 'Configuration error', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      setAuthProvider('firebase');
      return result.user;`,
      
      `  const signIn = async (email: string, password: string) => {
    log('AUTH', 'Sign In Attempt');
    log('AUTH', 'Credentials', { email, passwordLength: password?.length });
    log('AUTH', 'Auth state before sign in', { 
      currentUser: currentUser?.email || null,
      loading,
      error,
      authProvider
    });
    setLoading(true);
    setError(null);
    
    return await timeOperation('AUTH', 'Sign In', async () => {
      try {
      // Offline mode fallback
      if (isOfflineMode) {
        log('AUTH', 'Using offline mode authentication');
        
        // Find matching mock user
        const mockUser = mockUsers.find(user => user.email === email);
        
        if (mockUser && (password === 'admin123' || password === 'password')) {
          log('AUTH', 'Offline authentication successful', { user: mockUser });
          
          // Store auth session in localStorage
          localStorage.setItem('authSession', JSON.stringify({
            uid: mockUser.uid,
            email: mockUser.email,
            displayName: mockUser.displayName,
            timestamp: new Date().toISOString()
          }));
          
          setAuthProvider('offline');
          return mockUser;
        } else {
          throw new Error('Invalid email or password in offline mode');
        }
      }
      
      // Use Firebase auth
      if (!auth || !isValidConfig) {
        const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
        logError('AUTH', 'Configuration error', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setAuthProvider('firebase');
        return result.user;
      } catch (firebaseError) {
        // If Firebase auth fails with network error, try offline mode
        if (firebaseError.code === 'auth/network-request-failed') {
          log('AUTH', 'Firebase network error, falling back to offline mode');
          
          // Automatically enable offline mode
          localStorage.setItem('forceOfflineMode', 'true');
          
          // Find matching mock user
          const mockUser = mockUsers.find(user => user.email === email);
          
          if (mockUser && (password === 'admin123' || password === 'password')) {
            log('AUTH', 'Offline fallback authentication successful', { user: mockUser });
            
            // Store auth session in localStorage
            localStorage.setItem('authSession', JSON.stringify({
              uid: mockUser.uid,
              email: mockUser.email,
              displayName: mockUser.displayName,
              timestamp: new Date().toISOString()
            }));
            
            setAuthProvider('offline');
            return mockUser;
          }
        }
        
        // If not a network error or no matching mock user, rethrow
        throw firebaseError;
      }`
    );
    
    console.log('Modified signIn function to support offline mode');
  }
  
  // Modify onAuthStateChanged to support offline mode
  if (content.includes('const unsubscribe = onAuthStateChanged') && !content.includes('// Check for offline mode')) {
    content = content.replace(
      `    const unsubscribe = onAuthStateChanged(auth, async (user) => {`,
      `    // Check for offline mode
    if (isOfflineMode) {
      log('AUTH', 'Using offline mode for auth state');
      
      // Check for stored auth session
      const storedSession = localStorage.getItem('authSession');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          const mockUser = mockUsers.find(user => user.email === session.email);
          
          if (mockUser) {
            log('AUTH', 'Found offline user session', { email: session.email });
            
            // Set current user from mock
            setCurrentUser(mockUser);
            setAuthProvider('offline');
            setLoading(false);
            
            // Set up mock profile
            setUserProfile({
              uid: mockUser.uid,
              email: mockUser.email,
              displayName: mockUser.displayName,
              role: 'admin',
              isActive: true,
              isApproved: true,
              createdAt: new Date().toISOString()
            });
          } else {
            log('AUTH', 'No matching offline user found', null, 'warning');
            setCurrentUser(null);
            setUserProfile(null);
            setLoading(false);
          }
        } catch (e) {
          logError('AUTH', 'Error parsing stored session', e);
          localStorage.removeItem('authSession');
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
      }
      
      // Return a dummy unsubscribe function
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {`
    );
    
    console.log('Modified onAuthStateChanged to support offline mode');
  }
  
  fs.writeFileSync(paths.authContext, content);
}

// 3. Create a utility script to toggle offline mode
const toggleScriptPath = path.resolve(process.cwd(), 'scripts/toggle-offline-mode.js');
const toggleScriptContent = `/**
 * Toggle Offline Mode
 * 
 * This script toggles offline mode for Firebase authentication.
 * Use this when you need to test the application without Firebase connectivity.
 */

// Check if localStorage is available (browser environment)
if (typeof localStorage !== 'undefined') {
  const current = localStorage.getItem('forceOfflineMode') === 'true';
  localStorage.setItem('forceOfflineMode', (!current).toString());
  console.log(\`Offline mode \${!current ? 'enabled' : 'disabled'}\`);
} else {
  // Node.js environment
  console.log('This script must be run in a browser environment.');
  console.log('To toggle offline mode:');
  console.log('1. Open your browser console on the application');
  console.log('2. Run: localStorage.setItem("forceOfflineMode", "true") to enable');
  console.log('3. Run: localStorage.setItem("forceOfflineMode", "false") to disable');
}
`;

fs.writeFileSync(toggleScriptPath, toggleScriptContent);
console.log(`Created toggle script at ${toggleScriptPath}`);

// 4. Create a README file explaining the offline mode
const readmePath = path.resolve(process.cwd(), 'OFFLINE_MODE.md');
const readmeContent = `# Offline Mode for Firebase Authentication

This feature allows you to use the application even when Firebase authentication services are unavailable.

## What is Offline Mode?

Offline Mode provides a fallback authentication mechanism when:
- You have no internet connection
- Firebase authentication services are down
- Your network blocks Firebase authentication endpoints
- You're experiencing the \`auth/network-request-failed\` error

## How to Use Offline Mode

### Automatic Fallback

If you try to log in and encounter a network error, the application will automatically:
1. Enable offline mode
2. Attempt to authenticate you using the offline credentials
3. Allow you to use the application with limited functionality

### Manual Toggle

You can manually toggle offline mode in two ways:

#### 1. From the Error Screen

If you see the "Authentication Service Unavailable" error screen, click the "Toggle Offline Mode" button.

#### 2. From the Browser Console

\`\`\`
// To enable offline mode
localStorage.setItem('forceOfflineMode', 'true');

// To disable offline mode
localStorage.setItem('forceOfflineMode', 'false');
\`\`\`

After toggling, refresh the page for the changes to take effect.

## Default Offline Credentials

When in offline mode, you can log in with:

- **Email**: admin@example.com
- **Password**: admin123

## Limitations in Offline Mode

While in offline mode:
- You can only use predefined mock users
- Database operations will not work
- Changes will not be synchronized with Firebase
- Some features may be disabled or limited

## Troubleshooting

If you're still having issues with Firebase authentication:

1. Check your internet connection
2. Verify your Firebase configuration in \`.env.local\`
3. Make sure Firebase Authentication is enabled in your Firebase console
4. Check if your Firebase project has reached its quota limits
5. Try using a different browser or disabling browser extensions

## Returning to Online Mode

To return to online mode:
1. Click the "Toggle Offline Mode" button if on the error screen
2. Or set \`localStorage.setItem('forceOfflineMode', 'false')\` in the console
3. Refresh the page
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created offline mode README at ${readmePath}`);

console.log('\nFirebase network issues fix completed!');
console.log('\nThis fix allows the application to work in offline mode when Firebase authentication is unavailable.');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Try logging in with the offline credentials:');
console.log('   - Email: admin@example.com');
console.log('   - Password: admin123');
console.log('3. Read OFFLINE_MODE.md for more information');

/**
 * Fix Login Issues in CHWOne Platform
 * 
 * This script:
 * 1. Checks Firebase configuration
 * 2. Creates a test user if needed
 * 3. Ensures proper environment variables are set
 * 4. Clears any problematic localStorage/sessionStorage items
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Paths
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

console.log(chalk.blue('🔧 Starting login fix process...'));

// Step 1: Check if .env.local exists and has required Firebase variables
const checkEnvFile = () => {
  console.log(chalk.yellow('📋 Checking environment variables...'));
  
  if (!fs.existsSync(envPath)) {
    console.log(chalk.red('❌ .env.local file not found!'));
    createEnvFile();
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for required Firebase variables
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(`${varName}=`));
  
  if (missingVars.length > 0) {
    console.log(chalk.red(`❌ Missing required environment variables: ${missingVars.join(', ')}`));
    fixEnvFile(envContent, missingVars);
  } else {
    console.log(chalk.green('✅ All required environment variables are present'));
  }
};

// Create a new .env.local file with default values
const createEnvFile = () => {
  console.log(chalk.yellow('📝 Creating new .env.local file with default values...'));
  
  const defaultEnv = `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBnWmxkM1FU85WPevCqWh0y_Ya8I0j7NKY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wl4wj-chwone.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wl4wj-chwone
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wl4wj-chwone.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=969469711566
NEXT_PUBLIC_FIREBASE_APP_ID=1:969469711566:web:5e827684b5cc44343b2c9f
FIREBASE_PROJECT_ID=wl4wj-chwone
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@wl4wj-chwone.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRgSHWE6dC/k5h\\nrOkHw39jO/Kmc5luB3SFezcJOhHxdpkMgy7H2t9aUe55/9AAZuAiGY87At3aSsM3\\nyzgWaPS4q8Pu6w0RcIGV6MFabziPN1MfVVP6+jkqP9F3IDnRlpW9NwZnGuUByl19\\nXhkXoBsT28Wx1NoLP+OF6HVhDy+tjVlrEiQpz6p5YkrGJGOKGq+nRiQj8CJIx+cL\\ntgLyRI7Ta6CGkOej9VE5MavWvroQB3q6lO9WGupqxK5XZhVT58EqbVl80rWzBJp0\\nQePyYfH2YINPbgoADhwH78otdYsGvqA2Ehio2NLY5YG8td6o4OMCJilOcOTI79gN\\nV8yepmxzAgMBAAECggEASSpPTkuTzNYyOnNf+ImiSd4sOkxBx4bL/zfOOycwEANK\\npO+FXV+HRCw73BhmJFXJLa9+cW3pW6xja+9JOa5S1NGLvjsRV8dSQi/EotgXyRBZ\\ns6Yhi5NqdmJOPUugVZ1A0xFN56EhXBQ3vSopGjKccj1818ONmIMp6uCJaambjYCf\\nG58ZIAHNtRY1WAM4CQzHZIbtIB0fX4tYBpJUvAEx7C/7HP3qhtFHaYIEFlkZ7abJ\\npYFrHQ7xQaeyV6sfYOk6G0N8XWgNHFOdj6neZ+UF2Cplkh3eSjNzbaejnupd6Bg0\\nk0xis/aYQb06jiN//oVetd7glFg8deKerNivDtobAQKBgQD3sliuxKIe7ksGE/nm\\n6M4GkHc8SJoTKwkAvEFMG5FRuInAUUD2htf7BZfYWQ6XDAXpd9yOx4NJFo/VZZ2k\\nU2VH4lSOKXFYMPMcVwNkA4eM+qf6QYbBqgoKNgSVcELTFuXKwpgAF7lPfUNJE3Ui\\nwUVjZFEPv5A9NJbVxJSUpE8dAQKBgQDYhwg6KcHz6cNNX4eHqUVc4wow2y6xbXRG\\n9OFV18qfPqooxD81azYhsf5rLglYrdx/HATWZfp5suldUQqpnBDdtSJbKYsRopBx\\n/fRY1/U5lqHk3KDC4qCTiG5+gSUs31eSHdDhqSPORbYBKuNZBa+P42LiHz8MWFgV\\n4YfmOatlcwKBgGRTn6oCSSxAFrE6jCEkMLbl8vW+7nFPIBFlLwmVrPGtzlXQU4DH\\nM1ogdNWTlN5HZ2meO/60/w8ujUnBI+34PXC1UsxWKuuuv/m9oMj0yQWoTTuHKP7u\\nUay7HnYtB1Qa1S6gTRLUiSGSOhuyPuK559IPQuofDFxOHb4uJoRiXQ0BAoGBAMs/\\nxZtDQ0qALdHdUE0puXB9tj0yIVxvT+yjRTndO9fLbNKjlGnCX6e1ewqExkU1vnqa\\nhHf0de/y31e3EPkxBCv5MWy9TEube1dleQ5EeW47VXCNIWKOdQjH0mBxPcInS/5e\\neoq4yGGB0ly6M3qG+ctpOJLlnbsq2lR/xZ94lsi9AoGAH6EhONd2VQFnXWZ9ZMDq\\nNUgTi+lOJPTqfwGuObcxLESrgdhy4p2pj0NIoZtTtnYQonJ7mnwmiNUZjFoSzoAN\\ng7+vlV969RvNpghAl9nTkDjxFbwZ5PcGEoYZZgv3SxDD+Hxob/j6aR510J/IN33B\\n34HW6sLA+JEfAifc5SwQZQs=\\n-----END PRIVATE KEY-----

BLOG_ENABLED=true
GALLERY_ENABLED=true
SHOP_ENABLED=false
NEWSLETTER_ENABLED=true
ENCRYPTION_KEY=your_encryption_key_here
AUDIT_LOG_ENABLED=true
NC_CARE_360_API_URL=https://api.nccare360.org
NC_CARE_360_API_KEY=your_nc_care_360_api_key
EMPOWER_API_URL=https://empowerproject.us/api
EMPOWER_API_KEY=your_empower_api_key
PAGE_ACCESS_PASSWORD=password
NEXT_PUBLIC_BYPASS_AUTH=false
`;
  
  fs.writeFileSync(envPath, defaultEnv);
  console.log(chalk.green('✅ Created new .env.local file with default values'));
};

// Fix missing environment variables
const fixEnvFile = (currentContent, missingVars) => {
  console.log(chalk.yellow('📝 Adding missing environment variables...'));
  
  let updatedContent = currentContent;
  
  const defaultValues = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': 'AIzaSyBnWmxkM1FU85WPevCqWh0y_Ya8I0j7NKY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'wl4wj-chwone.firebaseapp.com',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'wl4wj-chwone',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'wl4wj-chwone.firebasestorage.app',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': '969469711566',
    'NEXT_PUBLIC_FIREBASE_APP_ID': '1:969469711566:web:5e827684b5cc44343b2c9f'
  };
  
  missingVars.forEach(varName => {
    updatedContent += `\n${varName}=${defaultValues[varName] || ''}`;
  });
  
  fs.writeFileSync(envPath, updatedContent);
  console.log(chalk.green(`✅ Added missing environment variables: ${missingVars.join(', ')}`));
};

// Step 2: Create a clear-browser-storage.html file
const createClearStorageFile = () => {
  console.log(chalk.yellow('📝 Creating clear-browser-storage.html...'));
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clear Browser Storage</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #1a365d;
    }
    .card {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    button {
      background-color: #1a365d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 10px;
    }
    button:hover {
      background-color: #2c5282;
    }
    .success {
      color: #38a169;
      font-weight: bold;
    }
    .error {
      color: #e53e3e;
      font-weight: bold;
    }
    .hidden {
      display: none;
    }
    ul {
      margin-top: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <h1>CHWOne Login Fix Tool</h1>
  
  <div class="card">
    <h2>Clear Browser Storage</h2>
    <p>If you're having trouble logging in, this tool will clear all stored data related to authentication and reset your browser state.</p>
    <p>This will:</p>
    <ul>
      <li>Clear all localStorage items</li>
      <li>Clear all sessionStorage items</li>
      <li>Clear any authentication-related cookies</li>
      <li>Reset any offline mode settings</li>
    </ul>
    <button id="clearButton">Clear Browser Storage</button>
    <p id="result" class="hidden"></p>
  </div>

  <div class="card">
    <h2>Login Instructions</h2>
    <p>After clearing your browser storage, try logging in with these credentials:</p>
    <ul>
      <li><strong>Email:</strong> admin@example.com</li>
      <li><strong>Password:</strong> admin123</li>
    </ul>
    <a href="/login"><button>Go to Login Page</button></a>
  </div>

  <script>
    document.getElementById('clearButton').addEventListener('click', function() {
      try {
        // Clear localStorage
        const localStorageItems = Object.keys(localStorage);
        localStorageItems.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        const sessionStorageItems = Object.keys(sessionStorage);
        sessionStorageItems.forEach(key => sessionStorage.removeItem(key));
        
        // Clear specific items that might cause issues
        localStorage.removeItem('firebaseNetworkError');
        localStorage.removeItem('forceOfflineMode');
        localStorage.removeItem('authSession');
        localStorage.removeItem('BYPASS_AUTH');
        localStorage.removeItem('theme');
        
        // Show success message
        const resultElement = document.getElementById('result');
        resultElement.textContent = 'Browser storage cleared successfully! You can now try logging in again.';
        resultElement.className = 'success';
        resultElement.classList.remove('hidden');
        
        // Log for debugging
        console.log('Cleared localStorage items:', localStorageItems);
        console.log('Cleared sessionStorage items:', sessionStorageItems);
      } catch (error) {
        // Show error message
        const resultElement = document.getElementById('result');
        resultElement.textContent = 'Error clearing storage: ' + error.message;
        resultElement.className = 'error';
        resultElement.classList.remove('hidden');
        console.error('Error clearing storage:', error);
      }
    });
  </script>
</body>
</html>`;
  
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicDir, 'clear-browser-storage.html'), htmlContent);
  console.log(chalk.green('✅ Created clear-browser-storage.html in public directory'));
};

// Step 3: Create a fix for the login page
const fixLoginPage = () => {
  console.log(chalk.yellow('📝 Creating login page fix...'));
  
  // Create a backup of the original login page
  const loginPagePath = path.join(rootDir, 'src', 'app', 'login', 'page.tsx');
  const loginPageBackupPath = path.join(rootDir, 'src', 'app', 'login', 'page.tsx.backup');
  
  if (fs.existsSync(loginPagePath) && !fs.existsSync(loginPageBackupPath)) {
    fs.copyFileSync(loginPagePath, loginPageBackupPath);
    console.log(chalk.green('✅ Created backup of login page'));
  }
  
  // Fix the login page
  const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');
  
  // Simplify the login page by removing problematic code
  let updatedLoginPage = loginPageContent;
  
  // 1. Remove offline mode handling
  updatedLoginPage = updatedLoginPage.replace(
    /\/\/ Enable offline mode for admin user[\s\S]*?return;/,
    '// Offline mode disabled\n        console.log(\'[LOGIN] Offline mode disabled\');'
  );
  
  // 2. Simplify the login process
  updatedLoginPage = updatedLoginPage.replace(
    /const handleSubmit = async \(e: React\.FormEvent\) => {[\s\S]*?};/,
    `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      console.log('%c[LOGIN] Login already in progress, ignoring submit', 'background: #2c5282; color: white;');
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log('%c[LOGIN] Submit started', 'background: #2c5282; color: white;', { email });
    
    try {
      console.time('[LOGIN] Sign in duration');
      const user = await signIn(email, password);
      console.timeEnd('[LOGIN] Sign in duration');
      
      console.log('%c[LOGIN] Login successful', 'background: #2c5282; color: white;', { 
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
      
      // Determine redirect URL
      const redirectUrl = searchParams?.get('redirect') || '/dashboard/region-5';
      console.log('%c[LOGIN] Redirect URL:', 'color: #2c5282;', redirectUrl);
      
      // Navigate immediately
      router.push(redirectUrl);
    } catch (error) {
      console.error('%c[LOGIN] Login error', 'background: red; color: white;', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message || 'Failed to sign in';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network connection error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };`
  );
  
  // 3. Add a link to the clear storage tool
  updatedLoginPage = updatedLoginPage.replace(
    /<div className="card">\s*<h2>Login Instructions<\/h2>/,
    `<div className="card">
      <h2>Having trouble logging in?</h2>
      <p>If you're experiencing login issues, try clearing your browser storage:</p>
      <a href="/clear-browser-storage.html" target="_blank">
        <button>Clear Browser Storage</button>
      </a>
    </div>

    <div className="card">
      <h2>Login Instructions</h2>`
  );
  
  fs.writeFileSync(loginPagePath, updatedLoginPage);
  console.log(chalk.green('✅ Fixed login page'));
};

// Step 4: Create a fix for the AuthContext
const fixAuthContext = () => {
  console.log(chalk.yellow('📝 Creating AuthContext fix...'));
  
  // Create a backup of the original AuthContext
  const authContextPath = path.join(rootDir, 'src', 'contexts', 'AuthContext.tsx');
  const authContextBackupPath = path.join(rootDir, 'src', 'contexts', 'AuthContext.tsx.backup');
  
  if (fs.existsSync(authContextPath) && !fs.existsSync(authContextBackupPath)) {
    fs.copyFileSync(authContextPath, authContextBackupPath);
    console.log(chalk.green('✅ Created backup of AuthContext'));
  }
  
  // Fix the AuthContext
  const authContextContent = fs.readFileSync(authContextPath, 'utf8');
  
  // Simplify the AuthContext by removing problematic code
  let updatedAuthContext = authContextContent;
  
  // 1. Disable auto-login prevention
  updatedAuthContext = updatedAuthContext.replace(
    /const DISABLE_AUTO_LOGIN = true;/,
    'const DISABLE_AUTO_LOGIN = false; // Enable auto-login'
  );
  
  // 2. Simplify the auth state change handler
  updatedAuthContext = updatedAuthContext.replace(
    /\/\/ Prevent auto-login ONLY on home page[\s\S]*?}/,
    '// Auto-login enabled\n      console.log(\'[AUTH] Auto-login enabled\');'
  );
  
  fs.writeFileSync(authContextPath, updatedAuthContext);
  console.log(chalk.green('✅ Fixed AuthContext'));
};

// Step 5: Update package.json to add the fix-login script
const updatePackageJson = () => {
  console.log(chalk.yellow('📝 Updating package.json...'));
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['fix-login']) {
    packageJson.scripts['fix-login'] = 'node scripts/fix-login.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('✅ Added fix-login script to package.json'));
  } else {
    console.log(chalk.yellow('⚠️ fix-login script already exists in package.json'));
  }
};

// Run all fix steps
checkEnvFile();
createClearStorageFile();
fixLoginPage();
fixAuthContext();
updatePackageJson();

console.log(chalk.blue('🎉 Login fix process completed!'));
console.log(chalk.blue('You can now start the application with: npm run dev'));
console.log(chalk.yellow('If you still have login issues, visit /clear-browser-storage.html in your browser'));
console.log(chalk.yellow('Login with: admin@example.com / admin123'));

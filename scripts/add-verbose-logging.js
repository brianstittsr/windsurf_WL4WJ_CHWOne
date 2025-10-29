/**
 * Add Verbose Logging
 * 
 * This script adds comprehensive console logging to key components
 * to help isolate issues with login and dashboard locking.
 */

const fs = require('fs');
const path = require('path');

// Paths to files that need logging
const filePaths = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  loginPage: path.resolve(process.cwd(), 'src/app/login/page.tsx'),
  dashboardPage: path.resolve(process.cwd(), 'src/app/dashboard/page.tsx'),
  dashboardContent: path.resolve(process.cwd(), 'src/components/Dashboard/DashboardContent.tsx'),
  unifiedLayout: path.resolve(process.cwd(), 'src/components/Layout/UnifiedLayout.jsx'),
  dashboardService: path.resolve(process.cwd(), 'src/services/dashboard/DashboardService.ts')
};

// Check if files exist
Object.entries(filePaths).forEach(([name, path]) => {
  if (!fs.existsSync(path)) {
    console.error(`${name} not found at path: ${path}`);
    process.exit(1);
  }
});

// Create backups
Object.entries(filePaths).forEach(([name, path]) => {
  const backupPath = `${path}.verbose-backup`;
  fs.copyFileSync(path, backupPath);
  console.log(`Created backup of ${name} at ${backupPath}`);
});

// Add logging to AuthContext.tsx
let authContextContent = fs.readFileSync(filePaths.authContext, 'utf8');

// Add logging to signIn method
authContextContent = authContextContent.replace(
  `const signIn = async (email: string, password: string) => {
    // Debug logging
    console.log('Auth credentials:', email, password);
    setLoading(true);
    setError(null);`,
  
  `const signIn = async (email: string, password: string) => {
    // Debug logging
    console.log('%c[AUTH] Sign In Attempt', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;');
    console.log('%c[AUTH] Credentials:', 'color: #1a365d;', { email, passwordLength: password?.length });
    console.log('%c[AUTH] Auth state before sign in:', 'color: #1a365d;', { 
      currentUser: currentUser?.email || null,
      loading,
      error,
      authProvider
    });
    setLoading(true);
    setError(null);`
);

// Add logging to auth state change
authContextContent = authContextContent.replace(
  `const unsubscribe = onAuthStateChanged(auth, async (user) => {
        // Emergency fix: Prevent auto-login
        if (DISABLE_AUTO_LOGIN && user && window.location.pathname === "/") {
          console.log("Auto-login prevented by emergency fix");
          await firebaseSignOut(auth);
          return;
        }`,
  
  `const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('%c[AUTH] Auth State Changed', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;', {
          user: user ? { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
          } : null,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString()
        });
        
        // Emergency fix: Prevent auto-login
        if (DISABLE_AUTO_LOGIN && user && window.location.pathname === "/") {
          console.log("%c[AUTH] Auto-login prevented by emergency fix", "color: orange;");
          await firebaseSignOut(auth);
          return;
        }`
);

// Add logging to setCurrentUser
authContextContent = authContextContent.replace(
  `if (user) {
          setCurrentUser(user);
          // Don't await checkUserApproval to prevent blocking
          checkUserApproval(user).catch(err => console.warn('User approval check failed:', err));
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }`,
  
  `if (user) {
          console.log('%c[AUTH] Setting current user', 'color: green;', { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          setCurrentUser(user);
          // Don't await checkUserApproval to prevent blocking
          checkUserApproval(user)
            .then(result => console.log('%c[AUTH] User approval check completed', 'color: green;', { result }))
            .catch(err => console.warn('%c[AUTH] User approval check failed:', 'color: red;', err));
        } else {
          console.log('%c[AUTH] Clearing current user', 'color: orange;');
          setCurrentUser(null);
          setUserProfile(null);
        }`
);

// Add logging to login page
let loginPageContent = fs.readFileSync(filePaths.loginPage, 'utf8');

// Add logging to handleSubmit
loginPageContent = loginPageContent.replace(
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Login attempt with:', email);`,
  
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('%c[LOGIN] Submit started', 'background: #2a4365; color: white; padding: 2px 4px; border-radius: 2px;', {
      email,
      passwordLength: password?.length,
      timestamp: new Date().toISOString(),
      rememberMe,
      tabValue
    });
    setLoading(true);
    setError('');`
);

// Add more detailed logging to login success/failure
loginPageContent = loginPageContent.replace(
  `try {
      const user = await signIn(email, password);
      console.log('Login successful, user:', user?.email);
      
      // Check if there's a redirect URL in session storage
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      console.log('Redirect URL:', redirectUrl || '/dashboard');`,
  
  `try {
      console.time('%c[LOGIN] Sign in duration');
      const user = await signIn(email, password);
      console.timeEnd('%c[LOGIN] Sign in duration');
      
      console.log('%c[LOGIN] Login successful', 'background: green; color: white; padding: 2px 4px; border-radius: 2px;', {
        user: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        } : null,
        timestamp: new Date().toISOString()
      });
      
      // Check if there's a redirect URL in session storage
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      console.log('%c[LOGIN] Redirect URL:', 'color: #2a4365;', redirectUrl || '/dashboard');`
);

// Add logging to login error handling
loginPageContent = loginPageContent.replace(
  `} catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }`,
  
  `} catch (error: any) {
      console.error('%c[LOGIN] Login error:', 'background: red; color: white; padding: 2px 4px; border-radius: 2px;', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      setError(error.message || 'Failed to login');
    } finally {
      console.log('%c[LOGIN] Login attempt completed', 'color: #2a4365;', {
        success: !error,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }`
);

// Add logging to navigation after login
loginPageContent = loginPageContent.replace(
  `// Force a small delay to ensure auth state is updated
      setTimeout(() => {
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectUrl;
        } else {
          window.location.href = '/dashboard';
        }
      }, 500);`,
  
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
      }, 500);`
);

// Add logging to dashboard page
let dashboardPageContent = fs.readFileSync(filePaths.dashboardPage, 'utf8');

// Add logging to Dashboard component
dashboardPageContent = dashboardPageContent.replace(
  `function Dashboard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();`,
  
  `function Dashboard() {
  console.log('%c[DASHBOARD] Dashboard component rendering', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;');
  const { currentUser, loading } = useAuth();
  console.log('%c[DASHBOARD] Auth state:', 'color: #3182ce;', { 
    currentUser: currentUser ? { 
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    } : null, 
    loading,
    timestamp: new Date().toISOString()
  });
  const router = useRouter();`
);

// Add logging to loading and redirect conditions
dashboardPageContent = dashboardPageContent.replace(
  `if (loading) {
    return <AnimatedLoading message="Loading Dashboard..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }`,
  
  `if (loading) {
    console.log('%c[DASHBOARD] Still loading, showing loading screen', 'color: #3182ce;');
    return <AnimatedLoading message="Loading Dashboard..." />;
  }

  if (!currentUser) {
    console.log('%c[DASHBOARD] No current user, redirecting to login', 'background: orange; color: white; padding: 2px 4px; border-radius: 2px;');
    router.push('/login');
    return null;
  }
  
  console.log('%c[DASHBOARD] User authenticated, rendering dashboard', 'background: green; color: white; padding: 2px 4px; border-radius: 2px;');`
);

// Add logging to dashboard content
let dashboardContentContent = fs.readFileSync(filePaths.dashboardContent, 'utf8');

// Add logging to useEffect
dashboardContentContent = dashboardContentContent.replace(
  `useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        await fetchDashboardData();
      } catch (error) {`,
  
  `useEffect(() => {
    console.log('%c[DASHBOARD_CONTENT] Component mounted', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;', {
      timestamp: new Date().toISOString()
    });
    
    let isMounted = true;
    
    const fetchData = async () => {
      console.log('%c[DASHBOARD_CONTENT] Starting data fetch', 'color: #3182ce;');
      console.time('[DASHBOARD_CONTENT] Data fetch duration');
      try {
        await fetchDashboardData();
        console.timeEnd('[DASHBOARD_CONTENT] Data fetch duration');
      } catch (error) {
        console.timeEnd('[DASHBOARD_CONTENT] Data fetch duration');
        console.error('%c[DASHBOARD_CONTENT] Error in fetchData:', 'background: red; color: white; padding: 2px 4px; border-radius: 2px;', error);`
);

// Add logging to fetchDashboardData
dashboardContentContent = dashboardContentContent.replace(
  `const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);`,
  
  `const fetchDashboardData = async () => {
    console.log('%c[DASHBOARD_CONTENT] fetchDashboardData started', 'color: #3182ce;', {
      timestamp: new Date().toISOString()
    });
    setLoading(true);
    setError(null);`
);

// Add logging to UnifiedLayout
let unifiedLayoutContent = fs.readFileSync(filePaths.unifiedLayout, 'utf8');

// Add logging to component rendering
unifiedLayoutContent = unifiedLayoutContent.replace(
  `export default function UnifiedLayout({ children, fullWidth = false }) {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const pathname = usePathname();`,
  
  `export default function UnifiedLayout({ children, fullWidth = false }) {
  console.log('%c[LAYOUT] UnifiedLayout rendering', 'background: #4a5568; color: white; padding: 2px 4px; border-radius: 2px;', {
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    timestamp: new Date().toISOString()
  });
  
  const { currentUser, signOut } = useAuth();
  console.log('%c[LAYOUT] Auth state in layout:', 'color: #4a5568;', { 
    currentUser: currentUser ? { 
      uid: currentUser.uid, 
      email: currentUser.email,
      displayName: currentUser.displayName
    } : null,
    timestamp: new Date().toISOString()
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const pathname = usePathname();`
);

// Add logging to signOut
unifiedLayoutContent = unifiedLayoutContent.replace(
  `const handleSignOut = () => {
    handleUserMenuClose();
    signOut();
  };`,
  
  `const handleSignOut = () => {
    console.log('%c[LAYOUT] Sign out requested', 'background: #4a5568; color: white; padding: 2px 4px; border-radius: 2px;');
    handleUserMenuClose();
    signOut()
      .then(() => console.log('%c[LAYOUT] Sign out successful', 'color: green;'))
      .catch(err => console.error('%c[LAYOUT] Sign out error:', 'color: red;', err));
  };`
);

// Add logging to DashboardService
let dashboardServiceContent = fs.readFileSync(filePaths.dashboardService, 'utf8');

// Add logging to checkDatabaseConnection
dashboardServiceContent = dashboardServiceContent.replace(
  `async checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
    const startTime = performance.now();`,
  
  `async checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
    console.log('%c[SERVICE] Checking database connection', 'background: #805ad5; color: white; padding: 2px 4px; border-radius: 2px;', {
      timestamp: new Date().toISOString()
    });
    const startTime = performance.now();`
);

// Add logging to getActiveCHWsCount
dashboardServiceContent = dashboardServiceContent.replace(
  `async getActiveCHWsCount(): Promise<number> {
    try {`,
  
  `async getActiveCHWsCount(): Promise<number> {
    console.log('%c[SERVICE] Getting active CHWs count', 'color: #805ad5;', {
      timestamp: new Date().toISOString()
    });
    console.time('[SERVICE] getActiveCHWsCount duration');
    try {`
);

// Add logging to catch blocks
dashboardServiceContent = dashboardServiceContent.replace(
  `} catch (error) {
      console.error('Error fetching active CHWs count:', error);`,
  
  `} catch (error) {
      console.timeEnd('[SERVICE] getActiveCHWsCount duration');
      console.error('%c[SERVICE] Error fetching active CHWs count:', 'background: red; color: white; padding: 2px 4px; border-radius: 2px;', error);`
);

// Write the modified content back to the files
fs.writeFileSync(filePaths.authContext, authContextContent);
fs.writeFileSync(filePaths.loginPage, loginPageContent);
fs.writeFileSync(filePaths.dashboardPage, dashboardPageContent);
fs.writeFileSync(filePaths.dashboardContent, dashboardContentContent);
fs.writeFileSync(filePaths.unifiedLayout, unifiedLayoutContent);
fs.writeFileSync(filePaths.dashboardService, dashboardServiceContent);

console.log('Successfully added verbose logging to all key components');
console.log('Please restart your development server and check the browser console for detailed logs.');

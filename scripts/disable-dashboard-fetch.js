/**
 * Disable Dashboard Data Fetching
 * 
 * This script disables the dashboard data fetching functionality to prevent freezing issues.
 * It replaces the actual data fetching with static mock data.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting dashboard data fetch disabling...');

// Paths to the files we need to modify
const paths = {
  dashboardContent: path.resolve(process.cwd(), 'src/components/Dashboard/DashboardContent.tsx'),
  databaseStatusCard: path.resolve(process.cwd(), 'src/components/Dashboard/DatabaseStatusCard.tsx'),
  dashboardService: path.resolve(process.cwd(), 'src/services/dashboard/DashboardService.ts')
};

// Create backups of all files
Object.entries(paths).forEach(([key, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.fetch-disabled-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${key} at ${backupPath}`);
  } else {
    console.log(`Warning: ${key} not found at ${filePath}`);
  }
});

// 1. Modify DashboardContent.tsx to use static data
if (fs.existsSync(paths.dashboardContent)) {
  let content = fs.readFileSync(paths.dashboardContent, 'utf8');
  
  // Replace the fetchDashboardData function with a mock version
  content = content.replace(
    /const fetchDashboardData = async \(\) => {[\s\S]*?};/,
    `const fetchDashboardData = async () => {
    console.log('%c[DASHBOARD_CONTENT] Using mock data instead of fetching', 'color: #3182ce;', {
      timestamp: new Date().toISOString()
    });
    setLoading(true);
    setError(null);
    
    // Simulate a delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use static mock data
    setStats({
      activeChws: 24,
      activeProjects: 12,
      activeGrants: 8,
      pendingReferrals: 15
    });
    
    setLoading(false);
  };`
  );
  
  // Replace the useEffect that sets up the interval
  content = content.replace(
    /useEffect\(\(\) => {[\s\S]*?}, \[\]\);/,
    `useEffect(() => {
    console.log('%c[DASHBOARD_CONTENT] Component mounted with data fetch disabled', 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;', {
      timestamp: new Date().toISOString()
    });
    
    // Fetch mock data once on mount
    fetchDashboardData();
    
    // No interval for refreshing data
    return () => {
      // No cleanup needed
    };
  }, []);`
  );
  
  fs.writeFileSync(paths.dashboardContent, content);
  console.log('Modified DashboardContent.tsx to use static data');
}

// 2. Modify DatabaseStatusCard.tsx to use static data
if (fs.existsSync(paths.databaseStatusCard)) {
  let content = fs.readFileSync(paths.databaseStatusCard, 'utf8');
  
  // Replace the checkConnection function with a mock version
  content = content.replace(
    /const checkConnection = async \(\) => {[\s\S]*?};/,
    `const checkConnection = async () => {
    setLoading(true);
    
    // Simulate a delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Always return connected status with mock data
    setStatus({
      isConnected: true,
      lastChecked: new Date(),
      latency: 42 // Mock latency value
    });
    
    setLoading(false);
  };`
  );
  
  // Replace the useEffect that sets up the interval
  content = content.replace(
    /useEffect\(\(\) => {[\s\S]*?}, \[\]\);/,
    `useEffect(() => {
    // Check connection once on mount
    checkConnection();
    
    // No interval for refreshing status
    return () => {
      // No cleanup needed
    };
  }, []);`
  );
  
  fs.writeFileSync(paths.databaseStatusCard, content);
  console.log('Modified DatabaseStatusCard.tsx to use static data');
}

// 3. Modify DashboardService.ts to use mock data
if (fs.existsSync(paths.dashboardService)) {
  let content = fs.readFileSync(paths.dashboardService, 'utf8');
  
  // Replace the checkDatabaseConnection method with a mock version
  content = content.replace(
    /async checkDatabaseConnection\(\): Promise<DatabaseConnectionStatus> {[\s\S]*?return this\.connectionStatus;[\s\S]*?}/,
    `async checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
    console.log('%c[SERVICE] Database connection check disabled, using mock data', 'background: #805ad5; color: white; padding: 2px 4px; border-radius: 2px;', {
      timestamp: new Date().toISOString()
    });
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Always return connected status
    this.connectionStatus = {
      isConnected: true,
      lastChecked: new Date(),
      latency: 42 // Mock latency value
    };
    
    return this.connectionStatus;
  }`
  );
  
  // Replace the data fetching methods with mock versions
  const mockMethods = [
    'getActiveCHWsCount',
    'getActiveProjectsCount',
    'getActiveGrantsCount',
    'getPendingReferralsCount'
  ];
  
  mockMethods.forEach(method => {
    const mockValue = method === 'getActiveCHWsCount' ? 24 :
                     method === 'getActiveProjectsCount' ? 12 :
                     method === 'getActiveGrantsCount' ? 8 : 15;
    
    content = content.replace(
      new RegExp(`async ${method}\\(\\): Promise<number> {[\\s\\S]*?return \\d+; // Fallback mock value[\\s\\S]*?}`),
      `async ${method}(): Promise<number> {
    console.log('%c[SERVICE] ${method} disabled, using mock data', 'color: #805ad5;', {
      timestamp: new Date().toISOString()
    });
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Return mock value
    return ${mockValue};
  }`
    );
  });
  
  fs.writeFileSync(paths.dashboardService, content);
  console.log('Modified DashboardService.ts to use mock data');
}

// Create a file to explain what was done
const readmePath = path.resolve(process.cwd(), 'DASHBOARD_FETCH_DISABLED.md');
const readmeContent = `# Dashboard Data Fetching Disabled

To prevent freezing issues, the dashboard data fetching functionality has been disabled.
The dashboard now uses static mock data instead of making actual Firebase queries.

## Files Modified

1. \`src/components/Dashboard/DashboardContent.tsx\`
   - Replaced real data fetching with static mock data
   - Removed the interval that refreshed data every 5 minutes

2. \`src/components/Dashboard/DatabaseStatusCard.tsx\`
   - Replaced real connection checking with a mock that always returns "Connected"
   - Removed the interval that checked connection status every 30 seconds

3. \`src/services/dashboard/DashboardService.ts\`
   - Replaced all data fetching methods with mock versions
   - Disabled the schema initialization that was happening during connection checks

## Backups

Backups of the original files were created with the suffix \`.fetch-disabled-backup\`.
To restore the original functionality, you can copy these backup files back to their original locations.

## Why This Helps

The dashboard was freezing because:

1. Multiple simultaneous Firestore queries were being made
2. Each query had its own timeout and error handling
3. Race conditions between different timeouts were causing issues
4. Schema initialization was happening during connection checks

By using static mock data, we eliminate these issues while maintaining the visual appearance of the dashboard.

## Re-enabling Data Fetching

If you want to re-enable data fetching in the future, consider:

1. Implementing a more efficient data fetching strategy
2. Using a single batch query instead of multiple parallel queries
3. Moving schema initialization to a separate process
4. Implementing proper caching to reduce the number of queries

Created on: ${new Date().toISOString()}
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created explanation file at ${readmePath}`);

console.log('\nDashboard data fetching has been successfully disabled!');
console.log('The dashboard will now use static mock data instead of making Firebase queries.');
console.log('This should prevent freezing issues while maintaining the visual appearance of the dashboard.');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Navigate to the dashboard to verify it loads without freezing');
console.log('3. Check that the mock data is displayed correctly');

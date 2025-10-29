/**
 * Script runner for create-admin-user.ts
 * 
 * This script uses ts-node to run the TypeScript script
 * that creates an admin user in Firebase.
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running create-admin-user.ts script...');
  
  // Get the absolute path to the script
  const scriptPath = path.resolve(__dirname, 'create-admin-user.ts');
  
  // Run the script using ts-node with proper path resolution
  execSync(`npx ts-node -r tsconfig-paths/register ${scriptPath}`, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: path.resolve(__dirname, '../../tsconfig.json')
    }
  });
  
  console.log('Script completed successfully');
} catch (error) {
  console.error('Error running script:', error);
  process.exit(1);
}

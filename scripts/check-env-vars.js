/**
 * Script to check for specific environment variables
 * This script will check if NEXT_PUBLIC_BYPASS_AUTH is set in the .env.local file
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Checking environment variables...');

// Check for NEXT_PUBLIC_BYPASS_AUTH
const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH;
console.log('NEXT_PUBLIC_BYPASS_AUTH:', bypassAuth || 'Not set');

// Check if it's set to true
if (bypassAuth === 'true') {
  console.log('Auto-login is ENABLED');
} else {
  console.log('Auto-login is DISABLED');
}

// List all environment variables starting with NEXT_PUBLIC
console.log('\nAll NEXT_PUBLIC environment variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .forEach(key => {
    console.log(`${key}: ${key === 'NEXT_PUBLIC_BYPASS_AUTH' ? process.env[key] : '[HIDDEN]'}`);
  });

/**
 * Generate User Creation URL Script
 * 
 * This script extracts Firebase configuration from .env.local
 * and generates a URL to open the create-user.html page with
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
const baseUrl = 'http://localhost:3000/create-user.html';
const url = `${baseUrl}?apiKey=${encodeURIComponent(apiKey)}&authDomain=${encodeURIComponent(authDomain)}&projectId=${encodeURIComponent(projectId)}`;

console.log('\nFirebase User Creation Tool\n');
console.log('This tool will help you create users directly in Firebase Authentication.');
console.log('\nFollow these steps:');
console.log('1. Make sure your development server is running (npm run dev)');
console.log('2. Open the following URL in your browser:');
console.log('\n' + url + '\n');
console.log('3. The page will be pre-configured with your Firebase settings');
console.log('4. Click "Create User" to create the admin user');
console.log('5. After creating the user, try logging in to your application');

// Print the Firebase configuration for reference
console.log('\nYour Firebase configuration:');
console.log('API Key:', apiKey);
console.log('Auth Domain:', authDomain);
console.log('Project ID:', projectId);

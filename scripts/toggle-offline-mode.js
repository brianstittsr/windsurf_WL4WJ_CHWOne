/**
 * Toggle Offline Mode
 * 
 * This script toggles offline mode for Firebase authentication.
 * Use this when you need to test the application without Firebase connectivity.
 */

// Check if localStorage is available (browser environment)
if (typeof localStorage !== 'undefined') {
  const current = localStorage.getItem('forceOfflineMode') === 'true';
  localStorage.setItem('forceOfflineMode', (!current).toString());
  console.log(`Offline mode ${!current ? 'enabled' : 'disabled'}`);
} else {
  // Node.js environment
  console.log('This script must be run in a browser environment.');
  console.log('To toggle offline mode:');
  console.log('1. Open your browser console on the application');
  console.log('2. Run: localStorage.setItem("forceOfflineMode", "true") to enable');
  console.log('3. Run: localStorage.setItem("forceOfflineMode", "false") to disable');
}

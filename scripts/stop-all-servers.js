/**
 * Stop All Servers Script
 * 
 * This script finds and stops all running Node.js processes
 * that might be running development servers.
 */

const { execSync } = require('child_process');

console.log('Stopping all Node.js processes...');

try {
  // On Windows, use taskkill to terminate Node.js processes
  const output = execSync('taskkill /F /IM node.exe', { encoding: 'utf8' });
  console.log(output);
  console.log('All Node.js processes have been terminated.');
} catch (error) {
  // If no processes were found, that's fine
  if (error.status === 128) {
    console.log('No Node.js processes were found to terminate.');
  } else {
    console.error('Error stopping Node.js processes:', error.message);
  }
}

// Also try to kill any processes on specific ports
const ports = [3000, 3001, 3002, 3003, 3004, 3005];

for (const port of ports) {
  try {
    console.log(`Attempting to kill process on port ${port}...`);
    execSync(`powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue"`, { encoding: 'utf8' });
  } catch (error) {
    // Ignore errors - the port might not be in use
  }
}

console.log('All server processes have been stopped.');
console.log('You can now restart your development server with: npm run dev');

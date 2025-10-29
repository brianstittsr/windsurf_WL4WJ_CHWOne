/**
 * Script to add code to clear auto-login localStorage on application startup
 * This will be added to the main layout file
 */

const fs = require('fs');
const path = require('path');

// Path to the layout file
const layoutFilePath = path.resolve(process.cwd(), 'src/app/layout.tsx');

console.log('Adding code to clear auto-login localStorage...');

try {
  let layoutContent = fs.readFileSync(layoutFilePath, 'utf8');
  
  // Check if we've already added the code
  if (layoutContent.includes('// Clear auto-login settings')) {
    console.log('Auto-login clearing code already exists.');
  } else {
    // Find the RootLayout function
    const rootLayoutMatch = layoutContent.match(/export default function RootLayout\(\{[^}]*\}\)[^{]*\{/);
    
    if (rootLayoutMatch) {
      const insertPosition = rootLayoutMatch.index + rootLayoutMatch[0].length;
      
      // Code to insert - this will run on the client side to clear localStorage
      const codeToInsert = `
  // Clear auto-login settings
  if (typeof window !== 'undefined') {
    // Use a script tag to ensure this runs as early as possible
    const script = document.createElement('script');
    script.innerHTML = \`
      try {
        localStorage.removeItem('BYPASS_AUTH');
        console.log('Auto-login settings cleared');
      } catch (e) {
        console.error('Error clearing auto-login settings:', e);
      }
    \`;
    document.head.appendChild(script);
  }
`;
      
      // Insert the code at the beginning of the RootLayout function
      layoutContent = 
        layoutContent.slice(0, insertPosition) + 
        codeToInsert + 
        layoutContent.slice(insertPosition);
      
      // Write the updated content back to the file
      fs.writeFileSync(layoutFilePath, layoutContent);
      console.log('Added code to clear auto-login localStorage.');
    } else {
      console.error('Could not find RootLayout function in layout.tsx');
    }
  }
  
  console.log('Please restart your development server for changes to take effect.');
} catch (error) {
  console.error('Error updating layout.tsx file:', error);
}

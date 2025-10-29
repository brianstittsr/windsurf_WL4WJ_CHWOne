/**
 * Check for Next.js Errors
 * 
 * This script adds a global error handler to detect and log Next.js errors
 * that might be appearing on the dashboard after login.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting Next.js error detection script...');

// Path to the layout file where we'll add the error handler
const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');

// Create a backup of the layout file
if (fs.existsSync(layoutPath)) {
  const backupPath = `${layoutPath}.error-check-backup`;
  fs.copyFileSync(layoutPath, backupPath);
  console.log(`Created backup of layout.tsx at ${backupPath}`);
  
  // Read the layout file content
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  // Check if our error handler is already added
  if (!layoutContent.includes('window.onerror = function(message, source, lineno, colno, error)')) {
    // Find the closing </head> tag
    const headCloseIndex = layoutContent.indexOf('</head>');
    
    if (headCloseIndex !== -1) {
      // Add our error handler script before the closing head tag
      const errorHandlerScript = `
        {/* Next.js Error Detection Script */}
        <script dangerouslySetInnerHTML={{ __html: \`
          window.onerror = function(message, source, lineno, colno, error) {
            console.error('DETECTED ERROR:', {
              message: message,
              source: source,
              lineno: lineno,
              colno: colno,
              error: error ? error.stack : 'No error stack available'
            });
            
            // Create a visible error message on the page
            var errorDiv = document.createElement('div');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '70px';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translateX(-50%)';
            errorDiv.style.backgroundColor = '#f44336';
            errorDiv.style.color = 'white';
            errorDiv.style.padding = '10px 20px';
            errorDiv.style.borderRadius = '4px';
            errorDiv.style.zIndex = '10000';
            errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            errorDiv.style.maxWidth = '80%';
            errorDiv.style.textAlign = 'center';
            errorDiv.style.pointerEvents = 'auto';
            
            var errorText = document.createElement('div');
            errorText.textContent = 'Next.js Error: ' + message;
            errorDiv.appendChild(errorText);
            
            var errorDetails = document.createElement('div');
            errorDetails.style.fontSize = '12px';
            errorDetails.style.marginTop = '5px';
            errorDetails.textContent = 'Source: ' + source + ' (' + lineno + ':' + colno + ')';
            errorDiv.appendChild(errorDetails);
            
            var closeButton = document.createElement('button');
            closeButton.textContent = 'Dismiss';
            closeButton.style.marginTop = '10px';
            closeButton.style.padding = '5px 10px';
            closeButton.style.backgroundColor = 'white';
            closeButton.style.color = '#f44336';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.cursor = 'pointer';
            closeButton.onclick = function() {
              document.body.removeChild(errorDiv);
            };
            errorDiv.appendChild(closeButton);
            
            document.body.appendChild(errorDiv);
            return false;
          };
          
          // Also capture React errors
          window.__NEXT_REACT_ROOT = true;
          window.__NEXT_REACT_DEVTOOLS = true;
          
          // Capture unhandled promise rejections
          window.addEventListener('unhandledrejection', function(event) {
            console.error('UNHANDLED PROMISE REJECTION:', event.reason);
            
            // Create a visible error message
            var errorDiv = document.createElement('div');
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '70px';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translateX(-50%)';
            errorDiv.style.backgroundColor = '#ff9800';
            errorDiv.style.color = 'white';
            errorDiv.style.padding = '10px 20px';
            errorDiv.style.borderRadius = '4px';
            errorDiv.style.zIndex = '10000';
            errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            errorDiv.style.maxWidth = '80%';
            errorDiv.style.textAlign = 'center';
            errorDiv.style.pointerEvents = 'auto';
            
            var errorText = document.createElement('div');
            errorText.textContent = 'Promise Rejection: ' + (event.reason ? event.reason.message || String(event.reason) : 'Unknown error');
            errorDiv.appendChild(errorText);
            
            var closeButton = document.createElement('button');
            closeButton.textContent = 'Dismiss';
            closeButton.style.marginTop = '10px';
            closeButton.style.padding = '5px 10px';
            closeButton.style.backgroundColor = 'white';
            closeButton.style.color = '#ff9800';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.cursor = 'pointer';
            closeButton.onclick = function() {
              document.body.removeChild(errorDiv);
            };
            errorDiv.appendChild(closeButton);
            
            document.body.appendChild(errorDiv);
          });
        \`}} />
      `;
      
      // Insert the error handler script before the closing head tag
      layoutContent = layoutContent.slice(0, headCloseIndex) + errorHandlerScript + layoutContent.slice(headCloseIndex);
      
      // Write the updated content back to the file
      fs.writeFileSync(layoutPath, layoutContent);
      console.log('Added error detection script to layout.tsx');
    } else {
      console.log('Could not find </head> tag in layout.tsx');
    }
  } else {
    console.log('Error detection script already exists in layout.tsx');
  }
} else {
  console.log(`Warning: layout.tsx not found at ${layoutPath}`);
}

// Create a README file explaining the script
const readmePath = path.resolve(process.cwd(), 'NEXTJS_ERROR_DETECTION.md');
const readmeContent = `# Next.js Error Detection

This document explains how to use the Next.js error detection script to identify errors that appear on the dashboard after login.

## What This Script Does

The script adds a global error handler to the application that:

1. Captures JavaScript errors and unhandled promise rejections
2. Logs detailed error information to the console
3. Displays a visible error message on the page that you can interact with
4. Makes the error message clickable and dismissible

## How to Use

1. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

2. Navigate to the dashboard by logging in
3. When an error occurs, you will see:
   - A red error box at the top of the page with details
   - Complete error information in the browser console

4. You can click the "Dismiss" button to close the error message

## Common Next.js Errors

Some common Next.js errors that might appear after login:

1. **Hydration Mismatch**: Differences between server and client rendering
2. **Missing Dependencies**: Required modules not installed or imported
3. **Invalid Hook Calls**: React hooks used incorrectly
4. **Route Conflicts**: Multiple pages trying to handle the same route
5. **API Route Errors**: Issues with API routes or server components

## Restoring Original Layout

If you want to remove the error detection script, you can restore the original layout file from the backup:

\`\`\`
cp src/app/layout.tsx.error-check-backup src/app/layout.tsx
\`\`\`

Created: ${new Date().toISOString()}
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created explanation file at ${readmePath}`);

console.log('\nNext.js error detection script completed!');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Navigate to the dashboard by logging in');
console.log('3. Look for the error message that will now be visible and clickable');
console.log('4. Check the browser console for detailed error information');

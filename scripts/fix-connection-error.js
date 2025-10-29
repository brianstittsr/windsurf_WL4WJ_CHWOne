/**
 * Fix Connection Error
 * 
 * This script adds error handling to prevent the "Could not establish connection" error
 * from affecting the user experience. This error is typically caused by browser extensions
 * or service workers trying to communicate with disconnected components.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting connection error fix...');

// Path to the main document
const documentPath = path.resolve(process.cwd(), 'src/pages/_document.tsx');
const appPath = path.resolve(process.cwd(), 'src/pages/_app.tsx');

// Check if Next.js is using pages directory or app directory
const usesAppDir = !fs.existsSync(documentPath) && !fs.existsSync(appPath);

if (usesAppDir) {
  console.log('App directory structure detected. Creating error handler in layout.tsx...');
  
  // Path to the root layout
  const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');
  
  if (fs.existsSync(layoutPath)) {
    // Create backup
    const backupPath = `${layoutPath}.connection-error-backup`;
    fs.copyFileSync(layoutPath, backupPath);
    console.log(`Created backup of layout.tsx at ${backupPath}`);
    
    // Read layout content
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Check if error handler is already added
    if (!layoutContent.includes('window.addEventListener(\'error\'')) {
      // Add error handler script
      const scriptToAdd = `
  {/* Error handler for connection errors */}
  <script dangerouslySetInnerHTML={{
    __html: \`
      window.addEventListener('error', function(event) {
        // Check if the error is about connection
        if (event.message && event.message.includes('Could not establish connection')) {
          // Prevent the error from showing in console
          event.preventDefault();
          console.log('[Connection Error Suppressed] This is likely caused by a browser extension or service worker.');
        }
      });
      
      // Also handle unhandled promise rejections
      window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.message && 
            event.reason.message.includes('Could not establish connection')) {
          // Prevent the rejection from showing in console
          event.preventDefault();
          console.log('[Connection Error Suppressed] Promise rejection suppressed for connection error.');
        }
      });
    \`
  }} />`;
      
      // Insert the script before the closing head tag
      layoutContent = layoutContent.replace('</head>', `${scriptToAdd}\n  </head>`);
      
      // Write updated content
      fs.writeFileSync(layoutPath, layoutContent);
      console.log('Added error handler to layout.tsx');
    } else {
      console.log('Error handler already exists in layout.tsx');
    }
  } else {
    console.log('Could not find layout.tsx. Creating custom error handler...');
    
    // Create error handler component
    const errorHandlerPath = path.resolve(process.cwd(), 'src/components/ErrorHandler.tsx');
    const errorHandlerContent = `'use client';

import { useEffect } from 'react';

/**
 * ErrorHandler Component
 * 
 * Handles and suppresses connection errors that are typically caused by
 * browser extensions or service workers.
 */
export default function ErrorHandler() {
  useEffect(() => {
    // Handler for regular errors
    const errorHandler = (event) => {
      // Check if the error is about connection
      if (event.message && event.message.includes('Could not establish connection')) {
        // Prevent the error from showing in console
        event.preventDefault();
        console.log('[Connection Error Suppressed] This is likely caused by a browser extension or service worker.');
      }
    };
    
    // Handler for unhandled promise rejections
    const rejectionHandler = (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('Could not establish connection')) {
        // Prevent the rejection from showing in console
        event.preventDefault();
        console.log('[Connection Error Suppressed] Promise rejection suppressed for connection error.');
      }
    };
    
    // Add event listeners
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    
    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);
  
  return null;
}
`;
    
    // Write error handler component
    fs.writeFileSync(errorHandlerPath, errorHandlerContent);
    console.log(`Created ErrorHandler component at ${errorHandlerPath}`);
    
    // Find a suitable layout file to add the component to
    const possibleLayouts = [
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/components/Layout/UnifiedLayout.tsx',
      'src/components/Layout/MainLayout.tsx'
    ];
    
    let layoutFile = null;
    for (const file of possibleLayouts) {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        layoutFile = filePath;
        break;
      }
    }
    
    if (layoutFile) {
      // Create backup
      const backupPath = `${layoutFile}.connection-error-backup`;
      fs.copyFileSync(layoutFile, backupPath);
      console.log(`Created backup of ${path.basename(layoutFile)} at ${backupPath}`);
      
      // Read layout content
      let layoutContent = fs.readFileSync(layoutFile, 'utf8');
      
      // Check if ErrorHandler is already imported
      if (!layoutContent.includes('ErrorHandler')) {
        // Add import
        const importStatement = `import ErrorHandler from '@/components/ErrorHandler';`;
        
        // Add import statement after the last import
        const lastImportIndex = layoutContent.lastIndexOf('import');
        const lastImportEndIndex = layoutContent.indexOf(';', lastImportIndex) + 1;
        layoutContent = layoutContent.slice(0, lastImportEndIndex) + '\n' + importStatement + layoutContent.slice(lastImportEndIndex);
        
        // Add ErrorHandler component to the JSX
        if (layoutContent.includes('return (')) {
          layoutContent = layoutContent.replace('return (', 'return (\n      <>\n        <ErrorHandler />\n');
          
          // Find the first closing tag after return
          const firstClosingTagIndex = layoutContent.indexOf(')', layoutContent.indexOf('return ('));
          layoutContent = layoutContent.slice(0, firstClosingTagIndex) + '\n      </>' + layoutContent.slice(firstClosingTagIndex);
        }
        
        // Write updated content
        fs.writeFileSync(layoutFile, layoutContent);
        console.log(`Added ErrorHandler component to ${path.basename(layoutFile)}`);
      } else {
        console.log(`ErrorHandler already imported in ${path.basename(layoutFile)}`);
      }
    } else {
      console.log('Could not find a suitable layout file to add the ErrorHandler component.');
      console.log('Please manually add the ErrorHandler component to your main layout or page component.');
    }
  }
} else {
  console.log('Pages directory structure detected. Creating error handler in _document.tsx or _app.tsx...');
  
  // Check if _document.tsx exists
  if (fs.existsSync(documentPath)) {
    // Create backup
    const backupPath = `${documentPath}.connection-error-backup`;
    fs.copyFileSync(documentPath, backupPath);
    console.log(`Created backup of _document.tsx at ${backupPath}`);
    
    // Read document content
    let documentContent = fs.readFileSync(documentPath, 'utf8');
    
    // Check if error handler is already added
    if (!documentContent.includes('window.addEventListener(\'error\'')) {
      // Add error handler script
      const scriptToAdd = `
          {/* Error handler for connection errors */}
          <script dangerouslySetInnerHTML={{
            __html: \`
              window.addEventListener('error', function(event) {
                // Check if the error is about connection
                if (event.message && event.message.includes('Could not establish connection')) {
                  // Prevent the error from showing in console
                  event.preventDefault();
                  console.log('[Connection Error Suppressed] This is likely caused by a browser extension or service worker.');
                }
              });
              
              // Also handle unhandled promise rejections
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message && 
                    event.reason.message.includes('Could not establish connection')) {
                  // Prevent the rejection from showing in console
                  event.preventDefault();
                  console.log('[Connection Error Suppressed] Promise rejection suppressed for connection error.');
                }
              });
            \`
          }} />`;
      
      // Insert the script before the closing head tag
      documentContent = documentContent.replace('</Head>', `${scriptToAdd}\n        </Head>`);
      
      // Write updated content
      fs.writeFileSync(documentPath, documentContent);
      console.log('Added error handler to _document.tsx');
    } else {
      console.log('Error handler already exists in _document.tsx');
    }
  } else if (fs.existsSync(appPath)) {
    // Create backup
    const backupPath = `${appPath}.connection-error-backup`;
    fs.copyFileSync(appPath, backupPath);
    console.log(`Created backup of _app.tsx at ${backupPath}`);
    
    // Read app content
    let appContent = fs.readFileSync(appPath, 'utf8');
    
    // Create error handler component
    const errorHandlerPath = path.resolve(process.cwd(), 'src/components/ErrorHandler.tsx');
    const errorHandlerContent = `import { useEffect } from 'react';

/**
 * ErrorHandler Component
 * 
 * Handles and suppresses connection errors that are typically caused by
 * browser extensions or service workers.
 */
export default function ErrorHandler() {
  useEffect(() => {
    // Handler for regular errors
    const errorHandler = (event) => {
      // Check if the error is about connection
      if (event.message && event.message.includes('Could not establish connection')) {
        // Prevent the error from showing in console
        event.preventDefault();
        console.log('[Connection Error Suppressed] This is likely caused by a browser extension or service worker.');
      }
    };
    
    // Handler for unhandled promise rejections
    const rejectionHandler = (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('Could not establish connection')) {
        // Prevent the rejection from showing in console
        event.preventDefault();
        console.log('[Connection Error Suppressed] Promise rejection suppressed for connection error.');
      }
    };
    
    // Add event listeners
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    
    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);
  
  return null;
}
`;
    
    // Write error handler component
    fs.writeFileSync(errorHandlerPath, errorHandlerContent);
    console.log(`Created ErrorHandler component at ${errorHandlerPath}`);
    
    // Check if ErrorHandler is already imported
    if (!appContent.includes('ErrorHandler')) {
      // Add import
      const importStatement = `import ErrorHandler from '../components/ErrorHandler';`;
      
      // Add import statement after the last import
      const lastImportIndex = appContent.lastIndexOf('import');
      const lastImportEndIndex = appContent.indexOf(';', lastImportIndex) + 1;
      appContent = appContent.slice(0, lastImportEndIndex) + '\n' + importStatement + appContent.slice(lastImportEndIndex);
      
      // Add ErrorHandler component to the JSX
      if (appContent.includes('return')) {
        // Find the return statement
        const returnIndex = appContent.indexOf('return');
        const openBraceIndex = appContent.indexOf('{', returnIndex);
        const closeBraceIndex = findMatchingBrace(appContent, openBraceIndex);
        
        if (closeBraceIndex > openBraceIndex) {
          // Insert ErrorHandler before the closing brace
          appContent = appContent.slice(0, closeBraceIndex) + '<ErrorHandler />\n      ' + appContent.slice(closeBraceIndex);
        }
      }
      
      // Write updated content
      fs.writeFileSync(appPath, appContent);
      console.log('Added ErrorHandler component to _app.tsx');
    } else {
      console.log('ErrorHandler already imported in _app.tsx');
    }
  } else {
    console.log('Could not find _document.tsx or _app.tsx. Creating custom error handler...');
    
    // Create error handler component
    const errorHandlerPath = path.resolve(process.cwd(), 'src/components/ErrorHandler.tsx');
    const errorHandlerContent = `import { useEffect } from 'react';

/**
 * ErrorHandler Component
 * 
 * Handles and suppresses connection errors that are typically caused by
 * browser extensions or service workers.
 */
export default function ErrorHandler() {
  useEffect(() => {
    // Handler for regular errors
    const errorHandler = (event) => {
      // Check if the error is about connection
      if (event.message && event.message.includes('Could not establish connection')) {
        // Prevent the error from showing in console
        event.preventDefault();
        console.log('[Connection Error Suppressed] This is likely caused by a browser extension or service worker.');
      }
    };
    
    // Handler for unhandled promise rejections
    const rejectionHandler = (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('Could not establish connection')) {
        // Prevent the rejection from showing in console
        event.preventDefault();
        console.log('[Connection Error Suppressed] Promise rejection suppressed for connection error.');
      }
    };
    
    // Add event listeners
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    
    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);
  
  return null;
}
`;
    
    // Write error handler component
    fs.writeFileSync(errorHandlerPath, errorHandlerContent);
    console.log(`Created ErrorHandler component at ${errorHandlerPath}`);
    console.log('Please manually add the ErrorHandler component to your main layout or page component.');
  }
}

// Helper function to find matching closing brace
function findMatchingBrace(text, openBraceIndex) {
  let braceCount = 1;
  let i = openBraceIndex + 1;
  
  while (i < text.length && braceCount > 0) {
    if (text[i] === '{') {
      braceCount++;
    } else if (text[i] === '}') {
      braceCount--;
    }
    i++;
  }
  
  return braceCount === 0 ? i - 1 : -1;
}

console.log('\nConnection error fix completed!');
console.log('\nThis fix will suppress the "Could not establish connection" error messages');
console.log('that are typically caused by browser extensions or service workers.');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Test the login flow to verify the error is suppressed');
console.log('3. If you still see the error, try disabling browser extensions or using incognito mode');

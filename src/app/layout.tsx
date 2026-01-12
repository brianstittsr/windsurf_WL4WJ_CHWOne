import type { Metadata } from "next";
import './globals.css';
import './fetch-error-handler';
import { Providers } from "@/components/Providers";
import ThemeRegistry from '@/components/ThemeRegistry';
import { FirebaseInitializer } from '@/components';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'CHWOne - Community Health Worker Management Platform',
  description: 'Women Leading for Wellness and Justice Community Health Worker Management Platform',
  keywords: 'community health workers, CHW, healthcare, North Carolina, wellness, justice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

  {/* Error handler for connection errors */}
  <script dangerouslySetInnerHTML={{
    __html: `
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
    `
  }} />
  
        {/* Next.js Error Detection Script */}
        <script dangerouslySetInnerHTML={{ __html: `
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
        `}} />
        {/* Fix for stuck overlay elements */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Remove any stuck overlay elements on page load
          document.addEventListener('DOMContentLoaded', function() {
            setInterval(function() {
              // Find and remove stuck MUI backdrops
              var backdrops = document.querySelectorAll('.MuiBackdrop-root');
              backdrops.forEach(function(backdrop) {
                var modal = backdrop.closest('.MuiModal-root');
                if (!modal) {
                  backdrop.style.display = 'none';
                  backdrop.style.pointerEvents = 'none';
                }
              });
              
              // Find any fixed position overlays blocking interaction
              var fixedElements = document.querySelectorAll('[style*="position: fixed"]');
              fixedElements.forEach(function(el) {
                var style = window.getComputedStyle(el);
                if (style.backgroundColor && style.backgroundColor.includes('rgba') && 
                    style.inset === '0px' || (style.top === '0px' && style.left === '0px' && style.right === '0px' && style.bottom === '0px')) {
                  // Check if it's a legitimate modal
                  if (!el.closest('.MuiModal-root') && !el.closest('[role="dialog"]')) {
                    el.style.pointerEvents = 'none';
                  }
                }
              });
            }, 1000);
          });
        `}} />
      </head>
      <body>
        <ThemeRegistry>
          <LanguageProvider>
            <Providers>
              <FirebaseInitializer />
                {/* Test Mode Toggle and Auth Debugger removed */}
                {children}
            </Providers>
          </LanguageProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

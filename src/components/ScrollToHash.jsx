'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Stub ScrollToHash component for build compatibility
export const ScrollToHash = () => {
  const pathname = usePathname();

  useEffect(() => {
    // If there's a hash in the URL
    if (window.location.hash) {
      // Get the hash without the '#'
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        // Scroll to the element
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
};

export default ScrollToHash;

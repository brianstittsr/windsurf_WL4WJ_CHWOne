'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-[#FF3B30]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-[#FF3B30]" />
          </div>
          
          <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
            Something went wrong
          </h1>
          
          <p className="text-[#6E6E73] mb-6">
            We apologize for the inconvenience. The application encountered an unexpected error.
          </p>
          
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071E3] text-white rounded-xl font-medium hover:bg-[#0077ED] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#D2D2D7] text-[#1D1D1F] rounded-xl font-medium hover:bg-[#F5F5F7] transition-colors"
            >
              <Home className="w-4 h-4" />
              Return home
            </Link>
          </div>
          
          {error.digest && (
            <p className="text-xs text-[#86868B]">
              Error reference: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

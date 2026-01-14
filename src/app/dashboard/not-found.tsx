'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/Layout/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { Search, RefreshCw, Home, LogIn } from 'lucide-react';

export default function DashboardNotFound() {
  const router = useRouter();
  
  return (
    <AuthProvider>
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 bg-[#FF9500]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-[#FF9500]" />
            </div>
            
            <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-3">
              Dashboard Not Found
            </h1>
            
            <p className="text-[#6E6E73] mb-8">
              We couldn&apos;t find the dashboard you&apos;re looking for. This might be due to an authentication issue or a temporary problem.
            </p>
            
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#0071E3] text-white rounded-xl font-medium hover:bg-[#0077ED] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-2 w-full py-3 border border-[#D2D2D7] text-[#1D1D1F] rounded-xl font-medium hover:bg-[#F5F5F7] transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('authSession');
                  sessionStorage.removeItem('loginSuccess');
                  sessionStorage.removeItem('loginTime');
                  router.push('/login');
                }}
                className="flex items-center justify-center gap-2 w-full py-3 text-[#0071E3] hover:bg-[#0071E3]/10 rounded-xl font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthProvider>
  );
}

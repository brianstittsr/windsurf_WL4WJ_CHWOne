'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import Region5Directory from '@/components/Resources/Region5Directory';
import AdminLayout from '@/components/Layout/AdminLayout';

// Inner component that uses the auth context
function ResourcesContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading Resources...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Apple-style Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#FF2D55] rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Resources</h1>
            <p className="text-[#6E6E73]">Access healthcare resources and community services</p>
          </div>
        </div>

        {/* Resource Directory Component */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
          <Region5Directory />
        </div>
      </div>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function ResourcesPage() {
  return (
    <AuthProvider>
      <ResourcesContent />
    </AuthProvider>
  );
}

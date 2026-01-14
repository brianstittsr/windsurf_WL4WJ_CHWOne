'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import ReferralManagement from '@/components/Referrals/ReferralManagement';
import AdminLayout from '@/components/Layout/AdminLayout';

// Inner component that uses the auth context
function ReferralsContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading Referrals...</p>
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
          <div className="w-14 h-14 bg-[#0071E3] rounded-2xl flex items-center justify-center">
            <Send className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Referrals</h1>
            <p className="text-[#6E6E73]">Track client referrals and coordinate care transitions</p>
          </div>
        </div>

        {/* Referral Management Component */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
          <ReferralManagement />
        </div>
      </div>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function ReferralsPage() {
  return (
    <AuthProvider>
      <ReferralsContent />
    </AuthProvider>
  );
}

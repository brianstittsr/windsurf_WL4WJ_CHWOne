'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import SettingsManagement from '@/components/Settings/SettingsManagement';
import AdminLayout from '@/components/Layout/AdminLayout';
import { Settings } from 'lucide-react';

// Inner component that uses the auth context
function SettingsContent() {
  return (
    <AdminLayout>
      {/* Apple-style Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1D1D1F] rounded-2xl flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-[#6E6E73]">
              Configure user accounts, permissions, notifications, and system preferences
            </p>
          </div>
        </div>
      </div>
      
      {/* Settings Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D2D2D7] overflow-hidden">
        <SettingsManagement />
      </div>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function SettingsPage() {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
}

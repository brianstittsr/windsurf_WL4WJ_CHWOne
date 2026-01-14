'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { SandhillsResourcesList } from '@/components/SandhillsResources';
import { FolderOpen } from 'lucide-react';

function SandhillsResourcesPageContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Apple-style Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#34C759] rounded-2xl flex items-center justify-center">
            <FolderOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Resource Directory</h1>
            <p className="text-[#6E6E73]">Browse and manage community resources in the Sandhills region</p>
          </div>
        </div>

        {/* Resources Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#D2D2D7] overflow-hidden">
          <SandhillsResourcesList />
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SandhillsResourcesPage() {
  return (
    <AuthProvider>
      <SandhillsResourcesPageContent />
    </AuthProvider>
  );
}

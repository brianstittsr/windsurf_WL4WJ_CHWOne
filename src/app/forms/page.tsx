'use client';

import React, { useState } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus, Sparkles, X, LayoutTemplate, GraduationCap } from 'lucide-react';
import FormsManagement from '@/components/Forms/FormsManagement';
import BmadFormWizard from '@/components/Forms/BmadFormWizard';
import AdminLayout from '@/components/Layout/AdminLayout';

// Inner component that uses the auth context
function FormsContent() {
  const { currentUser, loading } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading Forms...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!currentUser) {
    redirect('/login');
  }

  // Handle wizard completion
  const handleWizardComplete = (formId: string) => {
    console.log('Form generated:', formId);
    setWizardOpen(false);
    window.location.reload();
  };

  // Handle create form manually button
  const handleCreateManually = () => {
    setCreateModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Apple-style Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#5856D6] rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Forms</h1>
              <p className="text-[#6E6E73]">Create and manage health assessment forms</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Apple Style */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create with AI Wizard
          </button>
          <button
            onClick={handleCreateManually}
            className="flex items-center gap-2 px-5 py-3 bg-white text-[#1D1D1F] border border-[#D2D2D7] rounded-xl font-medium text-sm hover:bg-[#F5F5F7] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Form Manually
          </button>
          <Link
            href="/forms/templates"
            className="flex items-center gap-2 px-5 py-3 bg-white text-[#1D1D1F] border border-[#D2D2D7] rounded-xl font-medium text-sm hover:bg-[#F5F5F7] transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            Form Templates
          </Link>
          <Link
            href="/forms/digital-literacy"
            className="flex items-center gap-2 px-5 py-3 bg-[#AF52DE] text-white rounded-xl font-medium text-sm hover:bg-[#9B3DC9] transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Digital Literacy Program
          </Link>
        </div>

        {/* Forms Management Component */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
          <FormsManagement 
            openCreateModal={createModalOpen}
            onCreateModalClose={() => setCreateModalOpen(false)}
          />
        </div>
      </div>

      {/* AI Wizard Dialog - Apple Style */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setWizardOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2D2D7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1D1D1F]">AI Form Wizard</h2>
                  <p className="text-sm text-[#6E6E73]">Create forms with AI assistance</p>
                </div>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F5F5F7] text-[#6E6E73] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <BmadFormWizard onComplete={handleWizardComplete} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function FormsPage() {
  return (
    <AuthProvider>
      <FormsContent />
    </AuthProvider>
  );
}

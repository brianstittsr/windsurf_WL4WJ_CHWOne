'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AppleProfileComponent from '@/components/CHW/AppleProfileComponent';
import { OnboardingFlow } from '@/components/Onboarding';
import { WelcomeModal } from '@/components/Onboarding';
import AdminLayout from '@/components/Layout/AdminLayout';
import { PlayCircle, User } from 'lucide-react';

function ProfilePageContent() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleLaunchTour = () => {
    console.log('[ProfilePage] Launching platform tour');
    setShowWelcomeModal(true);
  };

  const handleWelcomeClose = (dontShowAgain: boolean) => {
    setShowWelcomeModal(false);
  };

  return (
    <>
      <OnboardingFlow showLaunchButton={false}>
        <AdminLayout>
          {/* Apple-style Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0071E3] rounded-2xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
                    My Profile
                  </h1>
                  <p className="text-sm text-[#6E6E73]">
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
              <button
                onClick={handleLaunchTour}
                className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-sm font-medium rounded-full transition-colors"
              >
                <PlayCircle className="h-4 w-4" />
                Platform Tour
              </button>
            </div>
          </div>
          
          {/* Profile Content with Tabs */}
          <AppleProfileComponent editable={true} />
        </AdminLayout>
      </OnboardingFlow>

      {/* Welcome Modal - Rendered outside layout hierarchy to avoid z-index issues */}
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={handleWelcomeClose} 
      />
    </>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfilePageContent />
    </AuthProvider>
  );
}

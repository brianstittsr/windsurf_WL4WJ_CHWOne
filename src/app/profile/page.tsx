'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import EnhancedProfileComponent from '@/components/CHW/EnhancedProfileComponent';
import { OnboardingFlow } from '@/components/Onboarding';
import { WelcomeModal } from '@/components/Onboarding';
import AdminLayout from '@/components/Layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

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
    <OnboardingFlow showLaunchButton={false}>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            My Profile
          </h1>
          <Button
            onClick={handleLaunchTour}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            View Platform Tour
          </Button>
        </div>
        <EnhancedProfileComponent editable={true} />
      </AdminLayout>

      {/* Welcome Modal */}
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={handleWelcomeClose} 
      />
    </OnboardingFlow>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfilePageContent />
    </AuthProvider>
  );
}

'use client';

import React, { useState } from 'react';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import EnhancedProfileComponent from '@/components/CHW/EnhancedProfileComponent';
import { OnboardingFlow } from '@/components/Onboarding';
import { WelcomeModal, ProfileCompletionModal } from '@/components/Onboarding';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

function ProfilePageContent() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleLaunchTour = () => {
    console.log('[ProfilePage] Launching platform tour');
    setShowWelcomeModal(true);
  };

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
  };

  return (
    <OnboardingFlow showLaunchButton={false}>
      <UnifiedLayout>
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-8">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900">
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
          </div>
        </div>
      </UnifiedLayout>

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

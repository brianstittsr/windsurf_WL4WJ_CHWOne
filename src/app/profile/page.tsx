'use client';

import React from 'react';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import EnhancedProfileComponent from '@/components/CHW/EnhancedProfileComponent';
import { OnboardingFlow } from '@/components/Onboarding';

function ProfilePageContent() {
  return (
    <OnboardingFlow>
      <UnifiedLayout>
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                My Profile
              </h1>
            </div>
            <EnhancedProfileComponent editable={true} />
          </div>
        </div>
      </UnifiedLayout>
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

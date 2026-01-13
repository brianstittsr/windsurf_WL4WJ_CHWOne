'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import EnhancedProfileComponent from '@/components/CHW/EnhancedProfileComponent';
import { OnboardingFlow } from '@/components/Onboarding';
import { WelcomeModal } from '@/components/Onboarding';
import { Button } from '@/components/ui/button';
import { PlayCircle, Home, LogOut, ArrowLeft } from 'lucide-react';

function ProfilePageContent() {
  const { currentUser, signOut } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleLaunchTour = () => {
    console.log('[ProfilePage] Launching platform tour');
    setShowWelcomeModal(true);
  };

  const handleWelcomeClose = (dontShowAgain: boolean) => {
    setShowWelcomeModal(false);
    // Note: When manually launched from profile page, we don't save the dontShowAgain preference
    // The OnboardingFlow handles that for automatic popups
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <OnboardingFlow showLaunchButton={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        {/* Simple Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image 
                  src="/images/CHWOneLogoDesign.png" 
                  width={40}
                  height={40}
                  alt="CHWOne Logo"
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-slate-800">CHWOne</span>
                  <span className="text-[10px] text-slate-500 italic hidden sm:block">A Women Leading for Wellness and Justice product</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              {currentUser && (
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
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
            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <EnhancedProfileComponent editable={true} />
            </div>
          </div>
        </main>
      </div>

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

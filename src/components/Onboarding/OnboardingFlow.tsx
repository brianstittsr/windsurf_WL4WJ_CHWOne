'use client';

import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeModal from './WelcomeModal';
import ProfileCompletionModal, { ProfileFormData } from './ProfileCompletionModal';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

interface OnboardingFlowProps {
  children: React.ReactNode;
  showLaunchButton?: boolean;
}

// Helper to check if profile is complete
const isProfileComplete = (profile: any): boolean => {
  return Boolean(
    profile?.firstName && 
    profile?.lastName &&
    profile?.phoneNumber &&
    profile?.title
  );
};

export default function OnboardingFlow({ children, showLaunchButton = false }: OnboardingFlowProps) {
  const { currentUser, userProfile } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Function to manually launch the onboarding flow
  const launchOnboarding = () => {
    console.log('[OnboardingFlow] Manually launching onboarding');
    setShowWelcomeModal(true);
  };

  useEffect(() => {
    // Debug logging
    console.log('[OnboardingFlow] Checking onboarding status:', {
      hasCurrentUser: !!currentUser,
      hasUserProfile: !!userProfile,
      hasCheckedOnboarding,
      userProfileData: userProfile ? {
        hasSeenWelcome: userProfile.hasSeenWelcome,
        dontShowWelcomeAgain: userProfile.dontShowWelcomeAgain,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phoneNumber: userProfile.phoneNumber,
        title: userProfile.title,
      } : null
    });

    if (!currentUser || !userProfile || hasCheckedOnboarding) {
      console.log('[OnboardingFlow] Skipping check - conditions not met');
      return;
    }

    // Check profile completion status
    const profileComplete = isProfileComplete(userProfile);
    const dontShowAgain = userProfile.dontShowWelcomeAgain === true;

    console.log('[OnboardingFlow] Onboarding status:', {
      profileComplete,
      dontShowAgain,
    });

    // Show welcome modal if:
    // 1. Profile is incomplete AND user hasn't selected "don't show again"
    // OR
    // 2. User has never seen the welcome (first time)
    if (!profileComplete && !dontShowAgain) {
      console.log('[OnboardingFlow] Showing welcome modal - profile incomplete');
      setShowWelcomeModal(true);
    } else if (profileComplete) {
      console.log('[OnboardingFlow] User has completed profile');
    } else {
      console.log('[OnboardingFlow] User selected dont show again');
    }

    setHasCheckedOnboarding(true);
  }, [currentUser, userProfile, hasCheckedOnboarding]);

  const handleWelcomeClose = async (dontShowAgain: boolean) => {
    setShowWelcomeModal(false);
    
    // Update Firestore with welcome status
    if (currentUser?.uid) {
      try {
        const updateData: any = {
          hasSeenWelcome: true,
          welcomeSeenAt: new Date(),
        };
        
        // Only set dontShowWelcomeAgain if user checked the box
        if (dontShowAgain) {
          updateData.dontShowWelcomeAgain = true;
        }
        
        await updateDoc(doc(db, 'users', currentUser.uid), updateData);
        console.log('[OnboardingFlow] Updated welcome status, dontShowAgain:', dontShowAgain);
      } catch (error) {
        console.error('Error updating welcome status:', error);
      }
    }

    // Check if profile needs completion - show profile modal
    if (!isProfileComplete(userProfile)) {
      setShowProfileModal(true);
    }
  };

  const handleProfileSave = async (data: ProfileFormData) => {
    if (!currentUser?.uid) return;

    try {
      const updateData: Record<string, any> = {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phone || null,
        organization: data.organization || null,
        title: data.title || null,
        region: data.region || null,
        bio: data.bio || null,
        profileCompletedAt: new Date(),
        updatedAt: new Date(),
      };

      // If an organization was selected from search, also save the linkedNonprofitId
      if (data.organizationId) {
        updateData.linkedNonprofitId = data.organizationId;
      }

      await updateDoc(doc(db, 'users', currentUser.uid), updateData);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const handleProfileClose = () => {
    setShowProfileModal(false);
  };

  // Debug: Log if button should be shown
  console.log('[OnboardingFlow] showLaunchButton:', showLaunchButton);

  return (
    <>
      {children}
      
      {/* Launch Onboarding Button - Always visible on profile page */}
      {showLaunchButton && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
          }}
        >
          <Button
            onClick={launchOnboarding}
            style={{
              background: 'linear-gradient(to right, #2563eb, #7c3aed)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
            }}
          >
            <PlayCircle style={{ width: '20px', height: '20px' }} />
            View Platform Tour
          </Button>
        </div>
      )}
      
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={handleWelcomeClose} 
      />
      
      <ProfileCompletionModal
        open={showProfileModal}
        onClose={handleProfileClose}
        onSave={handleProfileSave}
        initialData={{
          firstName: userProfile?.firstName || '',
          lastName: userProfile?.lastName || '',
          phone: userProfile?.phoneNumber || '',
          organization: userProfile?.organization || '',
          organizationId: userProfile?.linkedNonprofitId || '',
          title: userProfile?.title || '',
          region: userProfile?.region || '',
          bio: userProfile?.bio || '',
        }}
        linkedOrganization={
          userProfile?.linkedNonprofitId 
            ? { id: userProfile.linkedNonprofitId, name: userProfile.organization || '' }
            : null
        }
      />
    </>
  );
}

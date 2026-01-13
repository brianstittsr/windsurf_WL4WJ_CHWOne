'use client';

import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeModal from './WelcomeModal';
import ProfileCompletionModal, { ProfileFormData } from './ProfileCompletionModal';

interface OnboardingFlowProps {
  children: React.ReactNode;
}

export default function OnboardingFlow({ children }: OnboardingFlowProps) {
  const { currentUser, userProfile } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    // Debug logging
    console.log('[OnboardingFlow] Checking onboarding status:', {
      hasCurrentUser: !!currentUser,
      hasUserProfile: !!userProfile,
      hasCheckedOnboarding,
      userProfileData: userProfile ? {
        hasSeenWelcome: userProfile.hasSeenWelcome,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
      } : null
    });

    if (!currentUser || !userProfile || hasCheckedOnboarding) {
      console.log('[OnboardingFlow] Skipping check - conditions not met');
      return;
    }

    // Check if user has completed onboarding
    const hasSeenWelcome = userProfile.hasSeenWelcome === true;
    const hasCompletedProfile = Boolean(
      userProfile.firstName && 
      userProfile.lastName
    );

    console.log('[OnboardingFlow] Onboarding status:', {
      hasSeenWelcome,
      hasCompletedProfile,
    });

    // Show welcome modal for first-time users
    if (!hasSeenWelcome) {
      console.log('[OnboardingFlow] Showing welcome modal');
      setShowWelcomeModal(true);
    } else if (!hasCompletedProfile) {
      // If they've seen welcome but haven't completed profile, show profile modal
      console.log('[OnboardingFlow] Showing profile completion modal');
      setShowProfileModal(true);
    } else {
      console.log('[OnboardingFlow] User has completed onboarding');
    }

    setHasCheckedOnboarding(true);
  }, [currentUser, userProfile, hasCheckedOnboarding]);

  const handleWelcomeClose = async () => {
    setShowWelcomeModal(false);
    
    // Mark welcome as seen in Firestore
    if (currentUser?.uid) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          hasSeenWelcome: true,
          welcomeSeenAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating welcome status:', error);
      }
    }

    // Check if profile needs completion
    const hasCompletedProfile = Boolean(
      userProfile?.firstName && 
      userProfile?.lastName
    );

    if (!hasCompletedProfile) {
      setShowProfileModal(true);
    }
  };

  const handleProfileSave = async (data: ProfileFormData) => {
    if (!currentUser?.uid) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
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
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const handleProfileClose = () => {
    setShowProfileModal(false);
  };

  return (
    <>
      {children}
      
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
          title: userProfile?.title || '',
          region: userProfile?.region || '',
          bio: userProfile?.bio || '',
        }}
      />
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationType } from '@/types/firebase/schema';
import ProfileCompletionWizard from './ProfileCompletionWizard';
import ToolsOnboardingWizard from './ToolsOnboardingWizard';

interface ProfileCompletionCheckProps {
  children: React.ReactNode;
}

/**
 * Component that checks if the user's profile is complete and shows
 * the profile completion wizard if needed, followed by the tools onboarding wizard.
 * 
 * This should wrap pages that require a complete profile.
 */
export default function ProfileCompletionCheck({ children }: ProfileCompletionCheckProps) {
  const { currentUser, userProfile } = useAuth();
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showToolsWizard, setShowToolsWizard] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once we have user data
    if (!currentUser || !userProfile) {
      setHasChecked(true);
      return;
    }

    // Check if profile is complete
    const isProfileComplete = checkProfileCompletion(userProfile);
    
    // Check if user has dismissed the profile wizard this session
    const profileDismissedKey = `profile_wizard_dismissed_${currentUser.uid}`;
    const profileWasDismissed = sessionStorage.getItem(profileDismissedKey) === 'true';
    
    // Check if user has completed the tools onboarding
    const toolsOnboardingKey = `tools_onboarding_complete_${currentUser.uid}`;
    const toolsOnboardingComplete = localStorage.getItem(toolsOnboardingKey) === 'true';
    
    if (!isProfileComplete && !profileWasDismissed) {
      // Show profile wizard first
      setShowProfileWizard(true);
    } else if (isProfileComplete && !toolsOnboardingComplete) {
      // Profile is complete, show tools onboarding
      setShowToolsWizard(true);
    }
    
    setHasChecked(true);
  }, [currentUser, userProfile]);

  const checkProfileCompletion = (profile: any): boolean => {
    // Check if profile was explicitly marked as complete
    if (profile.profileCompleted === true) {
      return true;
    }

    // Check based on organization type
    const orgType = profile.organizationType;
    
    // Basic checks for all users
    if (!profile.displayName || profile.displayName.trim() === '') {
      return false;
    }

    // Type-specific checks
    switch (orgType) {
      case OrganizationType.CHW:
        // CHW needs professional info and service area
        if (!profile.professional?.expertise || profile.professional.expertise.length === 0) {
          return false;
        }
        if (!profile.serviceArea?.region) {
          return false;
        }
        break;
        
      case OrganizationType.NONPROFIT:
        // Nonprofit needs organization info
        if (!profile.organization?.name) {
          return false;
        }
        break;
        
      case OrganizationType.CHW_ASSOCIATION:
        // Association needs basic association info
        if (!profile.association?.name) {
          return false;
        }
        break;
        
      case OrganizationType.STATE:
        // State agency needs department info
        if (!profile.agency?.department) {
          return false;
        }
        break;
    }

    return true;
  };

  const handleProfileWizardClose = () => {
    // Mark as dismissed for this session
    if (currentUser) {
      const dismissedKey = `profile_wizard_dismissed_${currentUser.uid}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
    setShowProfileWizard(false);
  };

  const handleProfileWizardComplete = () => {
    setShowProfileWizard(false);
    // After profile is complete, show the tools onboarding wizard
    const toolsOnboardingKey = `tools_onboarding_complete_${currentUser?.uid}`;
    const toolsOnboardingComplete = localStorage.getItem(toolsOnboardingKey) === 'true';
    
    if (!toolsOnboardingComplete) {
      setShowToolsWizard(true);
    } else {
      // Refresh to update profile data
      window.location.reload();
    }
  };

  const handleToolsWizardClose = () => {
    // Mark tools onboarding as skipped for this session
    setShowToolsWizard(false);
  };

  const handleToolsWizardComplete = () => {
    setShowToolsWizard(false);
    // Tools onboarding is marked complete in the wizard itself via localStorage
  };

  // Don't render anything until we've checked
  if (!hasChecked) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <ProfileCompletionWizard
        open={showProfileWizard}
        onClose={handleProfileWizardClose}
        onComplete={handleProfileWizardComplete}
      />
      <ToolsOnboardingWizard
        open={showToolsWizard}
        onClose={handleToolsWizardClose}
        onComplete={handleToolsWizardComplete}
      />
    </>
  );
}

/**
 * Hook to check if the current user's profile is complete
 */
export function useProfileCompletion() {
  const { currentUser, userProfile } = useAuth();
  const [isComplete, setIsComplete] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!currentUser || !userProfile) {
      setIsChecking(false);
      return;
    }

    const profile = userProfile as any;
    
    // Check if profile was explicitly marked as complete
    if (profile.profileCompleted === true) {
      setIsComplete(true);
      setIsChecking(false);
      return;
    }

    // Basic check - has display name
    if (!profile.displayName || profile.displayName.trim() === '') {
      setIsComplete(false);
      setIsChecking(false);
      return;
    }

    // Type-specific checks
    const orgType = profile.organizationType;
    
    switch (orgType) {
      case OrganizationType.CHW:
        setIsComplete(
          profile.professional?.expertise?.length > 0 &&
          profile.serviceArea?.region
        );
        break;
        
      case OrganizationType.NONPROFIT:
        setIsComplete(!!profile.organization?.name);
        break;
        
      case OrganizationType.CHW_ASSOCIATION:
        setIsComplete(!!profile.association?.name);
        break;
        
      case OrganizationType.STATE:
        setIsComplete(!!profile.agency?.department);
        break;
        
      default:
        setIsComplete(true);
    }
    
    setIsChecking(false);
  }, [currentUser, userProfile]);

  return { isComplete, isChecking };
}

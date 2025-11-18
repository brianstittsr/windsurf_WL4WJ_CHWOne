'use client';

import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import EnhancedProfileComponent from '@/components/CHW/EnhancedProfileComponent';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

function CHWProfileContent({ id }: { id: string }) {
  const { currentUser } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfiles = JSON.parse(localStorage.getItem('chwProfiles') || '[]');
    const profile = savedProfiles.find((p: any) => p.id === id);
    
    if (profile) {
      setProfileData(profile);
      // Check if current user is the owner
      // For now, allow editing if user is logged in (you can add more specific logic)
      setIsOwner(!!currentUser);
    }
  }, [id, currentUser]);

  return (
    <UnifiedLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Button 
            href="/chws/mock-profiles" 
            variant="outlined" 
            sx={{ mb: 4 }}
          >
            Back to Profiles
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
            CHW Profile {isOwner && '(Edit Mode)'}
          </Typography>
          
          <EnhancedProfileComponent editable={isOwner} />
        </Box>
      </Container>
    </UnifiedLayout>
  );
}

export default function CHWProfilePage({ params }: ProfilePageProps) {
  const { id } = params;
  
  return (
    <AuthProvider>
      <CHWProfileContent id={id} />
    </AuthProvider>
  );
}

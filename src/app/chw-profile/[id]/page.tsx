'use client';

import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Alert, Card, CardContent, Avatar, Chip, Grid } from '@mui/material';
import { LocationOn, Language, Work, Email } from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema/unified-schema';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

function CHWProfileContent({ id }: { id: string }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        // Load profile from Firebase using the ID
        const profileRef = doc(db, COLLECTIONS.CHW_PROFILES, id);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfileData({ id: profileSnap.id, ...profileSnap.data() });
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <UnifiedLayout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </Container>
      </UnifiedLayout>
    );
  }

  if (error || !profileData) {
    return (
      <UnifiedLayout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Button href="/chws" variant="outlined" sx={{ mb: 4 }}>
              Back to Profiles
            </Button>
            <Alert severity="error">{error || 'Profile not found'}</Alert>
          </Box>
        </Container>
      </UnifiedLayout>
    );
  }

  const isOwner = currentUser?.uid === profileData.userId;

  return (
    <UnifiedLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Button href="/chws" variant="outlined" sx={{ mb: 4 }}>
            Back to Profiles
          </Button>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={profileData.profilePicture}
                  sx={{ width: 100, height: 100, mr: 3 }}
                >
                  {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1">
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {profileData.displayName}
                  </Typography>
                  {isOwner && (
                    <Chip label="Your Profile" color="primary" size="small" sx={{ mt: 1 }} />
                  )}
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Contact Information */}
                {profileData.email && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1 }} />
                      <Typography>{profileData.email}</Typography>
                    </Box>
                  </Grid>
                )}

                {/* Location */}
                {profileData.address && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1 }} />
                      <Typography>
                        {profileData.address.city}, {profileData.address.state}
                        {profileData.serviceArea?.countyResideIn && ` (${profileData.serviceArea.countyResideIn} County)`}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* Languages */}
                {profileData.professional?.languages && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Language sx={{ mr: 1 }} />
                      <Typography sx={{ mr: 1 }}>Languages:</Typography>
                      {profileData.professional.languages.map((lang: string) => (
                        <Chip key={lang} label={lang} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Specializations */}
                {profileData.professional?.expertise && profileData.professional.expertise.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Work sx={{ mr: 1 }} />
                      <Typography sx={{ mr: 1 }}>Specializations:</Typography>
                      {profileData.professional.expertise.map((spec: string) => (
                        <Chip key={spec} label={spec} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Bio */}
                {profileData.professional?.bio && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>About</Typography>
                    <Typography variant="body1">{profileData.professional.bio}</Typography>
                  </Grid>
                )}

                {/* Certification */}
                {profileData.certification && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Certification</Typography>
                    <Typography>
                      Status: <Chip 
                        label={profileData.certification.certificationStatus || 'Unknown'} 
                        size="small" 
                        color={profileData.certification.certificationStatus === 'certified' ? 'success' : 'default'}
                      />
                    </Typography>
                    {profileData.certification.certificationNumber && (
                      <Typography variant="body2" color="text.secondary">
                        Certificate #: {profileData.certification.certificationNumber}
                      </Typography>
                    )}
                  </Grid>
                )}
              </Grid>

              {isOwner && (
                <Box sx={{ mt: 3 }}>
                  <Button variant="contained" href="/chw-profile">
                    Edit Your Profile
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
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

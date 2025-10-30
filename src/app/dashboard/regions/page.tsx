'use client';

import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';

const regions = [
  { id: 1, name: 'Region 1' },
  { id: 2, name: 'Region 2' },
  { id: 3, name: 'Region 3' },
  { id: 4, name: 'Region 4' },
  { id: 5, name: 'Region 5' },
  { id: 6, name: 'Region 6' },
];

function RegionsPageContent() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const handleRegionClick = (regionId: number) => {
    router.push(`/dashboard/region/${regionId}`);
  };

  const filteredRegions = userProfile?.role === UserRole.ADMIN
    ? regions
    : regions.filter(region => userProfile?.organization === `region${region.id}`);

  return (
    <UnifiedLayout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Regions
        </Typography>
        <Grid container spacing={3}>
          {filteredRegions.map(region => (
            <Grid item xs={12} sm={6} md={4} key={region.id}>
              <Card>
                <CardActionArea onClick={() => handleRegionClick(region.id)}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {region.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </UnifiedLayout>
  );
}

export default function RegionsPage() {
  return (
    <AuthProvider>
      <RegionsPageContent />
    </AuthProvider>
  );
}

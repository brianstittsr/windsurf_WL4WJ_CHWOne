'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Chip, 
  Divider, 
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  LocationOn, 
  Phone, 
  Email, 
  Language, 
  School, 
  Work, 
  CalendarToday,
  AccessTime,
  VerifiedUser
} from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { mockCHWs, MockCHWProfile } from '@/components/CHW/MockCHWProfiles';

interface ExtendedCHWProfile extends MockCHWProfile {
  email: string;
  phone: string;
  activeClients: number;
  completedTrainings: number;
  totalEncounters: number;
  availability: {
    [key: string]: string[];
  };
  joinDate: Date;
  education: string[];
}

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CHWProfilePage({ params }: ProfilePageProps) {
  // Use React.use() to unwrap the params promise as recommended by Next.js 15+
  const unwrappedParams = use(params);
  const { id } = unwrappedParams as { id: string };
  const [chw, setChw] = useState<MockCHWProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the CHW by ID from our mock data
    const foundChw = mockCHWs.find(c => c.id === id);
    
    if (foundChw) {
      setChw(foundChw);
    }
    
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <UnifiedLayout>
        <Container>
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography>Loading profile...</Typography>
          </Box>
        </Container>
      </UnifiedLayout>
    );
  }

  if (!chw) {
    return (
      <UnifiedLayout>
        <Container>
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h4">Profile Not Found</Typography>
            <Typography sx={{ mt: 2 }}>
              The CHW profile you are looking for does not exist or has been removed.
            </Typography>
            <Button href="/chws/mock-profiles" variant="contained" sx={{ mt: 4 }}>
              Back to Profiles
            </Button>
          </Box>
        </Container>
      </UnifiedLayout>
    );
  }

  // Generate additional mock data for a complete profile
  const mockProfile: ExtendedCHWProfile = {
    ...chw,
    email: `${chw.firstName.toLowerCase()}.${chw.lastName.toLowerCase()}@chwone.org`,
    phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    activeClients: Math.floor(10 + Math.random() * 40),
    completedTrainings: Math.floor(3 + Math.random() * 8),
    totalEncounters: Math.floor(100 + Math.random() * 900),
    availability: {
      monday: ['9:00 AM - 5:00 PM'],
      tuesday: ['9:00 AM - 5:00 PM'],
      wednesday: ['9:00 AM - 5:00 PM'],
      thursday: ['9:00 AM - 5:00 PM'],
      friday: ['9:00 AM - 5:00 PM'],
      saturday: chw.certificationLevel === 'advanced' ? ['10:00 AM - 2:00 PM'] : [],
      sunday: []
    },
    joinDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)),
    education: ['CHW Certification', 'First Aid & CPR', ...(chw.certificationLevel === 'advanced' ? ['Advanced Care Coordination'] : [])]
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'entry': return '#4caf50';
      case 'intermediate': return '#2196f3';
      case 'advanced': return '#9c27b0';
      default: return '#757575';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

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
          
          <Grid container spacing={4}>
            {/* Left Column - Profile Info */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar 
                    src={mockProfile.imageUrl} 
                    alt={`${mockProfile.firstName} ${mockProfile.lastName}`}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                  
                  <Typography variant="h4" gutterBottom>
                    {mockProfile.firstName} {mockProfile.lastName}
                  </Typography>
                  
                  <Chip 
                    label={mockProfile.certificationLevel.charAt(0).toUpperCase() + mockProfile.certificationLevel.slice(1)} 
                    sx={{ 
                      backgroundColor: getCertificationColor(mockProfile.certificationLevel), 
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2
                    }} 
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <LocationOn color="primary" sx={{ mr: 0.5 }} />
                    <Typography>
                      {mockProfile.city}, {mockProfile.state} ({mockProfile.county} County)
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {mockProfile.bio}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Email fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={mockProfile.email} />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Phone fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={mockProfile.phone} />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={`Joined: ${formatDate(mockProfile.joinDate)}`} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Language sx={{ mr: 1 }} /> Languages
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {mockProfile.languages.map((lang: string, index: number) => (
                      <Chip key={index} label={lang} />
                    ))}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 1 }} /> Education & Certifications
                  </Typography>
                  <List dense>
                    {mockProfile.education.map((edu: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <VerifiedUser fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={edu} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Right Column - Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Work sx={{ mr: 1 }} /> Specializations
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {mockProfile.specializations.map((spec: string, index: number) => (
                      <Chip 
                        key={index} 
                        label={spec} 
                        variant="outlined" 
                        color="primary" 
                        sx={{ px: 1 }}
                      />
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h5" gutterBottom>
                    Performance Metrics
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                        <Typography variant="h4">{mockProfile.activeClients}</Typography>
                        <Typography variant="body2">Active Clients</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                        <Typography variant="h4">{mockProfile.completedTrainings}</Typography>
                        <Typography variant="body2">Completed Trainings</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                        <Typography variant="h4">{mockProfile.totalEncounters}</Typography>
                        <Typography variant="body2">Total Encounters</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1 }} /> Availability
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.entries(mockProfile.availability).map(([day, hours]) => {
                      const hoursArray = hours as string[];
                      return (
                        <Grid item xs={12} sm={6} key={day}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              bgcolor: hoursArray.length ? 'background.paper' : 'action.disabledBackground'
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                              {day}
                            </Typography>
                            {hoursArray.length > 0 ? (
                              hoursArray.map((hour: string, idx: number) => (
                                <Typography key={idx} variant="body2">
                                  {hour}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not Available
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </UnifiedLayout>
  );
}

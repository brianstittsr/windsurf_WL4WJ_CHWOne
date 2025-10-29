'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  Button, 
  Divider, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import { 
  Group as GroupIcon, 
  ArrowForward as ArrowForwardIcon, 
  Forum as ForumIcon,
  Event as EventIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  LocalHospital as LocalHospitalIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Region5Logo } from '@/components/Logos';

function Region5DashboardContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return <AnimatedLoading message="Loading Region 5 Dashboard..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  // Region 5 information
  const regionInfo = {
    name: "Region 5",
    description: "Region 5 encompasses the southeastern counties of North Carolina, including Cumberland, Robeson, Bladen, Columbus, Brunswick, New Hanover, Pender, Duplin, Sampson, and Onslow counties. This region is characterized by a diverse population with significant rural communities and several military installations.",
    counties: [
      "Cumberland", "Robeson", "Bladen", "Columbus", "Brunswick", 
      "New Hanover", "Pender", "Duplin", "Sampson", "Onslow"
    ],
    coordinator: "Dr. Maria Sanchez",
    contactEmail: "region5@chwone.org",
    contactPhone: "(910) 555-7890",
    officeLocation: "Fayetteville, NC"
  };

  // Enhanced stats for the dashboard
  const stats = [
    { title: 'Active CHWs', value: '42', color: '#1976d2', icon: <PeopleIcon /> },
    { title: 'Active Projects', value: '8', color: '#9c27b0', icon: <WorkIcon /> },
    { title: 'Forms Submitted', value: '287', color: '#2e7d32', icon: <DescriptionIcon /> },
    { title: 'Training Sessions', value: '12', color: '#ed6c02', icon: <SchoolIcon /> }
  ];
  
  // Health metrics for the region
  const healthMetrics = [
    { name: 'Diabetes Screenings', target: 500, current: 325, percentage: 65 },
    { name: 'Blood Pressure Checks', target: 1000, current: 780, percentage: 78 },
    { name: 'COVID-19 Vaccinations', target: 300, current: 215, percentage: 72 },
    { name: 'Mental Health Referrals', target: 200, current: 95, percentage: 48 }
  ];
  
  // Recent announcements
  const announcements = [
    {
      title: 'New Diabetes Prevention Program',
      date: 'October 15, 2025',
      content: 'The Region 5 office is launching a new diabetes prevention program targeting high-risk communities in Cumberland and Robeson counties.'
    },
    {
      title: 'CHW Certification Workshop',
      date: 'October 22, 2025',
      content: 'A certification workshop for new CHWs will be held at the Fayetteville Technical Community College. Registration is now open.'
    },
    {
      title: 'Quarterly Meeting Reminder',
      date: 'November 5, 2025',
      content: 'The quarterly Region 5 CHW meeting will be held on November 12th. Please submit agenda items by November 5th.'
    }
  ];
  
  // Upcoming events
  const upcomingEvents = [
    {
      title: 'Region 5 CHW Quarterly Meetup',
      date: 'November 12, 2025',
      location: 'Fayetteville Technical Community College'
    },
    {
      title: 'Mental Health First Aid Certification',
      date: 'October 28-29, 2025',
      location: 'Virtual (Zoom)'
    },
    {
      title: 'Community Resource Fair',
      date: 'November 5, 2025',
      location: 'Smith Recreation Center, Fayetteville'
    }
  ];

  return (
    <UnifiedLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header with Region 5 Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <Region5Logo size="large" />
          </Box>
          
          {/* Region 5 Information Card */}
          <Card sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ 
              bgcolor: theme.palette.primary.main, 
              color: 'white', 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h5" component="h1" fontWeight="bold">
                Region 5 Overview
              </Typography>
              <Chip 
                label="Southeast NC" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Box>
            <CardContent>
              <Typography variant="body1" paragraph>
                {regionInfo.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1 }} /> Counties in Region 5
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {regionInfo.counties.map(county => (
                      <Chip 
                        key={county} 
                        label={county} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Regional Contact Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <PeopleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Regional Coordinator" 
                        secondary={regionInfo.coordinator} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <LocationOnIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Office Location" 
                        secondary={regionInfo.officeLocation} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Typography variant="body2" color="text.secondary">@</Typography>
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={regionInfo.contactEmail} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Region 5 at a Glance
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: stat.color, mb: 2, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Main Content Grid */}
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={8}>
              {/* Health Metrics */}
              <Card sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Health Initiatives Progress
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  {healthMetrics.map((metric, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{metric.name}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {metric.current} / {metric.target}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={metric.percentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 0.5,
                          bgcolor: 'rgba(0, 0, 0, 0.05)'
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {metric.percentage}% Complete
                      </Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" endIcon={<BarChartIcon />}>
                      View Detailed Reports
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Announcements */}
              <Card sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Recent Announcements
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  {announcements.map((announcement, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {announcement.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {announcement.date}
                        </Typography>
                        <Typography variant="body2">
                          {announcement.content}
                        </Typography>
                      </Box>
                      {index < announcements.length - 1 && <Divider sx={{ my: 2 }} />}
                    </React.Fragment>
                  ))}
                  
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined">
                      View All Announcements
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Right Column */}
            <Grid item xs={12} md={4}>
              {/* Quick Links */}
              <Card sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Quick Links
                  </Typography>
                  <List>
                    <ListItem button component={Link} href="/dashboard/region-5/directory">
                      <ListItemIcon>
                        <GroupIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="CHW Directory" />
                    </ListItem>
                    <ListItem button component={Link} href="/dashboard/region-5/networking">
                      <ListItemIcon>
                        <ForumIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary="Networking Hub" />
                    </ListItem>
                    <ListItem button component={Link} href="/resources">
                      <ListItemIcon>
                        <DescriptionIcon color="action" />
                      </ListItemIcon>
                      <ListItemText primary="Resource Library" />
                    </ListItem>
                    <ListItem button component={Link} href="/training">
                      <ListItemIcon>
                        <SchoolIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Training Portal" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              {/* Upcoming Events */}
              <Card sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Upcoming Events
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {upcomingEvents.map((event, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                        {event.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                      {index < upcomingEvents.length - 1 && <Divider sx={{ my: 1.5 }} />}
                    </Box>
                  ))}
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 1 }}
                    component={Link}
                    href="/dashboard/region-5/networking?tab=events"
                    endIcon={<ArrowForwardIcon />}
                  >
                    View All Events
                  </Button>
                </CardContent>
              </Card>
              
              {/* Directory and Networking Cards */}
              <Card sx={{ mb: 4, bgcolor: '#1a365d', color: 'white', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <GroupIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Region 5 CHW Directory
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Connect with fellow Community Health Workers in Region 5.
                  </Typography>
                  <Button
                    component={Link}
                    href="/dashboard/region-5/directory"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                      }
                    }}
                  >
                    Browse Directory
                  </Button>
                </CardContent>
              </Card>
              
              <Card sx={{ bgcolor: '#9c27b0', color: 'white', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <ForumIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      CHW Networking Hub
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Connect with other CHWs and build your professional network.
                  </Typography>
                  <Button
                    component={Link}
                    href="/dashboard/region-5/networking"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                      }
                    }}
                  >
                    Join Discussions
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function Region5Dashboard() {
  return (
    <AuthProvider>
      <Region5DashboardContent />
    </AuthProvider>
  );
}

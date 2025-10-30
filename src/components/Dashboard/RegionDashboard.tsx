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
import Link from 'next/link';
import Image from 'next/image';

interface RegionDashboardProps {
  regionId: string;
}

// Mock data for regions - in a real app, this would come from a database
const regionData: { [key: string]: any } = {
  '1': { name: 'Region 1', description: 'Description for Region 1', counties: ['County A', 'County B'], coordinator: 'John Doe', officeLocation: 'City 1' },
  '2': { name: 'Region 2', description: 'Description for Region 2', counties: ['County C', 'County D'], coordinator: 'Jane Smith', officeLocation: 'City 2' },
  '3': { name: 'Region 3', description: 'Description for Region 3', counties: ['County E', 'County F'], coordinator: 'Peter Jones', officeLocation: 'City 3' },
  '4': { name: 'Region 4', description: 'Description for Region 4', counties: ['County G', 'County H'], coordinator: 'Mary Williams', officeLocation: 'City 4' },
  '5': { name: 'Region 5', description: 'Region 5 encompasses the southeastern counties of North Carolina...', counties: ['Cumberland', 'Robeson', 'Bladen', 'Columbus', 'Brunswick', 'New Hanover', 'Pender', 'Duplin', 'Sampson', 'Onslow'], coordinator: 'Dr. Maria Sanchez', officeLocation: 'Fayetteville, NC' },
  '6': { name: 'Region 6', description: 'Description for Region 6', counties: ['County I', 'County J'], coordinator: 'David Brown', officeLocation: 'City 6' },
};

export default function RegionDashboard({ regionId }: RegionDashboardProps) {
  const theme = useTheme();
  const regionInfo = regionData[regionId] || { name: `Region ${regionId}`, description: 'No data available.', counties: [], coordinator: 'N/A', officeLocation: 'N/A' };

  const stats = [
    { title: 'Active CHWs', value: '42', color: '#1976d2', icon: <PeopleIcon /> },
    { title: 'Active Projects', value: '8', color: '#9c27b0', icon: <WorkIcon /> },
    { title: 'Forms Submitted', value: '287', color: '#2e7d32', icon: <DescriptionIcon /> },
    { title: 'Training Sessions', value: '12', color: '#ed6c02', icon: <SchoolIcon /> }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
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
              {regionInfo.name} Overview
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
                  <LocationOnIcon sx={{ mr: 1 }} /> Counties in {regionInfo.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {regionInfo.counties.map((county: string) => (
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
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Image 
              src="https://i0.wp.com/www.northcarolinahealthnews.org/wp-content/uploads/2019/02/MedicaidManagedCareMap.jpg?w=1233&ssl=1"
              alt="NC Medicaid Managed Care Regions Map"
              width={1233}
              height={800}
              layout="responsive"
            />
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {regionInfo.name} at a Glance
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
      </Box>
    </Container>
  );
}

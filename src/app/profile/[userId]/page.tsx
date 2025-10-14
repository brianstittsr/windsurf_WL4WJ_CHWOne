'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  LocationOn,
  Work,
  School,
  Language,
  Schedule,
  Folder,
  Share,
  Edit,
  Visibility,
  VisibilityOff,
  HelpOutline as Help,
  ContentCopy,
  OpenInNew,
  DirectionsCar,
  Add,
  Send,
  AttachFile,
  Link,
  ContactMail,
  Business,
  CalendarToday,
  Assessment,
  Group,
  Message,
  Call
} from '@mui/icons-material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { CHWProfile, CHWResource } from '@/types/platform.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Inner component that uses the auth context
function CHWProfileContent() {
  const { userId } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<CHWProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Share contact dialog
  const [shareContactOpen, setShareContactOpen] = useState(false);
  const [shareResourceOpen, setShareResourceOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CHWResource | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  // Edit profile
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CHWProfile | null>(null);

  useEffect(() => {
    if (currentUser?.uid === userId) {
      setIsOwnProfile(true);
    }
    loadProfile();
  }, [userId, currentUser]);

  const loadProfile = async () => {
    try {
      // Mock profile data - replace with actual API call
      const mockProfile: CHWProfile = {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'female',
        primaryPhone: '(555) 123-4567',
        secondaryPhone: '(555) 987-6543',
        emergencyContact: {
          name: 'Juan Rodriguez',
          relationship: 'Brother',
          phone: '(555) 456-7890'
        },
        chwId: 'CHW-2024-001',
        certificationLevel: 'advanced',
        hireDate: new Date('2020-01-15'),
        supervisor: 'Dr. Sarah Johnson',
        ncchwaRecertificationDate: new Date('2025-12-31'),
        languages: ['English', 'Spanish', 'Portuguese'],
        serviceArea: ['Downtown', 'East Side', 'West End'],
        zipCodes: ['27601', '27603', '27604', '27605'],
        travelRadius: 25,
        skills: ['Health Education', 'Case Management', 'Cultural Competency', 'Community Outreach'],
        specializations: ['Diabetes Management', 'Maternal Health', 'Mental Health First Aid'],
        availability: {
          monday: ['9:00 AM - 5:00 PM'],
          tuesday: ['9:00 AM - 5:00 PM'],
          wednesday: ['9:00 AM - 5:00 PM'],
          thursday: ['9:00 AM - 5:00 PM'],
          friday: ['9:00 AM - 5:00 PM'],
          saturday: [],
          sunday: []
        },
        resources: [
          {
            id: '1',
            title: 'Diabetes Management Guide',
            description: 'Comprehensive guide for diabetes care and management',
            category: 'guide',
            url: 'https://example.com/diabetes-guide',
            tags: ['diabetes', 'health', 'education'],
            isPublic: true,
            sharedWith: [],
            createdAt: new Date()
          },
          {
            id: '2',
            title: 'Mental Health Resources',
            description: 'Local mental health support services and hotlines',
            category: 'contact',
            url: 'https://example.com/mental-health',
            tags: ['mental health', 'support', 'crisis'],
            isPublic: true,
            sharedWith: [],
            createdAt: new Date()
          }
        ],
        equipment: ['Blood Pressure Monitor', 'Glucometer', 'Scale', 'First Aid Kit'],
        profileVisible: true,
        allowContactSharing: true,
        isPublicProfile: false,
        bio: 'Dedicated Community Health Worker with 4 years of experience serving underserved communities in North Carolina. Passionate about improving health outcomes through education, advocacy, and comprehensive care coordination.',
        profilePictureUrl: 'https://via.placeholder.com/150',
        completedTrainings: 12,
        activeClients: 45,
        totalEncounters: 1250,
        lastActivityDate: new Date(),
        mileageEntries: [
          {
            id: '1',
            date: new Date('2025-10-10'),
            startLocation: 'Office',
            endLocation: 'Community Center',
            purpose: 'Health Workshop',
            miles: 12.5,
            notes: 'Monthly diabetes workshop',
            reimbursed: true,
            reimbursementDate: new Date('2025-10-15')
          },
          {
            id: '2',
            date: new Date('2025-10-12'),
            startLocation: 'Office',
            endLocation: 'Client Home',
            purpose: 'Home Visit',
            miles: 8.2,
            notes: 'Follow-up visit',
            reimbursed: false
          }
        ],
        totalMiles: 20.7
      };

      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleShareContact = async () => {
    // Mock contact sharing - replace with actual API call
    alert(`Contact information shared with ${recipientEmail}`);
    setShareContactOpen(false);
    setRecipientEmail('');
    setMessage('');
  };

  const handleShareResource = async (resource: CHWResource) => {
    // Mock resource sharing - replace with actual API call
    alert(`Resource "${resource.title}" shared with ${recipientEmail}`);
    setShareResourceOpen(false);
    setRecipientEmail('');
    setMessage('');
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      // Mock profile update - replace with actual API call
      setProfile(editedProfile);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleProfileVisibilityChange = async (visible: boolean) => {
    if (!profile) return;

    const updatedProfile = { ...profile, profileVisible: visible };
    setProfile(updatedProfile);

    // Mock API call - replace with actual implementation
    alert(`Profile ${visible ? 'made visible' : 'hidden'} in directory`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Profile not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={profile.profilePictureUrl}
                sx={{ width: 120, height: 120 }}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {profile.certificationLevel?.toUpperCase()} CHW • ID: {profile.chwId}
              </Typography>
              {profile.bio && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {profile.bio}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profile.languages.map((lang) => (
                  <Chip key={lang} label={lang} size="small" variant="outlined" />
                ))}
              </Box>
            </Grid>
            {isOwnProfile && (
              <Grid item>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.profileVisible}
                          onChange={(e) => handleProfileVisibilityChange(e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {profile.profileVisible ? <Visibility /> : <VisibilityOff />}
                          <Typography variant="body2">
                            Visible in Directory
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedProfile?.isPublicProfile || false}
                          onChange={(e) => {
                            if (editedProfile) {
                              const isPublic = e.target.checked;
                              setEditedProfile({
                                ...editedProfile,
                                isPublicProfile: isPublic
                              });
                              
                              // Update the profile state as well
                              if (profile) {
                                setProfile({
                                  ...profile,
                                  isPublicProfile: isPublic
                                });
                              }
                              
                              // In a real app, you would save this change immediately
                              if (isPublic) {
                                // Generate a shareable link
                                const shareableLink = `${window.location.origin}/public-profile/${userId}`;
                                navigator.clipboard.writeText(shareableLink);
                                alert(`Profile made public! Shareable link copied to clipboard: ${shareableLink}`);
                              } else {
                                alert('Profile is now private');
                              }
                            }
                          }}
                          color="secondary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Share />
                          <Typography variant="body2">
                            Make Profile Public
                          </Typography>
                          <Tooltip title="When enabled, your profile will be accessible to the public via a shareable link">
                            <IconButton size="small">
                              <Help fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Box>
                  
                  {/* Display public profile link when profile is public */}
                  {profile.isPublicProfile && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Link fontSize="small" /> Public Profile Link
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={`${window.location.origin}/public-profile/${userId}`}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{ bgcolor: 'white' }}
                        />
                        <Tooltip title="Copy link">
                          <IconButton 
                            onClick={() => {
                              const link = `${window.location.origin}/public-profile/${userId}`;
                              navigator.clipboard.writeText(link);
                              alert('Link copied to clipboard!');
                            }}
                            color="primary"
                            size="small"
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isOwnProfile && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Share & Connect</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<ContactMail />}
                onClick={() => setShareContactOpen(true)}
                disabled={!profile.allowContactSharing}
              >
                Share Contact
              </Button>
              <Button
                variant="outlined"
                startIcon={<Message />}
                onClick={() => {/* Implement messaging */}}
              >
                Send Message
              </Button>
              <Button
                variant="outlined"
                startIcon={<Call />}
                component="a"
                href={`tel:${profile.primaryPhone}`}
              >
                Call
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Overview" />
            <Tab label="Professional Info" />
            <Tab label="Resources" />
            <Tab label="Availability" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person /> Personal Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Full Name" secondary={`${profile.firstName} ${profile.lastName}`} />
                    </ListItem>
                    {profile.dateOfBirth && (
                      <ListItem>
                        <ListItemText
                          primary="Date of Birth"
                          secondary={profile.dateOfBirth.toLocaleDateString()}
                        />
                      </ListItem>
                    )}
                    {profile.gender && (
                      <ListItem>
                        <ListItemText primary="Gender" secondary={profile.gender} />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone /> Contact Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Primary Phone" secondary={profile.primaryPhone} />
                    </ListItem>
                    {profile.secondaryPhone && (
                      <ListItem>
                        <ListItemText primary="Secondary Phone" secondary={profile.secondaryPhone} />
                      </ListItem>
                    )}
                    {profile.emergencyContact && (
                      <ListItem>
                        <ListItemText
                          primary="Emergency Contact"
                          secondary={`${profile.emergencyContact.name} (${profile.emergencyContact.relationship}) - ${profile.emergencyContact.phone}`}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Service Area */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn /> Service Area
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Areas Served:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {profile.serviceArea.map((area) => (
                        <Chip key={area} label={area} size="small" />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>ZIP Codes:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {profile.zipCodes.map((zip) => (
                        <Chip key={zip} label={zip} size="small" variant="outlined" />
                      ))}
                    </Box>
                    {profile.travelRadius && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Travel Radius: {profile.travelRadius} miles
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment /> Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">{profile.activeClients}</Typography>
                        <Typography variant="body2" color="text.secondary">Active Clients</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">{profile.totalEncounters}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Encounters</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">{profile.completedTrainings}</Typography>
                        <Typography variant="body2" color="text.secondary">Completed Trainings</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {profile.lastActivityDate ? profile.lastActivityDate.toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Last Activity</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Mileage Tracking */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar /> Mileage Tracking
                    </Typography>
                    {isOwnProfile && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => {
                          // In a real app, this would open a dialog to add a new mileage entry
                          alert('Add mileage entry functionality would open here');
                        }}
                      >
                        Add Entry
                      </Button>
                    )}
                  </Box>
                  
                  {profile.mileageEntries && profile.mileageEntries.length > 0 ? (
                    <>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Start</TableCell>
                              <TableCell>End</TableCell>
                              <TableCell>Purpose</TableCell>
                              <TableCell align="right">Miles</TableCell>
                              <TableCell>Status</TableCell>
                              {isOwnProfile && <TableCell align="right">Actions</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {profile.mileageEntries.map((entry) => (
                              <TableRow key={entry.id}>
                                <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                                <TableCell>{entry.startLocation}</TableCell>
                                <TableCell>{entry.endLocation}</TableCell>
                                <TableCell>{entry.purpose}</TableCell>
                                <TableCell align="right">{entry.miles.toFixed(1)}</TableCell>
                                <TableCell>
                                  <Chip 
                                    size="small" 
                                    label={entry.reimbursed ? 'Reimbursed' : 'Pending'} 
                                    color={entry.reimbursed ? 'success' : 'warning'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                {isOwnProfile && (
                                  <TableCell align="right">
                                    <IconButton size="small">
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={4} align="right"><strong>Total Miles:</strong></TableCell>
                              <TableCell align="right"><strong>{profile.totalMiles?.toFixed(1) || '0.0'}</strong></TableCell>
                              <TableCell colSpan={isOwnProfile ? 2 : 1}></TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">No mileage entries recorded</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Professional Info Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work /> Professional Information
                  </Typography>
                  <List dense>
                    {profile.chwId && (
                      <ListItem>
                        <ListItemText primary="CHW ID" secondary={profile.chwId} />
                      </ListItem>
                    )}
                    {profile.certificationLevel && (
                      <ListItem>
                        <ListItemText primary="Certification Level" secondary={profile.certificationLevel} />
                      </ListItem>
                    )}
                    {profile.hireDate && (
                      <ListItem>
                        <ListItemText
                          primary="Hire Date"
                          secondary={profile.hireDate.toLocaleDateString()}
                        />
                      </ListItem>
                    )}
                    {profile.supervisor && (
                      <ListItem>
                        <ListItemText primary="Supervisor" secondary={profile.supervisor} />
                      </ListItem>
                    )}
                    {profile.ncchwaRecertificationDate && (
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              NCCHWA Recertification Date
                              <Tooltip title="Visit NCCHWA website to renew">
                                <IconButton 
                                  size="small" 
                                  component="a" 
                                  href="https://www.ncchwa.org" 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <OpenInNew fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          } 
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {profile.ncchwaRecertificationDate.toLocaleDateString()}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={`${Math.max(0, Math.ceil((profile.ncchwaRecertificationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining`}
                                color={Math.ceil((profile.ncchwaRecertificationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 30 ? 'error' : 'success'}
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          } 
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School /> Skills & Specializations
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Skills:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {profile.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Specializations:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {profile.specializations.map((spec) => (
                        <Chip key={spec} label={spec} size="small" color="secondary" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business /> Equipment & Resources
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {profile.equipment.map((item) => (
                      <Chip key={item} label={item} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Resources Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {profile.resources.map((resource) => (
              <Grid item xs={12} md={6} key={resource.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{resource.title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          {resource.category === 'document' && <AttachFile />}
                          {resource.category === 'link' && <Link />}
                          {resource.category === 'contact' && <ContactMail />}
                          {resource.category === 'tool' && <Business />}
                          {resource.category === 'guide' && <School />}
                          <Chip label={resource.category} size="small" variant="outlined" />
                        </Box>
                      </Box>
                      {!isOwnProfile && (
                        <Tooltip title="Share this resource">
                          <IconButton
                            onClick={() => {
                              setSelectedResource(resource);
                              setShareResourceOpen(true);
                            }}
                          >
                            <Share />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resource.description}
                    </Typography>
                    {resource.url && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Resource
                      </Button>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {resource.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Availability Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule /> Weekly Availability
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(profile.availability).map(([day, times]) => (
                  <Grid item xs={12} sm={6} md={3} key={day}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                          {day}
                        </Typography>
                        {times.length > 0 ? (
                          times.map((time, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">
                              {time}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not available
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Share Contact Dialog */}
      <Dialog open={shareContactOpen} onClose={() => setShareContactOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Contact Information</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient Email"
            type="email"
            fullWidth
            variant="outlined"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Personal Message (Optional)"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message with your contact information..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareContactOpen(false)}>Cancel</Button>
          <Button onClick={handleShareContact} variant="contained" disabled={!recipientEmail}>
            Share Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Resource Dialog */}
      <Dialog open={shareResourceOpen} onClose={() => setShareResourceOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Resource</DialogTitle>
        <DialogContent>
          {selectedResource && (
            <>
              <Typography variant="h6" gutterBottom>{selectedResource.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedResource.description}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Recipient Email"
                type="email"
                fullWidth
                variant="outlined"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Personal Message (Optional)"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message with this resource..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareResourceOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedResource && handleShareResource(selectedResource)}
            variant="contained"
            disabled={!recipientEmail}
          >
            Share Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Export the wrapped component with AuthProvider
export default function CHWProfilePage() {
  return (
    <AuthProvider>
      <CHWProfileContent />
    </AuthProvider>
  );
}

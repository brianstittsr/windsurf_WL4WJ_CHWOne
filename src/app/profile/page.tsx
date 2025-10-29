'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  TextField,
  Button,
  Divider,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  Person, 
  Email, 
  Phone, 
  LocationOn, 
  Work, 
  School, 
  Security,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';

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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ProfileContent() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({ open: false, message: '', severity: 'success' });
  
  // User profile data
  const [profileData, setProfileData] = useState({
    // Basic user info
    displayName: '',
    email: '',
    phone: '',
    location: '',
    organization: '',
    role: '',
    bio: '',
    
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    
    // Contact Information
    primaryPhone: '',
    secondaryPhone: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    
    // Professional Information
    chwId: '',
    certificationLevel: '',
    hireDate: '',
    supervisor: '',
    languages: [] as string[],
    ncchwaRecertificationDate: '',
    
    // Location & Service Area
    serviceArea: [] as string[],
    zipCodes: [] as string[],
    travelRadius: 0,
    
    // Skills & Specializations
    skills: [] as string[],
    specializations: [] as string[],
    
    // Profile Settings
    profileVisible: true,
    allowContactSharing: true,
    isPublicProfile: false,
    profilePictureUrl: ''
  });

  useEffect(() => {
    // Simulate loading user profile data
    const timer = setTimeout(() => {
      if (currentUser) {
        // Populate with user data or mock data
        setProfileData({
          // Basic user info
          displayName: currentUser.displayName || 'Admin User',
          email: currentUser.email || 'admin@example.com',
          phone: '+1 (555) 123-4567',
          location: 'Raleigh, NC',
          organization: 'CHWOne',
          role: 'Administrator',
          bio: 'Platform administrator with access to all features and functionality.',
          
          // Personal Information
          firstName: currentUser.displayName?.split(' ')[0] || 'Admin',
          lastName: currentUser.displayName?.split(' ')[1] || 'User',
          dateOfBirth: '1985-06-15',
          gender: 'prefer_not_to_say',
          
          // Contact Information
          primaryPhone: '+1 (555) 123-4567',
          secondaryPhone: '+1 (555) 987-6543',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: '+1 (555) 456-7890'
          },
          
          // Professional Information
          chwId: 'CHW-12345',
          certificationLevel: 'advanced',
          hireDate: '2022-03-01',
          supervisor: 'Jane Smith',
          languages: ['English', 'Spanish'],
          ncchwaRecertificationDate: '2025-03-01',
          
          // Location & Service Area
          serviceArea: ['Wake County', 'Durham County'],
          zipCodes: ['27601', '27603', '27605'],
          travelRadius: 25,
          
          // Skills & Specializations
          skills: ['User Management', 'Data Analysis', 'System Configuration', 'Training'],
          specializations: ['Maternal Health', 'Chronic Disease Management', 'Mental Health Support'],
          
          // Profile Settings
          profileVisible: true,
          allowContactSharing: true,
          isPublicProfile: false,
          profilePictureUrl: currentUser.photoURL || ''
        });
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      // If we're exiting edit mode, show notification
      setNotification({
        open: true,
        message: 'Profile changes discarded',
        severity: 'info'
      });
    }
  };

  const handleSaveProfile = () => {
    // Simulate saving profile
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEditMode(false);
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getRenewalStatus = () => {
    const renewalDate = new Date(profileData.ncchwaRecertificationDate);
    const now = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilRenewal < 0) {
      return { status: 'expired', color: 'error', text: 'Expired' };
    } else if (daysUntilRenewal <= 30) {
      return { status: 'urgent', color: 'warning', text: `${daysUntilRenewal} days` };
    } else if (daysUntilRenewal <= 90) {
      return { status: 'soon', color: 'info', text: `${daysUntilRenewal} days` };
    } else {
      return { status: 'active', color: 'success', text: 'Active' };
    }
  };

  const renewalStatus = getRenewalStatus();

  if (loading) {
    return (
      <UnifiedLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
            My Profile
          </Typography>

          <Grid container spacing={4}>
            {/* Left Column - Profile Info */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar 
                    src={currentUser?.photoURL || undefined} 
                    alt={profileData.displayName}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mx: 'auto',
                      mb: 2,
                      fontSize: '3rem',
                      bgcolor: 'primary.main'
                    }}
                  >
                    {profileData.displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  {editMode ? (
                    <TextField
                      fullWidth
                      name="displayName"
                      label="Name"
                      variant="outlined"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                  ) : (
                    <Typography variant="h5" gutterBottom>
                      {profileData.displayName}
                    </Typography>
                  )}
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      py: 1, 
                      px: 2, 
                      bgcolor: 'primary.light', 
                      color: 'white',
                      display: 'inline-block',
                      borderRadius: 2,
                      mb: 2
                    }}
                  >
                    {profileData.role}
                  </Paper>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      {editMode ? (
                        <TextField
                          fullWidth
                          name="email"
                          label="Email"
                          variant="outlined"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled
                          size="small"
                        />
                      ) : (
                        <Typography>{profileData.email}</Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      {editMode ? (
                        <TextField
                          fullWidth
                          name="phone"
                          label="Phone"
                          variant="outlined"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          size="small"
                        />
                      ) : (
                        <Typography>{profileData.phone}</Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                      {editMode ? (
                        <TextField
                          fullWidth
                          name="location"
                          label="Location"
                          variant="outlined"
                          value={profileData.location}
                          onChange={handleInputChange}
                          size="small"
                        />
                      ) : (
                        <Typography>{profileData.location}</Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Work sx={{ mr: 2, color: 'primary.main' }} />
                      {editMode ? (
                        <TextField
                          fullWidth
                          name="organization"
                          label="Organization"
                          variant="outlined"
                          value={profileData.organization}
                          onChange={handleInputChange}
                          size="small"
                        />
                      ) : (
                        <Typography>{profileData.organization}</Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {editMode ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      fullWidth
                      startIcon={<CancelIcon />}
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={handleEditToggle}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Grid>
            
            {/* Right Column - Details */}
            <Grid item xs={12} md={8}>
              <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    aria-label="profile tabs"
                    sx={{ px: 2, pt: 2 }}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="About" />
                    <Tab label="Location & Service" />
                    <Tab label="Activity" />
                    <Tab label="Settings" />
                  </Tabs>
                </Box>
                
                <CardContent>
                  <TabPanel value={tabValue} index={0}>
                    {/* Personal Information Section */}
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Personal Information
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="firstName"
                            label="First Name"
                            variant="outlined"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                            <Typography>{profileData.firstName}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="lastName"
                            label="Last Name"
                            variant="outlined"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                            <Typography>{profileData.lastName}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="dateOfBirth"
                            label="Date of Birth"
                            type="date"
                            variant="outlined"
                            value={profileData.dateOfBirth}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                            <Typography>{profileData.dateOfBirth}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            select
                            name="gender"
                            label="Gender"
                            variant="outlined"
                            value={profileData.gender}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                          >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                            <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                          </TextField>
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                            <Typography>
                              {profileData.gender === 'male' ? 'Male' : 
                               profileData.gender === 'female' ? 'Female' : 
                               profileData.gender === 'other' ? 'Other' : 'Prefer not to say'}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                    
                    {/* Professional Information Section */}
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Professional Information
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="chwId"
                            label="CHW ID"
                            variant="outlined"
                            value={profileData.chwId}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">CHW ID</Typography>
                            <Typography>{profileData.chwId}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            select
                            name="certificationLevel"
                            label="Certification Level"
                            variant="outlined"
                            value={profileData.certificationLevel}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                          >
                            <MenuItem value="entry">Entry</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                            <MenuItem value="lead">Lead</MenuItem>
                          </TextField>
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Certification Level</Typography>
                            <Typography sx={{ textTransform: 'capitalize' }}>{profileData.certificationLevel}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="hireDate"
                            label="Hire Date"
                            type="date"
                            variant="outlined"
                            value={profileData.hireDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Hire Date</Typography>
                            <Typography>{profileData.hireDate}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="supervisor"
                            label="Supervisor"
                            variant="outlined"
                            value={profileData.supervisor}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Supervisor</Typography>
                            <Typography>{profileData.supervisor}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="ncchwaRecertificationDate"
                            label="NCCHWA Recertification Date"
                            type="date"
                            variant="outlined"
                            value={profileData.ncchwaRecertificationDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">NCCHWA Recertification Date</Typography>
                            <Typography>{profileData.ncchwaRecertificationDate}</Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              label={`Renewal: ${renewalStatus.text}`}
                              color={renewalStatus.color as any}
                            />
                          </Box>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                    
                    {/* Bio Section */}
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Bio
                    </Typography>
                    
                    {editMode ? (
                      <TextField
                        fullWidth
                        name="bio"
                        label="Bio"
                        variant="outlined"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        sx={{ mb: 3 }}
                      />
                    ) : (
                      <Typography paragraph sx={{ mb: 3 }}>{profileData.bio}</Typography>
                    )}
                    
                    {/* Skills & Specializations Section */}
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Skills & Specializations
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Skills</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {profileData.skills.map((skill, index) => (
                            <Paper 
                              key={index} 
                              elevation={0} 
                              sx={{ 
                                py: 0.5, 
                                px: 1.5, 
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                borderRadius: 2
                              }}
                            >
                              {skill}
                            </Paper>
                          ))}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Specializations</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {profileData.specializations.map((spec, index) => (
                            <Paper 
                              key={index} 
                              elevation={0} 
                              sx={{ 
                                py: 0.5, 
                                px: 1.5, 
                                bgcolor: 'secondary.light',
                                color: 'secondary.contrastText',
                                borderRadius: 2
                              }}
                            >
                              {spec}
                            </Paper>
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </TabPanel>
                  
                  <TabPanel value={tabValue} index={1}>
                    {/* Location & Service Area Tab */}
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Location & Service Area
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      {/* Service Areas */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Service Areas</Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="serviceArea"
                            label="Service Areas (comma separated)"
                            variant="outlined"
                            value={profileData.serviceArea.join(', ')}
                            onChange={(e) => {
                              const areas = e.target.value.split(',').map(area => area.trim()).filter(Boolean);
                              setProfileData(prev => ({ ...prev, serviceArea: areas }));
                            }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                            {profileData.serviceArea.map((area, index) => (
                              <Paper 
                                key={index} 
                                elevation={0} 
                                sx={{ 
                                  py: 0.5, 
                                  px: 1.5, 
                                  bgcolor: 'info.light',
                                  color: 'info.contrastText',
                                  borderRadius: 2
                                }}
                              >
                                {area}
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </Grid>
                      
                      {/* Zip Codes */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Zip Codes</Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="zipCodes"
                            label="Zip Codes (comma separated)"
                            variant="outlined"
                            value={profileData.zipCodes.join(', ')}
                            onChange={(e) => {
                              const codes = e.target.value.split(',').map(code => code.trim()).filter(Boolean);
                              setProfileData(prev => ({ ...prev, zipCodes: codes }));
                            }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                            {profileData.zipCodes.map((code, index) => (
                              <Paper 
                                key={index} 
                                elevation={0} 
                                sx={{ 
                                  py: 0.5, 
                                  px: 1.5, 
                                  bgcolor: 'action.hover',
                                  borderRadius: 2
                                }}
                              >
                                {code}
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </Grid>
                      
                      {/* Travel Radius */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Travel Radius</Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="travelRadius"
                            label="Travel Radius (miles)"
                            type="number"
                            variant="outlined"
                            value={profileData.travelRadius}
                            onChange={handleInputChange}
                            InputProps={{
                              endAdornment: <Typography variant="body2" color="text.secondary">miles</Typography>,
                            }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Typography variant="body1">{profileData.travelRadius} miles</Typography>
                        )}
                      </Grid>
                      
                      {/* Languages */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Languages</Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="languages"
                            label="Languages (comma separated)"
                            variant="outlined"
                            value={profileData.languages.join(', ')}
                            onChange={(e) => {
                              const langs = e.target.value.split(',').map(lang => lang.trim()).filter(Boolean);
                              setProfileData(prev => ({ ...prev, languages: langs }));
                            }}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                            {profileData.languages.map((lang, index) => (
                              <Paper 
                                key={index} 
                                elevation={0} 
                                sx={{ 
                                  py: 0.5, 
                                  px: 1.5, 
                                  bgcolor: 'success.light',
                                  color: 'success.contrastText',
                                  borderRadius: 2
                                }}
                              >
                                {lang}
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                    
                    {/* Profile Visibility Settings */}
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Profile Visibility
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>Directory Visibility</Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Make your profile visible in the CHW directory
                          </Typography>
                          {editMode ? (
                            <Button 
                              variant={profileData.profileVisible ? "contained" : "outlined"}
                              color={profileData.profileVisible ? "primary" : "inherit"}
                              onClick={() => setProfileData(prev => ({ ...prev, profileVisible: !prev.profileVisible }))}
                              fullWidth
                            >
                              {profileData.profileVisible ? "Visible" : "Hidden"}
                            </Button>
                          ) : (
                            <Chip 
                              label={profileData.profileVisible ? "Visible" : "Hidden"} 
                              color={profileData.profileVisible ? "success" : "default"}
                            />
                          )}
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>Contact Sharing</Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Allow other CHWs to see your contact information
                          </Typography>
                          {editMode ? (
                            <Button 
                              variant={profileData.allowContactSharing ? "contained" : "outlined"}
                              color={profileData.allowContactSharing ? "primary" : "inherit"}
                              onClick={() => setProfileData(prev => ({ ...prev, allowContactSharing: !prev.allowContactSharing }))}
                              fullWidth
                            >
                              {profileData.allowContactSharing ? "Allowed" : "Not Allowed"}
                            </Button>
                          ) : (
                            <Chip 
                              label={profileData.allowContactSharing ? "Allowed" : "Not Allowed"} 
                              color={profileData.allowContactSharing ? "success" : "default"}
                            />
                          )}
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>Public Profile</Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Make your profile accessible to the public
                          </Typography>
                          {editMode ? (
                            <Button 
                              variant={profileData.isPublicProfile ? "contained" : "outlined"}
                              color={profileData.isPublicProfile ? "primary" : "inherit"}
                              onClick={() => setProfileData(prev => ({ ...prev, isPublicProfile: !prev.isPublicProfile }))}
                              fullWidth
                            >
                              {profileData.isPublicProfile ? "Public" : "Private"}
                            </Button>
                          ) : (
                            <Chip 
                              label={profileData.isPublicProfile ? "Public" : "Private"} 
                              color={profileData.isPublicProfile ? "success" : "default"}
                            />
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
                  </TabPanel>
                  
                  <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ p: 2, mb: 2 }}
                      >
                        <Typography variant="subtitle1">Logged in</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date().toLocaleString()}
                        </Typography>
                      </Paper>
                      
                      <Paper 
                        variant="outlined" 
                        sx={{ p: 2, mb: 2 }}
                      >
                        <Typography variant="subtitle1">Profile viewed</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(Date.now() - 3600000).toLocaleString()}
                        </Typography>
                      </Paper>
                      
                      <Paper 
                        variant="outlined" 
                        sx={{ p: 2 }}
                      >
                        <Typography variant="subtitle1">Dashboard accessed</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(Date.now() - 7200000).toLocaleString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </TabPanel>
                  
                  <TabPanel value={tabValue} index={3}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Account Settings
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <Security sx={{ mr: 1 }} /> Password
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Change your account password
                          </Typography>
                          <Button variant="outlined">Change Password</Button>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>Notifications</Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Manage your notification preferences
                          </Typography>
                          <Button variant="outlined">Notification Settings</Button>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
                      Emergency Contact
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={4}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="emergencyContactName"
                            label="Emergency Contact Name"
                            variant="outlined"
                            value={profileData.emergencyContact.name}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                name: e.target.value
                              }
                            }))}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Emergency Contact Name</Typography>
                            <Typography>{profileData.emergencyContact.name}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="emergencyContactRelationship"
                            label="Relationship"
                            variant="outlined"
                            value={profileData.emergencyContact.relationship}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                relationship: e.target.value
                              }
                            }))}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Relationship</Typography>
                            <Typography>{profileData.emergencyContact.relationship}</Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name="emergencyContactPhone"
                            label="Emergency Contact Phone"
                            variant="outlined"
                            value={profileData.emergencyContact.phone}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                phone: e.target.value
                              }
                            }))}
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Emergency Contact Phone</Typography>
                            <Typography>{profileData.emergencyContact.phone}</Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                    
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2, color: 'error.main' }}>
                      Danger Zone
                    </Typography>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ p: 3, borderColor: 'error.light' }}
                    >
                      <Typography variant="subtitle1" gutterBottom color="error">Delete Account</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Delete your account and all associated data. This action cannot be undone.
                      </Typography>
                      <Button variant="outlined" color="error">Delete Account</Button>
                    </Paper>
                  </TabPanel>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity === 'success' ? 'success' : 'info'} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </UnifiedLayout>
  );
}

// Export the component wrapped with AuthProvider
export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  Person,
  Email,
  Phone,
  LinkedIn,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Message,
  Work,
  Language,
  LocationOn,
  Close
} from '@mui/icons-material';
import {
  CHWDirectoryProfile,
  ProfileSearchFilters,
  EXPERTISE_OPTIONS,
  LANGUAGE_OPTIONS,
  REGION5_COUNTIES
} from '@/types/chw-profile.types';

interface CHWDirectoryProps {
  onMessageClick?: (profileId: string) => void;
}

export default function CHWDirectory({ onMessageClick }: CHWDirectoryProps) {
  const [profiles, setProfiles] = useState<CHWDirectoryProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<CHWDirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<CHWDirectoryProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ProfileSearchFilters>({
    searchTerm: '',
    expertise: [],
    languages: [],
    counties: [],
    availableForOpportunities: undefined
  });

  // Load profiles - in real implementation, this would come from API
  useEffect(() => {
    loadProfiles();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, profiles]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockProfiles: CHWDirectoryProfile[] = [
        {
          id: '1',
          displayName: 'Maria Rodriguez',
          headline: 'Certified CHW specializing in Maternal & Child Health',
          bio: 'Passionate about improving health outcomes for mothers and children in underserved communities. 10+ years of experience.',
          expertise: ['Maternal & Child Health', 'Health Education', 'Community Outreach'],
          languages: ['English', 'Spanish'],
          region: 'Region 5',
          countiesWorkedIn: ['Cumberland', 'Harnett'],
          currentOrganization: 'Women Leading 4 Wellness and Justice',
          availableForOpportunities: true,
          certificationStatus: 'certified',
          yearsOfExperience: 10,
          email: 'maria.r@example.com',
          allowDirectMessages: true
        },
        {
          id: '2',
          displayName: 'John Smith',
          headline: 'CHW focused on Chronic Disease Management',
          bio: 'Helping community members manage diabetes and hypertension through education and support.',
          expertise: ['Chronic Disease Management', 'Health Navigation', 'Care Coordination'],
          languages: ['English'],
          region: 'Region 5',
          countiesWorkedIn: ['New Hanover', 'Brunswick'],
          currentOrganization: 'Coastal Community Health',
          availableForOpportunities: false,
          certificationStatus: 'certified',
          yearsOfExperience: 5,
          allowDirectMessages: true
        },
        {
          id: '3',
          displayName: 'Aisha Johnson',
          headline: 'Mental Health & Substance Abuse Specialist',
          bio: 'Dedicated to breaking down barriers to mental health care and supporting recovery journeys.',
          expertise: ['Mental Health', 'Substance Abuse', 'Patient Advocacy'],
          languages: ['English', 'French'],
          region: 'Region 5',
          countiesWorkedIn: ['Robeson', 'Scotland'],
          availableForOpportunities: true,
          certificationStatus: 'certified',
          yearsOfExperience: 7,
          phone: '(555) 123-4567',
          allowDirectMessages: true,
          socialLinks: {
            linkedin: 'https://linkedin.com/in/aishajohnson'
          }
        }
      ];
      
      setProfiles(mockProfiles);
      setFilteredProfiles(mockProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.displayName.toLowerCase().includes(term) ||
        profile.headline?.toLowerCase().includes(term) ||
        profile.bio?.toLowerCase().includes(term) ||
        profile.currentOrganization?.toLowerCase().includes(term)
      );
    }

    // Expertise
    if (filters.expertise && filters.expertise.length > 0) {
      filtered = filtered.filter(profile =>
        filters.expertise!.some(exp => profile.expertise.includes(exp))
      );
    }

    // Languages
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter(profile =>
        filters.languages!.some(lang => profile.languages.includes(lang))
      );
    }

    // Counties
    if (filters.counties && filters.counties.length > 0) {
      filtered = filtered.filter(profile =>
        filters.counties!.some(county => profile.countiesWorkedIn.includes(county))
      );
    }

    // Available for opportunities
    if (filters.availableForOpportunities !== undefined) {
      filtered = filtered.filter(profile =>
        profile.availableForOpportunities === filters.availableForOpportunities
      );
    }

    setFilteredProfiles(filtered);
  };

  const handleFilterChange = (field: keyof ProfileSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      expertise: [],
      languages: [],
      counties: [],
      availableForOpportunities: undefined
    });
  };

  const ProfileCard = ({ profile }: { profile: CHWDirectoryProfile }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            src={profile.profilePicture}
            sx={{ width: 60, height: 60, mr: 2 }}
          >
            {profile.displayName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {profile.displayName}
            </Typography>
            {profile.headline && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile.headline}
              </Typography>
            )}
            {profile.availableForOpportunities && (
              <Chip
                label="Available"
                color="success"
                size="small"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        </Box>

        {profile.currentOrganization && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Work fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {profile.currentOrganization}
            </Typography>
          </Box>
        )}

        {profile.countiesWorkedIn.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {profile.countiesWorkedIn.slice(0, 2).join(', ')}
              {profile.countiesWorkedIn.length > 2 && ` +${profile.countiesWorkedIn.length - 2}`}
            </Typography>
          </Box>
        )}

        {profile.expertise.length > 0 && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {profile.expertise.slice(0, 3).map((exp) => (
                <Chip key={exp} label={exp} size="small" variant="outlined" />
              ))}
              {profile.expertise.length > 3 && (
                <Chip label={`+${profile.expertise.length - 3}`} size="small" variant="outlined" />
              )}
            </Stack>
          </Box>
        )}

        {profile.languages.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Language fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {profile.languages.join(', ')}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => setSelectedProfile(profile)}
          >
            View Profile
          </Button>
          {profile.allowDirectMessages && onMessageClick && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => onMessageClick(profile.id)}
            >
              <Message />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          CHW Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with Community Health Workers across Region 5
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, organization, or keywords..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              {(filters.expertise?.length || 0) + (filters.languages?.length || 0) + (filters.counties?.length || 0) > 0 && (
                <Button variant="text" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </Box>
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  options={EXPERTISE_OPTIONS}
                  value={filters.expertise || []}
                  onChange={(_, newValue) => handleFilterChange('expertise', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Expertise" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  options={LANGUAGE_OPTIONS}
                  value={filters.languages || []}
                  onChange={(_, newValue) => handleFilterChange('languages', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Languages" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  options={REGION5_COUNTIES}
                  value={filters.counties || []}
                  onChange={(_, newValue) => handleFilterChange('counties', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Counties" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={filters.availableForOpportunities === undefined ? '' : filters.availableForOpportunities ? 'yes' : 'no'}
                    label="Availability"
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : e.target.value === 'yes';
                      handleFilterChange('availableForOpportunities', value);
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="yes">Available for Opportunities</MenuItem>
                    <MenuItem value="no">Not Available</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredProfiles.length} {filteredProfiles.length === 1 ? 'CHW' : 'CHWs'} found
        </Typography>
      </Box>

      {/* Directory Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading directory...</Typography>
        </Box>
      ) : filteredProfiles.length === 0 ? (
        <Alert severity="info">
          No CHWs found matching your criteria. Try adjusting your filters.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredProfiles.map((profile) => (
            <Grid item xs={12} sm={6} md={4} key={profile.id}>
              <ProfileCard profile={profile} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Profile Detail Dialog */}
      <Dialog
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedProfile && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={selectedProfile.profilePicture}
                    sx={{ width: 60, height: 60 }}
                  >
                    {selectedProfile.displayName.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedProfile.displayName}</Typography>
                    {selectedProfile.headline && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedProfile.headline}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton onClick={() => setSelectedProfile(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Bio */}
                {selectedProfile.bio && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>About</Typography>
                    <Typography variant="body2">{selectedProfile.bio}</Typography>
                  </Box>
                )}

                {/* Organization */}
                {selectedProfile.currentOrganization && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Organization</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Work fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">{selectedProfile.currentOrganization}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Experience */}
                {selectedProfile.yearsOfExperience && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Experience</Typography>
                    <Typography variant="body2">{selectedProfile.yearsOfExperience} years</Typography>
                  </Box>
                )}

                {/* Expertise */}
                {selectedProfile.expertise.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Areas of Expertise</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedProfile.expertise.map((exp) => (
                        <Chip key={exp} label={exp} size="small" />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Languages */}
                {selectedProfile.languages.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Languages</Typography>
                    <Stack direction="row" spacing={1}>
                      {selectedProfile.languages.map((lang) => (
                        <Chip key={lang} label={lang} size="small" icon={<Language />} />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Service Area */}
                {selectedProfile.countiesWorkedIn.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Service Area</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedProfile.countiesWorkedIn.map((county) => (
                        <Chip key={county} label={`${county} County`} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}

                <Divider />

                {/* Contact Information */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                  <Stack spacing={1}>
                    {selectedProfile.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{selectedProfile.email}</Typography>
                      </Box>
                    )}
                    {selectedProfile.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{selectedProfile.phone}</Typography>
                      </Box>
                    )}
                    {!selectedProfile.email && !selectedProfile.phone && (
                      <Typography variant="body2" color="text.secondary">
                        Contact information not shared
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Social Links */}
                {selectedProfile.socialLinks && Object.keys(selectedProfile.socialLinks).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Social Media</Typography>
                    <Stack direction="row" spacing={1}>
                      {selectedProfile.socialLinks.linkedin && (
                        <IconButton
                          size="small"
                          href={selectedProfile.socialLinks.linkedin}
                          target="_blank"
                          sx={{ color: '#0077B5' }}
                        >
                          <LinkedIn />
                        </IconButton>
                      )}
                      {selectedProfile.socialLinks.twitter && (
                        <IconButton
                          size="small"
                          href={selectedProfile.socialLinks.twitter}
                          target="_blank"
                          sx={{ color: '#1DA1F2' }}
                        >
                          <Twitter />
                        </IconButton>
                      )}
                      {selectedProfile.socialLinks.facebook && (
                        <IconButton
                          size="small"
                          href={selectedProfile.socialLinks.facebook}
                          target="_blank"
                          sx={{ color: '#1877F2' }}
                        >
                          <Facebook />
                        </IconButton>
                      )}
                      {selectedProfile.socialLinks.website && (
                        <IconButton
                          size="small"
                          href={selectedProfile.socialLinks.website}
                          target="_blank"
                        >
                          <LinkIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              {selectedProfile.allowDirectMessages && onMessageClick && (
                <Button
                  variant="contained"
                  startIcon={<Message />}
                  onClick={() => {
                    onMessageClick(selectedProfile.id);
                    setSelectedProfile(null);
                  }}
                >
                  Send Message
                </Button>
              )}
              <Button onClick={() => setSelectedProfile(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Search,
  FilterList,
  Person,
  Phone,
  LocationOn,
  Work,
  Language,
  School,
  Message,
  Call,
  Email,
  ContactMail
} from '@mui/icons-material';
import { CHWProfile } from '@/types/platform.types';

interface DirectoryCHW {
  id: string;
  profile: CHWProfile;
  email: string;
  lastActive: Date;
}

export default function Region5DirectoryPage() {
  const router = useRouter();
  const [chwList, setChwList] = useState<DirectoryCHW[]>([]);
  const [filteredList, setFilteredList] = useState<DirectoryCHW[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterServiceArea, setFilterServiceArea] = useState('');
  const [selectedCHW, setSelectedCHW] = useState<DirectoryCHW | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Available filter options
  const specializations = [
    'Diabetes Management',
    'Maternal Health',
    'Mental Health First Aid',
    'Chronic Disease Management',
    'Health Education',
    'Case Management'
  ];

  const languages = ['English', 'Spanish', 'Portuguese', 'French', 'Arabic', 'Chinese'];

  const serviceAreas = ['Downtown', 'East Side', 'West End', 'North Side', 'South Side'];

  useEffect(() => {
    loadDirectory();
  }, []);

  useEffect(() => {
    filterCHWs();
  }, [chwList, searchQuery, filterSpecialization, filterLanguage, filterServiceArea]);

  const loadDirectory = async () => {
    try {
      // Mock directory data - replace with actual API call
      const mockDirectory: DirectoryCHW[] = [
        {
          id: 'chw-001',
          email: 'maria.rodriguez@chwone.org',
          lastActive: new Date(),
          profile: {
            firstName: 'Maria',
            lastName: 'Rodriguez',
            primaryPhone: '(555) 123-4567',
            languages: ['English', 'Spanish', 'Portuguese'],
            serviceArea: ['Downtown', 'East Side'],
            zipCodes: ['27601', '27603'],
            skills: ['Health Education', 'Case Management'],
            specializations: ['Diabetes Management', 'Maternal Health'],
            certificationLevel: 'advanced',
            chwId: 'CHW-2024-001',
            profileVisible: true,
            allowContactSharing: true,
            bio: 'Dedicated CHW with extensive experience in diabetes management and maternal health.',
            activeClients: 45,
            totalEncounters: 1250,
            completedTrainings: 8,
            resources: [],
            equipment: [],
            availability: {
              monday: ['9:00 AM - 5:00 PM'],
              tuesday: ['9:00 AM - 5:00 PM'],
              wednesday: ['9:00 AM - 5:00 PM'],
              thursday: ['9:00 AM - 5:00 PM'],
              friday: ['9:00 AM - 5:00 PM'],
              saturday: [],
              sunday: []
            }
          }
        },
        {
          id: 'chw-002',
          email: 'james.wilson@chwone.org',
          lastActive: new Date(Date.now() - 86400000), // 1 day ago
          profile: {
            firstName: 'James',
            lastName: 'Wilson',
            primaryPhone: '(555) 234-5678',
            languages: ['English'],
            serviceArea: ['West End', 'North Side'],
            zipCodes: ['27604', '27605'],
            skills: ['Mental Health Support', 'Community Outreach'],
            specializations: ['Mental Health First Aid', 'Chronic Disease Management'],
            certificationLevel: 'intermediate',
            chwId: 'CHW-2024-002',
            profileVisible: true,
            allowContactSharing: true,
            bio: 'Mental health advocate with focus on chronic disease management and community outreach.',
            activeClients: 32,
            totalEncounters: 890,
            completedTrainings: 6,
            resources: [],
            equipment: [],
            availability: {
              monday: ['8:00 AM - 4:00 PM'],
              tuesday: ['8:00 AM - 4:00 PM'],
              wednesday: ['8:00 AM - 4:00 PM'],
              thursday: ['8:00 AM - 4:00 PM'],
              friday: ['8:00 AM - 4:00 PM'],
              saturday: ['10:00 AM - 2:00 PM'],
              sunday: []
            }
          }
        },
        {
          id: 'chw-003',
          email: 'sara.chen@chwone.org',
          lastActive: new Date(Date.now() - 172800000), // 2 days ago
          profile: {
            firstName: 'Sara',
            lastName: 'Chen',
            primaryPhone: '(555) 345-6789',
            languages: ['English', 'Chinese', 'Spanish'],
            serviceArea: ['South Side', 'Downtown'],
            zipCodes: ['27606', '27601'],
            skills: ['Cultural Competency', 'Health Education'],
            specializations: ['Health Education', 'Cultural Competency'],
            certificationLevel: 'entry',
            chwId: 'CHW-2024-003',
            profileVisible: true,
            allowContactSharing: true,
            bio: 'Bilingual CHW specializing in health education and cultural competency training.',
            activeClients: 28,
            totalEncounters: 567,
            completedTrainings: 4,
            resources: [],
            equipment: [],
            availability: {
              monday: ['9:00 AM - 5:00 PM'],
              tuesday: ['9:00 AM - 5:00 PM'],
              wednesday: ['9:00 AM - 5:00 PM'],
              thursday: ['9:00 AM - 5:00 PM'],
              friday: ['9:00 AM - 5:00 PM'],
              saturday: [],
              sunday: []
            }
          }
        }
      ];

      setChwList(mockDirectory);
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterCHWs = () => {
    let filtered = chwList;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(chw =>
        `${chw.profile.firstName} ${chw.profile.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chw.profile.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
        chw.profile.serviceArea.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Specialization filter
    if (filterSpecialization) {
      filtered = filtered.filter(chw =>
        chw.profile.specializations.includes(filterSpecialization)
      );
    }

    // Language filter
    if (filterLanguage) {
      filtered = filtered.filter(chw =>
        chw.profile.languages.includes(filterLanguage)
      );
    }

    // Service area filter
    if (filterServiceArea) {
      filtered = filtered.filter(chw =>
        chw.profile.serviceArea.includes(filterServiceArea)
      );
    }

    setFilteredList(filtered);
  };

  const handleViewProfile = (chwId: string) => {
    router.push(`/profile/${chwId}`);
  };

  const handleContactCHW = (chw: DirectoryCHW) => {
    setSelectedCHW(chw);
    setContactDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedCHW || !contactMessage.trim()) return;

    try {
      // Mock message sending - replace with actual API call
      alert(`Message sent to ${selectedCHW.profile.firstName} ${selectedCHW.profile.lastName}`);
      setContactDialogOpen(false);
      setContactMessage('');
      setSelectedCHW(null);
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterSpecialization('');
    setFilterLanguage('');
    setFilterServiceArea('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading directory...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Region 5 CHW Directory
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Find CHWs by:</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, specialization, or service area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Specialization</InputLabel>
                <Select
                  value={filterSpecialization}
                  label="Specialization"
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={filterLanguage}
                  label="Language"
                  onChange={(e) => setFilterLanguage(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {languages.map((lang) => (
                    <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Service Area</InputLabel>
                <Select
                  value={filterServiceArea}
                  label="Service Area"
                  onChange={(e) => setFilterServiceArea(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {serviceAreas.map((area) => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Showing {filteredList.length} of {chwList.length} CHWs
      </Typography>

      {/* CHW Cards */}
      <Grid container spacing={3}>
        {filteredList.map((chw) => (
          <Grid item xs={12} md={6} lg={4} key={chw.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {chw.profile.firstName[0]}{chw.profile.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {chw.profile.firstName} {chw.profile.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {chw.profile.certificationLevel?.toUpperCase()} CHW • {chw.profile.chwId}
                    </Typography>
                  </Box>
                </Box>

                {chw.profile.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {chw.profile.bio.length > 120 ? `${chw.profile.bio.substring(0, 120)}...` : chw.profile.bio}
                  </Typography>
                )}

                {/* Specializations */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Specializations:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {chw.profile.specializations.slice(0, 3).map((spec) => (
                      <Chip key={spec} label={spec} size="small" color="primary" variant="outlined" />
                    ))}
                    {chw.profile.specializations.length > 3 && (
                      <Chip label={`+${chw.profile.specializations.length - 3} more`} size="small" variant="outlined" />
                    )}
                  </Box>
                </Box>

                {/* Service Areas */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" />
                    Service Areas:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {chw.profile.serviceArea.map((area) => (
                      <Chip key={area} label={area} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                {/* Languages */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language fontSize="small" />
                    Languages:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {chw.profile.languages.map((lang) => (
                      <Chip key={lang} label={lang} size="small" />
                    ))}
                  </Box>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">{chw.profile.activeClients}</Typography>
                    <Typography variant="caption" color="text.secondary">Active Clients</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">{chw.profile.totalEncounters}</Typography>
                    <Typography variant="caption" color="text.secondary">Encounters</Typography>
                  </Box>
                </Box>

                {/* Last Active */}
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Last active: {chw.lastActive.toLocaleDateString()}
                </Typography>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleViewProfile(chw.id)}
                  sx={{ mb: 1 }}
                >
                  View Full Profile
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<Message />}
                    onClick={() => handleContactCHW(chw)}
                    sx={{ flex: 1 }}
                  >
                    Message
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<Call />}
                    component="a"
                    href={`tel:${chw.profile.primaryPhone}`}
                    sx={{ flex: 1 }}
                  >
                    Call
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredList.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No CHWs found matching your criteria
          </Typography>
          <Button variant="outlined" onClick={clearFilters} sx={{ mt: 2 }}>
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Contact {selectedCHW?.profile.firstName} {selectedCHW?.profile.lastName}
        </DialogTitle>
        <DialogContent>
          {selectedCHW && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Send a message to this CHW. They will receive your contact information and message.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Your Message"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you're reaching out..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={!contactMessage.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button, Stack, useTheme,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox,
  IconButton, Alert, CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon, School as SchoolIcon, Upload as UploadIcon,
  GroupWork as GroupWorkIcon, LocalHospital as ResourceIcon,
  OpenInNew as OpenInNewIcon, Add as AddIcon, Flag as GoalIcon,
  Event as EventIcon, Close as CloseIcon, AttachFile as AttachIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import AdminLayout from '@/components/Layout/AdminLayout';
import { WL4WJLogo } from '@/components/Logos';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { WL4WJService } from '@/services/WL4WJService';
import { SandhillsResourceService } from '@/services/SandhillsResourceService';
import { ProgramGoal, WL4WJEvent, CreateGoalInput, CreateEventInput, GOAL_CATEGORIES, EVENT_TYPES } from '@/types/wl4wj.types';

function WL4WJDashboardContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const [goals, setGoals] = useState<ProgramGoal[]>([]);
  const [events, setEvents] = useState<WL4WJEvent[]>([]);
  const [resourceCounts, setResourceCounts] = useState<Record<string, number>>({});
  const [totalResources, setTotalResources] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goalForm, setGoalForm] = useState<CreateGoalInput>({
    name: '', description: '', category: 'recruitment', targetValue: 0,
    currentValue: 0, unit: '', startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  });

  const [eventForm, setEventForm] = useState<CreateEventInput>({
    title: '', description: '', eventType: 'meeting', startDate: new Date(),
    startTime: '09:00', endTime: '17:00', location: '', isVirtual: false,
    virtualLink: '', contactName: '', contactEmail: '', contactPhone: '',
    registrationRequired: false, registrationLink: '', notes: ''
  });
  const [flyerFile, setFlyerFile] = useState<File | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [goalsData, eventsData, countsData] = await Promise.all([
        WL4WJService.getActiveGoals(),
        WL4WJService.getUpcomingEvents(),
        SandhillsResourceService.getCountsByType()
      ]);
      setGoals(goalsData);
      setEvents(eventsData);
      setResourceCounts(countsData);
      setTotalResources(Object.values(countsData).reduce((a, b) => a + b, 0));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const metrics = {
    activeCHWs: goals.find(g => g.category === 'recruitment')?.currentValue || 0,
    communityPrograms: goals.find(g => g.category === 'community')?.currentValue || 0,
    trainingCompletions: goals.find(g => g.category === 'training')?.currentValue || 0,
    totalResources
  };

  const handleCreateGoal = async () => {
    if (!goalForm.name || !goalForm.unit || goalForm.targetValue <= 0) {
      setError('Please fill in all required fields'); return;
    }
    setSaving(true); setError(null);
    try {
      await WL4WJService.createGoal(goalForm, currentUser?.uid);
      setGoalModalOpen(false);
      setGoalForm({ name: '', description: '', category: 'recruitment', targetValue: 0, currentValue: 0, unit: '', startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) });
      fetchData();
    } catch { setError('Failed to create goal'); }
    finally { setSaving(false); }
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.startDate) {
      setError('Please fill in all required fields'); return;
    }
    setSaving(true); setError(null);
    try {
      let flyerBase64 = '';
      if (flyerFile) flyerBase64 = await fileToBase64(flyerFile);
      await WL4WJService.createEvent({ ...eventForm, flyerBase64 }, currentUser?.uid);
      setEventModalOpen(false);
      setEventForm({ title: '', description: '', eventType: 'meeting', startDate: new Date(), startTime: '09:00', endTime: '17:00', location: '', isVirtual: false, virtualLink: '', contactName: '', contactEmail: '', contactPhone: '', registrationRequired: false, registrationLink: '', notes: '' });
      setFlyerFile(null);
      fetchData();
    } catch { setError('Failed to create event'); }
    finally { setSaving(false); }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Delete this goal?')) {
      try { await WL4WJService.deleteGoal(id); fetchData(); } catch (err) { console.error(err); }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Delete this event?')) {
      try { await WL4WJService.deleteEvent(id); fetchData(); } catch (err) { console.error(err); }
    }
  };

  if (loading) return <AnimatedLoading message="Loading WL4WJ Dashboard..." />;
  if (!currentUser) { router.push('/login'); return null; }

  const stats = [
    { title: 'Active CHWs', value: metrics.activeCHWs.toString(), icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Community Programs', value: metrics.communityPrograms.toString(), icon: <GroupWorkIcon sx={{ fontSize: 40, color: 'secondary.main' }} /> },
    { title: 'Sandhills Resources', value: metrics.totalResources.toString(), icon: <ResourceIcon sx={{ fontSize: 40, color: 'success.main' }} /> },
    { title: 'Training Completions', value: metrics.trainingCompletions.toString(), icon: <SchoolIcon sx={{ fontSize: 40, color: 'warning.main' }} /> }
  ];

  const resourceCategories = [
    { type: "Children's Services", color: '#4CAF50' },
    { type: "Health Programs", color: '#E91E63' },
    { type: "Housing & Housing Repairs", color: '#795548' },
    { type: "Education", color: '#FF9800' },
    { type: "Medical & Dental", color: '#00BCD4' },
    { type: "Transportation", color: '#8BC34A' }
  ];

  return (
    <AdminLayout>
      <Box sx={{ py: 3 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}><WL4WJLogo size="large" /></Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}`, '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s', boxShadow: theme.shadows[4] } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>{stat.icon}</Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dataLoading ? <CircularProgress size={24} /> : stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Goals and Events */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Program Goals</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGoalModalOpen(true)} size="small">Create Goal</Button>
                </Box>
                {dataLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                : goals.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <GoalIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">No goals created yet. Click &quot;Create Goal&quot; to get started.</Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {goals.map((goal) => {
                      const pct = Math.round((goal.currentValue / goal.targetValue) * 100);
                      return (
                        <Box key={goal.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>{goal.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">{goal.currentValue}/{goal.targetValue} {goal.unit}</Typography>
                              <IconButton size="small" onClick={() => handleDeleteGoal(goal.id)}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                          </Box>
                          <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{ height: 8, borderRadius: 4, bgcolor: theme.palette.grey[200], '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: pct >= 80 ? 'success.main' : 'primary.main' } }} />
                          <Typography variant="caption" color="text.secondary">{pct}% Complete</Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Upcoming Events</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEventModalOpen(true)} size="small">Add Event</Button>
                </Box>
                {dataLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                : events.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">No upcoming events. Click &quot;Add Event&quot; to create one.</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {events.map((event) => {
                      const typeConfig = EVENT_TYPES.find(t => t.value === event.eventType);
                      return (
                        <Box key={event.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 1, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>{event.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{event.startDate.toLocaleDateString()} {event.startTime && `at ${event.startTime}`}</Typography>
                            {event.location && <Typography variant="caption" color="text.secondary" display="block">📍 {event.location}</Typography>}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={typeConfig?.label || event.eventType} size="small" sx={{ bgcolor: typeConfig?.color || '#757575', color: 'white' }} />
                            <IconButton size="small" onClick={() => handleDeleteEvent(event.id)}><DeleteIcon fontSize="small" /></IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sandhills Resources */}
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ResourceIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Sandhills Resources</Typography>
                  <Typography variant="body2" color="text.secondary">Community resources directory for the Sandhills region</Typography>
                </Box>
              </Box>
              <Button variant="contained" endIcon={<OpenInNewIcon />} onClick={() => router.push('/sandhills-resources')}>View All Resources</Button>
            </Box>
            <Grid container spacing={2}>
              {resourceCategories.map((cat, idx) => (
                <Grid item xs={6} sm={4} md={2} key={idx}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[2], borderColor: cat.color } }} onClick={() => router.push(`/sandhills-resources?type=${encodeURIComponent(cat.type)}`)}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: cat.color }}>{resourceCounts[cat.type] || 0}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>{cat.type}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><Button variant="contained" startIcon={<UploadIcon />} fullWidth sx={{ height: 48 }}>Upload Documents</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button variant="outlined" startIcon={<PeopleIcon />} fullWidth sx={{ height: 48 }}>Add New CHW</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button variant="outlined" startIcon={<GoalIcon />} fullWidth sx={{ height: 48 }} onClick={() => setGoalModalOpen(true)}>Create Goal</Button></Grid>
              <Grid item xs={12} sm={6} md={3}><Button variant="outlined" startIcon={<ResourceIcon />} fullWidth sx={{ height: 48 }} onClick={() => router.push('/sandhills-resources/new')}>Add Resource</Button></Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Goal Modal */}
      <Dialog open={goalModalOpen} onClose={() => setGoalModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create Program Goal
          <IconButton onClick={() => setGoalModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Goal Name *" fullWidth value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={2} value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={goalForm.category} label="Category" onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as typeof goalForm.category })}>
                {GOAL_CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Target Value *" type="number" fullWidth value={goalForm.targetValue} onChange={(e) => setGoalForm({ ...goalForm, targetValue: Number(e.target.value) })} /></Grid>
              <Grid item xs={6}><TextField label="Current Value" type="number" fullWidth value={goalForm.currentValue} onChange={(e) => setGoalForm({ ...goalForm, currentValue: Number(e.target.value) })} /></Grid>
            </Grid>
            <TextField label="Unit (e.g., CHWs, sessions) *" fullWidth value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={goalForm.startDate.toISOString().split('T')[0]} onChange={(e) => setGoalForm({ ...goalForm, startDate: new Date(e.target.value) })} /></Grid>
              <Grid item xs={6}><TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={goalForm.endDate.toISOString().split('T')[0]} onChange={(e) => setGoalForm({ ...goalForm, endDate: new Date(e.target.value) })} /></Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setGoalModalOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateGoal} disabled={saving}>{saving ? 'Creating...' : 'Create Goal'}</Button></DialogActions>
      </Dialog>

      {/* Event Modal */}
      <Dialog open={eventModalOpen} onClose={() => setEventModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add Event
          <IconButton onClick={() => setEventModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Event Title *" fullWidth value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select value={eventForm.eventType} label="Event Type" onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value as typeof eventForm.eventType })}>
                {EVENT_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={4}><TextField label="Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} value={eventForm.startDate.toISOString().split('T')[0]} onChange={(e) => setEventForm({ ...eventForm, startDate: new Date(e.target.value) })} /></Grid>
              <Grid item xs={4}><TextField label="Start Time" type="time" fullWidth InputLabelProps={{ shrink: true }} value={eventForm.startTime} onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })} /></Grid>
              <Grid item xs={4}><TextField label="End Time" type="time" fullWidth InputLabelProps={{ shrink: true }} value={eventForm.endTime} onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })} /></Grid>
            </Grid>
            <TextField label="Location" fullWidth value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
            <FormControlLabel control={<Checkbox checked={eventForm.isVirtual} onChange={(e) => setEventForm({ ...eventForm, isVirtual: e.target.checked })} />} label="Virtual Event" />
            {eventForm.isVirtual && <TextField label="Virtual Meeting Link" fullWidth value={eventForm.virtualLink} onChange={(e) => setEventForm({ ...eventForm, virtualLink: e.target.value })} />}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Contact Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}><TextField label="Contact Name" fullWidth value={eventForm.contactName} onChange={(e) => setEventForm({ ...eventForm, contactName: e.target.value })} /></Grid>
              <Grid item xs={4}><TextField label="Contact Email" fullWidth value={eventForm.contactEmail} onChange={(e) => setEventForm({ ...eventForm, contactEmail: e.target.value })} /></Grid>
              <Grid item xs={4}><TextField label="Contact Phone" fullWidth value={eventForm.contactPhone} onChange={(e) => setEventForm({ ...eventForm, contactPhone: e.target.value })} /></Grid>
            </Grid>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Event Flyer</Typography>
              <Button variant="outlined" component="label" startIcon={<AttachIcon />}>
                {flyerFile ? flyerFile.name : 'Upload Flyer'}
                <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setFlyerFile(e.target.files?.[0] || null)} />
              </Button>
            </Box>
            <FormControlLabel control={<Checkbox checked={eventForm.registrationRequired} onChange={(e) => setEventForm({ ...eventForm, registrationRequired: e.target.checked })} />} label="Registration Required" />
            {eventForm.registrationRequired && <TextField label="Registration Link" fullWidth value={eventForm.registrationLink} onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })} />}
            <TextField label="Additional Notes" fullWidth multiline rows={2} value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setEventModalOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateEvent} disabled={saving}>{saving ? 'Creating...' : 'Add Event'}</Button></DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default function WL4WJDashboard() {
  return <AuthProvider><WL4WJDashboardContent /></AuthProvider>;
}

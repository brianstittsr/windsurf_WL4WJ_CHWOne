'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface CHWJobAISearchProps {
  chwId: string;
  chwProfile: any;
  onJobRecommendation?: (jobId: string) => void;
}

export default function CHWJobAISearch({ chwId, chwProfile, onJobRecommendation }: CHWJobAISearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Call AI search API
      const response = await fetch('/api/chw/ai-job-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chwId,
          query: searchQuery,
          profile: {
            expertise: chwProfile?.professional?.expertise || [],
            languages: chwProfile?.professional?.languages || [],
            location: chwProfile?.serviceArea?.countyResideIn || '',
            yearsOfExperience: chwProfile?.professional?.yearsOfExperience || 0,
            additionalExpertise: chwProfile?.professional?.additionalExpertise || ''
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search for jobs');
      }

      const data = await response.json();
      setResults(data.jobs || []);

      // Auto-send email notifications for high-match jobs
      if (data.jobs && data.jobs.length > 0) {
        const highMatchJobs = data.jobs.filter((job: any) => job.matchScore >= 80);
        if (highMatchJobs.length > 0) {
          await sendJobNotifications(highMatchJobs);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
      console.error('AI Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendJobNotifications = async (jobs: any[]) => {
    try {
      await fetch('/api/chw/send-job-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chwId,
          email: chwProfile?.email,
          jobs: jobs.map(job => ({
            id: job.id,
            title: job.title,
            organization: job.organization,
            matchScore: job.matchScore
          }))
        }),
      });
    } catch (err) {
      console.error('Error sending notifications:', err);
    }
  };

  const handleAddToJobList = async (job: any) => {
    try {
      // Add job to CHW's recommendation list
      await fetch('/api/chw/add-job-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chwId,
          jobId: job.id,
          matchScore: job.matchScore,
          matchReasons: job.matchReasons || []
        }),
      });

      if (onJobRecommendation) {
        onJobRecommendation(job.id);
      }

      alert('Job added to your recommendations!');
    } catch (err) {
      console.error('Error adding job:', err);
      alert('Failed to add job to recommendations');
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AIIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
          <Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              AI Job Search
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Let AI find the perfect CHW jobs for you
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Describe your ideal job or ask AI to find opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
            disabled={loading}
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button
            variant="contained"
            onClick={handleAISearch}
            disabled={loading || !searchQuery.trim()}
            sx={{
              minWidth: 120,
              backgroundColor: 'white',
              color: '#667eea',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              }
            }}
            endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Remote CHW positions"
            size="small"
            onClick={() => setSearchQuery('Remote CHW positions')}
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <Chip
            label="Diabetes care specialist"
            size="small"
            onClick={() => setSearchQuery('Diabetes care specialist')}
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <Chip
            label="Bilingual CHW jobs"
            size="small"
            onClick={() => setSearchQuery('Bilingual CHW jobs')}
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            AI Found {results.length} Matching Jobs
          </Typography>
          <List>
            {results.map((job, index) => (
              <React.Fragment key={job.id}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${job.matchScore}% Match`}
                        color={job.matchScore >= 80 ? 'success' : job.matchScore >= 60 ? 'primary' : 'default'}
                        size="small"
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAddToJobList(job)}
                      >
                        Add to List
                      </Button>
                    </Box>
                  }
                  disablePadding
                >
                  <ListItemButton>
                    <ListItemText
                      primary={job.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="primary">
                            {job.organization}
                          </Typography>
                          {' • '}
                          {job.location?.city}, {job.location?.state}
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {job.matchReasons?.slice(0, 2).join(' • ')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {!loading && results.length === 0 && searchQuery && (
        <Alert severity="info">
          No jobs found matching your search. Try different keywords or let AI suggest opportunities based on your profile.
        </Alert>
      )}
    </Box>
  );
}

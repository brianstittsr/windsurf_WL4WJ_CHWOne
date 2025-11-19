'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { CHWJob, CHWJobRecommendation } from '@/types/chw-jobs.types';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CHWJobsSectionProps {
  chwId: string;
  chwProfile: any; // CHW profile with skills, expertise, etc.
}

export default function CHWJobsSection({ chwId, chwProfile }: CHWJobsSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState<CHWJob[]>([]);
  const [recommendations, setRecommendations] = useState<CHWJobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<CHWJob | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
    loadRecommendations();
  }, [chwId]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsRef = collection(db, 'chwJobs');
      const q = query(
        jobsRef,
        where('status', '==', 'active'),
        orderBy('postedDate', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CHWJob[];
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recsRef = collection(db, 'chwJobRecommendations');
      const q = query(
        recsRef,
        where('chwId', '==', chwId),
        where('status', '!=', 'dismissed'),
        orderBy('matchScore', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const recsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CHWJobRecommendation[];
      
      setRecommendations(recsData);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const calculateMatchScore = (job: CHWJob): number => {
    let score = 0;
    const maxScore = 100;
    
    // Match skills
    if (chwProfile?.professional?.expertise && job.requiredSkills) {
      const matchedSkills = job.requiredSkills.filter(skill =>
        chwProfile.professional.expertise.includes(skill)
      );
      score += (matchedSkills.length / job.requiredSkills.length) * 40;
    }
    
    // Match location
    if (chwProfile?.serviceArea?.countiesWorkedIn && job.location?.county) {
      if (chwProfile.serviceArea.countiesWorkedIn.includes(job.location.county)) {
        score += 20;
      }
    }
    
    // Match experience level
    if (chwProfile?.professional?.yearsOfExperience) {
      const years = chwProfile.professional.yearsOfExperience;
      if (job.experienceLevel === 'entry' && years < 2) score += 20;
      else if (job.experienceLevel === 'intermediate' && years >= 2 && years < 5) score += 20;
      else if (job.experienceLevel === 'advanced' && years >= 5) score += 20;
      else if (job.experienceLevel === 'any') score += 10;
    }
    
    // Match languages
    if (chwProfile?.professional?.languages && job.languages) {
      const matchedLanguages = job.languages.filter(lang =>
        chwProfile.professional.languages.includes(lang)
      );
      score += (matchedLanguages.length / job.languages.length) * 20;
    }
    
    return Math.min(score, maxScore);
  };

  const getRecommendedJobs = () => {
    return jobs
      .map(job => ({
        ...job,
        matchScore: calculateMatchScore(job)
      }))
      .filter(job => job.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderJobCard = (job: CHWJob, showMatchScore: boolean = false) => (
    <Card key={job.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              {job.organization}
            </Typography>
          </Box>
          {showMatchScore && job.matchScore && (
            <Chip
              icon={<StarIcon />}
              label={`${Math.round(job.matchScore)}% Match`}
              color={job.matchScore >= 80 ? 'success' : job.matchScore >= 60 ? 'primary' : 'default'}
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {job.location.city}, {job.location.state}
              {job.location.remote && ' (Remote)'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {job.employmentType}
            </Typography>
          </Box>
          {job.salary && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} {job.salary.type}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {job.description.substring(0, 200)}...
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {job.requiredSkills.slice(0, 5).map((skill, index) => (
            <Chip key={index} label={skill} size="small" variant="outlined" />
          ))}
          {job.requiredSkills.length > 5 && (
            <Chip label={`+${job.requiredSkills.length - 5} more`} size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => setSelectedJob(job)}>
          View Details
        </Button>
        <Button size="small" color="primary" variant="contained">
          Apply Now
        </Button>
        <IconButton size="small">
          <BookmarkBorderIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          CHW Job Opportunities
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Discover jobs that match your skills and experience
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Recommended For You" />
        <Tab label="All Jobs" />
        <Tab label="Saved Jobs" />
      </Tabs>

      <TextField
        fullWidth
        placeholder="Search jobs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {activeTab === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                These jobs match your skills, experience, and location preferences
              </Alert>
              {getRecommendedJobs().length === 0 ? (
                <Typography color="text.secondary">No recommended jobs at this time</Typography>
              ) : (
                getRecommendedJobs().map(job => renderJobCard(job, true))
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {filteredJobs.length === 0 ? (
                <Typography color="text.secondary">No jobs found</Typography>
              ) : (
                filteredJobs.map(job => renderJobCard(job, false))
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography color="text.secondary">No saved jobs yet</Typography>
            </Box>
          )}
        </>
      )}

      {/* Job Details Dialog */}
      <Dialog
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Typography variant="h5">{selectedJob.title}</Typography>
              <Typography variant="subtitle1" color="primary">
                {selectedJob.organization}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1" paragraph>{selectedJob.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Requirements</Typography>
                  <ul>
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}><Typography variant="body2">{req}</Typography></li>
                    ))}
                  </ul>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Responsibilities</Typography>
                  <ul>
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index}><Typography variant="body2">{resp}</Typography></li>
                    ))}
                  </ul>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedJob(null)}>Close</Button>
              <Button variant="contained" color="primary">Apply Now</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

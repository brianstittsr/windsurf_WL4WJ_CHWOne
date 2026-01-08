'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import { getProgramMetrics, type ProgramMetrics } from '@/services/programDatasetService';
import { ProgramForm } from '@/types/program-form.types';

interface ProgramMetricsDashboardProps {
  program: ProgramForm;
  onViewDataset?: (datasetType: 'instructor' | 'student' | 'nonprofit') => void;
}

export default function ProgramMetricsDashboard({ program, onViewDataset }: ProgramMetricsDashboardProps) {
  const [metrics, setMetrics] = useState<ProgramMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMetrics();
  }, [program.id]);
  
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const result = await getProgramMetrics(program.id);
      if (result.success && result.metrics) {
        setMetrics(result.metrics);
      }
    } catch (error) {
      console.error('Error fetching program metrics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2 }}>Loading metrics...</Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <ChartIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography color="text.secondary">
            No data available yet. Start adding records to see metrics.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  const completionColor = metrics.completionRate >= 70 ? 'success' : metrics.completionRate >= 40 ? 'warning' : 'error';
  
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <SchoolIcon />
          </Avatar>
        }
        title={program.name}
        subheader="Program Performance Dashboard"
        action={
          <Chip 
            label={program.status} 
            color={program.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        }
      />
      <Divider />
      <CardContent>
        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Instructors */}
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {metrics.totalInstructors}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Instructors
              </Typography>
            </Box>
          </Grid>
          
          {/* Students */}
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <SchoolIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {metrics.totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
            </Box>
          </Grid>
          
          {/* Completion Rate */}
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${completionColor}.50`, borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: `${completionColor}.main`, mx: 'auto', mb: 1 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {metrics.completionRate.toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
            </Box>
          </Grid>
          
          {/* Satisfaction */}
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <StarIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {metrics.avgSatisfactionScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Satisfaction
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Student Status Breakdown */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Student Status Breakdown
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon color="success" fontSize="small" />
              <Box>
                <Typography variant="h6">{metrics.studentsCompleted}</Typography>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="info" fontSize="small" />
              <Box>
                <Typography variant="h6">{metrics.studentsInProgress}</Typography>
                <Typography variant="caption" color="text.secondary">In Progress</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CancelIcon color="error" fontSize="small" />
              <Box>
                <Typography variant="h6">{metrics.studentsDropped}</Typography>
                <Typography variant="caption" color="text.secondary">Dropped</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Overall Progress</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {metrics.studentsCompleted} / {metrics.totalStudents} students completed
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={metrics.completionRate} 
            color={completionColor}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        
        {/* Program Delivery Stats */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Program Delivery
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="primary">{metrics.totalClassesHeld}</Typography>
                <Typography variant="body2" color="text.secondary">Classes Held</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="primary">{metrics.totalHoursDelivered}</Typography>
                <Typography variant="body2" color="text.secondary">Hours Delivered</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Dataset Links */}
        {onViewDataset && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              View Datasets
            </Typography>
            <Grid container spacing={1}>
              {program.datasets.instructor.enabled && (
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => onViewDataset('instructor')}
                  >
                    Instructor Data
                  </Button>
                </Grid>
              )}
              {program.datasets.student.enabled && (
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="success"
                    startIcon={<SchoolIcon />}
                    onClick={() => onViewDataset('student')}
                  >
                    Student Data
                  </Button>
                </Grid>
              )}
              {program.datasets.nonprofit.enabled && (
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<BusinessIcon />}
                    onClick={() => onViewDataset('nonprofit')}
                  >
                    Nonprofit Reports
                  </Button>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
}

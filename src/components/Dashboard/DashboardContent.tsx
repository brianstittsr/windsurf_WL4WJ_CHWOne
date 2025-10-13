import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Skeleton,
  Divider,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { dashboardService } from '@/services/dashboard/DashboardService';
import DatabaseStatusCard from './DatabaseStatusCard';

interface StatCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  loading: boolean;
  color: string;
}

function StatCard({ title, value, icon, loading, color }: StatCardProps) {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderTop: 6, 
      borderColor: color,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            bgcolor: `${color}15`, 
            borderRadius: '50%', 
            p: 1.5, 
            display: 'flex', 
            mr: 2 
          }}>
            {React.cloneElement(icon as React.ReactElement, { 
              sx: { fontSize: 28, color } 
            })}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={40} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {value !== null ? value : '-'}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeChws: null as number | null,
    activeProjects: null as number | null,
    activeGrants: null as number | null,
    pendingReferrals: null as number | null
  });

  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First check database connection
      const connectionStatus = await dashboardService.checkDatabaseConnection();
      
      if (!connectionStatus.isConnected) {
        throw new Error('Database connection failed. Please check your connection and try again.');
      }
      
      // Fetch all stats in parallel
      const [chwsCount, projectsCount, grantsCount, referralsCount] = await Promise.all([
        dashboardService.getActiveCHWsCount(),
        dashboardService.getActiveProjectsCount(),
        dashboardService.getActiveGrantsCount(),
        dashboardService.getPendingReferralsCount()
      ]);
      
      setStats({
        activeChws: chwsCount,
        activeProjects: projectsCount,
        activeGrants: grantsCount,
        pendingReferrals: referralsCount
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up an interval to refresh data every 5 minutes
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 300000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
        CHW Platform Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of platform metrics, active projects, and key performance indicators
      </Typography>
      
      {error ? (
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 2, 
          bgcolor: 'error.light', 
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, display: 'flex' }}>
              <ErrorIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="body1">{error}</Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Box>
      ) : null}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active CHWs"
            value={stats.activeChws}
            icon={<PeopleIcon />}
            loading={loading}
            color="#1a365d"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<BusinessIcon />}
            loading={loading}
            color="#2a4365"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Grants"
            value={stats.activeGrants}
            icon={<DescriptionIcon />}
            loading={loading}
            color="#2c5282"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Pending Referrals"
            value={stats.pendingReferrals}
            icon={<SendIcon />}
            loading={loading}
            color="#3182ce"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        System Status
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DatabaseStatusCard />
        </Grid>
      </Grid>
    </Box>
  );
}

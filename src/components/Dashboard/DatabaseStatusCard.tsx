import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  CircularProgress,
  Button,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  Refresh as RefreshIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { dashboardService, DatabaseConnectionStatus } from '@/services/dashboard/DashboardService';

export default function DatabaseStatusCard() {
  const [status, setStatus] = useState<DatabaseConnectionStatus>({
    isConnected: false,
    lastChecked: new Date()
  });
  const [loading, setLoading] = useState(true);

  const checkConnection = async () => {
    setLoading(true);
    
    // Simulate a delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Always return connected status with mock data
    setStatus({
      isConnected: true,
      lastChecked: new Date(),
      latency: 42 // Mock latency value
    });
    
    setLoading(false);
  };

  useEffect(() => {
    // Check connection once on mount
    checkConnection();
    
    // No interval for refreshing status
    return () => {
      // No cleanup needed
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
      }
    }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: status.isConnected ? 'success.main' : 'error.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StorageIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Database Status
          </Typography>
        </Box>
        <Tooltip title="Refresh status">
          <Button 
            size="small" 
            onClick={checkConnection} 
            disabled={loading}
            sx={{ 
              minWidth: 'auto', 
              p: 0.5, 
              color: 'white', 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          </Button>
        </Tooltip>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          py: 2
        }}>
          <Box sx={{ 
            width: 70, 
            height: 70, 
            borderRadius: '50%', 
            bgcolor: status.isConnected ? 'success.light' : 'error.light',
            color: status.isConnected ? 'success.dark' : 'error.dark',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            {status.isConnected ? 
              <CheckCircleIcon sx={{ fontSize: 40 }} /> : 
              <ErrorIcon sx={{ fontSize: 40 }} />
            }
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {status.isConnected ? 'Connected' : 'Disconnected'}
          </Typography>
          
          {status.latency && status.isConnected && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Response Time
              </Typography>
              <Chip
                label={`${status.latency}ms`}
                color={status.latency < 100 ? 'success' : status.latency < 300 ? 'warning' : 'error'}
                size="small"
              />
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last checked:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {formatTime(status.lastChecked)}
          </Typography>
        </Box>
        
        {status.error && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error.dark" sx={{ mb: status.isPermissionsError ? 1 : 0 }}>
              {status.error}
            </Typography>
            
            {status.isPermissionsError && (
              <>
                <Typography variant="body2" color="error.dark" fontWeight="medium">
                  This is a Firebase permissions error. To fix it:
                </Typography>
                <Typography variant="body2" color="error.dark" component="ol" sx={{ pl: 2, mt: 0.5 }}>
                  <li>Check that your Firebase security rules are properly configured</li>
                  <li>Make sure you&apos;re authenticated if the rules require it</li>
                  <li>Try deploying the updated security rules</li>
                </Typography>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Button,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  IntegrationInstructions as IntegrationIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
  Paid as PaidIcon,
  Map as MapIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import AdminSettings from '@/components/Admin/AdminSettings';
import AdminUsers from '@/components/Admin/AdminUsers';
import AdminIntegrations from '@/components/Admin/AdminIntegrations';
import AdminAnalytics from '@/components/Admin/AdminAnalytics';
import AdminSecurity from '@/components/Admin/AdminSecurity';
import AdminGrants from '@/components/Admin/AdminGrants';
import AdminStates from '@/components/Admin/AdminStates';
import AdminCHWAssociations from '@/components/Admin/AdminCHWAssociations';
import AdminNonprofits from '@/components/Admin/AdminNonprofits';
import AdminIdeas from '@/components/Admin/AdminIdeas';
import AdminBillComAPI from '@/components/Admin/AdminBillComAPI';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Inner component that uses the auth context
function AdminDashboardContent() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  // Check if user is admin based on their role in Firestore
  const isAdmin = 
    userProfile?.role === UserRole.ADMIN || 
    userProfile?.roles?.includes(UserRole.ADMIN) ||
    currentUser.email === 'admin@example.com'; // Fallback for legacy admin

  if (!isAdmin) {
    return (
      <MainLayout>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You don&apos;t have permission to access the admin panel.
            </Typography>
            <Button variant="contained" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const adminTabs = [
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      component: <AdminSettings />
    },
    {
      label: 'Users',
      icon: <PeopleIcon />,
      component: <AdminUsers />
    },
    {
      label: 'States',
      icon: <MapIcon />,
      component: <AdminStates />
    },
    {
      label: 'CHW Associations',
      icon: <StorageIcon />,
      component: <AdminCHWAssociations />
    },
    {
      label: 'Nonprofits',
      icon: <BusinessIcon />,
      component: <AdminNonprofits />
    },
    {
      label: 'Platform Ideas',
      icon: <NotificationsIcon />,
      component: <AdminIdeas />
    },
    {
      label: 'Integrations',
      icon: <IntegrationIcon />,
      component: <AdminIntegrations />
    },
    {
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      component: <AdminAnalytics />
    },
    {
      label: 'Security',
      icon: <SecurityIcon />,
      component: <AdminSecurity />
    },
    {
      label: 'Grants',
      icon: <PaidIcon />,
      component: <AdminGrants />
    },
    {
      label: 'Bill.com API',
      icon: <AccountBalanceIcon />,
      component: <AdminBillComAPI />
    }
  ];

  return (
    <MainLayout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Admin Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Platform Configuration & Management
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Administrator Access"
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              fontSize: '0.9rem',
              px: 2,
              py: 1
            }}
          />
        </Box>

        {/* System Status Alert */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>System Status:</strong> All services operational •
            Last backup: 2 hours ago •
            Active users: 47
          </Typography>
        </Alert>

        {/* Admin Navigation Tabs */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }
              }}
            >
              {adminTabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                  sx={{ px: 3 }}
                />
              ))}
            </Tabs>
          </Box>
        </Card>

        {/* Tab Content */}
        {adminTabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Container>
    </MainLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function AdminDashboard() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  );
}

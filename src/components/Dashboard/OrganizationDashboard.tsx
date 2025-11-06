'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Avatar,
  Divider,
  useTheme,
  Paper,
  Chip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Assignment as AssignmentIcon,
  AttachMoney as GrantsIcon,
  Group as UsersIcon,
  Event as EventIcon,
  Lightbulb as IdeasIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import useToolPermissions from '@/hooks/useToolPermissions';
import { OrganizationType, PlatformTool } from '@/types/organization-profiles';
import { getOrganizationTypeDisplayName } from '@/utils/organizationTypeMapping';
import RoleBasedNavigation from '../Layout/RoleBasedNavigation';

// Activity feed item interface
interface ActivityItem {
  id: string;
  type: 'referral' | 'form' | 'project' | 'grant' | 'idea';
  title: string;
  description: string;
  date: Date;
  status: string;
  user: {
    name: string;
    avatar?: string;
  };
}

// Metric card interface
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

// Quick action interface
interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, trend }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
              {value}
            </Typography>
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              width: 48, 
              height: 48 
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          {trend && (
            <>
              {trend.direction === 'up' && (
                <TrendingUp sx={{ color: theme.palette.success.main, mr: 0.5 }} fontSize="small" />
              )}
              {trend.direction === 'down' && (
                <TrendingDown sx={{ color: theme.palette.error.main, mr: 0.5 }} fontSize="small" />
              )}
              <Typography 
                variant="body2" 
                component="span" 
                sx={{ 
                  color: trend.direction === 'up' 
                    ? theme.palette.success.main 
                    : trend.direction === 'down'
                      ? theme.palette.error.main
                      : 'inherit',
                  fontWeight: 600,
                  mr: 1
                }}
              >
                {trend.value}%
              </Typography>
            </>
          )}
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Activity Feed Component
const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  if (!activities.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No recent activities to display
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <Box sx={{ display: 'flex', py: 1.5 }}>
            <Avatar 
              alt={activity.user.name} 
              src={activity.user.avatar}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              {activity.user.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="bold">
                  {activity.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.date).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {activity.description}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip 
                  label={activity.status} 
                  size="small"
                  color={
                    activity.status.includes('Complete') || activity.status.includes('Approved')
                      ? 'success'
                      : activity.status.includes('Pending')
                      ? 'warning'
                      : 'default'
                  }
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          {index < activities.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Box>
  );
};

// Quick Actions Component
const QuickActions: React.FC<{ actions: QuickAction[] }> = ({ actions }) => {
  return (
    <Grid container spacing={2}>
      {actions.map((action, index) => (
        <Grid item xs={6} md={4} lg={3} key={index}>
          <Button
            variant="outlined"
            color={action.color || 'primary'}
            startIcon={action.icon}
            fullWidth
            component="a"
            href={action.href}
            sx={{ 
              justifyContent: 'flex-start',
              textAlign: 'left',
              py: 1.5,
              height: '100%'
            }}
          >
            {action.label}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

// Main Dashboard Component
export default function OrganizationDashboard() {
  const theme = useTheme();
  const { userProfile } = useAuth();
  const { availableTools, organizationType } = useToolPermissions();
  
  // Demo data - in a real app, this would come from an API call
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'referral',
      title: 'New referral received',
      description: 'Jane Smith referred a client for housing assistance',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'Pending Review',
      user: { name: 'Jane Smith' }
    },
    {
      id: '2',
      type: 'form',
      title: 'Form submission completed',
      description: 'Intake form submitted for Johnson family',
      date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      status: 'Completed',
      user: { name: 'Maria Garcia' }
    },
    {
      id: '3',
      type: 'grant',
      title: 'Grant application updated',
      description: 'COVID-19 Emergency Fund application updated with new data',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      status: 'In Progress',
      user: { name: 'David Wilson' }
    }
  ];
  
  // Get quick actions based on organization type and available tools
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [];
    
    if (availableTools().includes(PlatformTool.REFERRALS)) {
      baseActions.push({
        label: 'Create Referral',
        icon: <AssignmentIcon />,
        href: '/referrals/new',
        color: 'primary'
      });
    }
    
    if (availableTools().includes(PlatformTool.GRANTS)) {
      baseActions.push({
        label: 'Browse Grants',
        icon: <GrantsIcon />,
        href: '/grants',
        color: 'secondary'
      });
    }
    
    if (availableTools().includes(PlatformTool.FORMS)) {
      baseActions.push({
        label: 'Complete Form',
        icon: <AssignmentIcon />,
        href: '/forms',
        color: 'info'
      });
    }
    
    if (availableTools().includes(PlatformTool.IDEAS)) {
      baseActions.push({
        label: 'Submit Idea',
        icon: <IdeasIcon />,
        href: '/ideas',
        color: 'success'
      });
    }
    
    return baseActions;
  };
  
  // Get metric cards based on organization type
  const getMetricCards = () => {
    const baseMetrics = [
      {
        title: 'Active Tasks',
        value: 14,
        subtitle: 'This month',
        icon: <AssignmentIcon />,
        trend: { value: 8, label: 'since last month', direction: 'up' }
      }
    ];
    
    switch (organizationType) {
      case OrganizationType.CHW:
        return [
          ...baseMetrics,
          {
            title: 'Open Referrals',
            value: 7,
            subtitle: 'Requiring action',
            icon: <AssignmentIcon />,
            trend: { value: 2, label: 'since yesterday', direction: 'down' }
          },
          {
            title: 'Clients Served',
            value: 24,
            subtitle: 'This month',
            icon: <UsersIcon />,
            trend: { value: 12, label: 'since last month', direction: 'up' }
          }
        ];
      
      case OrganizationType.NONPROFIT:
        return [
          ...baseMetrics,
          {
            title: 'Grant Opportunities',
            value: 5,
            subtitle: 'Closing this month',
            icon: <GrantsIcon />,
            trend: { value: 2, label: 'since last week', direction: 'up' }
          },
          {
            title: 'Team Members',
            value: 18,
            subtitle: 'Active this week',
            icon: <UsersIcon />,
            trend: { value: 5, label: 'since last month', direction: 'up' }
          }
        ];
      
      case OrganizationType.CHW_ASSOCIATION:
        return [
          ...baseMetrics,
          {
            title: 'Upcoming Events',
            value: 3,
            subtitle: 'Next 30 days',
            icon: <EventIcon />,
            trend: { value: 1, label: 'since last month', direction: 'up' }
          },
          {
            title: 'CHW Members',
            value: 42,
            subtitle: 'Active members',
            icon: <UsersIcon />,
            trend: { value: 8, label: 'since last quarter', direction: 'up' }
          }
        ];
      
      case OrganizationType.STATE:
        return [
          ...baseMetrics,
          {
            title: 'Organizations',
            value: 16,
            subtitle: 'Registered entities',
            icon: <UsersIcon />,
            trend: { value: 3, label: 'since last month', direction: 'up' }
          },
          {
            title: 'Active Grants',
            value: 8,
            subtitle: 'In progress',
            icon: <GrantsIcon />,
            trend: { value: 2, label: 'since last quarter', direction: 'up' }
          }
        ];
      
      default:
        return baseMetrics;
    }
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left sidebar with role-based navigation */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box sx={{ position: 'sticky', top: 70, maxHeight: 'calc(100vh - 70px)', overflowY: 'auto' }}>
          <RoleBasedNavigation />
        </Box>
      </Box>
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {`${getOrganizationTypeDisplayName(organizationType)} Dashboard`}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {userProfile?.displayName || 'User'}. Here's an overview of your activity.
          </Typography>
        </Box>
        
        {/* Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {getMetricCards().map((metric, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
        
        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <QuickActions actions={getQuickActions()} />
        </Paper>
        
        {/* Recent Activity */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <ActivityFeed activities={mockActivities} />
          {mockActivities.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="text" color="primary">
                View All Activity
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Close,
  Send,
  FolderOpen,
  AttachMoney,
  Description,
  Storage,
  Assessment,
  Folder,
  SmartToy,
  Build,
  Lightbulb,
  Handshake,
  Map,
  People,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  Celebration
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationType } from '@/types/firebase/schema';

interface ToolsOnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface ToolInfo {
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: string;
}

// Define all CHW Tools with their descriptions
const allTools: Record<string, ToolInfo> = {
  referrals: {
    name: 'Referrals',
    icon: <Send />,
    description: 'Send and receive referrals between CHWs and service providers.',
    features: [
      'Create referrals for clients to connect them with services',
      'Track referral status and outcomes',
      'Receive referrals from partner organizations',
      'View referral history and analytics'
    ],
    color: '#2196F3'
  },
  projects: {
    name: 'Projects',
    icon: <FolderOpen />,
    description: 'Manage community health projects and initiatives.',
    features: [
      'Create and organize health projects',
      'Track project milestones and deliverables',
      'Collaborate with team members',
      'Monitor project progress and outcomes'
    ],
    color: '#4CAF50'
  },
  grants: {
    name: 'Grants',
    icon: <AttachMoney />,
    description: 'Discover, apply for, and manage grant funding.',
    features: [
      'Browse available grant opportunities',
      'AI-powered grant document analysis',
      'Track grant applications and deadlines',
      'Manage grant reporting requirements'
    ],
    color: '#FF9800'
  },
  forms: {
    name: 'Forms',
    icon: <Description />,
    description: 'Create and manage data collection forms.',
    features: [
      'Build custom forms with drag-and-drop',
      'Collect client data securely',
      'Share forms with team members',
      'Export form submissions for reporting'
    ],
    color: '#9C27B0'
  },
  datasets: {
    name: 'Datasets',
    icon: <Storage />,
    description: 'Store and analyze your collected data.',
    features: [
      'Import data from various sources',
      'Organize data into structured datasets',
      'Run queries and filters on your data',
      'Export data for external analysis'
    ],
    color: '#00BCD4'
  },
  reports: {
    name: 'Reports',
    icon: <Assessment />,
    description: 'Generate reports and visualize your impact.',
    features: [
      'Create custom reports from your data',
      'Visualize trends with charts and graphs',
      'Schedule automated report generation',
      'Share reports with stakeholders'
    ],
    color: '#E91E63'
  },
  resources: {
    name: 'Resources',
    icon: <Folder />,
    description: 'Access educational materials and community resources.',
    features: [
      'Browse curated health resources',
      'Find local services and providers',
      'Access training materials',
      'Share resources with clients'
    ],
    color: '#795548'
  },
  aiAssistant: {
    name: 'AI Assistant',
    icon: <SmartToy />,
    description: 'Get AI-powered help with your work.',
    features: [
      'Ask questions about CHW best practices',
      'Get help writing reports and documentation',
      'Analyze data with natural language queries',
      'Generate insights from your activities'
    ],
    color: '#673AB7'
  },
  dataTools: {
    name: 'Data Tools',
    icon: <Build />,
    description: 'Advanced tools for data management.',
    features: [
      'Import and export data in multiple formats',
      'Clean and transform data',
      'Merge datasets from different sources',
      'Validate data quality'
    ],
    color: '#607D8B'
  },
  ideas: {
    name: 'Platform Ideas',
    icon: <Lightbulb />,
    description: 'Share ideas to improve the platform.',
    features: [
      'Submit feature requests and suggestions',
      'Vote on ideas from other users',
      'Track the status of your ideas',
      'Participate in platform development'
    ],
    color: '#FFC107'
  },
  collaborations: {
    name: 'Collaborations',
    icon: <Handshake />,
    description: 'Connect and collaborate with partners.',
    features: [
      'Find collaboration opportunities',
      'Join regional initiatives',
      'Share resources with partners',
      'Track collaborative projects'
    ],
    color: '#3F51B5'
  },
  regions: {
    name: 'Regional Pages',
    icon: <Map />,
    description: 'Access region-specific information and resources.',
    features: [
      'View regional health data and statistics',
      'Find CHWs and organizations in your region',
      'Access region-specific resources',
      'Connect with regional coordinators'
    ],
    color: '#009688'
  },
  directory: {
    name: 'CHW Directory',
    icon: <People />,
    description: 'Find and connect with other CHWs.',
    features: [
      'Search for CHWs by location or specialty',
      'View CHW profiles and expertise',
      'Connect with peers for collaboration',
      'Build your professional network'
    ],
    color: '#FF5722'
  }
};

// Get tools based on organization type
const getToolsForOrgType = (orgType?: OrganizationType): string[] => {
  switch (orgType) {
    case OrganizationType.CHW:
      return ['referrals', 'forms', 'resources', 'collaborations', 'ideas'];
    case OrganizationType.NONPROFIT:
      return ['referrals', 'projects', 'grants', 'forms', 'datasets', 'reports', 'resources', 'aiAssistant', 'dataTools', 'collaborations', 'regions', 'directory'];
    case OrganizationType.CHW_ASSOCIATION:
      return ['projects', 'grants', 'forms', 'reports', 'resources', 'aiAssistant', 'collaborations', 'regions', 'directory'];
    case OrganizationType.STATE:
      return ['projects', 'grants', 'forms', 'reports', 'resources', 'aiAssistant', 'regions', 'directory'];
    default:
      return ['referrals', 'projects', 'grants', 'forms', 'datasets', 'reports', 'resources', 'aiAssistant', 'dataTools', 'ideas', 'collaborations', 'regions', 'directory'];
  }
};

export default function ToolsOnboardingWizard({ open, onClose, onComplete }: ToolsOnboardingWizardProps) {
  const { userProfile, currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  
  const userOrgType = userProfile?.organizationType;
  const availableToolKeys = getToolsForOrgType(userOrgType);
  const availableTools = availableToolKeys.map(key => ({ key, ...allTools[key] }));
  
  // Group tools into steps (3-4 tools per step)
  const toolsPerStep = 3;
  const toolSteps: typeof availableTools[] = [];
  for (let i = 0; i < availableTools.length; i += toolsPerStep) {
    toolSteps.push(availableTools.slice(i, i + toolsPerStep));
  }
  
  const steps = [
    'Welcome',
    ...toolSteps.map((_, i) => `Tools ${i + 1}`),
    'Get Started'
  ];

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleComplete = () => {
    // Mark onboarding as complete in session storage
    if (currentUser) {
      const onboardingKey = `tools_onboarding_complete_${currentUser.uid}`;
      localStorage.setItem(onboardingKey, 'true');
    }
    onComplete();
  };

  const getOrgTypeName = () => {
    switch (userOrgType) {
      case OrganizationType.CHW:
        return 'Community Health Worker';
      case OrganizationType.NONPROFIT:
        return 'Nonprofit Organization';
      case OrganizationType.CHW_ASSOCIATION:
        return 'CHW Association';
      case OrganizationType.STATE:
        return 'State Agency';
      default:
        return 'User';
    }
  };

  const renderStepContent = () => {
    // Welcome step
    if (activeStep === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Celebration sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome to CHWOne!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your profile is complete. Let&apos;s explore the tools available to you.
          </Typography>
          <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
            <Typography variant="body1" color="primary.main" fontWeight="medium">
              As a {getOrgTypeName()}, you have access to {availableTools.length} powerful tools
              designed to help you make a greater impact in your community.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Click &quot;Next&quot; to learn about each tool and how to use it.
          </Typography>
        </Box>
      );
    }
    
    // Get Started step (last step)
    if (activeStep === steps.length - 1) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            You&apos;re All Set!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You now know about all the tools available to you.
          </Typography>
          <Box sx={{ mt: 4, p: 3, bgcolor: 'success.50', borderRadius: 2 }}>
            <Typography variant="body1" color="success.dark">
              Start exploring the platform and making an impact in your community!
            </Typography>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Tips:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Use the sidebar to navigate between tools" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Check your profile to update your information anytime" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Use the AI Assistant for help with any questions" />
              </ListItem>
            </List>
          </Box>
        </Box>
      );
    }
    
    // Tool steps
    const toolStepIndex = activeStep - 1;
    const currentTools = toolSteps[toolStepIndex] || [];
    
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center" sx={{ mb: 3 }}>
          Discover Your Tools
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {currentTools.map((tool) => (
            <Card 
              key={tool.key} 
              variant="outlined"
              sx={{ 
                borderLeft: 4, 
                borderLeftColor: tool.color,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar sx={{ bgcolor: tool.color, width: 48, height: 48 }}>
                    {tool.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {tool.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tool.description}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight="medium">
                      Key Features:
                    </Typography>
                    <List dense disablePadding>
                      {tool.features.map((feature, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircle sx={{ fontSize: 14, color: tool.color }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="span">CHW Tools Guide</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Learn about the tools available to help you succeed
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  {index === 0 ? 'Welcome' : 
                   index === steps.length - 1 ? 'Get Started' : 
                   `Tools ${index}`}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Skip Tour
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleComplete}
            startIcon={<CheckCircle />}
          >
            Start Using CHWOne
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleNext}
            endIcon={<ArrowForward />}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

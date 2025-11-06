'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Divider, Tooltip, Badge, Avatar, Chip, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Dashboard as DashboardIcon,
  AssignmentInd as ReferralsIcon,
  Architecture as ProjectsIcon,
  AttachMoney as GrantsIcon,
  LibraryBooks as ResourcesIcon,
  Assignment as FormsIcon,
  Storage as DatasetsIcon,
  BarChart as ReportsIcon,
  Chat as AIAssistantIcon,
  Build as DataToolsIcon,
  Lightbulb as IdeasIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import useToolPermissions from '@/hooks/useToolPermissions';
import { PlatformTool, TOOL_DISPLAY_CONFIG, OrganizationType } from '@/types/organization-profiles';
import ClickableLink from './ClickableLink';

// Maps tool IDs to their icon components
const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  referrals: <ReferralsIcon />,
  projects: <ProjectsIcon />,
  grants: <GrantsIcon />,
  resources: <ResourcesIcon />,
  forms: <FormsIcon />,
  datasets: <DatasetsIcon />,
  reports: <ReportsIcon />,
  'ai-assistant': <AIAssistantIcon />,
  'data-tools': <DataToolsIcon />,
  ideas: <IdeasIcon />
};

// Styled components
const NavSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const NavSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  padding: theme.spacing(1, 2),
}));

const NavButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  textAlign: 'left',
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5),
  },
}));

interface RoleBasedNavigationProps {
  onNavigate?: () => void; // Optional callback for mobile navigation
  showOrgLabel?: boolean; // Whether to show organization type label
}

/**
 * Navigation component that displays tools based on user's organization type
 */
export default function RoleBasedNavigation({ onNavigate, showOrgLabel = true }: RoleBasedNavigationProps) {
  const { userProfile } = useAuth();
  const { availableTools, toolsByCategory, organizationType } = useToolPermissions();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    core: true,
    data: false,
    communication: false,
    admin: false
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Sort order for categories
  const categoryOrder = ['core', 'data', 'communication', 'admin'];
  
  // Get organization name for display
  const getOrganizationName = (): string => {
    switch(organizationType) {
      case OrganizationType.CHW:
        return 'Community Health Worker';
      case OrganizationType.NONPROFIT:
        return 'Nonprofit Organization';
      case OrganizationType.CHW_ASSOCIATION:
        return 'CHW Association';
      case OrganizationType.STATE:
        return 'State Agency';
      case OrganizationType.ADMIN:
        return 'Platform Administrator';
      default:
        return 'User';
    }
  };
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle navigation click (for mobile)
  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };
  
  // Tool category sections
  const renderCategorySection = (category: string, tools: PlatformTool[]) => {
    if (!tools || tools.length === 0) return null;
    
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    const isExpanded = expanded[category] !== false; // Default to expanded if not set
    
    return (
      <NavSection key={category}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.04)',
              borderRadius: 1
            }
          }}
          onClick={() => toggleCategory(category)}
        >
          <NavSectionTitle variant="overline">
            {categoryTitle}
          </NavSectionTitle>
          {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
        
        {isExpanded && (
          <Box>
            {tools.map((tool) => {
              const toolConfig = TOOL_DISPLAY_CONFIG[tool];
              return (
                <Tooltip 
                  key={tool} 
                  title={toolConfig.description} 
                  placement="right"
                >
                  <ClickableLink href={`/${tool}`}>
                    <NavButton
                      startIcon={iconMap[tool] || null}
                      fullWidth
                      color="inherit"
                      onClick={handleNavClick}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.08)', // Light blue hover
                        },
                        width: '100%' // Ensure button takes full width
                      }}
                    >
                      {toolConfig.label}
                    </NavButton>
                  </ClickableLink>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </NavSection>
    );
  };
  
  // Main navigation structure
  const categorizedTools = toolsByCategory();
  const sortedCategories = Object.keys(categorizedTools)
    .sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      return aIndex - bIndex;
    });
  
  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {/* Organization Type Label */}
      {showOrgLabel && (
        <Box sx={{ px: 2, py: 1, mb: 2 }}>
          <Chip
            avatar={
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText 
                }}
              >
                {getOrganizationName().charAt(0)}
              </Avatar>
            }
            label={getOrganizationName()}
            variant="outlined"
            sx={{ width: '100%', justifyContent: 'flex-start' }}
          />
        </Box>
      )}
      
      {/* Dashboard Button - Always first */}
      <NavSection>
        <ClickableLink href="/dashboard">
          <NavButton
            startIcon={<DashboardIcon />}
            fullWidth
            color="inherit"
            onClick={handleNavClick}
            sx={{ mb: 2, width: '100%' }}
          >
            Dashboard
          </NavButton>
        </ClickableLink>
      </NavSection>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Tools by Category */}
      {sortedCategories.map(category => 
        renderCategorySection(category, categorizedTools[category])
      )}
    </Box>
  );
}

import React from 'react';
import { Box, Typography, Avatar, useTheme } from '@mui/material';

interface LogoPlaceholderProps {
  organization: 'region5' | 'wl4wj';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function LogoPlaceholder({
  organization,
  size = 'medium',
  showText = true
}: LogoPlaceholderProps) {
  const theme = useTheme();

  const sizeMap = {
    small: { avatar: 40, fontSize: '1rem' },
    medium: { avatar: 60, fontSize: '1.25rem' },
    large: { avatar: 80, fontSize: '2rem' }
  };

  const orgConfig = {
    region5: {
      initials: 'R5',
      fullName: 'Region 5',
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light
    },
    wl4wj: {
      initials: 'WL4WJ',
      fullName: 'Women Leading for Wellness & Justice',
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light
    }
  };

  const config = orgConfig[organization];
  const dimensions = sizeMap[size];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        sx={{
          width: dimensions.avatar,
          height: dimensions.avatar,
          bgcolor: config.bgColor,
          color: config.color,
          fontSize: dimensions.fontSize,
          fontWeight: 'bold',
          border: `2px solid ${config.color}`
        }}
      >
        {config.initials}
      </Avatar>
      {showText && (
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: config.color,
              lineHeight: 1.2
            }}
          >
            {config.fullName}
          </Typography>
          {organization === 'region5' && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: 'block'
              }}
            >
              North Carolina Community Health Worker Program
            </Typography>
          )}
          {organization === 'wl4wj' && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: 'block'
              }}
            >
              Empowering Communities Through Health Equity
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// Specific components for easier importing
export function Region5Logo({ size = 'medium', showText = true }: Omit<LogoPlaceholderProps, 'organization'>) {
  return <LogoPlaceholder organization="region5" size={size} showText={showText} />;
}

export function WL4WJLogo({ size = 'medium', showText = true }: Omit<LogoPlaceholderProps, 'organization'>) {
  return <LogoPlaceholder organization="wl4wj" size={size} showText={showText} />;
}

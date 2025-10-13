'use client';

import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Twitter as TwitterIcon, Facebook as FacebookIcon, LinkedIn as LinkedInIcon } from '@mui/icons-material';
import { socialSharing } from '@/resources';

export const ShareSection = ({ title, url }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      url: `${socialSharing.twitter.url}?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <TwitterIcon />,
      color: '#1DA1F2'
    },
    {
      name: 'Facebook',
      url: `${socialSharing.facebook.url}?u=${encodedUrl}`,
      icon: <FacebookIcon />,
      color: '#4267B2'
    },
    {
      name: 'LinkedIn',
      url: `${socialSharing.linkedin.url}?url=${encodedUrl}`,
      icon: <LinkedInIcon />,
      color: '#0077B5'
    }
  ];

  return (
    <Box sx={{ my: 4, py: 3, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="500">
        Share this article
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {shareLinks.map((link) => (
          <Button
            key={link.name}
            variant="outlined"
            startIcon={link.icon}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: link.color,
                color: link.color,
                bgcolor: 'transparent'
              }
            }}
          >
            {link.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default ShareSection;

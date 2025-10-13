'use client';

import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import Link from 'next/link';

// Stub ProjectCard component for build compatibility
export const ProjectCard = ({ 
  title, 
  description, 
  image = '/images/placeholder-project.jpg',
  slug,
  tags = []
}) => {
  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)'
      }
    }}>
      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
          {title}
        </Typography>
        
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.map((tag) => (
              <Box 
                key={tag}
                sx={{ 
                  px: 1.5, 
                  py: 0.5, 
                  bgcolor: 'rgba(0, 0, 0, 0.05)', 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Button 
            component={Link}
            href={`/work/${slug}`}
            endIcon={<ArrowForward />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            View Project
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;

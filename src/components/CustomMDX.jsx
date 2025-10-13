'use client';

import React from 'react';
import { Box, Typography, Link, Divider, Paper } from '@mui/material';

// Stub CustomMDX component for build compatibility
export const CustomMDX = ({ content }) => {
  return (
    <Box className="mdx-content" sx={{ 
      '& h1': { 
        fontSize: '2.5rem',
        fontWeight: 700,
        mt: 4,
        mb: 2
      },
      '& h2': { 
        fontSize: '2rem',
        fontWeight: 600,
        mt: 4,
        mb: 2
      },
      '& h3': { 
        fontSize: '1.5rem',
        fontWeight: 600,
        mt: 3,
        mb: 2
      },
      '& p': { 
        my: 2,
        lineHeight: 1.7
      },
      '& a': {
        color: 'primary.main',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline'
        }
      },
      '& ul, & ol': {
        pl: 4,
        my: 2
      },
      '& li': {
        mb: 1
      },
      '& blockquote': {
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        pl: 2,
        py: 1,
        my: 3,
        fontStyle: 'italic',
        bgcolor: 'background.paper'
      },
      '& code': {
        fontFamily: 'monospace',
        bgcolor: 'background.paper',
        p: 0.5,
        borderRadius: 1
      },
      '& pre': {
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 1,
        overflow: 'auto',
        my: 3
      },
      '& img': {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: 1,
        my: 3
      },
      '& hr': {
        my: 4
      },
      '& table': {
        width: '100%',
        borderCollapse: 'collapse',
        my: 3
      },
      '& th, & td': {
        border: '1px solid',
        borderColor: 'divider',
        p: 1
      }
    }}>
      {/* Render content as HTML - in a real MDX component this would use MDX processing */}
      <div dangerouslySetInnerHTML={{ __html: content || '<p>No content provided</p>' }} />
    </Box>
  );
};

export default CustomMDX;

'use client';

import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

// Stub Posts component for build compatibility
export const Posts = ({ 
  range = [1, 3], 
  columns = "1", 
  thumbnail = false, 
  direction = "row" 
}) => {
  // Generate dummy posts based on range
  const start = Array.isArray(range) ? range[0] : range;
  const end = Array.isArray(range) ? range[1] || start : start;
  const count = end - start + 1;
  
  const posts = Array.from({ length: count }, (_, i) => ({
    id: start + i,
    title: `Sample Blog Post ${start + i}`,
    excerpt: 'This is a sample blog post excerpt. It contains a brief summary of the post content.',
    date: new Date().toLocaleDateString(),
    image: `https://source.unsplash.com/random/300x200?sig=${start + i}`
  }));

  return (
    <Grid container spacing={3}>
      {posts.map(post => (
        <Grid item xs={12} md={columns === "2" ? 6 : 12} key={post.id}>
          <Card sx={{ 
            display: 'flex', 
            flexDirection: direction === 'column' ? 'column' : { xs: 'column', sm: 'row' },
            height: '100%'
          }}>
            {thumbnail && (
              <CardMedia
                component="img"
                sx={{ 
                  width: direction === 'column' ? '100%' : { xs: '100%', sm: 200 },
                  height: direction === 'column' ? 200 : { xs: 200, sm: '100%' }
                }}
                image={post.image}
                alt={post.title}
              />
            )}
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {post.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {post.date}
              </Typography>
              <Typography variant="body1">
                {post.excerpt}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Posts;

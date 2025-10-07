'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';

export default function AdminAnalytics() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        System Analytics
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1">
            System analytics and monitoring dashboard would go here - performance metrics, usage statistics, error logs, etc.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

'use client';

import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import GrantAnalyzer from '@/components/Grants/GrantAnalyzer';

export default function AdminGrants() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Grant Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Analyze and manage grants from this section.
        </Typography>
        <GrantAnalyzer />
      </CardContent>
    </Card>
  );
}

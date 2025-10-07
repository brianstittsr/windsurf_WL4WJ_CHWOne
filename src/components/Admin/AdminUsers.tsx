'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';

export default function AdminUsers() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        User Management
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1">
            User management interface would go here - user roles, permissions, account management, etc.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

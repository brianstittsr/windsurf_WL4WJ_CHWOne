'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';

export default function AdminSecurity() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Security Settings
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1">
            Security configuration interface would go here - password policies, two-factor authentication, access controls, audit logs, etc.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

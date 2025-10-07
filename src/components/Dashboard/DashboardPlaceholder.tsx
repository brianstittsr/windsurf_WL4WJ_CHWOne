"use client";

import React from "react";
import { Container, Grid, Card, CardContent, CircularProgress, Typography, Box } from "@mui/material";

export default function DashboardPlaceholder() {
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>CHW Platform Dashboard</Typography>
        <Typography color="text.secondary">This dashboard is being migrated to Material UI.</Typography>
      </Box>
      <Grid container spacing={3}>
        {["Active CHWs", "Active Projects", "Active Grants", "Pending Referrals"].map((title) => (
          <Grid item xs={12} sm={6} md={3} key={title}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <CircularProgress size={24} sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 0 }}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">Loading…</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

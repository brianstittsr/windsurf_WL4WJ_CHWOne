'use client';

import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardHeader } from '@mui/material';

const tools = [
  {
    category: 'Text Conversion Tools',
    items: [
      'MP3 Audio Files',
      'Audio extraction from Video files',
      'MP4 / MP4a Video Files',
      'Handwriting to text',
    ],
  },
  {
    category: 'QR Code Tools',
    items: ['QR Code links to forms'],
  },
  {
    category: 'Grant Data Tools',
    items: [
      'Grant Data Requirements Analysis',
      'Form Development',
      'Data Collection',
      'Automated, scheduled Reporting and report delivery',
    ],
  },
  {
    category: 'AI Tools',
    items: ['Project Management', 'Asset Tracking'],
  },
];

export default function CHWToolsPage() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        CHW Tools
      </Typography>
      <Grid container spacing={4}>
        {tools.map((toolCategory) => (
          <Grid item xs={12} md={6} key={toolCategory.category}>
            <Card>
              <CardHeader title={toolCategory.category} />
              <CardContent>
                <ul>
                  {toolCategory.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

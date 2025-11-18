'use client';

import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button, List, ListItem, ListItemIcon, ListItemText, Paper, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TargetIcon from '@mui/icons-material/GpsFixed';
import BookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Image from 'next/image';
import MainLayout from '@/components/Layout/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ForCHWsPage() {
  return (
    <AuthProvider>
      <MainLayout>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            CHWOne for Community Health Workers
          </Typography>
          <Typography variant="h5" paragraph>
            Tools and resources designed specifically for CHWs in the field
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '800px' }}>
            As a Community Health Worker, you're the trusted bridge between healthcare systems and the communities you serve. 
            You navigate complex challenges daily—from managing multiple clients to finding resources, tracking referrals, 
            and documenting outcomes—often with limited tools and support.
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
            CHWOne changes that.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Why CHWs Choose CHWOne
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <TargetIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Streamline Your Daily Workflow
              </Typography>
              <Typography paragraph>
                No more juggling paper forms, spreadsheets, and disconnected systems. CHWOne gives you one secure platform to:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Manage client information with HIPAA-compliant digital records accessible from any device" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Track referrals in real-time knowing exactly when your client connects with services" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Document outcomes easily with mobile-friendly forms that work offline and sync when connected" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Access resources instantly from a comprehensive library of health education materials in multiple languages" />
                </ListItem>
              </List>
              <Paper sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "Before CHWOne, I spent 3 hours a day on paperwork. Now it's 30 minutes, giving me 2.5 more hours with families who need me."
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  - Maria S., CHW in Texas
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <BookIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Advance Your Professional Development
              </Typography>
              <Typography paragraph>
                Your lived experience is invaluable. Add professional credentials to amplify your impact:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Access free training modules aligned with C3 Project competencies" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Track continuing education with automated certificate management" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Prepare for certification with study guides and practice assessments for all 23 state programs" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Build your professional portfolio documenting your skills and achievements" />
                </ListItem>
              </List>
              <Paper sx={{ bgcolor: 'secondary.light', p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  With CHWs earning a median of $48,200 annually and 13% job growth projected through 2033, investing in your professional development pays off.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <PeopleIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Connect with Your CHW Community
              </Typography>
              <Typography paragraph>
                You're not alone. Join thousands of CHWs nationwide who share your passion:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Peer support forums for advice on challenging cases (anonymized for privacy)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Regional networking connecting with CHWs in your area for in-person meetups" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Mentorship matching pairing experienced CHWs with those new to the field" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Success story sharing celebrating wins and learning from challenges" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <FitnessCenterIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Demonstrate Your Value
              </Typography>
              <Typography paragraph>
                Your work delivers $2.47 to $15 return on investment—now prove it:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Automated impact reports showing your contributions to health outcomes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Client success tracking documenting diabetes control, medication adherence, and prevented hospitalizations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Professional dashboards you can share with supervisors during reviews" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Advocacy tools with data to support fair compensation and career advancement" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Real CHWs. Real Results.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Jennifer, Rural Health CHW</Typography>
                  <Typography variant="body1">
                    "I serve 5 counties covering 1,200 square miles. CHWOne's mobile app lets me document visits immediately, even without internet. When I helped reduce our diabetes emergency visits by 45%, I had the data to prove it."
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Marcus, Urban Mental Health CHW</Typography>
                  <Typography variant="body1">
                    "Managing 60+ clients with complex needs was overwhelming. CHWOne's smart reminders ensure no one falls through the cracks. My supervisor noticed my improved outcomes—I just got promoted to Lead CHW."
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Rosa, Promotora de Salud</Typography>
                  <Typography variant="body1">
                    "The bilingual interface and culturally relevant resources help me serve Spanish-speaking families better. I can now show how our program prevented 30 hospitalizations last year, securing continued funding."
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Features Designed for Your Reality
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Works on any device - smartphone, tablet, or computer</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Offline capability - no internet? No problem</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Multiple language support - serve diverse communities effectively</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Voice-to-text notes - document faster in the field</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Smart scheduling - optimize your routes and time</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Resource matching - instantly find services your clients need</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Secure messaging - coordinate with your care team safely</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              background: 'linear-gradient(to right, #0088cc, #005999)'
            }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ color: 'white' }}>
              Join 10,000+ CHWs Already Using CHWOne
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
              Start Free Today
            </Typography>
            
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>No credit card required</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>Full access for 30 days</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>Setup in under 5 minutes</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>Free training included</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="secondary" size="large">
                Start Your Free Trial
              </Button>
              <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }} size="large">
                Watch 2-Minute Demo
              </Button>
              <Button variant="text" sx={{ color: 'white' }} size="large">
                Join Live Tour Tuesday 2pm ET
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </MainLayout>
    </AuthProvider>
  );
}

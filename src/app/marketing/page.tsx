'use client';

import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button, Paper, Divider, Avatar, CardMedia } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Image from 'next/image';
import Link from 'next/link';
import MarketingHeader from '@/components/Marketing/MarketingHeader';

export default function MarketingHomePage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MarketingHeader />
      
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern/effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url("/images/pattern-bg.png")',
            zIndex: 0,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 'bold' }}>
                Where Community Health Comes Together
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium' }}>
                Transform Your Impact. Amplify Your Voice. Build Your Career.
              </Typography>
              <Typography variant="subtitle1" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
                Your Work Saves Lives. We Make Your Work Easier.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  component={Link}
                  href="/trial"
                  sx={{ py: 1.5, px: 4 }}
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={Link}
                  href="/demo"
                  sx={{ py: 1.5, px: 4, color: 'white', borderColor: 'white' }}
                >
                  Request Demo
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: '100%', sm: '80%', md: '100%' },
                  height: { xs: '300px', md: '400px' },
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
              >
                <Image
                  src="/images/CHWOneLogoDesign.png"
                  alt="CHWOne Platform Interface"
                  layout="fill"
                  objectFit="cover"
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* User Types Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Who We Serve
        </Typography>
        
        <Grid container spacing={4}>
          {/* CHW Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Community Health Workers
                </Typography>
                <Typography variant="body1" paragraph>
                  Transform Your Impact. Amplify Your Voice. Build Your Career.
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Streamlined workflows</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Professional development</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Demonstrate your value</Typography>
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={Link}
                  href="/for-chws"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                >
                  Learn More
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Associations Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  CHW Associations
                </Typography>
                <Typography variant="body1" paragraph>
                  Empower Your Workforce. Amplify Your Advocacy. Accelerate Your Impact.
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Member management</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Training coordination</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Data-driven advocacy</Typography>
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={Link}
                  href="/for-associations"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                >
                  Learn More
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Nonprofits Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Nonprofit Organizations
                </Typography>
                <Typography variant="body1" paragraph>
                  Maximize Your Impact. Simplify Your Operations. Prove Your Value.
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Grant management</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">CHW deployment</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Impact measurement</Typography>
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={Link}
                  href="/for-nonprofits"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                >
                  Learn More
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* State Agencies Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  State Agencies
                </Typography>
                <Typography variant="body1" paragraph>
                  Optimize Oversight. Ensure Equity. Demonstrate Excellence.
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Program oversight</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Resource allocation</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Medicaid optimization</Typography>
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={Link}
                  href="/for-agencies"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                >
                  Learn More
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features Highlight */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
            Platform Highlights
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Grant Management
                </Typography>
                <Typography>
                  AI-powered grant discovery and end-to-end application management
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Project Tracking
                </Typography>
                <Typography>
                  Collaborative workspaces for multi-organization initiatives
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Referral System
                </Typography>
                <Typography>
                  Client referral tracking between organizations with status updates
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Success Stories
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                  "Before CHWOne, I spent 3 hours a day on paperwork. Now it's 30 minutes, giving me 2.5 more hours with families who need me."
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Maria S.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CHW in Texas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                  "CHWOne helped us demonstrate that our 400 members prevented 1,200 ER visits last year, saving Medicaid $3.2 million. This data secured state funding for our association."
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  James W.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Executive Director, State CHW Association
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                  "We showed our board that our 12 CHWs prevented 340 ER visits and 89 readmissions, saving $1.8 million. Our program went from 'nice to have' to 'essential.'"
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Sarah J.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Program Director, Community Health Nonprofit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Stats */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>10,000+</Typography>
                <Typography variant="h6">Community Health Workers</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>50+</Typography>
                <Typography variant="h6">CHW Associations</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>200+</Typography>
                <Typography variant="h6">Nonprofit Organizations</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>15</Typography>
                <Typography variant="h6">State Agencies</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Call To Action */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 6, borderRadius: 2 }}>
          <Typography variant="h3" gutterBottom>
            Ready to Transform Community Health?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Whether you're a CHW on the frontlines, an association supporting the workforce, a nonprofit delivering programs, or a state agency ensuring public health, CHWOne provides the tools you need to succeed.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={Link}
              href="/trial"
              sx={{ py: 1.5, px: 4 }}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large" 
              component={Link}
              href="/demo"
              sx={{ py: 1.5, px: 4 }}
            >
              Request Demo
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                CHWOne
              </Typography>
              <Typography variant="body2">
                Where Community Health Comes Together
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom>Contact</Typography>
              <Typography variant="body2" component={Link} href="mailto:hello@chwone.org" sx={{ color: 'white', display: 'block', mb: 1 }}>
                hello@chwone.org
              </Typography>
              <Typography variant="body2" component={Link} href="tel:18002496631" sx={{ color: 'white', display: 'block' }}>
                1-800-CHW-ONE1
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom>Follow Us</Typography>
              <Typography variant="body2" component={Link} href="https://linkedin.com/company/chwone" sx={{ color: 'white', display: 'block', mb: 1 }}>
                LinkedIn
              </Typography>
              <Typography variant="body2" component={Link} href="https://twitter.com/CHWOnePlatform" sx={{ color: 'white', display: 'block' }}>
                Twitter
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Newsletter</Typography>
              <Typography variant="body2" component={Link} href="https://chwone.org/subscribe" sx={{ color: 'white' }}>
                Subscribe to our newsletter
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} CHWOne Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

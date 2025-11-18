'use client';

import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button, List, ListItem, ListItemIcon, ListItemText, Paper, Divider, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SchoolIcon from '@mui/icons-material/School';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MainLayout from '@/components/Layout/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ForAssociationsPage() {
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
            CHWOne for CHW Associations
          </Typography>
          <Typography variant="h4" gutterBottom>
            Empower Your Workforce. Amplify Your Advocacy. Accelerate Your Impact.
          </Typography>
          <Typography variant="h5" sx={{ mb: 3 }}>
            The Platform Built By CHW Associations, For CHW Associations
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '800px' }}>
            Leading a CHW Association means juggling member services, training coordination, policy advocacy, 
            and organizational sustainability—often with limited staff and resources. You need tools that 
            multiply your capacity while maintaining the community-centered approach that defines your mission.
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
            CHWOne delivers enterprise-level capabilities with grassroots values.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Transform How You Serve Your Members
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <PeopleAltIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Comprehensive Member Management
              </Typography>
              <Typography paragraph>
                Move beyond spreadsheets to a dynamic system that grows with your association:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Automated membership workflows from application through renewal" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Tiered membership tracking (Individual, Organizational, Student, Lifetime) with customized benefits" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Integrated payment processing for dues, training, and events" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Member portal where CHWs update profiles, access resources, and connect with peers" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Certification tracking monitoring expiration dates and CE credits across your entire membership" />
                </ListItem>
              </List>
              <Paper sx={{ bgcolor: 'secondary.light', p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Your members represent 58,550 CHWs nationally growing at 13% annually—manage this growth seamlessly.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Streamlined Training Delivery
              </Typography>
              <Typography paragraph>
                Become the premier training destination for your state's CHWs:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Learning Management System delivering synchronous and asynchronous training" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Automated CEU tracking integrated with state certification requirements" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Multi-modal delivery supporting in-person, virtual, and hybrid formats" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Competency assessments aligned with C3 Project standards" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Training provider network connecting approved programs with learners" />
                </ListItem>
              </List>
              <Paper sx={{ bgcolor: 'secondary.light', p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Impact: States with organized CHW associations see 2.5x higher certification rates and 40% better workforce retention.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <CampaignIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Data-Driven Advocacy
              </Typography>
              <Typography paragraph>
                Transform anecdotes into evidence that moves policy:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Workforce analytics dashboard showing CHW distribution, demographics, and impact" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Automated report generation for legislators and funders" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="ROI calculators demonstrating the $2.47-$15 return per dollar invested in CHWs" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Success story repository with consent management and easy sharing" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Policy tracking monitoring CHW-related legislation across jurisdictions" />
                </ListItem>
              </List>
              <Paper sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "CHWOne helped us demonstrate that our 400 members prevented 1,200 ER visits last year, saving Medicaid $3.2 million. This data secured state funding for our association."
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  - Executive Director, State CHW Association
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h3" component="h2" gutterBottom sx={{ mt: 8 }}>
          Scale Your Operations Without Scaling Your Budget
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={1}>
              <AccountBalanceIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="h4" gutterBottom>
                Diversified Revenue Management
              </Typography>
              <Typography paragraph>
                Build financial sustainability through multiple income streams:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Grant management suite tracking multiple funders and reporting requirements" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Event registration system for conferences, trainings, and networking events" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Sponsorship tracking managing corporate and foundation partnerships" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Merchandise and resource sales through integrated e-commerce" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Financial dashboards showing revenue trends and projecting cash flow" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Success Stories from Leading Associations
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Massachusetts Association of CHWs (MACHW)</Typography>
                  <Typography variant="body1">
                    "Since implementing CHWOne, we've increased membership 40%, reduced administrative time by 60%, 
                    and successfully advocated for Medicaid reimbursement using platform-generated data showing $4.2 million in cost savings."
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>North Carolina Community Health Workers Association</Typography>
                  <Typography variant="body1">
                    "CHWOne enabled us to coordinate training across 12 community colleges, track certification for 1,800 CHWs, 
                    and demonstrate outcomes that secured $2.5 million in state funding."
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Texas Association of Promotores and CHWs</Typography>
                  <Typography variant="body1">
                    "The bilingual platform helps us serve 3,500 members statewide. We've streamlined certification renewal, 
                    delivered 50,000 CEU hours, and connected CHWs with 300+ job opportunities."
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            ROI for Your Association
          </Typography>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="ROI table">
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="h6">Investment</Typography></TableCell>
                  <TableCell><Typography variant="h6">Return</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Staff time on admin</TableCell>
                  <TableCell>60% reduction freeing capacity for mission-critical work</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Member retention</TableCell>
                  <TableCell>35% increase through better engagement and services</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Training delivery costs</TableCell>
                  <TableCell>40% lower per participant through efficiency</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Grant success rate</TableCell>
                  <TableCell>2.3x higher with data-driven applications</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Advocacy impact</TableCell>
                  <TableCell>Measurable policy wins backed by comprehensive data</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
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
              Join 50+ CHW Associations Already Thriving with CHWOne
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
              Schedule Your Personalized Demo
            </Typography>
            
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>45-minute tailored walkthrough</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>ROI analysis for your association</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>Implementation roadmap</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography>Nonprofit pricing available</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="secondary" size="large">
                Schedule Demo
              </Button>
              <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }} size="large">
                Download Association Guide
              </Button>
              <Button variant="text" sx={{ color: 'white' }} size="large">
                Connect with Current Users
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </MainLayout>
    </AuthProvider>
  );
}

'use client';

import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button, List, ListItem, ListItemIcon, ListItemText, Paper, Divider, Tabs, Tab } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Image from 'next/image';
import Link from 'next/link';
import MarketingHeader from '@/components/Marketing/MarketingHeader';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function GrantManagementPage() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MarketingHeader />
      
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
            Grant Management System
          </Typography>
          <Typography variant="h5" paragraph>
            Streamline the entire grant lifecycle from discovery to reporting
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom>
                Transform Your Grant Process
              </Typography>
              <Typography paragraph>
                Our comprehensive grant management system simplifies every stage of the grant lifecycle, 
                helping you find, apply for, manage, and report on grants with greater efficiency and success.
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><SearchIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Discover Opportunities" 
                    secondary="AI-powered matching identifies grants aligned with your mission and capabilities" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Streamline Applications" 
                    secondary="Collaborative workspaces and templates accelerate the application process" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ScheduleIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Manage Deadlines" 
                    secondary="Automated reminders and task tracking ensure nothing falls through the cracks" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AnalyticsIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Demonstrate Impact" 
                    secondary="Powerful reporting tools showcase your outcomes to funders" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TrendingUpIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Increase Success Rates" 
                    secondary="Organizations using CHWOne report 45% higher grant success rates" 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: '400px', borderRadius: '8px', overflow: 'hidden', boxShadow: 3 }}>
                <Image 
                  src="/images/CHWOneLogoDesign.png" 
                  alt="Grant Management Dashboard" 
                  layout="fill"
                  objectFit="cover"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 8 }} />

        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            Benefits For Your Role
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
              <Tab label="For CHWs" />
              <Tab label="For Associations" />
              <Tab label="For Nonprofits" />
              <Tab label="For State Agencies" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>How CHWs Benefit</Typography>
                <Typography paragraph>
                  Access resources funded by grants and document outcomes that strengthen future applications.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Track client success stories relevant to grant requirements" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Document outcomes that strengthen future applications" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Access resources made available through grant funding" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>How Associations Benefit</Typography>
                <Typography paragraph>
                  Build financial sustainability through diversified revenue management.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Grant management suite tracking multiple funders and reporting requirements" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Data-driven applications showing CHW impact" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Automated compliance tracking with alerts for reporting deadlines" />
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
              </CardContent>
            </Card>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>How Nonprofits Benefit</Typography>
                <Typography paragraph>
                  Master grant management from application to impact.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="AI-powered grant matching identifying opportunities aligned with your programs" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Collaborative application workspace where team members contribute sections simultaneously" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Automated compliance tracking with alerts for reporting deadlines and requirements" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Impact storytelling tools transforming data into compelling narratives for renewals" />
                  </ListItem>
                </List>
                <Paper sx={{ bgcolor: 'secondary.light', p: 3, borderRadius: 2, mt: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Nonprofits using CHWOne report 45% higher grant success rates and 30% less time on reporting.
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>How State Agencies Benefit</Typography>
                <Typography paragraph>
                  Optimize federal funding opportunities while ensuring compliance.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Automated federal report generation for HRSA, CDC, and CMS requirements" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Grant opportunity matching for state-level funding" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Audit-ready documentation and compliance tracking" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Multi-grant coordination across departments and regions" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>

        <Divider sx={{ my: 8 }} />

        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            Success Story
          </Typography>
          
          <Card>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image 
                      src="/images/CHWOneLogoDesign.png" 
                      alt="Urban Health Initiative Logo" 
                      width={200}
                      height={200}
                      style={{ borderRadius: '50%' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>Urban Health Initiative (500+ clients annually)</Typography>
                  <Typography paragraph>
                    "CHWOne helped us coordinate 8 CHWs across 3 funding streams. We reduced diabetes-related 
                    ER visits by 62% and secured a $2.3 million federal grant using platform-generated evidence."
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Key Outcomes:</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: 'success.dark', fontWeight: 'bold' }}>62%</Typography>
                          <Typography variant="body2">Reduction in ER visits</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ bgcolor: 'info.light', p: 2, borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: 'info.dark', fontWeight: 'bold' }}>$2.3M</Typography>
                          <Typography variant="body2">Federal grant secured</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: 'warning.dark', fontWeight: 'bold' }}>40%</Typography>
                          <Typography variant="body2">Less admin time</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
              See Grant Management in Action
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="secondary" size="large" component={Link} href="/demo">
                Request a Demo
              </Button>
              <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }} size="large" component={Link} href="/trial">
                Start Free Trial
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Footer (simplified) */}
      <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            &copy; {new Date().getFullYear()} CHWOne Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

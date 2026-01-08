'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Container, Dialog, DialogContent, IconButton, Tabs, Tab } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, Close as CloseIcon, Person, Business, Groups } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/LogoGlow.module.css';
import { CHWWizardShadcn } from '@/components/CHW/CHWWizardShadcn';
import { NonprofitWizard } from '@/components/Nonprofit/NonprofitWizard';
import { CHWAssociationWizard } from '@/components/CHWAssociation/CHWAssociationWizard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ height: '100%' }}>
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

function HomeContentInner() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [showCHWWizard, setShowCHWWizard] = useState(false);
  const [showNonprofitWizard, setShowNonprofitWizard] = useState(false);
  const [showAssociationWizard, setShowAssociationWizard] = useState(false);

  const handleCHWWizardComplete = (chwId: string) => {
    console.log('New CHW registered:', chwId);
    setShowCHWWizard(false);
  };

  const handleNonprofitWizardComplete = (nonprofitId: string) => {
    console.log('New nonprofit registered:', nonprofitId);
    setShowNonprofitWizard(false);
  };

  const handleAssociationWizardComplete = (associationId: string) => {
    console.log('New CHW Association registered:', associationId);
    setShowAssociationWizard(false);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a365d 0%, #2a4365 50%, #2c5282 100%)',
    }}>
      {/* Compact Header */}
      <Box component="header" sx={{ 
        py: 1.5, 
        px: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        flexShrink: 0,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className={styles.logoContainer} style={{ transform: 'scale(0.5)' }}>
                <div className={styles.glowEffect} style={{ opacity: 0.5 }}></div>
                <div className={styles.glowRing} style={{ opacity: 0.7 }}></div>
                <Image 
                  src="/images/CHWOneLogoDesign.png" 
                  alt="CHWOne Logo" 
                  width={60} 
                  height={60} 
                  className={styles.logoImage}
                  style={{ borderRadius: '50%' }}
                />
              </div>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a365d' }}>
                CHWOne Platform
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentUser ? (
                <Button variant="contained" size="small" component={Link} href="/dashboard">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outlined" size="small" component={Link} href="/register">
                    Register
                  </Button>
                  <Button variant="contained" size="small" component={Link} href="/login">
                    Login
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Container maxWidth="xl" sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
          py: 3,
          height: '100%',
        }}>
          {/* Left Side - Logo and Intro */}
          <Box sx={{ 
            flex: { xs: 'none', lg: '0 0 35%' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            p: 2,
          }}>
            <div className={styles.logoContainer} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.glowEffect}></div>
              <div className={styles.glowRing}></div>
              <div className={styles.glowRing} style={{ 
                top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 0 20px 5px rgba(100, 181, 246, 0.6)',
                animation: 'rotate 7s linear infinite reverse'
              }}></div>
              <div className={`${styles.sparkle} ${styles.sparkle1}`}></div>
              <div className={`${styles.sparkle} ${styles.sparkle2}`}></div>
              <div className={`${styles.sparkle} ${styles.sparkle3}`}></div>
              <div className={`${styles.sparkle} ${styles.sparkle4}`}></div>
              <Image 
                src="/images/CHWOneLogoDesign.png" 
                alt="CHWOne Logo" 
                width={200} 
                height={200} 
                className={styles.logoImage}
                style={{ 
                  borderRadius: '50%', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  border: '4px solid rgba(255,255,255,0.2)'
                }}
                priority
              />
            </div>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Streamline CHW Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 400 }}>
              The platform for Community Health Workers, Nonprofits, and Associations to connect and collaborate.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href={currentUser ? "/dashboard" : "/login"}
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 3,
                py: 1.5,
                px: 4,
                backgroundColor: 'white',
                color: '#1a365d',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#f8f9fa' }
              }}
            >
              {currentUser ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </Box>

          {/* Right Side - Tabbed Content */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Tabs */}
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{
                bgcolor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                },
                '& .Mui-selected': {
                  color: '#1a365d !important',
                }
              }}
            >
              <Tab icon={<Person />} iconPosition="start" label="For CHWs" />
              <Tab icon={<Business />} iconPosition="start" label="For Nonprofits" />
              <Tab icon={<Groups />} iconPosition="start" label="For Associations" />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              {/* CHW Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a365d', mb: 1 }}>
                    Are You a Community Health Worker?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Join our network and unlock powerful tools to enhance your community impact.
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2,
                    flex: 1,
                    mb: 3,
                  }}>
                    {[
                      { icon: '📋', title: 'Professional Profile', desc: 'Showcase your expertise and certifications' },
                      { icon: '🤝', title: 'Networking', desc: 'Connect with other CHWs across NC' },
                      { icon: '📊', title: 'Data Tools', desc: 'Access analytics and reporting' },
                      { icon: '🎓', title: 'Training', desc: 'Continuing education resources' },
                      { icon: '💼', title: 'Job Opportunities', desc: 'Get discovered by organizations' },
                      { icon: '🏆', title: 'Certification', desc: 'Track and showcase credentials' },
                    ].map((item, i) => (
                      <Box key={i} sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                      }}>
                        <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0369a1' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{item.desc}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => setShowCHWWizard(true)}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        flex: 1,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)',
                      }}
                    >
                      Register as a CHW
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      component={Link}
                      href="/chws/mock-profiles"
                      sx={{ flex: 1, py: 1.5 }}
                    >
                      View CHW Directory
                    </Button>
                  </Box>
                </Box>
              </TabPanel>

              {/* Nonprofit Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a365d', mb: 1 }}>
                    Are You a Nonprofit Organization?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Register to connect with CHWs, share resources, and expand your community impact.
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2,
                    flex: 1,
                    mb: 3,
                  }}>
                    {[
                      { icon: '🔗', title: 'Resource Sharing', desc: 'List services for CHW referrals' },
                      { icon: '🤝', title: 'CHW Partnerships', desc: 'Connect with qualified CHWs' },
                      { icon: '📊', title: 'Referral Management', desc: 'Streamlined referral system' },
                      { icon: '📈', title: 'Impact Tracking', desc: 'Measure community outcomes' },
                      { icon: '🌐', title: 'Visibility', desc: 'Increase service awareness' },
                      { icon: '💡', title: 'Collaboration', desc: 'Partner with other orgs' },
                    ].map((item, i) => (
                      <Box key={i} sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: '#f0fdfa',
                        border: '1px solid #99f6e4',
                      }}>
                        <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0d9488' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{item.desc}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => setShowNonprofitWizard(true)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      py: 1.5,
                      mt: 'auto',
                      background: 'linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)',
                    }}
                  >
                    Register Your Organization
                  </Button>
                </Box>
              </TabPanel>

              {/* Association Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a365d', mb: 1 }}>
                    Start a CHW Association in Your State
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Create a statewide association to organize resources, coordinate training, and advocate for CHWs.
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2,
                    flex: 1,
                    mb: 3,
                  }}>
                    {[
                      { icon: '🏛️', title: 'Statewide Coordination', desc: 'Organize CHW activities' },
                      { icon: '📚', title: 'Resource Management', desc: 'Centralize training materials' },
                      { icon: '🔔', title: 'Alerts & Notifications', desc: 'Send important updates' },
                      { icon: '📊', title: 'Data & Analytics', desc: 'Track workforce metrics' },
                      { icon: '🎓', title: 'Training & Certification', desc: 'Manage programs' },
                      { icon: '🤝', title: 'Network Building', desc: 'Connect organizations' },
                    ].map((item, i) => (
                      <Box key={i} sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                      }}>
                        <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1d4ed8' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{item.desc}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => setShowAssociationWizard(true)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      py: 1.5,
                      mt: 'auto',
                      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    }}
                  >
                    Register Your CHW Association
                  </Button>
                </Box>
              </TabPanel>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Compact Footer */}
      <Box component="footer" sx={{ 
        py: 1, 
        bgcolor: 'rgba(0,0,0,0.3)', 
        color: 'rgba(255,255,255,0.7)', 
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <Typography variant="caption">
          © {new Date().getFullYear()} CHWOne Platform. All rights reserved.
        </Typography>
      </Box>

      {/* Dialogs */}
      <Dialog
        open={showCHWWizard}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          setShowCHWWizard(false);
        }}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px', height: '80vh', maxHeight: '700px', overflow: 'hidden' } }}
      >
        <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', height: '100%' }}>
            <IconButton onClick={() => setShowCHWWizard(false)} sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
            <CHWWizardShadcn onComplete={handleCHWWizardComplete} onClose={() => setShowCHWWizard(false)} />
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNonprofitWizard}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          setShowNonprofitWizard(false);
        }}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px', maxHeight: '90vh', overflow: 'auto' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', pt: 2, pb: 2 }}>
            <IconButton onClick={() => setShowNonprofitWizard(false)} sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, bgcolor: 'rgba(0,0,0,0.05)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <NonprofitWizard onComplete={handleNonprofitWizardComplete} />
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAssociationWizard}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          setShowAssociationWizard(false);
        }}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '12px', maxHeight: '90vh', overflow: 'auto' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', pt: 2, pb: 2 }}>
            <IconButton onClick={() => setShowAssociationWizard(false)} sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, bgcolor: 'rgba(0,0,0,0.05)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <CHWAssociationWizard onComplete={handleAssociationWizardComplete} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContentInner />
    </AuthProvider>
  );
}

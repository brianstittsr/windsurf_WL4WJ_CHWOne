'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Container, Dialog, DialogContent, IconButton } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, Close as CloseIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/LogoGlow.module.css';
import { CHWWizard } from '@/components/CHW/CHWWizard';

function HomeContentInner() {
  const { currentUser } = useAuth();
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = (chwId: string) => {
    console.log('New CHW registered:', chwId);
    setShowWizard(false);
    // Show success message
    alert('Thank you for registering! A welcome email has been sent to your inbox. You can now log in with your credentials.');
  };
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      color: '#333333',
    }}>
      <Box component="header" sx={{ 
        py: 3, 
        px: 2,
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <div className={styles.logoContainer} style={{ transform: 'scale(0.8)' }}>
                {/* Glow effects for header logo */}
                <div className={styles.glowEffect} style={{ opacity: 0.5 }}></div>
                <div className={styles.glowRing} style={{ opacity: 0.7 }}></div>
                <div className={styles.glowRing} style={{ 
                  top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 0 20px 5px rgba(100, 181, 246, 0.6)',
                  animation: 'rotate 7s linear infinite reverse',
                  opacity: 0.5
                }}></div>
                
                <Image 
                  src="/images/CHWOneLogoDesign.png" 
                  alt="CHWOne Logo" 
                  width={88} 
                  height={88} 
                  className={styles.logoImage}
                  style={{ borderRadius: '50%' }}
                />
              </div>
            </Box>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              CHWOne Platform
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentUser ? (
                <Button 
                  variant="contained" 
                  component={Link}
                  href="/dashboard"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    component={Link}
                    href="/register"
                  >
                    Register
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link}
                    href="/login"
                  >
                    Login
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section with Large Logo */}
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a365d 0%, #2a4365 50%, #2c5282 100%)',
      }}>
        <Container maxWidth="xl" sx={{ 
          position: 'relative', 
          zIndex: 2, 
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 8
        }}>
          {/* Left side - Text content */}
          <Box sx={{ 
            maxWidth: 600, 
            color: 'white',
            p: { xs: 3, md: 0 },
            mb: { xs: 6, md: 0 },
            order: { xs: 2, md: 1 }
          }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Streamline CHW Management
            </Typography>
            
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                maxWidth: '600px'
              }}
            >
              The only platform you need to manage Community Health Workers, track activities, and measure impact in real-time.
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href={currentUser ? "/dashboard" : "/login"}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  backgroundColor: 'white',
                  color: '#1a365d',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  }
                }}
              >
                {currentUser ? 'Go to Dashboard' : 'Get Started'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/about"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#e2e8f0',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>

          {/* Right side - Logo with Glow Effect */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            order: { xs: 1, md: 2 },
            mb: { xs: 4, md: 0 }
          }}>
            <div className={styles.logoContainer}>
              {/* Glow effects */}
              <div className={styles.glowEffect}></div>
              <div className={styles.glowRing}></div>
              <div className={styles.glowRing} style={{ 
                top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 0 20px 5px rgba(100, 181, 246, 0.6)',
                animation: 'rotate 7s linear infinite reverse'
              }}></div>
              
              {/* Sparkle elements */}
              <div className={`${styles.sparkle} ${styles.sparkle1}`}></div>
              <div className={`${styles.sparkle} ${styles.sparkle2}`}></div>
              <div className={`${styles.sparkle} ${styles.sparkle3}`}></div>
              <div className={`${styles.sparkle} ${styles.sparkle4}`}></div>
              
              {/* Logo image */}
              <Image 
                src="/images/CHWOneLogoDesign.png" 
                alt="CHWOne Logo" 
                width={459} 
                height={459} 
                className={styles.logoImage}
                style={{ 
                  borderRadius: '50%', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  border: '8px solid rgba(255,255,255,0.2)'
                }}
                priority
              />
            </div>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: '#1a365d' }}>
            Welcome to CHWOne Platform
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: '#64748b', maxWidth: 800, mx: 'auto' }}>
            Empowering Community Health Workers with comprehensive tools for client management, resource coordination, and impact tracking.
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 4,
          mb: 8
        }}>
          {/* Feature 1 */}
          <Box sx={{ 
            p: 4, 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1a365d', fontWeight: 600 }}>
              CHW Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Streamline CHW onboarding, certification tracking, and performance monitoring with our comprehensive management tools.
            </Typography>
          </Box>

          {/* Feature 2 */}
          <Box sx={{ 
            p: 4, 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1a365d', fontWeight: 600 }}>
              Data Collection
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Collect, organize, and analyze data with customizable forms and powerful analytics tools designed for community health initiatives.
            </Typography>
          </Box>

          {/* Feature 3 */}
          <Box sx={{ 
            p: 4, 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1a365d', fontWeight: 600 }}>
              Impact Tracking
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Measure and visualize the impact of your community health programs with real-time dashboards and comprehensive reporting tools.
            </Typography>
          </Box>
        </Box>

        {/* CHW Registration Section */}
        <Box sx={{ 
          my: 12,
          p: 6,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
              Are You a Community Health Worker?
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, textAlign: 'center', opacity: 0.95, maxWidth: 800, mx: 'auto' }}>
              Join our growing network of CHWs and unlock powerful tools to enhance your impact in the community
            </Typography>

            {/* Benefits Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
              mb: 6
            }}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  📋 Professional Profile
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Create a comprehensive profile showcasing your expertise, certifications, and service areas to connect with opportunities
                </Typography>
              </Box>

              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  🤝 Networking & Collaboration
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Connect with other CHWs, share resources, and collaborate on community health initiatives across North Carolina
                </Typography>
              </Box>

              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  📊 Data & Analytics Tools
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Access powerful data collection forms, analytics dashboards, and reporting tools to track your impact
                </Typography>
              </Box>

              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  🎓 Training & Resources
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Access continuing education opportunities, best practices, and a library of resources to enhance your skills
                </Typography>
              </Box>

              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  💼 Job Opportunities
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Get discovered by organizations looking for qualified CHWs and access exclusive job postings
                </Typography>
              </Box>

              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  🏆 Recognition & Certification
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Track your certifications, maintain your credentials, and showcase your professional achievements
                </Typography>
              </Box>
            </Box>

            {/* CTA Buttons */}
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => setShowWizard(true)}
                sx={{ 
                  py: 2, 
                  px: 6,
                  mr: 2,
                  mb: { xs: 2, sm: 0 },
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                  }
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Register as a CHW
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link}
                href="/chws/mock-profiles"
                sx={{ 
                  py: 2, 
                  px: 6,
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                View CHW Directory
              </Button>
            </Box>

            {/* Screenshot Preview */}
            <Box sx={{ 
              mt: 8, 
              p: 4, 
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
                Explore Our CHW Community
              </Typography>
              <Box sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Image 
                  src="/images/chw-profiles-screenshot.png"
                  alt="Community Health Worker Profiles Directory"
                  width={1200}
                  height={675}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                  priority
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', opacity: 0.9 }}>
                Browse profiles of Community Health Workers across North Carolina
              </Typography>
            </Box>
          </Box>

          {/* Decorative elements */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
        </Box>

        {/* CTA Section */}
        <Box sx={{ 
          textAlign: 'center',
          p: 6,
          borderRadius: 2,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <Typography variant="h4" sx={{ mb: 2, color: '#1a365d', fontWeight: 600 }}>
            Ready to transform your CHW program?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#64748b', maxWidth: 700, mx: 'auto' }}>
            Join organizations across North Carolina who are using CHWOne to streamline their community health initiatives.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            component={Link}
            href={currentUser ? "/dashboard" : "/login"}
            sx={{ py: 1.5, px: 4 }}
          >
            {currentUser ? "Go to Dashboard" : "Get Started Today"}
          </Button>
        </Box>
      </Container>

      <Box component="footer" sx={{ p: 4, bgcolor: '#1a365d', color: 'white', textAlign: 'center' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} CHWOne Platform. All rights reserved.
        </Typography>
      </Box>

      {/* CHW Registration Wizard Dialog */}
      <Dialog
        open={showWizard}
        onClose={() => setShowWizard(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            maxHeight: '90vh',
            overflow: 'auto',
            backgroundColor: '#f8fafc'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Box sx={{
            position: 'relative',
            pt: 2,
            px: 2,
            pb: 2,
          }}>
            <IconButton
              onClick={() => setShowWizard(false)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'white',
                boxShadow: 1,
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <CHWWizard onComplete={handleWizardComplete} />
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

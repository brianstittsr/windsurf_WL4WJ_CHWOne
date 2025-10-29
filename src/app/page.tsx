'use client';

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/LogoGlow.module.css';

function HomeContentInner() {
  const { currentUser } = useAuth();
  
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

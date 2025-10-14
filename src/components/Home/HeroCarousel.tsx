'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

interface HeroCarouselProps {
  isLoggedIn: boolean;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Streamline CHW Management",
    description: "The only platform you need to manage Community Health Workers, track activities, and measure impact in real-time.",
    imageUrl: "/images/carousel/community-health-workers.webp",
    imageAlt: "Community health workers in action"
  },
  {
    id: 2,
    title: "Centralize Project Coordination",
    description: "Manage multiple health initiatives, track resources, and coordinate teams all in one secure, HIPAA-compliant platform.",
    imageUrl: "/images/carousel/project-management.webp",
    imageAlt: "Project coordination dashboard"
  },
  {
    id: 3,
    title: "Maximize Grant Opportunities",
    description: "Discover, track, and manage funding opportunities with built-in tools for grant applications and compliance reporting.",
    imageUrl: "/images/carousel/grant-management.webp",
    imageAlt: "Grant management process"
  },
  {
    id: 4,
    title: "Data-Driven Community Impact",
    description: "Transform community health with powerful analytics and visualization tools that demonstrate real outcomes.",
    imageUrl: "/images/carousel/data-analytics.webp",
    imageAlt: "Health data analytics dashboard"
  },
  {
    id: 5,
    title: "Seamless Resource Sharing",
    description: "Connect CHWs with the resources they need through our integrated library and knowledge base system.",
    imageUrl: "/images/carousel/resource-sharing.webp",
    imageAlt: "Resource sharing platform"
  }
];

export default function HeroCarousel({ isLoggedIn }: HeroCarouselProps) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition time
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Carousel Items */}
      {carouselItems.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: activeIndex === index ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            zIndex: activeIndex === index ? 1 : 0,
          }}
        >
          {/* Sepia Background Image */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: theme.palette.primary.dark, // Add background color
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7))',
              zIndex: 1
            }
          }}>
            <Image
              src={item.imageUrl}
              alt={item.imageAlt}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
              loading={index === 0 ? 'eager' : 'lazy'}
              quality={80}
              style={{
                objectFit: 'cover',
                filter: 'sepia(0.4) brightness(0.8)',
                animation: activeIndex === index ? 'zoomIn 6s ease-out forwards' : 'none'
              }}
            />
          </Box>

          {/* Content Overlay */}
          <Container maxWidth="xl" sx={{ 
            position: 'relative', 
            zIndex: 2, 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out',
            animation: activeIndex === index && !isTransitioning ? 'fadeInUp 1s ease-out' : 'none'
          }}>
            <Box sx={{ 
              maxWidth: 800, 
              color: 'white',
              p: { xs: 3, md: 0 }
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
                {item.title}
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  maxWidth: '600px'
                }}
              >
                {item.description}
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
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100],
                    }
                  }}
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
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
                      borderColor: theme.palette.grey[300],
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      ))}

      {/* Carousel Indicators */}
      <Box sx={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 1,
        zIndex: 10
      }}>
        {carouselItems.map((item, index) => (
          <Box
            key={`indicator-${item.id}`}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: activeIndex === index ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'white'
              }
            }}
          />
        ))}
      </Box>
      
      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes zoomIn {
          from {
            transform: scale(1.1);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </Box>
  );
}

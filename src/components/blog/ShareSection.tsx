"use client";

import { Grid, Button, Snackbar, Alert, Box, Typography } from "@mui/material";
import { useState } from "react";
import { socialSharing } from "@/resources";
import { FaTwitter, FaLinkedin, FaFacebook, FaPinterest, FaWhatsapp, FaReddit, FaTelegram, FaEnvelope, FaLink } from 'react-icons/fa';

interface ShareSectionProps {
  title: string;
  url: string;
}

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  label: string;
  generateUrl: (title: string, url: string) => string;
}

const socialPlatforms: Record<string, SocialPlatform> = {
  x: {
    name: "x",
    icon: <FaTwitter />,
    label: "X",
    generateUrl: (title, url) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  linkedin: {
    name: "linkedin",
    icon: <FaLinkedin />,
    label: "LinkedIn",
    generateUrl: (title, url) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  facebook: {
    name: "facebook",
    icon: <FaFacebook />,
    label: "Facebook",
    generateUrl: (title, url) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  pinterest: {
    name: "pinterest",
    icon: <FaPinterest />,
    label: "Pinterest",
    generateUrl: (title, url) => 
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
  whatsapp: {
    name: "whatsapp",
    icon: <FaWhatsapp />,
    label: "WhatsApp",
    generateUrl: (title, url) => 
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  reddit: {
    name: "reddit",
    icon: <FaReddit />,
    label: "Reddit",
    generateUrl: (title, url) => 
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  telegram: {
    name: "telegram",
    icon: <FaTelegram />,
    label: "Telegram",
    generateUrl: (title, url) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  email: {
    name: "email",
    icon: <FaEnvelope />,
    label: "Email",
    generateUrl: (title, url) => 
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this post: ${url}`)}`,
  },
};

export function ShareSection({ title, url }: ShareSectionProps) {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Don't render if sharing is disabled
  if (!socialSharing.display) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setSnackbarMessage("Link copied to clipboard");
      setSnackbarSeverity("success");
      setShowSnackbar(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setSnackbarMessage("Failed to copy link");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
  };

  // Get enabled platforms
  const enabledPlatforms = Object.entries(socialSharing.platforms)
    .filter(([key, enabled]) => enabled && key !== 'copyLink')
    .map(([platformKey]) => ({ key: platformKey, ...socialPlatforms[platformKey] }))
    .filter(platform => platform.name); // Filter out platforms that don't exist in our definitions

  return (
    <Box sx={{ my: 4 }}>
      <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Grid item xs="auto">
          <Typography color="text.secondary">Share this post:</Typography>
        </Grid>
        <Grid item xs="auto">
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {enabledPlatforms.map((platform, index) => (
              <Button 
                key={index} 
                variant="outlined" 
                size="small"
                href={platform.generateUrl(title, url)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <Box component="span">{platform.icon}</Box>
                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>{platform.label}</Box>
              </Button>
            ))}
            
            {socialSharing.platforms.copyLink && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleCopy}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <FaLink />
                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Copy Link</Box>
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

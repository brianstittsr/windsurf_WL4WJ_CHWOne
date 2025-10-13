'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeMode } from '@/components/ThemeProvider';
import Link from 'next/link';
import { 
  Container, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert, 
  Box, 
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility, 
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import Image from 'next/image';

interface RoleOption {
  role: string;
  label: string;
  email: string;
  password: string;
  description: string;
}

// Login form component that uses the auth context
function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode } = useThemeMode();
  
  // Force light theme for login page
  useEffect(() => {
    // If theme is dark, set it to light in localStorage
    if (mode === 'dark') {
      localStorage.setItem('theme', 'light');
      // Reload the page to apply the theme change
      window.location.reload();
    }
  }, [mode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Role-based login options
  const roleOptions: RoleOption[] = [
    {
      role: 'custom',
      label: 'Custom Login',
      email: '',
      password: '',
      description: 'Sign in with your email and password'
    },
    {
      role: 'admin',
      label: 'Admin',
      email: 'admin@chwone.org',
      password: 'admin123',
      description: 'Full access to all features and settings'
    },
    {
      role: 'chw',
      label: 'CHW',
      email: 'chw@chwone.org',
      password: 'chw123',
      description: 'Access to CHW tools and resources'
    },
    {
      role: 'wl4j_chw',
      label: 'WL4J CHW',
      email: 'wl4j@chwone.org',
      password: 'wl4j123',
      description: 'Access to WL4J-specific tools'
    },
    {
      role: 'demo',
      label: 'Demo',
      email: 'demo@chwone.org',
      password: 'demo123',
      description: 'Limited access for demonstration'
    }
  ];

  // Check if session expired from query params
  useEffect(() => {
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setSessionExpired(true);
    }
  }, [searchParams]);
  
  // Set email and password when role tab changes
  useEffect(() => {
    if (activeTab > 0) {
      const selectedRole = roleOptions[activeTab];
      setEmail(selectedRole.email);
      setPassword(selectedRole.password);
    } else {
      setEmail('');
      setPassword('');
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSessionExpired(false);

    try {
      // Set session expiration to 1 hour if not rememberMe
      const sessionDuration = rememberMe ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 24 hours or 1 hour
      await login(email, password, sessionDuration);
      router.push('/dashboard');
    } catch (error: any) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="sm" sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      py: 5, 
      minHeight: '80vh',
      bgcolor: '#ffffff' // Force white background for the container
    }}>
      <Paper sx={{ 
        width: '100%', 
        borderRadius: 2, 
        overflow: 'hidden', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        bgcolor: '#ffffff' // Force white background for the paper
      }}>
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              alt="CHWOne Logo"
              width={80}
              height={80}
              style={{ marginBottom: 16 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>CHWOne</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>Women Leading for Wellness & Justice</Typography>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>Sign In</Typography>
          </Box>
          
          {sessionExpired && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Your session has expired. Please sign in again.
            </Alert>
          )}
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          {/* Role selection tabs */}
          <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              aria-label="login role tabs"
            >
              {roleOptions.map((option, index) => (
                <Tab key={option.role} label={option.label} />
              ))}
            </Tabs>
          </Box>
          
          {/* Role description */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(26, 54, 93, 0.04)', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {roleOptions[activeTab].description}
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => activeTab === 0 ? setEmail(e.target.value) : null}
              placeholder="Enter your email"
              required
              disabled={loading}
              InputProps={{
                readOnly: activeTab !== 0,
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiInputBase-input.Mui-readOnly': {
                  bgcolor: activeTab !== 0 ? 'rgba(26, 54, 93, 0.04)' : 'transparent'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => activeTab === 0 ? setPassword(e.target.value) : null}
              placeholder="Enter your password"
              required
              disabled={loading}
              InputProps={{
                readOnly: activeTab !== 0,
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: activeTab === 0 ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input.Mui-readOnly': {
                  bgcolor: activeTab !== 0 ? 'rgba(26, 54, 93, 0.04)' : 'transparent'
                }
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              
              <Typography variant="body2" color="primary" component={Link} href="/forgot-password" sx={{ textDecoration: 'none' }}>
                Forgot password?
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              type="submit" 
              fullWidth
              disabled={loading}
              sx={{ 
                py: 1.5, 
                borderRadius: 2,
                fontWeight: 600
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Typography 
                component={Link} 
                href="/register" 
                variant="body2" 
                color="primary" 
                sx={{ textDecoration: 'none', fontWeight: 500 }}
              >
                Register here
              </Typography>
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ bgcolor: 'rgba(26, 54, 93, 0.04)', p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'primary.main' }}>🔒 HIPAA Compliant Platform</Typography>
            <Typography variant="body2" color="text.secondary">Your login is secured with enterprise-grade encryption</Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

// Add a style component to set the body background color
const LoginPageStyle = () => {
  useEffect(() => {
    // Save the original background color
    const originalBg = document.body.style.backgroundColor;
    
    // Set the background color to white
    document.body.style.backgroundColor = '#ffffff';
    
    // Restore the original background color when component unmounts
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);
  
  return null;
};

// Export the wrapped component with AuthProvider
export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageStyle />
      <LoginForm />
    </AuthProvider>
  );
}

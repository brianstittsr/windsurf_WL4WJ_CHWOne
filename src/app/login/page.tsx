'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
function LoginFormContent() {
  const { signIn } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([
    {
      role: 'admin',
      label: 'Administrator',
      email: 'admin@example.com',
      password: 'password123',
      description: 'Full access to all features and settings'
    },
    {
      role: 'chw_coordinator',
      label: 'CHW Coordinator',
      email: 'coordinator@example.com',
      password: 'password123',
      description: 'Manage CHWs and resources'
    },
    {
      role: 'chw',
      label: 'Community Health Worker',
      email: 'chw@example.com',
      password: 'password123',
      description: 'Access to client management and resources'
    }
  ]);

  // Check for redirect parameter
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      // Store the redirect URL in session storage
      sessionStorage.setItem('redirectAfterLogin', redirect);
    }
  }, [searchParams, roleOptions]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      
      // Check if there's a redirect URL in session storage
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    const selectedRole = roleOptions.find(option => option.role === role);
    if (selectedRole) {
      setEmail(selectedRole.email);
      setPassword(selectedRole.password);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card 
        elevation={6} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a365d' }}>
            CHWOne Platform
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Sign in to access the Community Health Worker management platform
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{ mb: 3 }}
          >
            <Tab label="Sign In" />
            <Tab label="Demo Access" />
          </Tabs>

          {tabValue === 0 && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      color="primary" 
                    />
                  }
                  label="Remember me"
                />
                <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Forgot password?
                  </Typography>
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  py: 1.5,
                  backgroundColor: '#1a365d',
                  '&:hover': {
                    backgroundColor: '#0f2942'
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" style={{ textDecoration: 'none', color: '#1a365d', fontWeight: 500 }}>
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select a role to try out the platform with demo credentials:
              </Typography>
              
              <Grid container spacing={2}>
                {roleOptions.map((option) => (
                  <Grid item xs={12} key={option.role}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleDemoLogin(option.role)}
                    >
                      <Typography variant="subtitle1" fontWeight={500}>
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Email: {option.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Password: {option.password}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                disabled={!email || !password || loading}
                onClick={handleSubmit}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ 
                  mt: 3, 
                  py: 1.5,
                  backgroundColor: '#1a365d',
                  '&:hover': {
                    backgroundColor: '#0f2942'
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In with Demo Account'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

// Export the wrapped component with AuthProvider
export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}
    >
      <AuthProvider>
        <LoginFormContent />
      </AuthProvider>
    </Box>
  );
}

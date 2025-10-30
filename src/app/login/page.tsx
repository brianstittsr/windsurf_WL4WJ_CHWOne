'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { log, logError, timeOperation } from '@/utils/logger';
import { initializeSchemaIfNeeded } from '@/lib/schema/initialize-schema';
import { useThemeMode } from '@/components/ThemeProvider';
import Link from 'next/link';
import { 
  Container, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert, 
  Box, 
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility, 
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';

// Login form component that uses the auth context
function LoginFormContent() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode } = useThemeMode();
  const [isOnline, setIsOnline] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('online');
  
  // Network status detection
  useEffect(() => {
    const updateNetworkStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setNetworkStatus(online ? 'online' : 'offline');
      
      // Update localStorage for offline mode detection
      if (!online) {
        localStorage.setItem('firebaseNetworkError', 'true');
      }
    };
    
    // Initial check
    updateNetworkStatus();
    
    // Add event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);
  
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

  // Check for redirect parameter
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      // Store the redirect URL in session storage
      sessionStorage.setItem('redirectAfterLogin', redirect);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      console.log('%c[LOGIN] Login already in progress, ignoring submit', 'background: #2c5282; color: white;');
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log('%c[LOGIN] Submit started', 'background: #2c5282; color: white;', { email });
    
    try {
      console.time('[LOGIN] Sign in duration');
      const user = await signIn(email, password);
      console.timeEnd('[LOGIN] Sign in duration');
      
      console.log('%c[LOGIN] Login successful', 'background: #2c5282; color: white;', { 
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
      
      // Determine redirect URL
      const redirectUrl = searchParams?.get('redirect') || '/dashboard/regions';
      console.log('%c[LOGIN] Redirect URL:', 'color: #2c5282;', redirectUrl);
      
      // Navigate immediately
      router.push(redirectUrl);
    } catch (error) {
      console.error('%c[LOGIN] Login error', 'background: red; color: white;', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to sign in';
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        errorMessage = firebaseError.message;
        if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed login attempts. Please try again later.';
        } else if (firebaseError.code === 'auth/network-request-failed') {
          errorMessage = 'Network connection error. Please check your internet connection.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fill in demo credentials
  const fillDemoCredentials = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
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
              
              {/* Network status indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: networkStatus === 'online' ? 'success.main' : 
                             networkStatus === 'firebase-available' ? 'success.main' : 'error.main',
                    mr: 1
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {networkStatus === 'online' ? 'Online' : 
                   networkStatus === 'firebase-available' ? 'Firebase Connected' : 
                   networkStatus === 'firebase-unavailable' ? 'Firebase Unavailable (Offline Mode)' : 'Offline'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Need quick access? Use demo credentials:
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={fillDemoCredentials}
                sx={{ mt: 1 }}
              >
                Use Demo Account
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                Email: admin@example.com | Password: admin123
              </Typography>
            </Box>
          </Box>
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

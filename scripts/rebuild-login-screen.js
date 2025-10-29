/**
 * Rebuild Login Screen
 * 
 * This script rebuilds the login screen to only use Firebase login credentials.
 * It simplifies the UI and removes any AWS/Cognito related code.
 */

const fs = require('fs');
const path = require('path');

// Path to login page
const loginPagePath = path.resolve(process.cwd(), 'src/app/login/page.tsx');

// Check if file exists
if (!fs.existsSync(loginPagePath)) {
  console.error('Login page not found at path:', loginPagePath);
  process.exit(1);
}

// Create backup
const backupPath = `${loginPagePath}.login-rebuild-backup`;
fs.copyFileSync(loginPagePath, backupPath);
console.log(`Created backup of login page at ${backupPath}`);

// New simplified login page content
const newLoginPageContent = `'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
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
import FirebaseDebugger from '@/components/FirebaseDebugger';

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
    console.log('%c[LOGIN] Submit started', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;', {
      email,
      passwordLength: password?.length,
      timestamp: new Date().toISOString(),
      rememberMe
    });
    setLoading(true);
    setError('');

    try {
      console.time('[LOGIN] Sign in duration');
      const user = await signIn(email, password);
      console.timeEnd('[LOGIN] Sign in duration');
      
      console.log('%c[LOGIN] Login successful', 'background: green; color: white; padding: 2px 4px; border-radius: 2px;', {
        user: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        } : null,
        timestamp: new Date().toISOString()
      });
      
      // Check if there's a redirect URL in session storage
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      console.log('%c[LOGIN] Redirect URL:', 'color: #1a365d;', redirectUrl || '/dashboard');
      
      // Store login success flag
      sessionStorage.setItem('loginSuccess', 'true');
      sessionStorage.setItem('loginTime', new Date().toISOString());
      
      // Force a small delay to ensure auth state is updated
      console.log('%c[LOGIN] Setting navigation timeout', 'color: #1a365d;');
      setTimeout(() => {
        console.log('%c[LOGIN] Navigation timeout fired', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;');
        if (redirectUrl) {
          console.log('%c[LOGIN] Navigating to redirect URL:', 'color: #1a365d;', redirectUrl);
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectUrl;
        } else {
          console.log('%c[LOGIN] Navigating to dashboard', 'color: #1a365d;');
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (error: any) {
      console.error('%c[LOGIN] Login error:', 'background: red; color: white; padding: 2px 4px; border-radius: 2px;', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      setError(error.message || 'Failed to login');
    } finally {
      console.log('%c[LOGIN] Login attempt completed', 'color: #1a365d;', {
        success: !error,
        timestamp: new Date().toISOString()
      });
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
        {/* Firebase Debugger - Only appears in development mode */}
        {process.env.NODE_ENV === 'development' && <FirebaseDebugger />}
      </AuthProvider>
    </Box>
  );
}
`;

// Write the new content to the file
fs.writeFileSync(loginPagePath, newLoginPageContent);
console.log('Successfully rebuilt login screen to only use Firebase login credentials');

console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Test the login functionality with Firebase credentials');

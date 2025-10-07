'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, TextField, Button, Card, CardContent, CircularProgress, Alert, Box, Typography } from '@mui/material';
import Image from 'next/image';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5, minHeight: '80vh' }}>
      <Card sx={{ maxWidth: '400px', width: '100%', boxShadow: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              alt="CHWOne Logo"
              width={80}
              height={80}
              style={{ marginBottom: 16 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>CHWOne</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Women Leading for Wellness & Justice</Typography>
            <Typography variant="h5" sx={{ mt: 2 }}>Sign In</Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              sx={{ mb: 4 }}
            />
            
            <Button 
              variant="contained" 
              type="submit" 
              fullWidth
              disabled={loading}
              sx={{ mb: 3 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Signing In...
                </>
              ) : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography color="text.secondary">
                Don't have an account?{' '}
                <Link href="/register" style={{ textDecoration: 'none' }}>Register here</Link>
              </Typography>
            </Box>
          </Box>
          
          <Card sx={{ bgcolor: 'action.hover', mt: 4, p: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ mb: 1, fontWeight: 'bold' }}>🔒 HIPAA Compliant Platform</Typography>
              <Typography variant="body2" color="text.secondary">Your login is secured with enterprise-grade encryption</Typography>
            </Box>
          </Card>
        </CardContent>
      </Card>
    </Container>
  );
}

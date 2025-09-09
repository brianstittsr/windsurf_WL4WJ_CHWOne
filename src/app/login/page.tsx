'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';

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
    <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
      <Card style={{ maxWidth: '400px', width: '100%' }} className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <img 
              src="/images/CHWOneLogoDesign.png" 
              alt="CHWOne Logo"
              style={{ width: '80px', height: '80px' }}
              className="mb-3"
            />
            <h2 className="fw-bold text-primary">CHWOne</h2>
            <p className="text-muted small">Women Leading for Wellness & Justice</p>
            <h4>Sign In</h4>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </Button>
            
            <div className="text-center mt-3">
              <p className="text-muted">
                Don't have an account?{' '}
                <Link href="/register">Register here</Link>
              </p>
            </div>
          </Form>
          
          <Card className="bg-light mt-4 p-3">
            <div className="text-center">
              <p className="mb-1 fw-bold">🔒 HIPAA Compliant Platform</p>
              <small className="text-muted">Your login is secured with enterprise-grade encryption</small>
            </div>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
}

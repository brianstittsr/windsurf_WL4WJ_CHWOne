'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Spinner, Button, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import APIAccess from '@/components/API/APIAccess';

export default function APIAccessPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100" style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="light" className="mb-3" />
          <p className="text-light">Loading API Access...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="mb-2">API Access Management</h1>
        <p className="text-muted mb-4">Configure API keys, manage integrations, and monitor external service connections for the CHWOne platform</p>
        
        <div className="d-flex gap-2 mb-4">
          <Link href="/api-access/keys">
            <Button variant="primary">Manage API Keys</Button>
          </Link>
          <Link href="/api-access/docs">
            <Button variant="outline-secondary">View Documentation</Button>
          </Link>
        </div>
      </div>
      
      <APIAccess />
    </Container>
  );
}

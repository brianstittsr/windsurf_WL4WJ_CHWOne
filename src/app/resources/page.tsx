'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Region5Directory from '@/components/Resources/Region5Directory';
import { Container, Spinner } from 'react-bootstrap';

export default function ResourcesPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100" style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="light" className="mb-3" />
          <p className="text-light">Loading Resources...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <main className="container py-4">
      <h1 className="mb-2">Resource Directory</h1>
      <p className="text-muted mb-4">Access healthcare resources, community services, and support networks.</p>
      <Region5Directory />
    </main>
  );
}

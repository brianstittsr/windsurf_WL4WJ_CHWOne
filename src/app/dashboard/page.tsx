'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Spinner } from 'react-bootstrap';
import DashboardPlaceholder from '@/components/Dashboard/DashboardPlaceholder';

export default function DashboardPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100" style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="light" className="mb-3" />
          <p className="text-light">Loading CHWOne Platform...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <div className="container">
        <h1 className="mb-3">CHWOne Dashboard</h1>
        <p className="text-muted mb-4">Overview of platform metrics, active projects, and key performance indicators</p>
        <DashboardPlaceholder />
      </div>
    </main>
  );
}

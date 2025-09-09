'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ReferralManagement from '@/components/Referrals/ReferralManagement';
import { Container, Spinner } from 'react-bootstrap';

export default function ReferralsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100" style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="light" className="mb-3" />
          <p className="text-light">Loading Referrals...</p>
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
      <h1 className="mb-2">Referral Management</h1>
      <p className="text-muted mb-4">Track client referrals, coordinate care transitions, and manage service connections.</p>
      <ReferralManagement />
    </main>
  );
}

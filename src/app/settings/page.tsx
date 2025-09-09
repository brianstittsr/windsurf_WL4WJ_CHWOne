'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import SettingsManagement from '@/components/Settings/SettingsManagement';
import { Container, Spinner } from 'react-bootstrap';

export default function SettingsPage() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100" style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="light" className="mb-3" />
          <p className="text-light">Loading Settings...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <main className="container py-4">
      <h1 className="mb-2">Platform Settings</h1>
      <p className="text-muted mb-4">Configure user accounts, permissions, notifications, and system preferences</p>
      <SettingsManagement />
    </main>
  );
}

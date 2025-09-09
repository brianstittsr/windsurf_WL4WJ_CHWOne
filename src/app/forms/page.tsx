'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { Container, Spinner, Button, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import FormsManagement from '@/components/Forms/FormsManagement';

export default function FormsPage() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100" style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="light" className="mb-3" />
          <p className="text-light">Loading Forms...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="mb-2">Forms Management</h1>
        <p className="text-muted mb-4">Create, manage, and analyze health assessment forms and data collection tools for Community Health Workers</p>
        
        <div className="d-flex gap-2 mb-4">
          <Link href="/forms/new">
            <Button variant="primary">Create Form</Button>
          </Link>
          <Link href="/forms/templates">
            <Button variant="outline-secondary">Form Templates</Button>
          </Link>
        </div>
      </div>
      
      <FormsManagement />
    </Container>
  );
}

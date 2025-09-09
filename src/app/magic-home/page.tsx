'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Container, Row, Col, Button, Spinner, Navbar, Image } from 'react-bootstrap';
import Link from 'next/link';
import { redirect } from 'next/navigation';


export default function MagicHome() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100" style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="light" className="mb-3" />
          <h1 className="text-white display-4 fw-bold" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>CHWOne Platform</h1>
        </div>
      </Container>
    );
  }

  // Allow access to magic-home page without authentication

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: '#f8f9fa' }}>
      {/* Top Navigation */}
      <Navbar bg="light" expand="lg" className="shadow-sm sticky-top" style={{ backdropFilter: 'blur(10px)' }}>
        <Container>
          <Navbar.Brand href="/" className="fw-bold">CHWOne</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <div className="d-flex align-items-center gap-4">
              <Link href="/dashboard" className="text-decoration-none text-secondary">Dashboard</Link>
              <Link href="/chws" className="text-decoration-none text-secondary">CHWs</Link>
              <Link href="/projects" className="text-decoration-none text-secondary">Projects</Link>
              
              {currentUser ? (
                <Image 
                  src={currentUser.photoURL || '/images/CHWOneLogoDesign.png'} 
                  width={32}
                  height={32}
                  roundedCircle
                />
              ) : (
                <Link href="/login">
                  <Button variant="outline-primary" size="sm">Login</Button>
                </Link>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <Container className="d-flex flex-column justify-content-center align-items-center flex-grow-1 py-5 text-center">
        <div className="mb-4">
          <h2 className="fw-bold mb-2">Building bridges between</h2>
          <h2 className="fw-bold mb-4">wellness and justice</h2>
        </div>

        <h1 className="display-4 fw-bold mb-3">Welcome to CHWOne</h1>

        <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '600px' }}>
          Empowering Community Health Workers with comprehensive tools for client management, resource coordination, and impact tracking.
        </p>
        
        <div className="d-flex gap-3 mb-5">
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              Access Dashboard
            </Button>
          </Link>
          <Link href="/resources">
            <Button variant="outline-secondary" size="lg">
              Browse Resources
            </Button>
          </Link>
        </div>

        <div className="bg-light p-4 rounded shadow-sm border" style={{ maxWidth: '600px' }}>
          <p className="fw-bold mb-1 text-center">🔒 HIPAA Compliant Platform</p>
          <p className="text-muted small mb-0">
            All client data is encrypted, access is logged for audit purposes, and privacy regulations are strictly enforced.
          </p>
        </div>
      </Container>
    </div>
  );
}

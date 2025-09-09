'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';

export default function Home() {
  const { currentUser, loading } = useAuth();

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

  // Temporary bypass for development - remove in production
  // if (!currentUser) {
  //   redirect('/login');
  // }

  return (
    <MainLayout>
      <main style={{ 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 12s ease infinite',
        color: 'white',
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '1rem'
      }}>
      <div style={{ textAlign: 'center', maxWidth: '800px' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          marginBottom: '1rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Building bridges between
        </h1>
        <h2 style={{ 
          fontSize: '4rem', 
          marginBottom: '2rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          wellness and justice
        </h2>
        
        <p style={{ 
          fontSize: '1.25rem', 
          marginBottom: '3rem', 
          color: 'rgba(255,255,255,0.8)', 
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: '0 auto 3rem auto'
        }}>
          I'm a Community Health Worker, working with <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>CHWOne Platform</span>, where I manage community health initiatives and build stronger communities.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '4rem'
        }}>
          <button style={{ 
            padding: '1rem 2rem', 
            background: '#4f46e5', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
          }}>
            Go to Dashboard
          </button>
          <button style={{ 
            padding: '1rem 2rem', 
            background: 'rgba(255,255,255,0.1)', 
            color: 'white', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}>
            Manage CHWs
          </button>
        </div>
        
        <div style={{
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1rem', color: '#60a5fa', marginBottom: '0.5rem', fontWeight: '600' }}>
            🔒 HIPAA Compliant Platform
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            All client data is encrypted, access is logged for audit purposes, and privacy regulations are strictly enforced.
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </main>
    </MainLayout>
  );
}

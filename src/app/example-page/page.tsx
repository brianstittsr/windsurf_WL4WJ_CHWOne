'use client';

import React from 'react';
import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

/**
 * Example page demonstrating the Magic template page system
 * This matches the beautiful homepage design with gradient background
 */
export default function ExamplePage() {
  return (
    <Container fluid className="d-flex flex-column align-items-center justify-content-center py-5" 
      style={{ 
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    >
      <div className="text-center mb-5" style={{ maxWidth: '800px' }}>
        <div className="mb-3" style={{ transform: 'translateY(0)', opacity: 1, transition: 'all 0.5s ease-out' }}>
          <h1 className="display-5 fw-bold text-white mb-4">Building bridges between</h1>
        </div>
        
        <div className="mb-5" style={{ transform: 'translateY(0)', opacity: 1, transition: 'all 0.5s ease-out 0.2s' }}>
          <p className="text-light mb-4">This example page demonstrates how to create new pages that match the beautiful Magic template homepage design with gradient backgrounds and centered layouts.</p>
        </div>
        
        <div className="d-flex gap-3 justify-content-center mb-5">
          <Link href="/dashboard">
            <Button variant="primary" size="lg">Go to Dashboard</Button>
          </Link>
          <Link href="/chws">
            <Button variant="outline-light" size="lg">Manage CHWs</Button>
          </Link>
        </div>
      </div>
      
      <Card className="p-4 shadow" style={{ maxWidth: '600px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        <div style={{ fontSize: '1rem', color: '#60a5fa', marginBottom: '0.5rem', fontWeight: '600' }}>
          🎨 Magic Template Design
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          This page template preserves the beautiful gradient background and centered layout from the homepage. 
          Perfect for landing pages, authentication forms, or any content that needs the Magic template aesthetic.
        </div>
      </Card>
    </Container>
  );
}

'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';

interface PageFooterProps {
  variant?: 'default' | 'minimal' | 'magic';
}

export default function PageFooter({ variant = 'default' }: PageFooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'magic') {
    return null; // Magic variant typically doesn't show footer
  }

  if (variant === 'minimal') {
    return (
      <footer className="border-top py-3 mt-auto">
        <Container className="text-center">
          <small className="text-muted">
            © {currentYear} CHWOne Platform. All rights reserved.
          </small>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="border-top py-4 mt-auto bg-light">
      <Container>
        <Row className="mb-4">
          {/* Brand Section */}
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-primary mb-3">CHWOne Platform</h5>
            <p className="text-muted small">
              Community Health Worker Management Platform for Women Leading for Wellness and Justice
            </p>
          </Col>

          {/* Quick Links */}
          <Col md={4} className="mb-4 mb-md-0">
            <h6 className="mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/dashboard" className="text-muted text-decoration-none">
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/resources" className="text-muted text-decoration-none">
                  Resources
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/api-access" className="text-muted text-decoration-none">
                  API Access
                </Link>
              </li>
            </ul>
          </Col>

          {/* Support */}
          <Col md={4}>
            <h6 className="mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/settings" className="text-muted text-decoration-none">
                  Settings
                </Link>
              </li>
              <li className="mb-2 text-muted">
                HIPAA Compliant Platform
              </li>
              <li className="text-success">
                ✓ Secure & Encrypted
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <Row className="pt-4 border-top">
          <Col md={6} className="mb-3 mb-md-0">
            <small className="text-muted">
              © {currentYear} CHWOne Platform. All rights reserved.
            </small>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-md-end gap-4">
              <small className="text-muted">Privacy Policy</small>
              <small className="text-muted">Terms of Service</small>
              <small className="text-muted">HIPAA Compliance</small>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

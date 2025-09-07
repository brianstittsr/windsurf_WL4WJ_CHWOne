'use client';

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/platform.types';
import Link from 'next/link';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaProjectDiagram, 
  FaMoneyBillWave, 
  FaDatabase, 
  FaExchangeAlt, 
  FaMapMarkerAlt, 
  FaChartBar, 
  FaDownload, 
  FaCog,
  FaArrowRight,
  FaWpforms,
  FaBriefcase
} from 'react-icons/fa';

interface PlatformCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  roles: UserRole[];
}

export default function PlatformLanding() {
  const { currentUser } = useAuth();

  const platformCards: PlatformCard[] = [
    {
      title: 'Dashboard',
      description: 'Overview of platform metrics, active projects, and key performance indicators',
      href: '/dashboard',
      icon: FaTachometerAlt,
      color: 'primary',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Community Health Workers',
      description: 'Manage CHW profiles, certifications, assignments, and performance tracking',
      href: '/chws',
      icon: FaUsers,
      color: 'success',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR]
    },
    {
      title: 'Projects',
      description: 'Create and manage community health projects with timeline and resource tracking',
      href: '/projects',
      icon: FaProjectDiagram,
      color: 'info',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Grants',
      description: 'Track funding sources, budgets, compliance requirements, and reporting schedules',
      href: '/grants',
      icon: FaMoneyBillWave,
      color: 'warning',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Datasets',
      description: 'Manage and analyze platform data with privacy-compliant export capabilities',
      href: '/datasets',
      icon: FaDatabase,
      color: 'secondary',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Referral Communications',
      description: 'Track client referrals, outcomes, and communication logs between providers',
      href: '/referrals',
      icon: FaExchangeAlt,
      color: 'primary',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Region 5 Resources',
      description: 'Directory of community resources, services, and location-based assistance',
      href: '/resources',
      icon: FaMapMarkerAlt,
      color: 'success',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Empower Surveys',
      description: 'Manage survey collection, analysis, and integration with the Empower Project',
      href: '/surveys',
      icon: FaChartBar,
      color: 'info',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'API Access',
      description: 'External system integrations, API keys, and NC C.A.R.E. 360 connectivity',
      href: '/api-access',
      icon: FaDownload,
      color: 'warning',
      roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Forms & Surveys',
      description: 'Create and manage custom forms, surveys, and data collection tools',
      href: '/forms',
      icon: FaWpforms,
      color: 'warning',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Workforce Development',
      description: 'Connect CHW training programs with employment opportunities',
      href: '/workforce',
      icon: FaBriefcase,
      color: 'info',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF]
    },
    {
      title: 'Settings',
      description: 'Platform configuration, user preferences, and system administration',
      href: '/settings',
      icon: FaCog,
      color: 'secondary',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF]
    }
  ];

  // Mock user role for testing - in production this would come from user profile
  const userRole = currentUser?.email === 'admin@example.com' ? UserRole.ADMIN : UserRole.CHW_COORDINATOR;

  const filteredCards = platformCards.filter(card => 
    card.roles.includes(userRole)
  );

  return (
    <Container fluid className="main-content">
      <Row className="mb-4">
        <Col>
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-primary">CHWOne Platform</h1>
            <p className="lead text-muted">
              Welcome back, {currentUser?.displayName || currentUser?.email}!
            </p>
            <p className="text-muted">
              Women Leading for Wellness and Justice • Community Health Worker Management Platform
            </p>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <div className="bg-light p-4 rounded">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="mb-2">🔒 HIPAA Compliant Platform</h5>
                <p className="mb-0 text-muted">
                  All client data is encrypted, access is logged for audit purposes, and privacy regulations are strictly enforced.
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <small className="text-success fw-bold">✓ Fully Compliant</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">Platform Areas</h3>
          <p className="text-muted mb-4">
            Select an area below to access its management interface. Your access is based on your role: <strong>{userRole}</strong>
          </p>
        </Col>
      </Row>

      <Row>
        {filteredCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Col key={card.href} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-0 hover-card">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`bg-${card.color} bg-opacity-10 p-3 rounded-circle me-3`}>
                      <IconComponent className={`text-${card.color} fs-4`} />
                    </div>
                    <h5 className="mb-0 fw-bold">{card.title}</h5>
                  </div>
                  <p className="text-muted flex-grow-1 mb-3">
                    {card.description}
                  </p>
                  <Link href={card.href} className="text-decoration-none">
                    <Button variant={`outline-${card.color}`} className="w-100">
                      Access {card.title}
                      <FaArrowRight className="ms-2" />
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row className="mt-5">
        <Col>
          <div className="text-center">
            <h5 className="text-muted">Quick Navigation</h5>
            <p className="small text-muted">
              You can also use the sidebar navigation on the left to quickly access any platform area.
              On mobile devices, tap the menu icon (☰) to access the sidebar.
            </p>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </Container>
  );
}

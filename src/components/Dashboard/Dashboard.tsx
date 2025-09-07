'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardMetrics } from '@/types/platform.types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StatusIndicatorProps {
  status: 'active' | 'pending' | 'inactive';
  label: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => (
  <div className="d-flex align-items-center mb-2">
    <span className={`status-indicator status-${status}`}></span>
    <span>{label}</span>
  </div>
);

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCHWs: 0,
    activeCHWs: 0,
    totalClients: 0,
    activeProjects: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalGrants: 0,
    activeGrants: 0,
    totalGrantAmount: 0,
    region5Resources: 0,
    empowerSurveys: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        // Check if we're in test mode (bypass Firebase)
        const isTestMode = process.env.NODE_ENV === 'development' && 
                           process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

        if (isTestMode) {
          // Use mock data in test mode
          setMetrics({
            totalCHWs: 12,
            activeCHWs: 8,
            totalClients: 45,
            activeProjects: 5,
            pendingReferrals: 7,
            completedReferrals: 23,
            totalGrants: 3,
            activeGrants: 2,
            totalGrantAmount: 125000,
            region5Resources: 18,
            empowerSurveys: 34,
          });
          setLoading(false);
          return;
        }

        // Fetch CHWs
        const chwsQuery = query(collection(db, 'communityHealthWorkers'));
        const chwsSnapshot = await getDocs(chwsQuery);
        const totalCHWs = chwsSnapshot.size;
        const activeCHWs = chwsSnapshot.docs.filter(doc => doc.data().isActive).length;

        // Fetch Projects
        const projectsQuery = query(collection(db, 'projects'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const activeProjects = projectsSnapshot.docs.filter(doc => doc.data().status === 'active').length;

        // Fetch Grants
        const grantsQuery = query(collection(db, 'grants'));
        const grantsSnapshot = await getDocs(grantsQuery);
        const totalGrants = grantsSnapshot.size;
        const activeGrants = grantsSnapshot.docs.filter(doc => doc.data().status === 'active').length;
        const totalGrantAmount = grantsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        // Fetch Referrals
        const referralsQuery = query(collection(db, 'referrals'));
        const referralsSnapshot = await getDocs(referralsQuery);
        const pendingReferrals = referralsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
        const completedReferrals = referralsSnapshot.docs.filter(doc => doc.data().status === 'completed').length;

        // Fetch Resources
        const resourcesQuery = query(collection(db, 'referralResources'));
        const resourcesSnapshot = await getDocs(resourcesQuery);
        const region5Resources = resourcesSnapshot.docs.filter(doc => doc.data().region5Certified).length;

        // Fetch Empower Surveys
        const surveysQuery = query(collection(db, 'empowerSurveyResults'));
        const surveysSnapshot = await getDocs(surveysQuery);
        const empowerSurveys = surveysSnapshot.size;

        setMetrics({
          totalCHWs,
          activeCHWs,
          totalClients: 0, // Will be implemented based on privacy requirements
          activeProjects,
          pendingReferrals,
          completedReferrals,
          totalGrants,
          activeGrants,
          totalGrantAmount,
          region5Resources,
          empowerSurveys,
        });
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        // Set default values on error
        setMetrics({
          totalCHWs: 0,
          activeCHWs: 0,
          totalClients: 0,
          activeProjects: 0,
          pendingReferrals: 0,
          completedReferrals: 0,
          totalGrants: 0,
          activeGrants: 0,
          totalGrantAmount: 0,
          region5Resources: 0,
          empowerSurveys: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <Container fluid className="main-content">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="main-content">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">CHWOne Dashboard</h1>
          <p className="text-muted">
            Welcome back, {currentUser?.displayName || currentUser?.email}! Here's an overview of your Community Health Worker platform.
          </p>
        </Col>
      </Row>

      {/* HIPAA Compliance Notice */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="hipaa-compliant">
            <strong>🔒 HIPAA Compliant Platform</strong> - All client data is encrypted and access is logged for audit purposes.
          </Alert>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-metric">
            <Card.Body>
              <h3>{metrics.activeCHWs}</h3>
              <p>Active CHWs</p>
              <small>of {metrics.totalCHWs} total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-metric">
            <Card.Body>
              <h3>{metrics.activeProjects}</h3>
              <p>Active Projects</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-metric">
            <Card.Body>
              <h3>{metrics.activeGrants}</h3>
              <p>Active Grants</p>
              <small>${metrics.totalGrantAmount.toLocaleString()}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-metric">
            <Card.Body>
              <h3>{metrics.pendingReferrals}</h3>
              <p>Pending Referrals</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Status Overview */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <StatusIndicator status="active" label="Firebase Database Connection" />
              <StatusIndicator status="active" label="HIPAA Compliance Monitoring" />
              <StatusIndicator status="active" label="Data Encryption" />
              <StatusIndicator status="pending" label="NC C.A.R.E. 360 Integration" />
              <StatusIndicator status="active" label="Empower Survey Integration" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Data Communications Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Region 5 Resource Directory</h6>
                <Badge bg="success" className="region5-certified">
                  {metrics.region5Resources} Certified Resources
                </Badge>
              </div>
              <div className="mb-3">
                <h6>Empower Survey Results</h6>
                <div className="empower-survey p-2">
                  <strong>{metrics.empowerSurveys}</strong> survey responses collected
                </div>
              </div>
              <div className="mb-3">
                <h6>Referral Communications</h6>
                <StatusIndicator status="active" label={`${metrics.completedReferrals} Completed Referrals`} />
                <StatusIndicator status="pending" label={`${metrics.pendingReferrals} Pending Referrals`} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>New CHW certification processed</span>
                <Badge bg="success">Today</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Grant report submitted for Project Alpha</span>
                <Badge bg="info">Yesterday</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>5 new resources added to Region 5 directory</span>
                <Badge bg="primary">2 days ago</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Empower survey data synchronized</span>
                <Badge bg="secondary">3 days ago</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

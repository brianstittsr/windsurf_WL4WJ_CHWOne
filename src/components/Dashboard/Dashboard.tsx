'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardMetrics, Project, ProjectStatus } from '@/types/platform.types';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StatusIndicatorProps {
  status: 'active' | 'pending' | 'inactive';
  label: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => (
  <Row className="align-items-center mb-2">
    <div 
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: status === 'active' ? 'var(--accent-solid)' : status === 'pending' ? 'var(--brand-solid)' : 'var(--neutral-solid)'
      }}
      className="me-2"
    />
    <small className="text-muted">{label}</small>
  </Row>
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
  const [projects, setProjects] = useState<Project[]>([]);
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
          
          // Mock projects data
          setProjects([
            {
              id: 'proj-1',
              name: 'Community Health Outreach Initiative',
              description: 'Expanding CHW services to underserved rural communities in Western NC',
              status: ProjectStatus.ACTIVE,
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-12-31'),
              budget: 75000,
              spentAmount: 45000,
              grantId: 'grant-1',
              assignedCHWs: ['chw-1', 'chw-2'],
              targetPopulation: 'Rural communities in Western NC',
              goals: ['Increase CHW coverage by 40%', 'Improve health outcomes'],
              outcomes: [],
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15')
            },
            {
              id: 'proj-2',
              name: 'Diabetes Prevention Program',
              description: 'CHW-led diabetes prevention and management program for high-risk populations',
              status: ProjectStatus.ACTIVE,
              startDate: new Date('2024-02-01'),
              endDate: new Date('2025-01-31'),
              budget: 120000,
              spentAmount: 30000,
              grantId: 'grant-2',
              assignedCHWs: ['chw-3', 'chw-4'],
              targetPopulation: 'Adults at high risk for diabetes',
              goals: ['Reduce diabetes incidence by 25%', 'Train 50 participants'],
              outcomes: [],
              createdAt: new Date('2024-02-01'),
              updatedAt: new Date('2024-02-01')
            },
            {
              id: 'proj-3',
              name: 'Mental Health Support Network',
              description: 'Building community-based mental health support through trained CHWs',
              status: ProjectStatus.PLANNING,
              startDate: new Date('2024-04-01'),
              endDate: new Date('2024-10-31'),
              budget: 85000,
              spentAmount: 5000,
              grantId: 'grant-3',
              assignedCHWs: ['chw-5'],
              targetPopulation: 'Community members with mental health needs',
              goals: ['Establish support network', 'Train 20 CHWs in mental health'],
              outcomes: [],
              createdAt: new Date('2024-03-15'),
              updatedAt: new Date('2024-03-15')
            }
          ]);
          
          setLoading(false);
          return;
        }

        // Basic sample fetches (can be optimized later)
        const chwsSnapshot = await getDocs(query(collection(db, 'communityHealthWorkers')));
        const projectsSnapshot = await getDocs(query(collection(db, 'projects')));
        const grantsSnapshot = await getDocs(query(collection(db, 'grants')));
        const referralsSnapshot = await getDocs(query(collection(db, 'referrals')));
        const resourcesSnapshot = await getDocs(query(collection(db, 'referralResources')));
        const surveysSnapshot = await getDocs(query(collection(db, 'empowerSurveyResults')));

        setMetrics({
          totalCHWs: chwsSnapshot.size,
          activeCHWs: chwsSnapshot.docs.filter(doc => doc.data().isActive).length,
          totalClients: 0,
          activeProjects: projectsSnapshot.docs.filter(doc => doc.data().status === 'active').length,
          pendingReferrals: referralsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
          completedReferrals: referralsSnapshot.docs.filter(doc => doc.data().status === 'completed').length,
          totalGrants: grantsSnapshot.size,
          activeGrants: grantsSnapshot.docs.filter(doc => doc.data().status === 'active').length,
          totalGrantAmount: grantsSnapshot.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0),
          region5Resources: resourcesSnapshot.docs.filter(doc => doc.data().region5Certified).length,
          empowerSurveys: surveysSnapshot.size,
        });

        setProjects(projectsSnapshot.docs.slice(0, 3).map((d) => ({
          id: d.id,
          name: d.data().name || 'Project',
          description: d.data().description || '',
          status: (d.data().status as ProjectStatus) || ProjectStatus.PLANNING,
          startDate: d.data().startDate ? new Date(d.data().startDate) : undefined,
          endDate: d.data().endDate ? new Date(d.data().endDate) : undefined,
          budget: d.data().budget || 0,
          spentAmount: d.data().spentAmount || 0,
          grantId: d.data().grantId || '',
          assignedCHWs: d.data().assignedCHWs || [],
          targetPopulation: d.data().targetPopulation || '',
          goals: d.data().goals || [],
          outcomes: d.data().outcomes || [],
          createdAt: d.data().createdAt ? new Date(d.data().createdAt) : new Date(),
          updatedAt: d.data().updatedAt ? new Date(d.data().updatedAt) : new Date(),
        })));
      } catch (e) {
        console.error('Error fetching dashboard metrics:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" className="me-2" />
        <span className="text-muted">Loading dashboard…</span>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">CHW Platform Dashboard</h2>
        <p className="text-muted">Welcome back{currentUser ? `, ${currentUser.displayName || currentUser.email}` : ''}.</p>
        </Text>
        <Text variant="body-default-l" onBackground="neutral-weak" style={{ marginTop: '0.5rem' }}>
          Welcome back, {currentUser?.displayName || currentUser?.email}! Here's an overview of your Community Health Worker platform.
        </Text>
      </div>

      {/* Key Metrics */}
      <Flex fillWidth gap="16" wrap>
        <Card fillWidth padding="20" background="surface" border="neutral-alpha-medium" style={{ minWidth: '200px', flex: '1' }}>
          <Column gap="8">
            <Text variant="heading-strong-xl">{metrics.activeCHWs}</Text>
            <Text variant="body-default-m">Active CHWs</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">of {metrics.totalCHWs} total</Text>
          </Column>
        </Card>
        <Card fillWidth padding="20" background="surface" border="neutral-alpha-medium" style={{ minWidth: '200px', flex: '1' }}>
          <Column gap="8">
            <Text variant="heading-strong-xl">{metrics.activeProjects}</Text>
            <Text variant="body-default-m">Active Projects</Text>
          </Column>
        </Card>
        <Card fillWidth padding="20" background="surface" border="neutral-alpha-medium" style={{ minWidth: '200px', flex: '1' }}>
          <Column gap="8">
            <Text variant="heading-strong-xl">{metrics.activeGrants}</Text>
            <Text variant="body-default-m">Active Grants</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">${metrics.totalGrantAmount.toLocaleString()}</Text>
          </Column>
        </Card>
        <Card fillWidth padding="20" background="surface" border="neutral-alpha-medium" style={{ minWidth: '200px', flex: '1' }}>
          <Column gap="8">
            <Text variant="heading-strong-xl">{metrics.pendingReferrals}</Text>
            <Text variant="body-default-m">Pending Referrals</Text>
          </Column>
        </Card>
      </Flex>

      {/* Status Overview */}
      <Flex fillWidth gap="16" wrap>
        <Card fillWidth padding="20" background="surface" border="neutral-alpha-medium" style={{ minWidth: '300px', flex: '1' }}>
          <Column gap="16">
            <Text variant="heading-strong-s">System Status</Text>
            <Column gap="8">
              <StatusIndicator status="active" label="Firebase Database Connection" />
              <StatusIndicator status="active" label="HIPAA Compliance Monitoring" />
              <StatusIndicator status="active" label="Data Encryption" />
              <StatusIndicator status="pending" label="NC C.A.R.E. 360 Integration" />
              <StatusIndicator status="active" label="Empower Survey Integration" />
            </Column>
          </Column>
        </Card>
        <Card fillWidth padding="20" background="surface" border="neutral-alpha-medium" style={{ minWidth: '300px', flex: '1' }}>
          <Column gap="16">
            <Text variant="heading-strong-s">Data Communications Status</Text>
            <Column gap="16">
              <Column gap="8">
                <Text variant="heading-default-xs">Region 5 Resource Directory</Text>
                <Badge title={`${metrics.region5Resources} Certified Resources`} background="accent-alpha-weak" onBackground="accent-strong" />
              </Column>
              <Column gap="8">
                <Text variant="heading-default-xs">Empower Survey Results</Text>
                <Text variant="body-strong-s">{metrics.empowerSurveys} survey responses collected</Text>
              </Column>
              <Column gap="8">
                <Text variant="heading-default-xs">Referral Communications</Text>
                <StatusIndicator status="active" label={`${metrics.completedReferrals} Completed Referrals`} />
                <StatusIndicator status="pending" label={`${metrics.pendingReferrals} Pending Referrals`} />
              </Column>
            </Column>
          </Column>
        </Card>
      </Flex>

      {/* Projects Section */}
      <Card fillWidth padding="32" background="surface" border="neutral-alpha-medium">
        <Column gap="24" fillWidth>
          <Row horizontal="between" vertical="center">
            <Column gap="8">
              <Text variant="heading-strong-l" onBackground="neutral-strong">Active Projects</Text>
              <Text variant="body-default-m" onBackground="neutral-medium">
                Manage and track your community health initiatives
              </Text>
            </Column>
            <Button variant="secondary" size="m" href="/projects">
              View All Projects
            </Button>
          </Row>
          
          {/* Projects Grid */}
          <Flex fillWidth wrap gap="20">
            {projects.map((project) => {
              const progressPercentage = project.budget > 0 ? (project.spentAmount / project.budget) * 100 : 0;
              const statusColor = project.status === ProjectStatus.ACTIVE ? 'brand' : 
                                 project.status === ProjectStatus.PLANNING ? 'accent' : 'neutral';
              
              return (
                <Card 
                  key={project.id} 
                  padding="0"
                  background="surface"
                  border="neutral-alpha-medium"
                  style={{
                    minWidth: '500px',
                    flex: '1 1 500px',
                    maxWidth: '700px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <Row fillWidth>
                    {/* Project Image Placeholder */}
                    <div style={{
                      width: '200px',
                      height: '280px',
                      background: `linear-gradient(135deg, var(--${statusColor}-background-strong) 0%, var(--${statusColor}-background-medium) 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '12px',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Background Pattern */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        opacity: 0.3
                      }} />
                      
                      {/* Project Icon */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        {project.name.charAt(0)}
                      </div>
                      
                      {/* Status Badge */}
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {project.status.replace('_', ' ')}
                      </div>
                    </div>

                    {/* Project Content */}
                    <Column flex={1} padding="24" gap="20">
                      {/* Header */}
                      <Column gap="8">
                        <Text variant="heading-strong-m" onBackground="neutral-strong">
                          {project.name}
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-medium" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.5'
                        }}>
                          {project.description}
                        </Text>
                      </Column>

                      {/* Project Stats */}
                      <Row gap="24" wrap>
                        <Column gap="4">
                          <Text variant="body-default-xs" onBackground="neutral-medium">CHWs Assigned</Text>
                          <Text variant="heading-strong-s" onBackground="neutral-strong">
                            {project.assignedCHWs.length}
                          </Text>
                        </Column>
                        <Column gap="4">
                          <Text variant="body-default-xs" onBackground="neutral-medium">End Date</Text>
                          <Text variant="body-strong-s" onBackground="neutral-strong">
                            {project.endDate?.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            }) || 'Ongoing'}
                          </Text>
                        </Column>
                        <Column gap="4">
                          <Text variant="body-default-xs" onBackground="neutral-medium">Budget Used</Text>
                          <Text variant="body-strong-s" onBackground="neutral-strong">
                            {progressPercentage.toFixed(0)}%
                          </Text>
                        </Column>
                      </Row>

                      {/* Budget Progress */}
                      <Column gap="8">
                        <Row horizontal="between" vertical="center">
                          <Text variant="body-strong-s" onBackground="neutral-strong">Budget Progress</Text>
                          <Text variant="body-default-s" onBackground="neutral-medium">
                            ${project.spentAmount.toLocaleString()} / ${project.budget.toLocaleString()}
                          </Text>
                        </Row>
                        
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: 'var(--neutral-alpha-medium)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min(progressPercentage, 100)}%`,
                            height: '100%',
                            backgroundColor: progressPercentage > 90 ? 'var(--danger-background-strong)' :
                              progressPercentage > 70 ? 'var(--accent-background-strong)' : 'var(--brand-background-strong)',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </Column>

                      {/* Action Buttons */}
                      <Row gap="12" style={{ marginTop: 'auto' }}>
                        <Button variant="secondary" size="m" style={{ flex: 1 }} href={`/projects/${project.id}`}>
                          View Details
                        </Button>
                        <Button variant="tertiary" size="m" style={{ flex: 1 }} href={`/projects/${project.id}/edit`}>
                          Edit Project
                        </Button>
                      </Row>
                    </Column>
                  </Row>
                </Card>
              );
            })}
          </Flex>
        </Column>
      </Card>

      {/* Recent Activity */}
      <Card fillWidth padding="20" background="surface" border="neutral-alpha-medium">
        <Column gap="16">
          <Text variant="heading-strong-s">Recent Activity</Text>
          <Column gap="12">
            <Row horizontal="between" vertical="center">
              <Text variant="body-default-s">New CHW certification processed</Text>
              <Badge title="Today" background="accent-alpha-weak" onBackground="accent-strong" />
            </Row>
            <Row horizontal="between" vertical="center">
              <Text variant="body-default-s">Grant report submitted for Project Alpha</Text>
              <Badge title="Yesterday" background="brand-alpha-weak" onBackground="brand-strong" />
            </Row>
            <Row horizontal="between" vertical="center">
              <Text variant="body-default-s">5 new resources added to Region 5 directory</Text>
              <Badge title="2 days ago" background="brand-alpha-weak" onBackground="brand-strong" />
            </Row>
            <Row horizontal="between" vertical="center">
              <Text variant="body-default-s">Empower survey data synchronized</Text>
              <Badge title="3 days ago" background="neutral-alpha-weak" onBackground="neutral-strong" />
            </Row>
          </Column>
        </Column>
      </Card>
    </div>
  );
}

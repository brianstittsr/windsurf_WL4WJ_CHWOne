'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Modal } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, ProjectStatus, ProjectOutcome, Grant } from '@/types/platform.types';
import { FaPlus, FaEdit, FaEye, FaChartLine, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grantId: '',
    status: ProjectStatus.PLANNING,
    startDate: '',
    endDate: '',
    targetPopulation: '',
    goals: '',
    budget: 0,
    assignedCHWs: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if Firebase is properly configured
      if (!db) {
        console.warn('Firebase not configured, using mock data');
        setProjects(mockProjects);
        setGrants([]);
        return;
      }

      // Fetch projects with better error handling
      try {
        const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate ? data.startDate.toDate() : null,
            endDate: data.endDate?.toDate ? data.endDate.toDate() : null,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
          };
        }) as Project[];
        setProjects(projectsData);
      } catch (projectError) {
        console.warn('Error fetching projects, using mock data:', projectError);
        setProjects(mockProjects);
      }

      // Fetch grants with better error handling
      try {
        const grantsQuery = query(collection(db, 'grants'));
        const grantsSnapshot = await getDocs(grantsQuery);
        const grantsData = grantsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate ? data.startDate.toDate() : null,
            endDate: data.endDate?.toDate ? data.endDate.toDate() : null,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
          };
        }) as Grant[];
        setGrants(grantsData);
      } catch (grantError) {
        console.warn('Error fetching grants:', grantError);
        setGrants([]);
      }

    } catch (error) {
      console.error('Error in fetchData:', error);
      // Set mock data as fallback
      setProjects(mockProjects);
      setGrants([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock projects data for fallback
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Community Health Outreach Program',
      description: 'Expanding healthcare access to underserved rural communities through mobile clinics and CHW visits.',
      grantId: 'grant-1',
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      targetPopulation: 'Rural communities in Johnston County',
      goals: ['Increase healthcare access', 'Reduce emergency room visits', 'Improve health outcomes'],
      budget: 250000,
      spentAmount: 87500,
      assignedCHWs: ['chw-1', 'chw-2', 'chw-3'],
      outcomes: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-15')
    },
    {
      id: '2',
      name: 'Diabetes Prevention Initiative',
      description: 'Community-based diabetes prevention program focusing on lifestyle interventions and education.',
      status: ProjectStatus.PLANNING,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      targetPopulation: 'Adults at risk for Type 2 diabetes',
      goals: ['Prevent diabetes onset', 'Promote healthy lifestyle', 'Increase health literacy'],
      budget: 180000,
      spentAmount: 15000,
      assignedCHWs: ['chw-4', 'chw-5'],
      outcomes: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-10')
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        grantId: formData.grantId || undefined,
        status: formData.status,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        targetPopulation: formData.targetPopulation,
        goals: formData.goals.split(',').map(g => g.trim()),
        budget: formData.budget,
        spentAmount: 0,
        assignedCHWs: formData.assignedCHWs,
        outcomes: [] as ProjectOutcome[],
        updatedAt: new Date()
      };

      if (selectedProject) {
        await updateDoc(doc(db, 'projects', selectedProject.id), projectData);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: new Date()
        });
      }

      setShowModal(false);
      setSelectedProject(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      grantId: '',
      status: ProjectStatus.PLANNING,
      startDate: '',
      endDate: '',
      targetPopulation: '',
      goals: '',
      budget: 0,
      assignedCHWs: []
    });
  };

  const editProject = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      grantId: project.grantId || '',
      status: project.status,
      startDate: project.startDate.toISOString().split('T')[0],
      endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : '',
      targetPopulation: project.targetPopulation,
      goals: project.goals.join(', '),
      budget: project.budget,
      assignedCHWs: project.assignedCHWs
    });
    setShowModal(true);
  };

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    const variants = {
      [ProjectStatus.PLANNING]: 'secondary',
      [ProjectStatus.ACTIVE]: 'success',
      [ProjectStatus.ON_HOLD]: 'warning',
      [ProjectStatus.COMPLETED]: 'primary',
      [ProjectStatus.CANCELLED]: 'danger'
    };
    return variants[status];
  };

  const calculateProgress = (project: Project) => {
    if (!project.endDate) return 0;
    const total = project.endDate.getTime() - project.startDate.getTime();
    const elapsed = Date.now() - project.startDate.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getBudgetUtilization = (project: Project) => {
    return project.budget > 0 ? (project.spentAmount / project.budget) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3 text-muted">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold">Project Management</h2>
              <p className="text-muted">Manage community health projects and track outcomes</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" /> New Project
            </Button>
          </div>
        </Col>
      </Row>

      {/* Project Metrics */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="text-info">
                {projects.filter(p => p.status === ProjectStatus.ACTIVE).length}
              </h2>
              <p className="text-muted mb-0">Active Projects</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="text-primary">
                {projects.filter(p => p.status === ProjectStatus.COMPLETED).length}
              </h2>
              <p className="text-muted mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="text-dark">
                ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </h2>
              <p className="text-muted mb-0">Total Budget</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <h2 className="text-warning">
                {projects.filter(p => p.grantId).length}
              </h2>
              <p className="text-muted mb-0">Grant-Funded</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Projects Table */}
      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-4">Project Portfolio</h4>
          
          {projects.length === 0 ? (
            <div className="text-center py-5">
              <FaChartLine size={48} className="text-muted mb-3" />
              <h5>No Projects Yet</h5>
              <p className="text-muted">Create your first project to get started.</p>
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
              >
                <FaPlus className="me-2" /> Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '20%' }}>Project Name</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '15%' }}>Grant</th>
                    <th style={{ width: '15%' }}>Timeline</th>
                    <th style={{ width: '15%' }}>Budget</th>
                    <th style={{ width: '10%' }}>Progress</th>
                    <th style={{ width: '5%' }}>CHWs</th>
                    <th style={{ width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => {
                    const grant = grants.find(g => g.id === project.grantId);
                    const progress = calculateProgress(project);
                    const budgetUtilization = getBudgetUtilization(project);
                    
                    return (
                      <tr key={project.id}>
                        <td>
                          <div>
                            <strong>{project.name}</strong>
                            <div className="small text-muted">{project.targetPopulation}</div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(project.status)}>
                            {project.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td>
                          {grant ? (
                            <div>
                              <div className="small">{grant.title}</div>
                              <Badge bg="info">${grant.amount.toLocaleString()}</Badge>
                            </div>
                          ) : (
                            <span className="text-muted">No grant</span>
                          )}
                        </td>
                        <td>
                          <div className="small">
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt size={12} className="text-muted me-1" />
                              {project.startDate.toLocaleDateString()}
                            </div>
                            {project.endDate && (
                              <div className="text-muted">to {project.endDate.toLocaleDateString()}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>${project.budget.toLocaleString()}</strong>
                            <div className="small text-muted">Spent: ${project.spentAmount.toLocaleString()}</div>
                            <div className="progress mt-1" style={{ height: '4px' }}>
                              <div 
                                className={`progress-bar ${budgetUtilization > 90 ? 'bg-danger' : budgetUtilization > 75 ? 'bg-warning' : 'bg-info'}`} 
                                role="progressbar" 
                                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                                aria-valuenow={Math.min(budgetUtilization, 100)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="small">{Math.round(progress)}% complete</div>
                          <div className="progress mt-1" style={{ height: '4px' }}>
                            <div 
                              className="progress-bar bg-primary" 
                              role="progressbar" 
                              style={{ width: `${Math.min(progress, 100)}%` }}
                              aria-valuenow={Math.min(progress, 100)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{project.assignedCHWs.length}</Badge>
                        </td>
                        <td>
                          <div className="btn-group">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => editProject(project)}
                            >
                              <FaEdit />
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              <FaEye />
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              <FaChartLine />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Project Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProject ? 'Edit Project' : 'New Project'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ProjectStatus})}
                  >
                    {Object.values(ProjectStatus).map(status => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Associated Grant</Form.Label>
                  <Form.Select
                    value={formData.grantId}
                    onChange={(e) => setFormData({...formData, grantId: e.target.value})}
                  >
                    <option value="">No grant association</option>
                    {grants.map(grant => (
                      <option key={grant.id} value={grant.id}>
                        {grant.title} (${grant.amount.toLocaleString()})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Target Population</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.targetPopulation}
                    onChange={(e) => setFormData({...formData, targetPopulation: e.target.value})}
                    placeholder="e.g., Low-income families, Seniors, etc."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date (Optional)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Budget</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.budget.toString()}
                    onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Project Goals (comma-separated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                placeholder="e.g., Improve health outcomes, Increase access to care, Reduce hospitalizations"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedProject ? 'Update Project' : 'Create Project'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

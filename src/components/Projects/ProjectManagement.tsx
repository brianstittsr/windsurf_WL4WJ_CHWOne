'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, ProgressBar, Alert } from 'react-bootstrap';
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
      // Fetch projects
      const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Project[];

      // Fetch grants
      const grantsQuery = query(collection(db, 'grants'));
      const grantsSnapshot = await getDocs(grantsQuery);
      const grantsData = grantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Grant[];

      setProjects(projectsData);
      setGrants(grantsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status: ProjectStatus) => {
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Project Management</h1>
              <p className="text-muted">Manage community health projects and track outcomes</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              New Project
            </Button>
          </div>
        </Col>
      </Row>

      {/* Project Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{projects.filter(p => p.status === ProjectStatus.ACTIVE).length}</h3>
              <p className="mb-0">Active Projects</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{projects.filter(p => p.status === ProjectStatus.COMPLETED).length}</h3>
              <p className="mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</h3>
              <p className="mb-0">Total Budget</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{projects.filter(p => p.grantId).length}</h3>
              <p className="mb-0">Grant-Funded</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Projects Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Project Portfolio</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Grant</th>
                <th>Timeline</th>
                <th>Budget</th>
                <th>Progress</th>
                <th>CHWs</th>
                <th>Actions</th>
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
                        <br />
                        <small className="text-muted">{project.targetPopulation}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(project.status)}>
                        {project.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td>
                      {grant ? (
                        <div>
                          <small>{grant.title}</small>
                          <br />
                          <Badge bg="info" className="small">
                            ${grant.amount.toLocaleString()}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted">No grant</span>
                      )}
                    </td>
                    <td>
                      <div>
                        <small>
                          <FaCalendarAlt className="me-1" />
                          {project.startDate.toLocaleDateString()}
                        </small>
                        {project.endDate && (
                          <>
                            <br />
                            <small className="text-muted">
                              to {project.endDate.toLocaleDateString()}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>${project.budget.toLocaleString()}</strong>
                        <br />
                        <small className="text-muted">
                          Spent: ${project.spentAmount.toLocaleString()}
                        </small>
                        <ProgressBar 
                          now={budgetUtilization} 
                          variant={budgetUtilization > 90 ? 'danger' : budgetUtilization > 75 ? 'warning' : 'success'}
                          size="sm"
                          className="mt-1"
                        />
                      </div>
                    </td>
                    <td>
                      <div>
                        <small>{Math.round(progress)}% complete</small>
                        <ProgressBar 
                          now={progress} 
                          variant="info" 
                          size="sm"
                          className="mt-1"
                        />
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{project.assignedCHWs.length} CHWs</Badge>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => editProject(project)}
                        >
                          <FaEdit />
                        </Button>
                        <Button variant="outline-info" size="sm">
                          <FaEye />
                        </Button>
                        <Button variant="outline-success" size="sm">
                          <FaChartLine />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Project Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProject ? 'Edit Project' : 'New Project'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ProjectStatus})}
                  >
                    {Object.values(ProjectStatus).map(status => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Associated Grant</Form.Label>
                  <Form.Select
                    value={formData.grantId}
                    onChange={(e) => setFormData({...formData, grantId: e.target.value})}
                  >
                    <option value="">No grant association</option>
                    {grants.map(grant => (
                      <option key={grant.id} value={grant.id}>
                        {grant.title} - ${grant.amount.toLocaleString()}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
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

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
                  <Form.Label>End Date (Optional)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Budget</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
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

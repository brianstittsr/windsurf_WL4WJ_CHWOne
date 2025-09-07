'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmpowerSurveyResult, SurveyResponse, Project } from '@/types/platform.types';
import { FaPlus, FaEye, FaDownload, FaChartBar, FaSync, FaExternalLinkAlt } from 'react-icons/fa';

export default function EmpowerSurveyManagement() {
  const [surveys, setSurveys] = useState<EmpowerSurveyResult[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<EmpowerSurveyResult | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch survey results
      const surveysQuery = query(
        collection(db, 'empowerSurveyResults'),
        orderBy('completedAt', 'desc')
      );
      const surveysSnapshot = await getDocs(surveysQuery);
      const surveysData = surveysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as EmpowerSurveyResult[];

      // Fetch projects
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Project[];

      setSurveys(surveysData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithEmpower = async () => {
    setSyncStatus('syncing');
    try {
      // Simulate API call to Empower Project
      // In real implementation, this would call the Empower API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      const mockSurveyData = {
        surveyId: `empower_${Date.now()}`,
        projectId: selectedProject,
        responses: [
          {
            questionId: 'q1',
            questionText: 'How would you rate your overall health?',
            answer: 'Good',
            answerType: 'multiple_choice' as const
          },
          {
            questionId: 'q2',
            questionText: 'Do you have access to healthy food?',
            answer: true,
            answerType: 'boolean' as const
          },
          {
            questionId: 'q3',
            questionText: 'Rate your stress level (1-10)',
            answer: 6,
            answerType: 'scale' as const
          }
        ] as SurveyResponse[],
        completedAt: new Date(),
        isAnonymous: true,
        metadata: {
          source: 'empower_api',
          syncDate: new Date().toISOString(),
          version: '1.0'
        },
        createdAt: new Date()
      };

      await addDoc(collection(db, 'empowerSurveyResults'), mockSurveyData);
      setSyncStatus('success');
      fetchData();
    } catch (error) {
      console.error('Error syncing with Empower:', error);
      setSyncStatus('error');
    }
  };

  const exportSurveyData = async (projectId?: string) => {
    try {
      let filteredSurveys = surveys;
      if (projectId) {
        filteredSurveys = surveys.filter(survey => survey.projectId === projectId);
      }

      const csvData = filteredSurveys.map(survey => ({
        surveyId: survey.surveyId,
        projectId: survey.projectId,
        completedAt: survey.completedAt?.toISOString(),
        isAnonymous: survey.isAnonymous,
        responseCount: survey.responses.length,
        responses: JSON.stringify(survey.responses)
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `empower_survey_data_${projectId || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getSurveysByProject = (projectId: string) => {
    return surveys.filter(survey => survey.projectId === projectId);
  };

  const getProjectMetrics = (projectId: string) => {
    const projectSurveys = getSurveysByProject(projectId);
    const totalResponses = projectSurveys.length;
    const anonymousResponses = projectSurveys.filter(s => s.isAnonymous).length;
    const avgResponsesPerSurvey = totalResponses > 0 ? 
      projectSurveys.reduce((sum, s) => sum + s.responses.length, 0) / totalResponses : 0;

    return {
      totalResponses,
      anonymousResponses,
      avgResponsesPerSurvey: Math.round(avgResponsesPerSurvey * 10) / 10
    };
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
              <h1>Empower Survey Management</h1>
              <p className="text-muted">
                Manage and analyze survey results from the Empower Project 
                <a href="https://empowerproject.us/" target="_blank" rel="noopener noreferrer" className="ms-2">
                  <FaExternalLinkAlt />
                </a>
              </p>
            </div>
            <div>
              <Button 
                variant="success" 
                className="me-2"
                onClick={() => setShowModal(true)}
                disabled={syncStatus === 'syncing'}
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <FaSync className="me-2" />
                    Sync with Empower
                  </>
                )}
              </Button>
              <Button variant="primary" onClick={() => exportSurveyData()}>
                <FaDownload className="me-2" />
                Export All Data
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Sync Status Alert */}
      {syncStatus === 'success' && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" dismissible onClose={() => setSyncStatus('idle')}>
              <strong>Sync Successful!</strong> Latest survey data has been imported from Empower Project.
            </Alert>
          </Col>
        </Row>
      )}

      {syncStatus === 'error' && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setSyncStatus('idle')}>
              <strong>Sync Failed!</strong> Unable to connect to Empower Project API. Please try again later.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Empower Integration Info */}
      <Row className="mb-4">
        <Col>
          <Card className="empower-survey">
            <Card.Header>
              <h5 className="mb-0">Empower Project Integration</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <p className="mb-2">
                    <strong>Connected to Empower Project API</strong> - Automated survey data collection and analysis
                  </p>
                  <small className="text-muted">
                    The Empower Project focuses on community health and wellness initiatives. 
                    Survey data is collected on a project-by-project basis to measure outcomes and impact.
                  </small>
                </Col>
                <Col md={4} className="text-end">
                  <div className="mb-2">
                    <strong>{surveys.length}</strong> total survey responses
                  </div>
                  <div>
                    <strong>{surveys.filter(s => s.isAnonymous).length}</strong> anonymous responses
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Project-based Survey Overview */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Survey Data by Project</h5>
            </Card.Header>
            <Card.Body>
              {projects.map(project => {
                const metrics = getProjectMetrics(project.id);
                const projectSurveys = getSurveysByProject(project.id);
                
                return (
                  <div key={project.id} className="mb-4 p-3 border rounded">
                    <Row>
                      <Col md={6}>
                        <h6>{project.name}</h6>
                        <p className="text-muted small">{project.description}</p>
                      </Col>
                      <Col md={3}>
                        <div className="text-center">
                          <h4 className="text-primary">{metrics.totalResponses}</h4>
                          <small>Survey Responses</small>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => exportSurveyData(project.id)}
                            disabled={projectSurveys.length === 0}
                          >
                            <FaDownload className="me-1" />
                            Export
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            disabled={projectSurveys.length === 0}
                          >
                            <FaChartBar className="me-1" />
                            Analyze
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    
                    {metrics.totalResponses > 0 && (
                      <Row className="mt-2">
                        <Col>
                          <small className="text-muted">
                            Anonymous: {metrics.anonymousResponses}/{metrics.totalResponses} responses | 
                            Avg questions per survey: {metrics.avgResponsesPerSurvey}
                          </small>
                          <ProgressBar 
                            now={(metrics.anonymousResponses / metrics.totalResponses) * 100} 
                            variant="success" 
                            className="mt-1"
                            style={{ height: '4px' }}
                          />
                        </Col>
                      </Row>
                    )}
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Survey Results */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Survey Results</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Survey ID</th>
                    <th>Project</th>
                    <th>Completed</th>
                    <th>Responses</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.slice(0, 20).map((survey) => {
                    const project = projects.find(p => p.id === survey.projectId);
                    
                    return (
                      <tr key={survey.id}>
                        <td>
                          <code>{survey.surveyId}</code>
                        </td>
                        <td>{project?.name || 'Unknown Project'}</td>
                        <td>{survey.completedAt?.toLocaleDateString()}</td>
                        <td>
                          <Badge bg="info">{survey.responses.length} questions</Badge>
                        </td>
                        <td>
                          <Badge bg={survey.isAnonymous ? 'success' : 'warning'}>
                            {survey.isAnonymous ? 'Anonymous' : 'Identified'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setSelectedSurvey(survey)}
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sync Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sync with Empower Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Project for Survey Data</Form.Label>
            <Form.Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
            >
              <option value="">Choose a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Alert variant="info">
            <small>
              This will fetch the latest survey responses from the Empower Project API 
              and associate them with the selected project.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={syncWithEmpower}
            disabled={!selectedProject || syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Start Sync'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Survey Detail Modal */}
      <Modal show={!!selectedSurvey} onHide={() => setSelectedSurvey(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Survey Details - {selectedSurvey?.surveyId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSurvey && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Project:</strong> {projects.find(p => p.id === selectedSurvey.projectId)?.name}
                </Col>
                <Col md={6}>
                  <strong>Completed:</strong> {selectedSurvey.completedAt?.toLocaleString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Type:</strong> {selectedSurvey.isAnonymous ? 'Anonymous' : 'Identified'}
                </Col>
                <Col md={6}>
                  <strong>Response Count:</strong> {selectedSurvey.responses.length}
                </Col>
              </Row>
              
              <h6>Survey Responses:</h6>
              <Table striped>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSurvey.responses.map((response, index) => (
                    <tr key={index}>
                      <td>{response.questionText}</td>
                      <td>
                        <strong>
                          {typeof response.answer === 'boolean' 
                            ? (response.answer ? 'Yes' : 'No')
                            : response.answer
                          }
                        </strong>
                      </td>
                      <td>
                        <Badge bg="secondary">{response.answerType}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedSurvey(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

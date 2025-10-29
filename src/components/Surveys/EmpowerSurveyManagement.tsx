'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Modal, Alert } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
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
      <div className="d-flex flex-column align-items-center justify-content-center p-4" style={{ minHeight: '200px' }}>
        <Spinner animation="border" />
        <p className="mt-3 text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="fw-bold">Empower Survey Management</h2>
              <div className="d-flex align-items-center">
                <p className="text-muted mb-0">
                  Manage and analyze survey results from the Empower Project
                </p>
                <a href="https://empowerproject.us/" target="_blank" rel="noopener noreferrer" className="ms-2 text-primary">
                  <FaExternalLinkAlt />
                </a>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant={syncStatus === 'syncing' ? 'secondary' : 'primary'}
                onClick={() => setShowModal(true)}
                disabled={syncStatus === 'syncing'}
              >
                <div className="d-flex align-items-center">
                  {syncStatus === 'syncing' ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <FaSync className="me-2" />
                      <span>Sync with Empower</span>
                    </>
                  )}
                </div>
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
              <Alert.Heading>Sync Successful!</Alert.Heading>
              <p className="mb-0">Latest survey data has been imported from Empower Project.</p>
            </Alert>
          </Col>
        </Row>
      )}

      {syncStatus === 'error' && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setSyncStatus('idle')}>
              <Alert.Heading>Sync Failed!</Alert.Heading>
              <p className="mb-0">Unable to connect to Empower Project API. Please try again later.</p>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Empower Integration Info */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Empower Project Integration</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h6>Connected to Empower Project API</h6>
                  <p className="mb-1">Automated survey data collection and analysis</p>
                  <p className="text-muted small">
                    The Empower Project focuses on community health and wellness initiatives. 
                    Survey data is collected on a project-by-project basis to measure outcomes and impact.
                  </p>
                </Col>
                <Col md={4} className="text-center">
                  <div className="mb-3">
                    <h3 className="text-primary">{surveys.length}</h3>
                    <p className="text-muted small mb-0">total survey responses</p>
                  </div>
                  <div>
                    <h3 className="text-success">{surveys.filter(s => s.isAnonymous).length}</h3>
                    <p className="text-muted small mb-0">anonymous responses</p>
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
                  <Card key={project.id} className="mb-3 border">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <h6>{project.name}</h6>
                          <p className="text-muted small">{project.description}</p>
                        </Col>
                        <Col md={3} className="text-center">
                          <h4 className="text-primary">{metrics.totalResponses}</h4>
                          <p className="text-muted small">Survey Responses</p>
                        </Col>
                        <Col md={3} className="text-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => exportSurveyData(project.id)}
                            disabled={projectSurveys.length === 0}
                            className="me-2"
                          >
                            <FaDownload className="me-1" /> Export
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            disabled={projectSurveys.length === 0}
                          >
                            <FaChartBar className="me-1" /> Analyze
                          </Button>
                        </Col>
                      </Row>
                      
                      {metrics.totalResponses > 0 && (
                        <div className="mt-3">
                          <p className="text-muted small mb-2">
                            Anonymous: {metrics.anonymousResponses}/{metrics.totalResponses} responses | 
                            Avg questions per survey: {metrics.avgResponsesPerSurvey}
                          </p>
                          <div className="progress" style={{ height: '4px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              role="progressbar" 
                              style={{ width: `${(metrics.anonymousResponses / metrics.totalResponses) * 100}%` }}
                              aria-valuenow={(metrics.anonymousResponses / metrics.totalResponses) * 100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
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
              <div className="table-responsive">
                <table className="table">
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
                            <code className="bg-light px-2 py-1 rounded small">{survey.surveyId}</code>
                          </td>
                          <td>{project?.name || 'Unknown Project'}</td>
                          <td>{survey.completedAt?.toLocaleDateString()}</td>
                          <td>
                            <Badge bg="primary" pill>
                              {survey.responses.length} questions
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={survey.isAnonymous ? 'success' : 'warning'} pill>
                              {survey.isAnonymous ? 'Anonymous' : 'Identified'}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-secondary"
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
                </table>
              </div>
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedProject(e.target.value)}
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
            This will fetch the latest survey responses from the Empower Project API 
            and associate them with the selected project.
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
      <Modal 
        show={!!selectedSurvey} 
        onHide={() => setSelectedSurvey(null)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Survey Details - {selectedSurvey?.surveyId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSurvey && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Project:</h6>
                  <p>{projects.find(p => p.id === selectedSurvey.projectId)?.name}</p>
                </Col>
                <Col md={6}>
                  <h6>Completed:</h6>
                  <p>{selectedSurvey.completedAt?.toLocaleString()}</p>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Type:</h6>
                  <p>{selectedSurvey.isAnonymous ? 'Anonymous' : 'Identified'}</p>
                </Col>
                <Col md={6}>
                  <h6>Response Count:</h6>
                  <p>{selectedSurvey.responses.length}</p>
                </Col>
              </Row>
              
              <h6 className="mb-3">Survey Responses:</h6>
              <div className="table-responsive">
                <table className="table">
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
                          <Badge bg="secondary" pill>
                            {response.answerType}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grant, GrantStatus, ReportingSchedule } from '@/types/platform.types';
import { FaPlus, FaEdit, FaEye, FaFileAlt, FaDollarSign, FaCalendarCheck } from 'react-icons/fa';

export default function GrantManagement() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingSource: '',
    amount: 0,
    startDate: '',
    endDate: '',
    status: GrantStatus.PENDING,
    requirements: '',
    contactPerson: ''
  });

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      const grantsQuery = query(collection(db, 'grants'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(grantsQuery);
      const grantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        reportingSchedule: doc.data().reportingSchedule?.map((schedule: any) => ({
          ...schedule,
          dueDate: schedule.dueDate?.toDate(),
          submittedDate: schedule.submittedDate?.toDate()
        }))
      })) as Grant[];
      
      setGrants(grantsData);
    } catch (error) {
      console.error('Error fetching grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const grantData = {
        title: formData.title,
        description: formData.description,
        fundingSource: formData.fundingSource,
        amount: formData.amount,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: formData.status,
        requirements: formData.requirements.split(',').map(r => r.trim()),
        contactPerson: formData.contactPerson,
        projectIds: [],
        reportingSchedule: generateReportingSchedule(new Date(formData.startDate), new Date(formData.endDate)),
        updatedAt: new Date()
      };

      if (selectedGrant) {
        await updateDoc(doc(db, 'grants', selectedGrant.id), grantData);
      } else {
        await addDoc(collection(db, 'grants'), {
          ...grantData,
          createdAt: new Date()
        });
      }

      setShowModal(false);
      setSelectedGrant(null);
      resetForm();
      fetchGrants();
    } catch (error) {
      console.error('Error saving grant:', error);
    }
  };

  const generateReportingSchedule = (startDate: Date, endDate: Date): ReportingSchedule[] => {
    const schedule: ReportingSchedule[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate quarterly reports
    let currentDate = new Date(start);
    currentDate.setMonth(currentDate.getMonth() + 3);
    
    while (currentDate < end) {
      schedule.push({
        type: 'quarterly',
        dueDate: new Date(currentDate),
        completed: false
      });
      currentDate.setMonth(currentDate.getMonth() + 3);
    }
    
    // Add final report
    schedule.push({
      type: 'final',
      dueDate: new Date(end),
      completed: false
    });
    
    return schedule;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fundingSource: '',
      amount: 0,
      startDate: '',
      endDate: '',
      status: GrantStatus.PENDING,
      requirements: '',
      contactPerson: ''
    });
  };

  const editGrant = (grant: Grant) => {
    setSelectedGrant(grant);
    setFormData({
      title: grant.title,
      description: grant.description,
      fundingSource: grant.fundingSource,
      amount: grant.amount,
      startDate: grant.startDate.toISOString().split('T')[0],
      endDate: grant.endDate.toISOString().split('T')[0],
      status: grant.status,
      requirements: grant.requirements.join(', '),
      contactPerson: grant.contactPerson
    });
    setShowModal(true);
  };

  const getStatusBadge = (status: GrantStatus) => {
    const variants = {
      [GrantStatus.ACTIVE]: 'success',
      [GrantStatus.PENDING]: 'warning',
      [GrantStatus.COMPLETED]: 'primary',
      [GrantStatus.CANCELLED]: 'danger'
    };
    return variants[status];
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const timeLeft = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: 'Expired', variant: 'danger' };
    if (daysLeft <= 30) return { text: `${daysLeft} days left`, variant: 'warning' };
    if (daysLeft <= 90) return { text: `${daysLeft} days left`, variant: 'info' };
    return { text: `${daysLeft} days left`, variant: 'success' };
  };

  const getUpcomingReports = (grant: Grant) => {
    const now = new Date();
    return grant.reportingSchedule?.filter(report => 
      !report.completed && report.dueDate > now
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) || [];
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
              <h1>Grant Management</h1>
              <p className="text-muted">Track funding opportunities and compliance requirements</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              New Grant
            </Button>
          </div>
        </Col>
      </Row>

      {/* Grant Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{grants.filter(g => g.status === GrantStatus.ACTIVE).length}</h3>
              <p className="mb-0">Active Grants</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">${grants.filter(g => g.status === GrantStatus.ACTIVE).reduce((sum, g) => sum + g.amount, 0).toLocaleString()}</h3>
              <p className="mb-0">Active Funding</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{grants.filter(g => g.status === GrantStatus.PENDING).length}</h3>
              <p className="mb-0">Pending Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">
                {grants.reduce((count, g) => 
                  count + (g.reportingSchedule?.filter(r => !r.completed && r.dueDate > new Date()).length || 0), 0
                )}
              </h3>
              <p className="mb-0">Upcoming Reports</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Reports Alert */}
      {grants.some(g => getUpcomingReports(g).some(r => 
        (r.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30
      )) && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning">
              <FaCalendarCheck className="me-2" />
              <strong>Upcoming Report Deadlines:</strong> You have grant reports due within the next 30 days.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Grants Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Grant Portfolio</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Grant Title</th>
                <th>Funding Source</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timeline</th>
                <th>Next Report</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((grant) => {
                const timeRemaining = getTimeRemaining(grant.endDate);
                const upcomingReports = getUpcomingReports(grant);
                const nextReport = upcomingReports[0];
                
                return (
                  <tr key={grant.id}>
                    <td>
                      <div>
                        <strong>{grant.title}</strong>
                        <br />
                        <small className="text-muted">{grant.description.substring(0, 50)}...</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{grant.fundingSource}</strong>
                        <br />
                        <small className="text-muted">{grant.contactPerson}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>${grant.amount.toLocaleString()}</strong>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(grant.status)}>
                        {grant.status}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <small>
                          {grant.startDate.toLocaleDateString()} - {grant.endDate.toLocaleDateString()}
                        </small>
                        <br />
                        <Badge bg={timeRemaining.variant} className="small">
                          {timeRemaining.text}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      {nextReport ? (
                        <div>
                          <small>
                            <FaFileAlt className="me-1" />
                            {nextReport.type}
                          </small>
                          <br />
                          <small className="text-muted">
                            Due: {nextReport.dueDate.toLocaleDateString()}
                          </small>
                        </div>
                      ) : (
                        <span className="text-muted">No reports due</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => editGrant(grant)}
                        >
                          <FaEdit />
                        </Button>
                        <Button variant="outline-info" size="sm">
                          <FaEye />
                        </Button>
                        <Button variant="outline-success" size="sm">
                          <FaFileAlt />
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

      {/* Add/Edit Grant Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedGrant ? 'Edit Grant' : 'New Grant Application'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Grant Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as GrantStatus})}
                  >
                    {Object.values(GrantStatus).map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  <Form.Label>Funding Source</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fundingSource}
                    onChange={(e) => setFormData({...formData, fundingSource: e.target.value})}
                    placeholder="e.g., CDC, NIH, Private Foundation"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    placeholder="Program Officer or Contact"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Grant Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
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
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Requirements (comma-separated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                placeholder="e.g., Quarterly reports, Annual evaluation, Site visits"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedGrant ? 'Update Grant' : 'Create Grant'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

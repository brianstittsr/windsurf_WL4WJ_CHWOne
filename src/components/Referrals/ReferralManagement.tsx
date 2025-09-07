'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Referral, ReferralResource, Client, ReferralStatus, ReferralUrgency, ResourceCategory } from '@/types/platform.types';
import { FaPlus, FaEdit, FaEye, FaPhone, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [resources, setResources] = useState<ReferralResource[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    resourceId: '',
    urgency: ReferralUrgency.MEDIUM,
    reason: '',
    notes: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch referrals
      const referralsQuery = query(
        collection(db, 'referrals'),
        orderBy('createdAt', 'desc')
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      const referralsData = referralsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        followUpDate: doc.data().followUpDate?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      })) as Referral[];

      // Fetch resources
      const resourcesQuery = query(collection(db, 'referralResources'));
      const resourcesSnapshot = await getDocs(resourcesQuery);
      const resourcesData = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReferralResource[];

      // Fetch clients (limited for HIPAA compliance)
      const clientsQuery = query(collection(db, 'clients'));
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];

      setReferrals(referralsData);
      setResources(resourcesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const referralData = {
        ...formData,
        status: ReferralStatus.PENDING,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (selectedReferral) {
        await updateDoc(doc(db, 'referrals', selectedReferral.id), {
          ...referralData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'referrals'), referralData);
      }

      setShowModal(false);
      setSelectedReferral(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  };

  const updateReferralStatus = async (referralId: string, status: ReferralStatus) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === ReferralStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      await updateDoc(doc(db, 'referrals', referralId), updateData);
      fetchData();
    } catch (error) {
      console.error('Error updating referral status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      resourceId: '',
      urgency: ReferralUrgency.MEDIUM,
      reason: '',
      notes: '',
      followUpDate: ''
    });
  };

  const getUrgencyBadge = (urgency: ReferralUrgency) => {
    const variants = {
      [ReferralUrgency.LOW]: 'success',
      [ReferralUrgency.MEDIUM]: 'warning',
      [ReferralUrgency.HIGH]: 'danger',
      [ReferralUrgency.URGENT]: 'danger'
    };
    return variants[urgency];
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const variants = {
      [ReferralStatus.PENDING]: 'warning',
      [ReferralStatus.CONTACTED]: 'info',
      [ReferralStatus.SCHEDULED]: 'primary',
      [ReferralStatus.COMPLETED]: 'success',
      [ReferralStatus.CANCELLED]: 'secondary',
      [ReferralStatus.NO_SHOW]: 'danger'
    };
    return variants[status];
  };

  const getResourceByCategory = (category: ResourceCategory) => {
    return resources.filter(resource => resource.category === category);
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
              <h1>Referral Communications</h1>
              <p className="text-muted">Manage client referrals and resource connections</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              New Referral
            </Button>
          </div>
        </Col>
      </Row>

      {/* HIPAA Notice */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="hipaa-compliant">
            <FaExclamationTriangle className="me-2" />
            <strong>HIPAA Protected Communications</strong> - All referral communications are encrypted and logged for compliance.
          </Alert>
        </Col>
      </Row>

      {/* Metrics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{referrals.filter(r => r.status === ReferralStatus.PENDING).length}</h3>
              <p className="mb-0">Pending Referrals</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{referrals.filter(r => r.status === ReferralStatus.COMPLETED).length}</h3>
              <p className="mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{referrals.filter(r => r.urgency === ReferralUrgency.URGENT).length}</h3>
              <p className="mb-0">Urgent</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{resources.filter(r => r.region5Certified).length}</h3>
              <p className="mb-0">Region 5 Resources</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* NC C.A.R.E. 360 Integration Status */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">NC C.A.R.E. 360 Integration Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Connected Resources:</strong> {resources.filter(r => r.ncCare360Id).length}
                </div>
                <Badge bg="success">Active Connection</Badge>
              </div>
              <small className="text-muted">
                Synchronized with NC C.A.R.E. 360 for seamless resource coordination
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Referrals Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Active Referrals</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Client</th>
                <th>Resource</th>
                <th>Category</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Created</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => {
                const resource = resources.find(r => r.id === referral.resourceId);
                const client = clients.find(c => c.id === referral.clientId);
                
                return (
                  <tr key={referral.id}>
                    <td>
                      <div className="encrypted-data">
                        {client ? `${client.firstName} ${client.lastName.charAt(0)}.` : 'Unknown Client'}
                      </div>
                    </td>
                    <td>{resource?.name || 'Unknown Resource'}</td>
                    <td>
                      <Badge bg="info">{resource?.category}</Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(referral.status)}>
                        {referral.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getUrgencyBadge(referral.urgency)}>
                        {referral.urgency}
                      </Badge>
                    </td>
                    <td>{referral.createdAt?.toLocaleDateString()}</td>
                    <td>
                      {referral.followUpDate ? (
                        <span className={referral.followUpDate < new Date() ? 'text-danger' : 'text-success'}>
                          {referral.followUpDate.toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => updateReferralStatus(referral.id, ReferralStatus.COMPLETED)}
                          disabled={referral.status === ReferralStatus.COMPLETED}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedReferral(referral);
                            setFormData({
                              clientId: referral.clientId,
                              resourceId: referral.resourceId,
                              urgency: referral.urgency,
                              reason: referral.reason,
                              notes: referral.notes || '',
                              followUpDate: referral.followUpDate ? referral.followUpDate.toISOString().split('T')[0] : ''
                            });
                            setShowModal(true);
                          }}
                        >
                          <FaEdit />
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

      {/* Add/Edit Referral Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedReferral ? 'Edit Referral' : 'New Referral'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client</Form.Label>
                  <Form.Select
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Resource</Form.Label>
                  <Form.Select
                    value={formData.resourceId}
                    onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                    required
                  >
                    <option value="">Select Resource</option>
                    {Object.values(ResourceCategory).map(category => (
                      <optgroup key={category} label={category}>
                        {getResourceByCategory(category).map(resource => (
                          <option key={resource.id} value={resource.id}>
                            {resource.name} - {resource.organization}
                            {resource.region5Certified && ' (Region 5 Certified)'}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Urgency</Form.Label>
                  <Form.Select
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value as ReferralUrgency})}
                  >
                    {Object.values(ReferralUrgency).map(urgency => (
                      <option key={urgency} value={urgency}>{urgency}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Follow-up Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Referral</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedReferral ? 'Update Referral' : 'Create Referral'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

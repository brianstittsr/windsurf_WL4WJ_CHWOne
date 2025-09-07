'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunityHealthWorker, UserRole } from '@/types/platform.types';
import { FaPlus, FaEdit, FaEye, FaCertificate } from 'react-icons/fa';

export default function CHWManagement() {
  const [chws, setCHWs] = useState<CommunityHealthWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCHW, setSelectedCHW] = useState<CommunityHealthWorker | null>(null);
  const [formData, setFormData] = useState({
    certificationNumber: '',
    certificationDate: '',
    expirationDate: '',
    specializations: '',
    region: '',
    serviceArea: '',
    languages: '',
    maxCaseLoad: 25,
    supervisor: ''
  });

  useEffect(() => {
    fetchCHWs();
  }, []);

  const fetchCHWs = async () => {
    try {
      // Check if we're in test mode (bypass Firebase)
      const isTestMode = process.env.NODE_ENV === 'development' && 
                         process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

      if (isTestMode) {
        // Use mock CHW data in test mode
        const mockCHWs: CommunityHealthWorker[] = [
          {
            id: 'chw-1',
            userId: 'user-chw-1',
            certificationNumber: 'CHW-2024-001',
            certificationDate: new Date('2024-01-15'),
            expirationDate: new Date('2026-01-15'),
            specializations: ['Maternal Health', 'Diabetes Management'],
            region: 'Charlotte Metro',
            serviceArea: ['Mecklenburg County', 'Union County'],
            languages: ['English', 'Spanish'],
            maxCaseLoad: 25,
            caseLoad: 18,
            supervisor: 'Sarah Johnson',
            isActive: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          },
          {
            id: 'chw-2',
            userId: 'user-chw-2',
            certificationNumber: 'CHW-2024-002',
            certificationDate: new Date('2024-02-01'),
            expirationDate: new Date('2026-02-01'),
            specializations: ['Mental Health', 'Substance Abuse'],
            region: 'Charlotte Metro',
            serviceArea: ['Gaston County'],
            languages: ['English'],
            maxCaseLoad: 20,
            caseLoad: 15,
            supervisor: 'Sarah Johnson',
            isActive: true,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01')
          }
        ];
        setCHWs(mockCHWs);
        setLoading(false);
        return;
      }

      const chwQuery = query(collection(db, 'communityHealthWorkers'));
      const snapshot = await getDocs(chwQuery);
      const chwData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityHealthWorker[];
      setCHWs(chwData);
    } catch (error) {
      console.error('Error fetching CHWs:', error);
      // Set empty array on error
      setCHWs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if we're in test mode (bypass Firebase)
      const isTestMode = process.env.NODE_ENV === 'development' && 
                         process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

      if (isTestMode) {
        // In test mode, just close modal and refresh
        setShowModal(false);
        setSelectedCHW(null);
        resetForm();
        fetchCHWs();
        return;
      }

      const chwData = {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim()),
        serviceArea: formData.serviceArea.split(',').map(s => s.trim()),
        languages: formData.languages.split(',').map(s => s.trim()),
        certificationDate: new Date(formData.certificationDate),
        expirationDate: new Date(formData.expirationDate),
        isActive: true,
        caseLoad: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (selectedCHW) {
        await updateDoc(doc(db, 'communityHealthWorkers', selectedCHW.id), chwData);
      } else {
        await addDoc(collection(db, 'communityHealthWorkers'), chwData);
      }

      setShowModal(false);
      setSelectedCHW(null);
      resetForm();
      fetchCHWs();
    } catch (error) {
      console.error('Error saving CHW:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      certificationNumber: '',
      certificationDate: '',
      expirationDate: '',
      specializations: '',
      region: '',
      serviceArea: '',
      languages: '',
      maxCaseLoad: 25,
      supervisor: ''
    });
  };

  const editCHW = (chw: CommunityHealthWorker) => {
    setSelectedCHW(chw);
    setFormData({
      certificationNumber: chw.certificationNumber,
      certificationDate: chw.certificationDate.toISOString().split('T')[0],
      expirationDate: chw.expirationDate.toISOString().split('T')[0],
      specializations: chw.specializations.join(', '),
      region: chw.region,
      serviceArea: chw.serviceArea.join(', '),
      languages: chw.languages.join(', '),
      maxCaseLoad: chw.maxCaseLoad,
      supervisor: chw.supervisor || ''
    });
    setShowModal(true);
  };

  const getCertificationStatus = (expirationDate: Date) => {
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return { status: 'expired', variant: 'danger' };
    if (daysUntilExpiration <= 30) return { status: 'expiring soon', variant: 'warning' };
    return { status: 'active', variant: 'success' };
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
              <h1>Community Health Workers</h1>
              <p className="text-muted">Manage CHW certifications, assignments, and case loads</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              Add CHW
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{chws.filter(chw => chw.isActive).length}</h3>
              <p className="mb-0">Active CHWs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{chws.filter(chw => {
                const status = getCertificationStatus(chw.expirationDate);
                return status.status === 'expiring soon';
              }).length}</h3>
              <p className="mb-0">Expiring Soon</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{chws.reduce((sum, chw) => sum + chw.caseLoad, 0)}</h3>
              <p className="mb-0">Total Cases</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{new Set(chws.map(chw => chw.region)).size}</h3>
              <p className="mb-0">Regions Covered</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">CHW Directory</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Certification #</th>
                <th>Region</th>
                <th>Specializations</th>
                <th>Case Load</th>
                <th>Certification Status</th>
                <th>Languages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chws.map((chw) => {
                const certStatus = getCertificationStatus(chw.expirationDate);
                return (
                  <tr key={chw.id}>
                    <td>
                      <strong>{chw.certificationNumber}</strong>
                      {!chw.isActive && <Badge bg="secondary" className="ms-2">Inactive</Badge>}
                    </td>
                    <td>{chw.region}</td>
                    <td>
                      {chw.specializations.slice(0, 2).map(spec => (
                        <Badge key={spec} bg="info" className="me-1">{spec}</Badge>
                      ))}
                      {chw.specializations.length > 2 && (
                        <Badge bg="light" text="dark">+{chw.specializations.length - 2}</Badge>
                      )}
                    </td>
                    <td>
                      <span className={chw.caseLoad >= chw.maxCaseLoad ? 'text-danger' : 'text-success'}>
                        {chw.caseLoad}/{chw.maxCaseLoad}
                      </span>
                    </td>
                    <td>
                      <Badge bg={certStatus.variant}>
                        <FaCertificate className="me-1" />
                        {certStatus.status}
                      </Badge>
                    </td>
                    <td>{chw.languages.join(', ')}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => editCHW(chw)}
                      >
                        <FaEdit />
                      </Button>
                      <Button variant="outline-info" size="sm">
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

      {/* Add/Edit CHW Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedCHW ? 'Edit CHW' : 'Add New CHW'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Certification Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.certificationNumber}
                    onChange={(e) => setFormData({...formData, certificationNumber: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Region</Form.Label>
                  <Form.Select
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    required
                  >
                    <option value="">Select Region</option>
                    <option value="Region 1">Region 1</option>
                    <option value="Region 2">Region 2</option>
                    <option value="Region 3">Region 3</option>
                    <option value="Region 4">Region 4</option>
                    <option value="Region 5">Region 5</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Certification Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.certificationDate}
                    onChange={(e) => setFormData({...formData, certificationDate: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiration Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Specializations (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.specializations}
                onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                placeholder="e.g., Diabetes Care, Mental Health, Maternal Health"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Service Areas (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.serviceArea}
                onChange={(e) => setFormData({...formData, serviceArea: e.target.value})}
                placeholder="e.g., Durham County, Wake County"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Languages (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    placeholder="e.g., English, Spanish, French"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Case Load</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxCaseLoad}
                    onChange={(e) => setFormData({...formData, maxCaseLoad: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedCHW ? 'Update CHW' : 'Add CHW'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

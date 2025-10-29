'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { ReferralResource, ResourceCategory, ContactInfo, ServiceHours, Address } from '@/types/platform.types';
import { FaPlus, FaEdit, FaEye, FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaSearch, FaCertificate } from 'react-icons/fa';

export default function Region5Directory() {
  const [resources, setResources] = useState<ReferralResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<ReferralResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ReferralResource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | ''>('');
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    category: ResourceCategory.HEALTHCARE,
    description: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    state: 'NC',
    zipCode: '',
    county: '',
    servicesOffered: '',
    eligibilityCriteria: '',
    serviceHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
      notes: ''
    },
    region5Certified: false,
    ncCare360Id: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory]);

  const fetchResources = async () => {
    try {
      const resourcesQuery = query(
        collection(db, 'referralResources'),
        orderBy('name')
      );
      const snapshot = await getDocs(resourcesQuery);
      const resourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ReferralResource[];
      
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.servicesOffered.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resourceData = {
        name: formData.name,
        organization: formData.organization,
        category: formData.category,
        description: formData.description,
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        } as ContactInfo,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          county: formData.county
        } as Address,
        serviceHours: formData.serviceHours as ServiceHours,
        servicesOffered: formData.servicesOffered.split(',').map(s => s.trim()),
        eligibilityCriteria: formData.eligibilityCriteria.split(',').map(s => s.trim()),
        isActive: true,
        region5Certified: formData.region5Certified,
        ncCare360Id: formData.ncCare360Id || undefined,
        updatedAt: new Date()
      };

      if (selectedResource) {
        await updateDoc(doc(db, 'referralResources', selectedResource.id), resourceData);
      } else {
        await addDoc(collection(db, 'referralResources'), {
          ...resourceData,
          createdAt: new Date()
        });
      }

      setShowModal(false);
      setSelectedResource(null);
      resetForm();
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      organization: '',
      category: ResourceCategory.HEALTHCARE,
      description: '',
      phone: '',
      email: '',
      website: '',
      street: '',
      city: '',
      state: 'NC',
      zipCode: '',
      county: '',
      servicesOffered: '',
      eligibilityCriteria: '',
      serviceHours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
        notes: ''
      },
      region5Certified: false,
      ncCare360Id: ''
    });
  };

  const editResource = (resource: ReferralResource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      organization: resource.organization,
      category: resource.category,
      description: resource.description,
      phone: resource.contactInfo.phone,
      email: resource.contactInfo.email || '',
      website: resource.contactInfo.website || '',
      street: resource.address.street,
      city: resource.address.city,
      state: resource.address.state,
      zipCode: resource.address.zipCode,
      county: resource.address.county,
      servicesOffered: resource.servicesOffered.join(', '),
      eligibilityCriteria: resource.eligibilityCriteria.join(', '),
      serviceHours: {
        monday: resource.serviceHours.monday || '',
        tuesday: resource.serviceHours.tuesday || '',
        wednesday: resource.serviceHours.wednesday || '',
        thursday: resource.serviceHours.thursday || '',
        friday: resource.serviceHours.friday || '',
        saturday: resource.serviceHours.saturday || '',
        sunday: resource.serviceHours.sunday || '',
        notes: resource.serviceHours.notes || ''
      },
      region5Certified: resource.region5Certified,
      ncCare360Id: resource.ncCare360Id || ''
    });
    setShowModal(true);
  };

  const getCategoryColor = (category: ResourceCategory) => {
    const colors = {
      [ResourceCategory.HEALTHCARE]: 'primary',
      [ResourceCategory.MENTAL_HEALTH]: 'success',
      [ResourceCategory.HOUSING]: 'warning',
      [ResourceCategory.FOOD_ASSISTANCE]: 'info',
      [ResourceCategory.TRANSPORTATION]: 'secondary',
      [ResourceCategory.EMPLOYMENT]: 'dark',
      [ResourceCategory.EDUCATION]: 'light',
      [ResourceCategory.CHILDCARE]: 'danger',
      [ResourceCategory.LEGAL_SERVICES]: 'primary',
      [ResourceCategory.FINANCIAL_ASSISTANCE]: 'success'
    };
    return colors[category] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <p className="text-muted">Loading resources...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>NC CHW Association Region 5 Resource Directory</h1>
              <p className="text-muted">
                Comprehensive resource directory for community health workers in Region 5
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" /> Add Resource
            </Button>
          </div>
        </Col>
      </Row>

      {/* NC C.A.R.E. 360 Integration Notice */}
      <Row className="mb-4">
        <Col>
          <div className="alert alert-success">
            <div className="d-flex align-items-center">
              <FaCertificate className="me-2" />
              <strong>NC C.A.R.E. 360 Integration Active</strong>
              <span className="ms-2">- Resources are synchronized with the statewide coordinated care network.</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Search resources, organizations, or services..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value as ResourceCategory | '')}
          >
            <option value="">All Categories</option>
            {Object.values(ResourceCategory).map(category => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2} className="d-flex align-items-center">
          <strong>{filteredResources.length}</strong>
          <span className="ms-1 text-muted">resources found</span>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-success">{resources.filter(r => r.region5Certified).length}</h2>
              <p className="mb-0">Region 5 Certified</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-info">{resources.filter(r => r.ncCare360Id).length}</h2>
              <p className="mb-0">NC C.A.R.E. 360 Connected</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-primary">{new Set(resources.map(r => r.address.county)).size}</h2>
              <p className="mb-0">Counties Covered</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h2 className="text-warning">{Object.values(ResourceCategory).length}</h2>
              <p className="mb-0">Service Categories</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resources Grid */}
      <Row className="g-4">
        {filteredResources.map((resource) => (
          <Col key={resource.id} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              {/* Card Header */}
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Badge bg={getCategoryColor(resource.category)}>
                  {resource.category.replace(/_/g, ' ')}
                </Badge>
                <div>
                  {resource.region5Certified && (
                    <Badge bg="success" className="me-1">Region 5</Badge>
                  )}
                  {resource.ncCare360Id && (
                    <Badge bg="info">NC C.A.R.E. 360</Badge>
                  )}
                </div>
              </Card.Header>

              {/* Card Body */}
              <Card.Body>
                <h5>{resource.name}</h5>
                <p className="text-muted small">{resource.organization}</p>
                <p>{resource.description}</p>
                
                <div className="d-flex align-items-center text-muted small mb-3">
                  <FaMapMarkerAlt className="me-1" />
                  {resource.address.city}, {resource.address.county} County
                </div>

                <div className="d-flex flex-wrap gap-1 mb-2">
                  {resource.servicesOffered.slice(0, 3).map(service => (
                    <Badge key={service} bg="secondary" className="text-wrap">{service}</Badge>
                  ))}
                  {resource.servicesOffered.length > 3 && (
                    <Badge bg="dark">+{resource.servicesOffered.length - 3} more</Badge>
                  )}
                </div>
              </Card.Body>

              {/* Card Footer */}
              <Card.Footer className="d-flex justify-content-between">
                <div>
                  {resource.contactInfo.phone && (
                    <Button variant="outline-secondary" size="sm" className="me-1">
                      <FaPhone />
                    </Button>
                  )}
                  {resource.contactInfo.email && (
                    <Button variant="outline-secondary" size="sm" className="me-1">
                      <FaEnvelope />
                    </Button>
                  )}
                  {resource.contactInfo.website && (
                    <Button variant="outline-secondary" size="sm">
                      <FaGlobe />
                    </Button>
                  )}
                </div>
                <div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-1"
                    onClick={() => editResource(resource)}
                  >
                    <FaEdit />
                  </Button>
                  <Button variant="outline-primary" size="sm">
                    <FaEye />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Resource Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedResource ? 'Edit Resource' : 'Add New Resource'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Resource Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Organization</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.organization}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, organization: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, category: e.target.value as ResourceCategory})}
                  >
                    {Object.values(ResourceCategory).map(category => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>County</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.county}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, county: e.target.value})}
                    placeholder="e.g., Wake County"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.website}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, website: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.street}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, street: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.zipCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, zipCode: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Services Offered (comma-separated)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.servicesOffered}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, servicesOffered: e.target.value})}
                    placeholder="e.g., Primary Care, Preventive Services, Health Education"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Eligibility Criteria (comma-separated)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.eligibilityCriteria}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, eligibilityCriteria: e.target.value})}
                    placeholder="e.g., Uninsured, Low Income, Medicaid Accepted"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="region5-certified"
                  label="Region 5 Certified Resource"
                  checked={formData.region5Certified}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, region5Certified: e.target.checked})}
                />
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>NC C.A.R.E. 360 ID (if applicable)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ncCare360Id}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, ncCare360Id: e.target.value})}
                    placeholder="NC C.A.R.E. 360 Resource ID"
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
              {selectedResource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

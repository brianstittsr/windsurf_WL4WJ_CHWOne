'use client';

import React, { useState, useEffect } from 'react';
import { Flex, Row, Column, Card, Button, Text, Input, Textarea } from '@once-ui-system/core';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
      serviceHours: resource.serviceHours,
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
      <Flex style={{ padding: '24px', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Text variant="body-default-m">Loading resources...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="xl" style={{ padding: '24px' }}>
      <Row>
        <Column>
          <Flex style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Flex direction="column" gap="s">
              <Text variant="display-strong-s">NC CHW Association Region 5 Resource Directory</Text>
              <Text variant="body-default-m" style={{ color: 'var(--neutral-medium)' }}>Comprehensive resource directory for community health workers in Region 5</Text>
            </Flex>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Flex style={{ alignItems: 'center', gap: '8px' }}>
                <FaPlus />
                Add Resource
              </Flex>
            </Button>
          </Flex>
        </Column>
      </Row>

      {/* NC C.A.R.E. 360 Integration Notice */}
      <Row>
        <Column>
          <Card style={{ backgroundColor: 'var(--success-light)', padding: '16px', border: '1px solid var(--success)' }}>
            <Flex style={{ alignItems: 'center', gap: '8px' }}>
              <FaCertificate style={{ color: 'var(--success)' }} />
              <Text variant="body-strong-m" style={{ color: 'var(--success)' }}>NC C.A.R.E. 360 Integration Active</Text>
              <Text variant="body-default-m"> - Resources are synchronized with the statewide coordinated care network.</Text>
            </Flex>
          </Card>
        </Column>
      </Row>

      {/* Search and Filter */}
      <Row gap="m">
        <Column width={6}>
          <Flex style={{ alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--neutral-border)', borderRadius: '8px' }}>
            <FaSearch style={{ color: 'var(--neutral-medium)' }} />
            <Input
              id="search-resources"
              type="text"
              placeholder="Search resources, organizations, or services..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none' }}
            />
          </Flex>
        </Column>
        <Column width={4}>
          <select
            value={selectedCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value as ResourceCategory | '')}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--neutral-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--neutral-light)',
              color: 'var(--neutral-dark)'
            }}
          >
            <option value="">All Categories</option>
            {Object.values(ResourceCategory).map(category => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </Column>
        <Column width={2}>
          <Flex style={{ justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
            <Text variant="body-strong-m">{filteredResources.length}</Text>
            <Text variant="body-default-s" style={{ color: 'var(--neutral-medium)' }}> resources found</Text>
          </Flex>
        </Column>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{resources.filter(r => r.region5Certified).length}</h3>
              <p className="mb-0">Region 5 Certified</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{resources.filter(r => r.ncCare360Id).length}</h3>
              <p className="mb-0">NC C.A.R.E. 360 Connected</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{new Set(resources.map(r => r.address.county)).size}</h3>
              <p className="mb-0">Counties Covered</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{Object.values(ResourceCategory).length}</h3>
              <p className="mb-0">Service Categories</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resources Grid */}
      <Row>
        {filteredResources.map((resource) => (
          <Col key={resource.id} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Badge bg={getCategoryColor(resource.category)}>
                  {resource.category.replace(/_/g, ' ')}
                </Badge>
                <div>
                  {resource.region5Certified && (
                    <Badge bg="success" className="region5-certified me-1">
                      Region 5
                    </Badge>
                  )}
                  {resource.ncCare360Id && (
                    <Badge bg="info">NC C.A.R.E. 360</Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <Card.Title className="h6">{resource.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{resource.organization}</Card.Subtitle>
                <Card.Text className="small">{resource.description}</Card.Text>
                
                <div className="mb-2">
                  <small className="text-muted">
                    <FaMapMarkerAlt className="me-1" />
                    {resource.address.city}, {resource.address.county} County
                  </small>
                </div>

                <div className="mb-2">
                  {resource.servicesOffered.slice(0, 3).map(service => (
                    <Badge key={service} bg="light" text="dark" className="me-1 mb-1">
                      {service}
                    </Badge>
                  ))}
                  {resource.servicesOffered.length > 3 && (
                    <Badge bg="secondary">+{resource.servicesOffered.length - 3} more</Badge>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {resource.contactInfo.phone && (
                      <Button variant="outline-primary" size="sm" className="me-1">
                        <FaPhone />
                      </Button>
                    )}
                    {resource.contactInfo.email && (
                      <Button variant="outline-success" size="sm" className="me-1">
                        <FaEnvelope />
                      </Button>
                    )}
                    {resource.contactInfo.website && (
                      <Button variant="outline-info" size="sm">
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
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Resource Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{selectedResource ? 'Edit Resource' : 'Add New Resource'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Resource Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as ResourceCategory})}
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
                    onChange={(e) => setFormData({...formData, county: e.target.value})}
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
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Services Offered (comma-separated)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.servicesOffered}
                    onChange={(e) => setFormData({...formData, servicesOffered: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, eligibilityCriteria: e.target.value})}
                    placeholder="e.g., Uninsured, Low Income, Medicaid Accepted"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Region 5 Certified Resource"
                  checked={formData.region5Certified}
                  onChange={(e) => setFormData({...formData, region5Certified: e.target.checked})}
                />
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>NC C.A.R.E. 360 ID (if applicable)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ncCare360Id}
                    onChange={(e) => setFormData({...formData, ncCare360Id: e.target.value})}
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

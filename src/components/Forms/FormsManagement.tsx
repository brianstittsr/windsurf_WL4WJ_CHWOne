'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { FaPlus, FaEdit, FaEye, FaTrash, FaUpload, FaDownload, FaFileExcel, FaWpforms } from 'react-icons/fa';

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  options?: string[];
  validation?: string;
}

interface CustomForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  submissions: number;
  createdBy: string;
}

export default function FormsManagement() {
  const { currentUser } = useAuth();
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'upload'>('create');
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: [] as FormField[]
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      // Check if we're in test mode
      const isTestMode = process.env.NODE_ENV === 'development' && 
                         process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

      if (isTestMode) {
        // Mock forms data
        const mockForms: CustomForm[] = [
          {
            id: 'form-1',
            name: 'Patient Intake Form',
            description: 'Initial patient registration and health assessment',
            fields: [
              { id: 'f1', name: 'firstName', type: 'text', label: 'First Name', required: true },
              { id: 'f2', name: 'lastName', type: 'text', label: 'Last Name', required: true },
              { id: 'f3', name: 'email', type: 'email', label: 'Email Address', required: true },
              { id: 'f4', name: 'phone', type: 'text', label: 'Phone Number', required: true },
              { id: 'f5', name: 'birthDate', type: 'date', label: 'Date of Birth', required: true },
              { id: 'f6', name: 'insurance', type: 'select', label: 'Insurance Provider', required: false, options: ['Medicaid', 'Medicare', 'Private', 'Uninsured'] }
            ],
            isActive: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            submissions: 45,
            createdBy: currentUser?.uid || 'admin'
          },
          {
            id: 'form-2',
            name: 'Community Health Survey',
            description: 'Quarterly community health needs assessment',
            fields: [
              { id: 'f7', name: 'zipCode', type: 'text', label: 'ZIP Code', required: true },
              { id: 'f8', name: 'householdSize', type: 'number', label: 'Household Size', required: true },
              { id: 'f9', name: 'healthConcerns', type: 'checkbox', label: 'Health Concerns', required: false, options: ['Diabetes', 'Hypertension', 'Mental Health', 'Substance Abuse'] },
              { id: 'f10', name: 'accessBarriers', type: 'textarea', label: 'Healthcare Access Barriers', required: false }
            ],
            isActive: true,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01'),
            submissions: 23,
            createdBy: currentUser?.uid || 'admin'
          }
        ];
        setForms(mockForms);
        setLoading(false);
        return;
      }

      // In production, fetch from Firebase
      setForms([]);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    setModalType('create');
    setSelectedForm(null);
    setFormData({ name: '', description: '', fields: [] });
    setShowModal(true);
  };

  const handleEditForm = (form: CustomForm) => {
    setModalType('edit');
    setSelectedForm(form);
    setFormData({
      name: form.name,
      description: form.description,
      fields: form.fields
    });
    setShowModal(true);
  };

  const handleViewForm = (form: CustomForm) => {
    setModalType('view');
    setSelectedForm(form);
    setShowModal(true);
  };

  const handleUploadCSV = () => {
    setModalType('upload');
    setCsvFile(null);
    setShowModal(true);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const processCSVFile = async () => {
    if (!csvFile) return;

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const fields: FormField[] = headers.map((header, index) => ({
        id: `field-${Date.now()}-${index}`,
        name: header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        type: 'text',
        label: header,
        required: false
      }));

      const newForm: CustomForm = {
        id: `form-${Date.now()}`,
        name: `Form from ${csvFile.name.replace('.csv', '')}`,
        description: `Auto-generated form from CSV file: ${csvFile.name}`,
        fields,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        submissions: 0,
        createdBy: currentUser?.uid || 'admin'
      };

      // Add the new form to the existing forms list
      setForms(prevForms => [...prevForms, newForm]);
      
      // Close the upload modal
      setShowModal(false);
      setCsvFile(null);
      
      // Show success message
      alert(`Form "${newForm.name}" created successfully with ${fields.length} fields!`);
      
    } catch (error) {
      console.error('Error processing CSV file:', error);
      alert('Error processing CSV file. Please check the file format and try again.');
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text',
      label: '',
      required: false
    };
    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
  };

  const updateField = (index: number, field: Partial<FormField>) => {
    const updatedFields = [...formData.fields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFormData({ ...formData, fields: updatedFields });
  };

  const removeField = (index: number) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: updatedFields });
  };

  const handleSaveForm = async () => {
    try {
      const isTestMode = process.env.NODE_ENV === 'development' && 
                         process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

      if (isTestMode) {
        // Create new form or update existing one
        const newForm: CustomForm = {
          id: selectedForm?.id || `form-${Date.now()}`,
          name: formData.name,
          description: formData.description,
          fields: formData.fields,
          isActive: true,
          createdAt: selectedForm?.createdAt || new Date(),
          updatedAt: new Date(),
          submissions: selectedForm?.submissions || 0,
          createdBy: currentUser?.uid || 'admin'
        };

        if (selectedForm) {
          // Update existing form
          setForms(prevForms => 
            prevForms.map(form => 
              form.id === selectedForm.id ? newForm : form
            )
          );
        } else {
          // Add new form
          setForms(prevForms => [...prevForms, newForm]);
        }

        setShowModal(false);
        setSelectedForm(null);
        setFormData({ name: '', description: '', fields: [] });
        return;
      }

      // In production, save to Firebase
      setShowModal(false);
      fetchForms();
    } catch (error) {
      console.error('Error saving form:', error);
    }
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
              <h1 className="mb-2">Forms Management</h1>
              <p className="text-muted">Create, manage, and deploy custom forms and surveys for data collection</p>
            </div>
            <div>
              <Button variant="outline-primary" className="me-2" onClick={handleUploadCSV}>
                <FaUpload className="me-1" />
                Upload CSV
              </Button>
              <Button variant="primary" onClick={handleCreateForm}>
                <FaPlus className="me-1" />
                Create Form
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Alert variant="info">
            <strong>📋 Form Builder Features:</strong> Create forms from scratch, upload CSV files to auto-generate forms, 
            or use the integrated form builder SDK for advanced survey creation.
          </Alert>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Active Forms ({forms.length})</h5>
            </Card.Header>
            <Card.Body>
              {forms.length === 0 ? (
                <div className="text-center py-5">
                  <FaWpforms className="text-muted mb-3" size={48} />
                  <h5 className="text-muted">No Forms Created Yet</h5>
                  <p className="text-muted">Create your first form or upload a CSV file to get started.</p>
                  <Button variant="primary" onClick={handleCreateForm}>
                    <FaPlus className="me-1" />
                    Create Your First Form
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Form Name</th>
                      <th>Description</th>
                      <th>Fields</th>
                      <th>Submissions</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.map((form) => (
                      <tr key={form.id}>
                        <td>
                          <strong>{form.name}</strong>
                        </td>
                        <td className="text-muted">{form.description}</td>
                        <td>
                          <Badge bg="secondary">{form.fields.length} fields</Badge>
                        </td>
                        <td>{form.submissions}</td>
                        <td>
                          <Badge bg={form.isActive ? 'success' : 'secondary'}>
                            {form.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>{form.createdAt.toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleViewForm(form)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEditForm(form)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'create' && 'Create New Form'}
            {modalType === 'edit' && 'Edit Form'}
            {modalType === 'view' && 'View Form'}
            {modalType === 'upload' && 'Upload CSV File'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'upload' ? (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Select CSV File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                />
                <Form.Text className="text-muted">
                  Upload a CSV file to automatically generate form fields from the column headers.
                </Form.Text>
              </Form.Group>
              {csvFile && (
                <Alert variant="success">
                  <strong>File selected:</strong> {csvFile.name}
                  <br />
                  <small className="text-muted">
                    This will create a new form with fields based on your CSV column headers.
                  </small>
                  <br />
                  <Button variant="primary" size="sm" className="mt-2" onClick={processCSVFile}>
                    Generate Form from CSV
                  </Button>
                </Alert>
              )}
            </div>
          ) : modalType === 'view' ? (
            <div>
              <h6>Form Preview: {selectedForm?.name}</h6>
              <p className="text-muted">{selectedForm?.description}</p>
              <div className="border p-3 rounded">
                {selectedForm?.fields.map((field, index) => (
                  <Form.Group key={field.id} className="mb-3">
                    <Form.Label>
                      {field.label}
                      {field.required && <span className="text-danger">*</span>}
                    </Form.Label>
                    {field.type === 'textarea' ? (
                      <Form.Control as="textarea" rows={3} disabled />
                    ) : field.type === 'select' ? (
                      <Form.Select disabled>
                        <option>Select an option...</option>
                        {field.options?.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Form.Control type={field.type} disabled />
                    )}
                  </Form.Group>
                ))}
              </div>
            </div>
          ) : (
            <Tabs defaultActiveKey="basic" className="mb-3">
              <Tab eventKey="basic" title="Basic Info">
                <Form.Group className="mb-3">
                  <Form.Label>Form Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter form name"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter form description"
                  />
                </Form.Group>
              </Tab>
              <Tab eventKey="fields" title="Form Fields">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Form Fields ({formData.fields.length})</h6>
                  <Button variant="outline-primary" size="sm" onClick={addField}>
                    <FaPlus className="me-1" />
                    Add Field
                  </Button>
                </div>
                {formData.fields.map((field, index) => (
                  <Card key={field.id} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label>Field Label</Form.Label>
                            <Form.Control
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                              placeholder="Enter field label"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-2">
                            <Form.Label>Field Type</Form.Label>
                            <Form.Select
                              value={field.type}
                              onChange={(e) => updateField(index, { type: e.target.value as any })}
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="email">Email</option>
                              <option value="date">Date</option>
                              <option value="select">Select</option>
                              <option value="textarea">Textarea</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="radio">Radio</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-2">
                            <Form.Label>&nbsp;</Form.Label>
                            <div>
                              <Form.Check
                                type="checkbox"
                                label="Required"
                                checked={field.required}
                                onChange={(e) => updateField(index, { required: e.target.checked })}
                              />
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="mt-1"
                                onClick={() => removeField(index)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
                        <Form.Group>
                          <Form.Label>Options (comma-separated)</Form.Label>
                          <Form.Control
                            type="text"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(index, { 
                              options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt) 
                            })}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </Form.Group>
                      )}
                    </Card.Body>
                  </Card>
                ))}
                {formData.fields.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No fields added yet. Click "Add Field" to get started.</p>
                  </div>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          {modalType !== 'view' && modalType !== 'upload' && (
            <Button variant="primary" onClick={handleSaveForm}>
              {modalType === 'create' ? 'Create Form' : 'Update Form'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

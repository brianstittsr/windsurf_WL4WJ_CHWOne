'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEye, FaSave, FaCode } from 'react-icons/fa';

interface FormBuilderField {
  id: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'rating';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    dependsOn: string;
    value: string;
  };
}

interface FormBuilderProps {
  onSave?: (formData: any) => void;
  initialData?: any;
}

export default function FormBuilder({ onSave, initialData }: FormBuilderProps) {
  const [fields, setFields] = useState<FormBuilderField[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormTitle(initialData.title || '');
      setFormDescription(initialData.description || '');
      setFields(initialData.fields || []);
    }
  }, [initialData]);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'radio', label: 'Radio Button', icon: '🔘' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'rating', label: 'Rating', icon: '⭐' }
  ];

  const addField = (type: string) => {
    const newField: FormBuilderField = {
      id: `field_${Date.now()}`,
      type: type as any,
      label: `New ${type} field`,
      required: false,
      placeholder: type === 'textarea' ? 'Enter your response...' : `Enter ${type}...`
    };

    if (type === 'select' || type === 'radio' || type === 'checkbox') {
      newField.options = ['Option 1', 'Option 2', 'Option 3'];
    }

    setFields([...fields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<FormBuilderField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    setFields(newFields);
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string, index: number) => {
    setDraggedField(fieldId);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      moveField(dragIndex, dropIndex);
    }
    setDraggedField(null);
  };

  const generateFormJson = () => {
    return {
      title: formTitle,
      description: formDescription,
      fields: fields,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
  };

  const handleSave = () => {
    const formData = generateFormJson();
    if (onSave) {
      onSave(formData);
    }
  };

  const renderFieldPreview = (field: FormBuilderField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Form.Control
            type={field.type}
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'date':
        return <Form.Control type="date" disabled />;
      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'select':
        return (
          <Form.Select disabled>
            <option>Select an option...</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </Form.Select>
        );
      case 'checkbox':
        return (
          <div>
            {field.options?.map((option, i) => (
              <Form.Check
                key={i}
                type="checkbox"
                label={option}
                disabled
              />
            ))}
          </div>
        );
      case 'radio':
        return (
          <div>
            {field.options?.map((option, i) => (
              <Form.Check
                key={i}
                type="radio"
                name={field.id}
                label={option}
                disabled
              />
            ))}
          </div>
        );
      case 'file':
        return <Form.Control type="file" disabled />;
      case 'rating':
        return (
          <div className="d-flex">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className="text-warning me-1" style={{ fontSize: '1.5rem' }}>
                ⭐
              </span>
            ))}
          </div>
        );
      default:
        return <Form.Control type="text" disabled />;
    }
  };

  return (
    <Container fluid>
      <Row>
        {/* Field Palette */}
        <Col md={3}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Field Types</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {fieldTypes.map((fieldType) => (
                  <Button
                    key={fieldType.type}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => addField(fieldType.type)}
                    className="text-start"
                  >
                    <span className="me-2">{fieldType.icon}</span>
                    {fieldType.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h6 className="mb-0">Form Settings</h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Form Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter form title"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter form description"
                />
              </Form.Group>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={handleSave}>
                  <FaSave className="me-1" />
                  Save Form
                </Button>
                <Button variant="outline-secondary" onClick={() => setShowPreview(true)}>
                  <FaEye className="me-1" />
                  Preview
                </Button>
                <Button variant="outline-info" onClick={() => setShowJsonModal(true)}>
                  <FaCode className="me-1" />
                  View JSON
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Form Builder */}
        <Col md={9}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Form Builder</h5>
            </Card.Header>
            <Card.Body>
              {formTitle && (
                <div className="mb-4">
                  <h4>{formTitle}</h4>
                  {formDescription && <p className="text-muted">{formDescription}</p>}
                </div>
              )}

              {fields.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No fields added yet</h5>
                  <p className="text-muted">Select field types from the left panel to start building your form.</p>
                </div>
              ) : (
                <div>
                  {fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className={`mb-3 ${draggedField === field.id ? 'opacity-50' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, field.id, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{ cursor: 'move' }}
                    >
                      <Card.Body>
                        <Row>
                          <Col md={8}>
                            <Form.Group className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <Form.Label className="mb-0 me-2">Field Label</Form.Label>
                                <Form.Check
                                  type="checkbox"
                                  label="Required"
                                  checked={field.required}
                                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                />
                              </div>
                              <Form.Control
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                              />
                            </Form.Group>

                            {field.placeholder !== undefined && (
                              <Form.Group className="mb-3">
                                <Form.Label>Placeholder</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={field.placeholder}
                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                />
                              </Form.Group>
                            )}

                            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                              <Form.Group className="mb-3">
                                <Form.Label>Options (one per line)</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  value={field.options?.join('\n') || ''}
                                  onChange={(e) => updateField(field.id, { 
                                    options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                  })}
                                />
                              </Form.Group>
                            )}
                          </Col>
                          <Col md={4}>
                            <div className="text-end mb-3">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeField(field.id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                            <div>
                              <small className="text-muted">Preview:</small>
                              <div className="border p-2 rounded mt-1">
                                <Form.Group>
                                  <Form.Label>
                                    {field.label}
                                    {field.required && <span className="text-danger">*</span>}
                                  </Form.Label>
                                  {renderFieldPreview(field)}
                                </Form.Group>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Form Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border p-4 rounded">
            {formTitle && <h4 className="mb-3">{formTitle}</h4>}
            {formDescription && <p className="text-muted mb-4">{formDescription}</p>}
            
            {fields.map((field) => (
              <Form.Group key={field.id} className="mb-3">
                <Form.Label>
                  {field.label}
                  {field.required && <span className="text-danger">*</span>}
                </Form.Label>
                {renderFieldPreview(field)}
              </Form.Group>
            ))}
            
            <div className="text-center mt-4">
              <Button variant="primary" disabled>Submit Form</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* JSON Modal */}
      <Modal show={showJsonModal} onHide={() => setShowJsonModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Form JSON Schema</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
            {JSON.stringify(generateFormJson(), null, 2)}
          </pre>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(generateFormJson(), null, 2))}
          >
            Copy to Clipboard
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

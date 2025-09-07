'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { FaKey, FaDownload, FaCopy, FaEye, FaEyeSlash, FaCode, FaBook } from 'react-icons/fa';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export default function APIAccess() {
  const { userProfile } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  });

  const availablePermissions = [
    'chws:read',
    'chws:write',
    'projects:read',
    'projects:write',
    'grants:read',
    'grants:write',
    'referrals:read',
    'referrals:write',
    'resources:read',
    'resources:write',
    'surveys:read',
    'datasets:read',
    'datasets:export'
  ];

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/chws',
      description: 'Retrieve all Community Health Workers',
      permission: 'chws:read'
    },
    {
      method: 'POST',
      endpoint: '/api/chws',
      description: 'Create a new CHW record',
      permission: 'chws:write'
    },
    {
      method: 'GET',
      endpoint: '/api/projects',
      description: 'Retrieve all projects',
      permission: 'projects:read'
    },
    {
      method: 'GET',
      endpoint: '/api/referrals',
      description: 'Retrieve referral data',
      permission: 'referrals:read'
    },
    {
      method: 'GET',
      endpoint: '/api/resources',
      description: 'Retrieve Region 5 resources',
      permission: 'resources:read'
    },
    {
      method: 'GET',
      endpoint: '/api/surveys/empower',
      description: 'Export Empower survey results',
      permission: 'surveys:read'
    },
    {
      method: 'GET',
      endpoint: '/api/datasets/{id}/export',
      description: 'Export dataset as CSV/JSON',
      permission: 'datasets:export'
    }
  ];

  useEffect(() => {
    // Mock API keys for demonstration
    setApiKeys([
      {
        id: '1',
        name: 'Main Dashboard API',
        key: 'chwone_live_sk_1234567890abcdef',
        permissions: ['chws:read', 'projects:read', 'referrals:read'],
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date('2024-01-20'),
        isActive: true
      },
      {
        id: '2',
        name: 'Data Export Service',
        key: 'chwone_live_sk_fedcba0987654321',
        permissions: ['datasets:read', 'datasets:export', 'surveys:read'],
        createdAt: new Date('2024-01-10'),
        isActive: true
      }
    ]);
  }, []);

  const generateAPIKey = () => {
    const prefix = 'chwone_live_sk_';
    const randomString = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
    return prefix + randomString;
  };

  const handleCreateAPIKey = () => {
    const newKey = generateAPIKey();
    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: formData.name,
      key: newKey,
      permissions: formData.permissions,
      createdAt: new Date(),
      isActive: true
    };

    setApiKeys([...apiKeys, apiKey]);
    setNewApiKey(newKey);
    setShowCreateModal(false);
    setShowKeyModal(true);
    setFormData({ name: '', permissions: [] });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const togglePermission = (permission: string) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const getMethodBadge = (method: string) => {
    const variants = {
      'GET': 'success',
      'POST': 'primary',
      'PUT': 'warning',
      'DELETE': 'danger'
    };
    return variants[method as keyof typeof variants] || 'secondary';
  };

  const generateCurlExample = (endpoint: any) => {
    return `curl -X ${endpoint.method} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  https://chwone-platform.com${endpoint.endpoint}`;
  };

  const generateJavaScriptExample = (endpoint: any) => {
    return `const response = await fetch('https://chwone-platform.com${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
  };

  return (
    <Container fluid className="main-content">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>API Access & Data Export</h1>
              <p className="text-muted">Manage API keys and access programmatic data export</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FaKey className="me-2" />
              Create API Key
            </Button>
          </div>
        </Col>
      </Row>

      {/* HIPAA Compliance Notice */}
      <Row className="mb-4">
        <Col>
          <Alert variant="warning" className="hipaa-compliant">
            <strong>🔒 HIPAA Compliance Notice</strong> - API access to protected health information requires proper authorization and audit logging. All API calls are monitored and logged.
          </Alert>
        </Col>
      </Row>

      {/* API Keys Management */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Your API Keys</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Permissions</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id}>
                      <td><strong>{apiKey.name}</strong></td>
                      <td>
                        <code className="text-muted">
                          {apiKey.key.substring(0, 20)}...
                        </code>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="ms-2"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <FaCopy />
                        </Button>
                      </td>
                      <td>
                        {apiKey.permissions.slice(0, 2).map(permission => (
                          <Badge key={permission} bg="info" className="me-1">
                            {permission}
                          </Badge>
                        ))}
                        {apiKey.permissions.length > 2 && (
                          <Badge bg="light" text="dark">
                            +{apiKey.permissions.length - 2}
                          </Badge>
                        )}
                      </td>
                      <td>{apiKey.createdAt.toLocaleDateString()}</td>
                      <td>
                        {apiKey.lastUsed ? (
                          <span className="text-success">
                            {apiKey.lastUsed.toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted">Never</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={apiKey.isActive ? 'success' : 'danger'}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-danger" size="sm">
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* API Documentation */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaBook className="me-2" />
                API Documentation
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-3">
                Use these endpoints to programmatically access CHWOne platform data. 
                All requests require a valid API key in the Authorization header.
              </p>
              
              <Table responsive>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                    <th>Required Permission</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiEndpoints.map((endpoint, index) => (
                    <tr key={index}>
                      <td>
                        <Badge bg={getMethodBadge(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                      </td>
                      <td>
                        <code>{endpoint.endpoint}</code>
                      </td>
                      <td>{endpoint.description}</td>
                      <td>
                        <Badge bg="secondary">{endpoint.permission}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => setSelectedEndpoint(endpoint.endpoint)}
                        >
                          <FaCode className="me-1" />
                          Examples
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Export Options */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Data Export</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FaDownload className="text-primary mb-3" size={32} />
                      <Card.Title className="h6">CHW Directory</Card.Title>
                      <Card.Text className="small">
                        Export complete Community Health Worker directory with certifications and contact info.
                      </Card.Text>
                      <Button variant="outline-primary" size="sm">
                        Export CSV
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FaDownload className="text-success mb-3" size={32} />
                      <Card.Title className="h6">Referral Data</Card.Title>
                      <Card.Text className="small">
                        Export referral communications and outcomes data for reporting and analysis.
                      </Card.Text>
                      <Button variant="outline-success" size="sm">
                        Export JSON
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FaDownload className="text-info mb-3" size={32} />
                      <Card.Title className="h6">Survey Results</Card.Title>
                      <Card.Text className="small">
                        Export Empower survey results and project outcome metrics for analysis.
                      </Card.Text>
                      <Button variant="outline-info" size="sm">
                        Export Excel
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create API Key Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New API Key</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => { e.preventDefault(); handleCreateAPIKey(); }}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>API Key Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Dashboard Integration, Data Export Service"
                required
              />
              <Form.Text className="text-muted">
                Choose a descriptive name to identify this API key's purpose.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Permissions</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {availablePermissions.map(permission => (
                  <Form.Check
                    key={permission}
                    type="checkbox"
                    id={permission}
                    label={permission}
                    checked={formData.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="mb-2"
                  />
                ))}
              </div>
              <Form.Text className="text-muted">
                Select the minimum permissions required for your use case.
              </Form.Text>
            </Form.Group>

            <Alert variant="info">
              <small>
                <strong>Security Note:</strong> API keys provide access to sensitive data. 
                Store them securely and never share them publicly. You can revoke access at any time.
              </small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={!formData.name || formData.permissions.length === 0}
            >
              Create API Key
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Show New API Key Modal */}
      <Modal show={showKeyModal} onHide={() => setShowKeyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Your New API Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            <strong>API Key Created Successfully!</strong>
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label>API Key</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                value={newApiKey}
                readOnly
              />
              <Button
                variant="outline-secondary"
                onClick={() => copyToClipboard(newApiKey)}
              >
                <FaCopy />
              </Button>
            </InputGroup>
          </Form.Group>

          <Alert variant="warning">
            <strong>Important:</strong> This is the only time you'll see this API key. 
            Copy it now and store it securely. If you lose it, you'll need to create a new one.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowKeyModal(false)}>
            I've Saved My Key
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Code Examples Modal */}
      <Modal show={!!selectedEndpoint} onHide={() => setSelectedEndpoint('')} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Code Examples - {selectedEndpoint}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEndpoint && (
            <div>
              <h6>cURL Example:</h6>
              <pre className="bg-light p-3 rounded">
                <code>{generateCurlExample(apiEndpoints.find(e => e.endpoint === selectedEndpoint))}</code>
              </pre>

              <h6 className="mt-4">JavaScript Example:</h6>
              <pre className="bg-light p-3 rounded">
                <code>{generateJavaScriptExample(apiEndpoints.find(e => e.endpoint === selectedEndpoint))}</code>
              </pre>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedEndpoint('')}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

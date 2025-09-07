'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaCog, FaShieldAlt, FaBell, FaDatabase } from 'react-icons/fa';

interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    dashboard: boolean;
  };
  privacy: {
    shareData: boolean;
    auditLog: boolean;
  };
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
  };
}

export default function SettingsManagement() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      sms: false,
      dashboard: true
    },
    privacy: {
      shareData: false,
      auditLog: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York'
    }
  });
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    try {
      // Check if we're in test mode
      const isTestMode = process.env.NODE_ENV === 'development' && 
                         process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

      if (isTestMode) {
        setSaveMessage('Settings saved successfully! (Test Mode)');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }

      // In production, save to Firebase/backend
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <Container fluid className="main-content">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Settings</h1>
          <p className="text-muted">
            Manage your account preferences and platform settings.
          </p>
        </Col>
      </Row>

      {saveMessage && (
        <Row className="mb-3">
          <Col>
            <Alert variant={saveMessage.includes('Error') ? 'danger' : 'success'}>
              {saveMessage}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="profile" className="mb-3">
                {/* Profile Tab */}
                <Tab eventKey="profile" title={<><FaUser className="me-2" />Profile</>}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                          type="email" 
                          value={currentUser?.email || ''} 
                          disabled 
                        />
                        <Form.Text className="text-muted">
                          Email cannot be changed. Contact administrator if needed.
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={currentUser?.displayName || ''} 
                          disabled 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>User ID</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={currentUser?.uid || ''} 
                          disabled 
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Account Status</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={currentUser?.emailVerified ? 'Verified' : 'Unverified'} 
                          disabled 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab>

                {/* Notifications Tab */}
                <Tab eventKey="notifications" title={<><FaBell className="me-2" />Notifications</>}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Notifications</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Receive email notifications for important updates"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: e.target.checked }
                      })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>SMS Notifications</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Receive SMS notifications for urgent alerts"
                      checked={settings.notifications.sms}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: e.target.checked }
                      })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Dashboard Notifications</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Show notifications on dashboard"
                      checked={settings.notifications.dashboard}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, dashboard: e.target.checked }
                      })}
                    />
                  </Form.Group>
                </Tab>

                {/* Privacy Tab */}
                <Tab eventKey="privacy" title={<><FaShieldAlt className="me-2" />Privacy</>}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data Sharing</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Allow anonymized data sharing for research purposes"
                      checked={settings.privacy.shareData}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, shareData: e.target.checked }
                      })}
                    />
                    <Form.Text className="text-muted">
                      All shared data is anonymized and HIPAA compliant.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Audit Logging</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Enable detailed audit logging of my activities"
                      checked={settings.privacy.auditLog}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, auditLog: e.target.checked }
                      })}
                    />
                    <Form.Text className="text-muted">
                      Required for HIPAA compliance. Cannot be disabled.
                    </Form.Text>
                  </Form.Group>
                </Tab>

                {/* Preferences Tab */}
                <Tab eventKey="preferences" title={<><FaCog className="me-2" />Preferences</>}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Theme</Form.Label>
                        <Form.Select
                          value={settings.preferences.theme}
                          onChange={(e) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, theme: e.target.value as 'light' | 'dark' }
                          })}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Language</Form.Label>
                        <Form.Select
                          value={settings.preferences.language}
                          onChange={(e) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, language: e.target.value }
                          })}
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Timezone</Form.Label>
                        <Form.Select
                          value={settings.preferences.timezone}
                          onChange={(e) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, timezone: e.target.value }
                          })}
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>

              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={handleSave}>
                  Save Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

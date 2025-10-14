'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@/types/platform.types';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser, FaBuilding } from 'react-icons/fa';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.CHW,
    organization: '',
    phoneNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '100vh' }}>
      <Card style={{ maxWidth: '600px', width: '100%' }} className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <img 
              src="/images/CHWOneLogoDesign.png" 
              alt="CHWOne Logo"
              style={{ width: '80px', height: '80px' }}
              className="mb-3"
            />
            <h2 className="fw-bold text-primary">CHWOne</h2>
            <p className="text-muted">Women Leading for Wellness & Justice</p>
            <h4>Create Account</h4>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    First Name
                  </Form.Label>
                  <Form.Control
                    id="firstName-input"
                    type="text"
                    value={formData.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Enter your first name"
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    id="lastName-input"
                    type="text"
                    value={formData.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Enter your last name"
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaEnvelope className="me-2" />
                Email Address
              </Form.Label>
              <Form.Control
                id="email-input"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    id="role-select"
                    value={formData.role}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value as UserRole})}
                    required
                    disabled={loading}
                  >
                    <option value={UserRole.CHW}>Community Health Worker</option>
                    <option value={UserRole.CHW_COORDINATOR}>CHW Coordinator</option>
                    <option value={UserRole.NONPROFIT_STAFF}>Nonprofit Staff</option>
                    <option value={UserRole.CLIENT}>Client</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaBuilding className="me-2" />
                    Organization
                  </Form.Label>
                  <Form.Control
                    id="organization-input"
                    type="text"
                    value={formData.organization}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, organization: e.target.value})}
                    placeholder="Your organization"
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number (Optional)</Form.Label>
              <Form.Control
                id="phone-input"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="(555) 123-4567"
                disabled={loading}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Password
                  </Form.Label>
                  <div className="input-group">
                    <Form.Control
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
                      placeholder="Create a password"
                      required
                      disabled={loading}
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      id="confirmPassword-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Check 
                type="checkbox"
                id="hipaa-agreement"
                label="I acknowledge that I understand HIPAA compliance requirements and will protect client confidentiality"
                required
                disabled={loading}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating Account...
                </>
              ) : 'Create Account'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <p className="text-muted">
              Already have an account?{' '}
              <Link href="/login">Sign in here</Link>
            </p>
          </div>
          
          <Card className="bg-light mt-4 p-3">
            <div className="text-center">
              <p className="mb-1 fw-bold">🔒 HIPAA Compliant Registration</p>
              <small className="text-muted">All user data is encrypted and stored securely</small>
            </div>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
}

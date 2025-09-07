'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Link from 'next/link';
import { 
  FaBars, 
  FaSignOutAlt, 
  FaUser, 
  FaTachometerAlt, 
  FaUsers, 
  FaProjectDiagram, 
  FaMoneyBillWave, 
  FaDatabase, 
  FaExchangeAlt, 
  FaMapMarkerAlt, 
  FaChartBar, 
  FaDownload, 
  FaCog,
  FaWpforms,
  FaBriefcase
} from 'react-icons/fa';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="d-flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar d-md-block ${sidebarOpen ? 'show' : ''}`} style={{ width: '250px' }}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1">
        {/* Top Navigation */}
        <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
          <Container fluid>
            <Navbar.Brand as={Link} href="/" className="fw-bold text-primary d-flex align-items-center">
              <img 
                src="/images/CHWOneLogoDesign.png" 
                alt="CHWOne Logo" 
                style={{ height: '40px', marginRight: '10px' }}
              />
              CHWOne Platform
            </Navbar.Brand>
            <Button
              variant="outline-secondary"
              className="d-lg-none me-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </Button>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} href="/dashboard">
                  <FaTachometerAlt className="me-1" />
                  Dashboard
                </Nav.Link>
                
                <NavDropdown title={<><FaUsers className="me-1" />Management</>} id="management-dropdown">
                  <NavDropdown.Item as={Link} href="/chws">
                    <FaUsers className="me-2" />
                    Community Health Workers
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/projects">
                    <FaProjectDiagram className="me-2" />
                    Projects
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/grants">
                    <FaMoneyBillWave className="me-2" />
                    Grants
                  </NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown title={<><FaDatabase className="me-1" />Data</>} id="data-dropdown">
                  <NavDropdown.Item as={Link} href="/datasets">
                    <FaDatabase className="me-2" />
                    Datasets
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/referrals">
                    <FaExchangeAlt className="me-2" />
                    Referrals
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/surveys">
                    <FaChartBar className="me-2" />
                    Surveys
                  </NavDropdown.Item>
                </NavDropdown>
                
                <Nav.Link as={Link} href="/resources">
                  <FaMapMarkerAlt className="me-1" />
                  Resources
                </Nav.Link>
                
                <Nav.Link as={Link} href="/forms">
                  <FaWpforms className="me-1" />
                  Forms
                </Nav.Link>
                
                <Nav.Link as={Link} href="/workforce">
                  <FaBriefcase className="me-1" />
                  Workforce
                </Nav.Link>
                
                <Nav.Link as={Link} href="/api-access">
                  <FaDownload className="me-1" />
                  API
                </Nav.Link>
              </Nav>
            
            <Nav className="ms-auto">
              <NavDropdown 
                title={
                  <span className="d-flex align-items-center">
                    <FaUser className="me-2" />
                    {currentUser?.displayName || currentUser?.email}
                  </span>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} href="/settings">
                  <FaCog className="me-2" />
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

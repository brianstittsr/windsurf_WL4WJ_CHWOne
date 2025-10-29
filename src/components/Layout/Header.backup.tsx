'use client';

import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Image, Dropdown } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/platform.types';
import Link from 'next/link';
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt, FaCode, FaInfoCircle } from 'react-icons/fa';

interface HeaderProps {
  variant?: 'default' | 'minimal' | 'magic';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/chws', 
      label: 'CHWs', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR] 
    },
    { 
      href: '/projects', 
      label: 'Projects', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/grants', 
      label: 'Grants', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/referrals', 
      label: 'Referrals', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/resources', 
      label: 'Resources', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/forms', 
      label: 'Forms', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/workforce', 
      label: 'Workforce', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/surveys', 
      label: 'Surveys', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/api-access', 
      label: 'API Access', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/settings', 
      label: 'Settings', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/about', 
      label: 'About', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
  ];

  // Mock user role for testing
  const userRole = currentUser?.email === 'admin@example.com' ? UserRole.ADMIN : UserRole.CHW_COORDINATOR;
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  if (variant === 'magic') {
    return (
      <header style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        padding: '8px 16px',
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '14px'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            🏠
          </Link>
          
          <div style={{
            width: '1px',
            height: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            minWidth: '1px'
          }}></div>
          
          {filteredMenuItems.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '12px',
              color: '#ffffff',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '13px'
            }}>
              {item.label}
            </Link>
          ))}
          
          <div style={{
            width: '1px',
            height: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            minWidth: '1px'
          }}></div>
          
          {currentUser && (
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '12px',
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} aria-label="User menu">
              👤
            </button>
          )}
        </div>
      </header>
    );
  }

  if (variant === 'minimal') {
    return (
      <Navbar bg="light" expand="lg" className="border-bottom shadow-sm" sticky="top">
        <Container>
          <Navbar.Brand as={Link} href="/">
            <div className="d-flex align-items-center">
              <Image 
                src="/images/CHWOneLogoDesign.png" 
                width={30} 
                height={30} 
                className="me-2" 
                alt="CHWOne Logo"
                roundedCircle
              />
              <span className="fw-bold text-primary">CHWOne</span>
            </div>
          </Navbar.Brand>
          
          {currentUser && (
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="user-dropdown" className="d-flex align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                    style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                    {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline">{currentUser?.displayName || currentUser?.email || 'User'}</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} href="/settings">
                  <FaCog className="me-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar bg="light" expand="lg" className="border-bottom shadow-sm" sticky="top">
      <Container>
        <Navbar.Brand as={Link} href="/">
          <div className="d-flex align-items-center">
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              width={40} 
              height={40} 
              className="me-2" 
              alt="CHWOne Logo"
              roundedCircle
            />
            <span className="fw-bold text-primary">CHWOne</span>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="border-0"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </Navbar.Toggle>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {filteredMenuItems.slice(0, 8).map((item) => (
              <Nav.Link 
                key={item.href} 
                as={Link} 
                href={item.href}
                className="px-3"
              >
                {item.label}
              </Nav.Link>
            ))}
            
            {/* More Menu for additional items */}
            {filteredMenuItems.length > 8 && (
              <Dropdown>
                <Dropdown.Toggle variant="light" id="more-menu">
                  More
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {filteredMenuItems.slice(8).map((item) => (
                    <Dropdown.Item key={item.href} as={Link} href={item.href}>
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
          
          {/* User Menu */}
          {currentUser && (
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="user-dropdown" className="d-flex align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                    style={{ width: '32px', height: '32px' }}>
                    {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline">{currentUser?.displayName || currentUser?.email || 'User'}</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} href="/settings">
                  <FaCog className="me-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Item as={Link} href="/api-access">
                  <FaCode className="me-2" /> API Access
                </Dropdown.Item>
                <Dropdown.Item as={Link} href="/about">
                  <FaInfoCircle className="me-2" /> About
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

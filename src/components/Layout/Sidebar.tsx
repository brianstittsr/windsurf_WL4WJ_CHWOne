'use client';

import React from 'react';
import { Nav } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/platform.types';
import Link from 'next/link';
import { 
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

export default function Sidebar() {
  const { currentUser } = useAuth();

  const menuItems = [
    { 
      href: '/dashboard', 
      icon: FaTachometerAlt, 
      label: 'Dashboard', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/chws', 
      icon: FaUsers, 
      label: 'Community Health Workers', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR] 
    },
    { 
      href: '/projects', 
      icon: FaProjectDiagram, 
      label: 'Projects', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/grants', 
      icon: FaMoneyBillWave, 
      label: 'Grants', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/datasets', 
      icon: FaDatabase, 
      label: 'Datasets', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/referrals', 
      icon: FaExchangeAlt, 
      label: 'Referral Communications', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/resources', 
      icon: FaMapMarkerAlt, 
      label: 'Region 5 Resources', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/surveys', 
      icon: FaChartBar, 
      label: 'Empower Surveys', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/api-access', 
      icon: FaDownload, 
      label: 'API Access', 
      roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/forms', 
      icon: FaWpforms, 
      label: 'Forms & Surveys', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/workforce', 
      icon: FaBriefcase, 
      label: 'Workforce Development', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/settings', 
      icon: FaCog, 
      label: 'Settings', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
  ];

  // Mock user role for testing - in production this would come from user profile
  const userRole = currentUser?.email === 'admin@example.com' ? UserRole.ADMIN : UserRole.CHW_COORDINATOR;

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="sidebar">
      <div className="p-3">
        <h4 className="text-primary fw-bold">CHWOne</h4>
        <p className="text-muted small">Women Leading for Wellness & Justice</p>
      </div>
      <Nav className="flex-column px-3">
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.href} href={item.href} className="nav-link text-decoration-none">
              <IconComponent className="me-2" />
              {item.label}
            </Link>
          );
        })}
      </Nav>
      
      {/* HIPAA Compliance Footer */}
      <div className="mt-auto p-3">
        <div className="hipaa-compliant">
          <small>
            <strong>🔒 HIPAA Compliant</strong><br />
            All data encrypted & audit logged
          </small>
        </div>
      </div>
    </div>
  );
}

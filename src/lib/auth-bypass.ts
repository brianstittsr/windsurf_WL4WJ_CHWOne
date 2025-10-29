/**
 * Authentication Bypass
 * 
 * This module provides mock authentication functions and utilities
 * to bypass all authentication requirements in the application.
 */

// Mock user object that is always authenticated
export const mockUser = {
  uid: 'mock-user-always-authenticated',
  email: 'auto-login@example.com',
  displayName: 'Auto Login User',
  emailVerified: true,
  getIdToken: () => Promise.resolve('mock-token-always-valid')
};

// Mock user profile with admin privileges
export const mockProfile = {
  uid: 'mock-user-always-authenticated',
  email: 'auto-login@example.com',
  displayName: 'Auto Login User',
  role: 'ADMIN',
  approved: true,
  permissions: ['*'],
  organization: 'general',
  isActive: true,
  createdAt: new Date().toISOString()
};

// Mock authentication check that always returns true
export const isAuthenticated = () => true;

// Mock permission check that always returns true
export const hasPermission = () => true;

// Mock role check that always returns true
export const hasRole = () => true;

// Log authentication bypass status
console.log('%c[AUTH_BYPASS] Authentication completely disabled', 'background: red; color: white; font-size: 14px; padding: 5px;');

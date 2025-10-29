/**
 * FirebaseInitializer Component Tests
 * 
 * These tests verify that the FirebaseInitializer component
 * correctly verifies Firebase services without reinitializing them.
 */

import React from 'react';
import { render } from '@testing-library/react';
import FirebaseInitializer from '../FirebaseInitializer';
import { onAuthStateChanged } from 'firebase/auth';
import { getSchemaVersion } from '@/lib/schema/initialize-schema';

// Mock the Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}));

// Mock the schema version function
jest.mock('@/lib/schema/initialize-schema', () => ({
  getSchemaVersion: jest.fn()
}));

// Mock the Firebase config
jest.mock('@/lib/firebase/firebaseConfig', () => {
  const mockApp = {
    options: {
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain',
      projectId: 'test-project-id'
    }
  };
  
  return {
    auth: {
      app: mockApp
    }
  };
});

describe('FirebaseInitializer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful schema version
    (getSchemaVersion as jest.Mock).mockResolvedValue({
      version: '1.0.0',
      appliedAt: {
        toDate: () => new Date()
      }
    });
    
    // Mock auth state listener
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null); // No user
      return jest.fn(); // Return unsubscribe function
    });
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  
  test('renders without crashing', () => {
    const { container } = render(<FirebaseInitializer />);
    expect(container).toBeTruthy();
  });
  
  test('verifies Firebase auth', () => {
    render(<FirebaseInitializer />);
    expect(onAuthStateChanged).toHaveBeenCalled();
  });
  
  test('checks schema version', async () => {
    render(<FirebaseInitializer />);
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(getSchemaVersion).toHaveBeenCalled();
  });
  
  test('handles schema version error gracefully', async () => {
    // Mock schema version error
    (getSchemaVersion as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    render(<FirebaseInitializer />);
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(console.warn).toHaveBeenCalledWith(
      'Error checking schema version:',
      expect.any(Error)
    );
  });
});

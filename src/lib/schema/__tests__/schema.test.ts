/**
 * Tests for the unified schema
 * 
 * This file contains tests for the schema interfaces, data access functions,
 * validation, and migration tools.
 */
import '@testing-library/jest-dom';

import { Timestamp } from 'firebase/firestore';
import * as schema from '../unified-schema';
import { validate, validateUser, validateCHWProfile, validateGrant } from '../validation';
import { initializeFirebaseSchema, getSchemaVersion } from '../initialize-schema';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ 
      seconds: Math.floor(date.getTime() / 1000), 
      nanoseconds: 0,
      toDate: () => date
    }))
  },
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  writeBatch: jest.fn()
}));

jest.mock('@/lib/firebase', () => ({
  db: {}
}));

describe('Unified Schema', () => {
  describe('Schema Interfaces', () => {
    test('UserRole enum has all required roles', () => {
      expect(schema.UserRole.ADMIN).toBe('admin');
      expect(schema.UserRole.CHW).toBe('chw');
      expect(schema.UserRole.CHW_COORDINATOR).toBe('chw_coordinator');
      expect(schema.UserRole.NONPROFIT_STAFF).toBe('nonprofit_staff');
      expect(schema.UserRole.WL4WJ_CHW).toBe('wl4wj_chw');
      expect(schema.UserRole.CLIENT).toBe('client');
      expect(schema.UserRole.VIEWER).toBe('viewer');
      expect(schema.UserRole.DEMO).toBe('demo');
    });

    test('COLLECTIONS constant has all required collections', () => {
      expect(schema.COLLECTIONS.USERS).toBe('users');
      expect(schema.COLLECTIONS.CHW_PROFILES).toBe('chwProfiles');
      expect(schema.COLLECTIONS.ORGANIZATIONS).toBe('organizations');
      expect(schema.COLLECTIONS.FORMS).toBe('forms');
      expect(schema.COLLECTIONS.FORM_SUBMISSIONS).toBe('formSubmissions');
      expect(schema.COLLECTIONS.GRANTS).toBe('grants');
      expect(schema.COLLECTIONS.PROJECTS).toBe('projects');
      expect(schema.COLLECTIONS.CLIENTS).toBe('clients');
      expect(schema.COLLECTIONS.REFERRALS).toBe('referrals');
      expect(schema.COLLECTIONS.DASHBOARD_METRICS).toBe('dashboardMetrics');
      expect(schema.COLLECTIONS.ACTIVITY_LOGS).toBe('activityLogs');
      expect(schema.COLLECTIONS.NOTIFICATIONS).toBe('notifications');
    });
  });

  describe('Schema Validation', () => {
    test('validateUser validates a valid user', () => {
      const user: schema.User = {
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: schema.UserRole.CHW,
        organizationId: 'general',
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const result = validateUser(user);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateUser catches invalid user', () => {
      const user = {
        uid: 'user-123',
        email: 'invalid-email',
        role: 'invalid-role',
        organizationId: 'general',
        isActive: true,
        isApproved: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const result = validateUser(user as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('email');
    });

    test('validateCHWProfile validates a valid CHW profile', () => {
      const profile: schema.CHWProfile = {
        uid: 'chw-123',
        firstName: 'John',
        lastName: 'Doe',
        certificationNumber: 'CHW-2024-001',
        certificationDate: Timestamp.now(),
        expirationDate: Timestamp.now(),
        certificationLevel: 'advanced',
        primaryPhone: '123-456-7890',
        region: 'Charlotte Metro',
        serviceArea: ['Mecklenburg County'],
        zipCodes: ['28202'],
        languages: ['English'],
        specializations: ['Maternal Health'],
        skills: ['Blood Pressure Screening'],
        availability: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }],
          saturday: [],
          sunday: []
        },
        isActive: true,
        caseLoad: 10,
        maxCaseLoad: 20,
        completedTrainings: 5,
        totalEncounters: 100,
        profileVisible: true,
        allowContactSharing: true,
        resources: [],
        equipment: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const result = validateCHWProfile(profile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateGrant validates a valid grant', () => {
      const grant: schema.Grant = {
        id: 'grant-123',
        title: 'Test Grant',
        description: 'Test grant description',
        fundingSource: 'Test Funder',
        amount: 10000,
        organizationId: 'general',
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(Date.now() + 86400000)), // Tomorrow
        status: 'active',
        projectIds: [],
        requirements: ['Requirement 1'],
        reportingSchedule: [],
        contactPerson: 'John Doe',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const result = validateGrant(grant);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Schema Initialization', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('initializeFirebaseSchema creates default organizations if they don\'t exist', async () => {
      const mockGetDocs = require('firebase/firestore').getDocs;
      mockGetDocs.mockResolvedValueOnce({ empty: true });

      const mockSetDoc = require('firebase/firestore').setDoc;
      mockSetDoc.mockResolvedValue(undefined);

      await initializeFirebaseSchema();

      // Should have called setDoc at least 4 times (3 orgs + connection test)
      expect(mockSetDoc).toHaveBeenCalledTimes(4);
    });

    test('getSchemaVersion returns the current schema version', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          version: '1.0.0',
          appliedAt: Timestamp.now(),
          description: 'Initial schema creation',
          changes: ['Created default organizations']
        })
      });

      const version = await getSchemaVersion();
      expect(version).not.toBeNull();
      expect(version?.version).toBe('1.0.0');
    });
  });
});

// Additional tests for data access functions would go here
// These would mock Firestore responses and verify the functions
// handle success and error cases correctly

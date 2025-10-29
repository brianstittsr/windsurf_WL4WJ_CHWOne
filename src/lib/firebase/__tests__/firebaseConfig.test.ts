/**
 * Firebase Configuration Tests
 * 
 * These tests verify that Firebase is initialized correctly
 * and that the same instance is used across the application.
 */

import { app, auth, db, storage, initializeFirebase } from '../firebaseConfig';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

describe('Firebase Configuration', () => {
  test('Firebase app is initialized', () => {
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
    expect(app.options).toBeDefined();
    expect(app.options.apiKey).toBeDefined();
    expect(app.options.projectId).toBeDefined();
  });

  test('Firebase auth is initialized', () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBe(app);
  });

  test('Firebase firestore is initialized', () => {
    expect(db).toBeDefined();
    expect(db.app).toBe(app);
  });

  test('Firebase storage is initialized', () => {
    expect(storage).toBeDefined();
    expect(storage.app).toBe(app);
  });

  test('initializeFirebase returns the same instances', () => {
    const services = initializeFirebase();
    expect(services.app).toBe(app);
    expect(services.auth).toBe(auth);
    expect(services.db).toBe(db);
    expect(services.storage).toBe(storage);
    expect(services.initialized).toBe(true);
  });

  test('Multiple calls to initializeFirebase return the same instances', () => {
    const services1 = initializeFirebase();
    const services2 = initializeFirebase();
    expect(services1).toBe(services2);
  });
});

// Mock test for firebase.ts re-exports
jest.mock('../firebaseConfig', () => {
  const mockApp = {} as FirebaseApp;
  const mockAuth = { app: mockApp } as Auth;
  const mockDb = { app: mockApp } as Firestore;
  const mockStorage = { app: mockApp } as FirebaseStorage;
  
  return {
    app: mockApp,
    auth: mockAuth,
    db: mockDb,
    storage: mockStorage,
    handleFirebaseError: jest.fn(),
    initializeFirebase: jest.fn().mockReturnValue({
      app: mockApp,
      auth: mockAuth,
      db: mockDb,
      storage: mockStorage,
      initialized: true
    })
  };
});

describe('Firebase Re-exports', () => {
  test('firebase.ts re-exports the same instances', async () => {
    // Import the re-exports
    const { default: reExportedApp, auth: reExportedAuth, db: reExportedDb, storage: reExportedStorage } = await import('../../firebase');
    
    // Get the original exports
    const { app: originalApp, auth: originalAuth, db: originalDb, storage: originalStorage } = await import('../firebaseConfig');
    
    // Verify they're the same instances
    expect(reExportedApp).toBe(originalApp);
    expect(reExportedAuth).toBe(originalAuth);
    expect(reExportedDb).toBe(originalDb);
    expect(reExportedStorage).toBe(originalStorage);
  });
});

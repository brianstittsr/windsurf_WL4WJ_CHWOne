'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getSchemaVersion } from '@/lib/schema/initialize-schema';

export default function FirebaseInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [schemaVersion, setSchemaVersion] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Verify Firebase Auth is working
        const auth = getAuth();
        
        // Log Firebase config status
        console.log('Firebase Auth initialized with config:', {
          apiKey: auth.app.options.apiKey ? 'Set' : 'Missing',
          authDomain: auth.app.options.authDomain ? 'Set' : 'Missing',
          projectId: auth.app.options.projectId ? 'Set' : 'Missing',
        });
        
        // Test auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Firebase Auth state initialized', user ? 'User authenticated' : 'No user');
          unsubscribe();
        });
        
        // Check schema version
        try {
          const versionInfo = await getSchemaVersion();
          if (versionInfo) {
            setSchemaVersion(versionInfo.version);
            console.log(`Firebase schema version: ${versionInfo.version} (applied at ${versionInfo.appliedAt.toDate().toLocaleString()})`);
          } else {
            console.log('Schema version not found, initialization may be in progress');
          }
        } catch (schemaError) {
          console.warn('Error checking schema version:', schemaError);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };

    initializeFirebase();
  }, []);

  // This component doesn't render anything
  return null;
}

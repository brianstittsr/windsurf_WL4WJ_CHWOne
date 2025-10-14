'use client';

import React from 'react';
import AuthTest from '@/components/test/AuthTest';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AuthTestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Authentication Test Page</h1>
      <p>This page tests the authentication system with Firebase as the default provider.</p>
      <p>If Cognito is configured via NEXT_PUBLIC_AUTH_PROVIDER=cognito, it will use Cognito instead.</p>
      
      <AuthProvider>
        <AuthTest />
      </AuthProvider>
    </div>
  );
}

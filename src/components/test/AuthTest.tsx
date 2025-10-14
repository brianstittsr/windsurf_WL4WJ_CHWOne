'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthProviderName } from '@/lib/auth/AuthInterface';

export default function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const auth = useAuth();
  const authProvider = getAuthProviderName();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      await auth.login(email, password);
      setMessage('Login successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };
  
  const handleLogout = async () => {
    try {
      await auth.logout();
      setMessage('Logout successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Auth Test</h1>
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Current Auth Status</h2>
        <p><strong>Auth Provider:</strong> {authProvider}</p>
        <p><strong>Loading:</strong> {auth.loading ? 'Yes' : 'No'}</p>
        <p><strong>Logged In:</strong> {auth.currentUser ? 'Yes' : 'No'}</p>
        {auth.currentUser && (
          <div>
            <h3>User Info</h3>
            <p><strong>UID:</strong> {auth.currentUser.uid}</p>
            <p><strong>Email:</strong> {auth.currentUser.email}</p>
            <p><strong>Name:</strong> {auth.currentUser.displayName || 'Not set'}</p>
            <p><strong>Email Verified:</strong> {auth.currentUser.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
      
      {!auth.currentUser ? (
        <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
          <h2>Login</h2>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Login
          </button>
        </form>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Logout
          </button>
        </div>
      )}
      
      {message && (
        <div style={{ padding: '10px', backgroundColor: '#dff0d8', color: '#3c763d', borderRadius: '4px', marginBottom: '10px' }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f2dede', color: '#a94442', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Auth Provider Features</h3>
        <ul>
          <li><strong>confirmSignUp:</strong> {auth.confirmSignUp ? 'Available' : 'Not Available'}</li>
          <li><strong>forgotPassword:</strong> {auth.forgotPassword ? 'Available' : 'Not Available'}</li>
          <li><strong>confirmPassword:</strong> {auth.confirmPassword ? 'Available' : 'Not Available'}</li>
          <li><strong>updateUserAttributes:</strong> {auth.updateUserAttributes ? 'Available' : 'Not Available'}</li>
          <li><strong>resendConfirmationCode:</strong> {auth.resendConfirmationCode ? 'Available' : 'Not Available'}</li>
        </ul>
      </div>
    </div>
  );
}

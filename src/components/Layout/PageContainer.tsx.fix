'use client';

import React from 'react';
import { Container, Card } from 'react-bootstrap';
import Header from './Header';
import PageFooter from './PageFooter';

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'full-width' | 'magic' | 'magic-centered';
  headerVariant?: 'default' | 'minimal' | 'magic';
  footerVariant?: 'default' | 'minimal' | 'magic';
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: string;
  padding?: string;
  background?: 'default' | 'gradient' | 'neutral' | 'magic';
}

export default function PageContainer({
  children,
  variant = 'default',
  headerVariant = 'default',
  footerVariant = 'default',
  showHeader = true,
  showFooter = true,
  maxWidth = '1200px',
  padding = '32px',
  background = 'default'
}: PageContainerProps) {
  
  const getBackgroundStyle = () => {
    switch (background) {
      case 'gradient':
      case 'magic':
        return {
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 12s ease infinite',
          color: 'white'
        };
      case 'neutral':
        return {
          background: '#f5f5f5'
        };
      default:
        return {
          background: '#ffffff'
        };
    }
  };

  const getContainerStyle = () => {
    if (variant === 'magic-centered') {
      return {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center' as const,
        maxWidth: '800px',
        margin: '0 auto',
        padding: '4rem 2rem',
        minHeight: 'calc(100vh - 200px)'
      };
    }

    if (variant === 'magic') {
      return {
        maxWidth: maxWidth,
        margin: '0 auto',
        padding: padding,
        color: 'white'
      };
    }

    if (variant === 'full-width') {
      return {
        width: '100%',
        padding: padding
      };
    }
    
    if (variant === 'minimal') {
      return {
        maxWidth: maxWidth,
        margin: '0 auto',
        padding: '16px'
      };
    }

    return {
      maxWidth: maxWidth,
      margin: '0 auto',
      padding: padding
    };
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      ...getBackgroundStyle()
    }}>
      {/* Header */}
      {showHeader && <Header variant={headerVariant} />}

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {variant === 'default' ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 24px'
          }}>
            <Card style={{
              ...getContainerStyle(),
              flex: 1,
              background: background === 'gradient' ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
              backdropFilter: background === 'gradient' ? 'blur(20px)' : 'none',
              border: background === 'gradient' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #dee2e6',
              borderRadius: '24px',
              boxShadow: background === 'gradient' ? 
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 
                '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
            }}>
              {children}
            </Card>
          </div>
        ) : (
          <div style={getContainerStyle()}>
            {children}
          </div>
        )}
      </main>

      {/* Footer */}
      {showFooter && <PageFooter variant={footerVariant} />}

      {/* Gradient Animation Styles */}
      {background === 'gradient' && (
        <style jsx>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
    </div>
  );
}

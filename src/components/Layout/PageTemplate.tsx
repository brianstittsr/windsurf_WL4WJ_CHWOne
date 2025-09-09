'use client';

import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import PageContainer from './PageContainer';

/**
 * Example page template showing how to build modular pages with Bootstrap
 * 
 * Usage Examples:
 * 
 * 1. Standard page with header/footer:
 * <PageTemplate title="My Page" />
 * 
 * 2. Full-width page with gradient background:
 * <PageTemplate title="Dashboard" variant="full-width" background="gradient" />
 * 
 * 3. Minimal page without footer:
 * <PageTemplate title="Login" variant="minimal" showFooter={false} />
 */

interface PageTemplateProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'full-width';
  background?: 'default' | 'gradient' | 'neutral';
  showHeader?: boolean;
  showFooter?: boolean;
  actions?: React.ReactNode;
}

export default function PageTemplate({
  title = "Page Title",
  subtitle,
  children,
  variant = 'default',
  background = 'default',
  showHeader = true,
  showFooter = true,
  actions
}: PageTemplateProps) {
  
  return (
    <PageContainer
      variant={variant}
      background={background}
      showHeader={showHeader}
      showFooter={showFooter}
    >
      {/* Page Header */}
      {(title || subtitle || actions) && (
        <div className="d-flex justify-content-between align-items-start mb-4 gap-3 flex-wrap">
          <div className="d-flex flex-column gap-2 flex-grow-1">
            {title && (
              <h2 className="text-primary fw-bold">{title}</h2>
            )}
            {subtitle && (
              <p className="text-muted">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="d-flex gap-2 align-items-center">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {children || (
        <div className="d-flex flex-column gap-4">
          {/* Example Content Sections */}
          <Card className="p-4">
            <h3 className="fw-bold mb-3">Content Section 1</h3>
            <p className="text-muted mb-3">
              This is an example of how to structure content using Bootstrap components. 
              Each section can be wrapped in a Card for visual separation.
            </p>
            <Button variant="primary">Primary Action</Button>
          </Card>

          <Row className="g-4">
            <Col md={6}>
              <Card className="p-4 h-100">
                <h4 className="fw-bold mb-3">Left Column</h4>
                <p className="text-muted">
                  Use Row and Col components for responsive layouts.
                </p>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="p-4 h-100">
                <h4 className="fw-bold mb-3">Right Column</h4>
                <p className="text-muted">
                  Content automatically adapts to different screen sizes.
                </p>
              </Card>
            </Col>
          </Row>

          <Card className="p-4">
            <h3 className="fw-bold mb-3">Action Section</h3>
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <Button variant="primary">Save Changes</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="outline-secondary">More Options</Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

// Export individual layout components for advanced usage
export { default as PageContainer } from './PageContainer';
export { default as Header } from './Header';
export { default as PageFooter } from './PageFooter';

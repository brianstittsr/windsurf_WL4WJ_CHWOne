"use client";

import React from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";

export default function DashboardPlaceholder() {
  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">CHW Platform Dashboard</h2>
        <p className="text-muted">This dashboard is being migrated to Bootstrap.</p>
      </div>
      <Row className="g-3">
        {["Active CHWs", "Active Projects", "Active Grants", "Pending Referrals"].map((title) => (
          <Col md={3} sm={6} key={title}>
            <Card className="h-100 text-center">
              <Card.Body>
                <Spinner animation="border" size="sm" className="mb-2" />
                <Card.Title className="h6 mb-0">{title}</Card.Title>
                <small className="text-muted">Loading…</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

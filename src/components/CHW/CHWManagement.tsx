'use client';

import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Card, CardContent, Grid, Button, TextField, Chip, LinearProgress, Dialog, Box, Typography } from '@mui/material';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunityHealthWorker, UserRole } from '@/types/platform.types';
import { FaPlus, FaEdit, FaEye, FaCertificate } from 'react-icons/fa';

export default function CHWManagement() {
  const [chws, setCHWs] = useState<CommunityHealthWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCHW, setSelectedCHW] = useState<CommunityHealthWorker | null>(null);
  const [formData, setFormData] = useState({
    certificationNumber: '',
    certificationDate: '',
    expirationDate: '',
    specializations: '',
    region: '',
    serviceArea: '',
    languages: '',
    maxCaseLoad: 25,
    supervisor: ''
  });

  useEffect(() => {
    fetchCHWs();
  }, []);

  const fetchCHWs = async () => {
    try {
      // Check if we're in test mode (bypass Firebase)
      const isTestMode = process.env.NODE_ENV === 'development' && 
                         process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

      if (isTestMode) {
        // Enhanced mock CHW data with more realistic scenarios
        const mockCHWs: CommunityHealthWorker[] = [
          {
            id: 'chw-1',
            userId: 'user-chw-1',
            certificationNumber: 'CHW-2024-001',
            certificationDate: new Date('2024-01-15'),
            expirationDate: new Date('2026-01-15'),
            specializations: ['Maternal Health', 'Diabetes Management', 'Hypertension Care'],
            region: 'Charlotte Metro',
            serviceArea: ['Mecklenburg County', 'Union County'],
            languages: ['English', 'Spanish'],
            maxCaseLoad: 25,
            caseLoad: 22,
            supervisor: 'Sarah Johnson',
            isActive: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          },
          {
            id: 'chw-2',
            userId: 'user-chw-2',
            certificationNumber: 'CHW-2024-002',
            certificationDate: new Date('2024-02-01'),
            expirationDate: new Date('2025-02-15'), // Expiring soon
            specializations: ['Mental Health', 'Substance Abuse', 'Crisis Intervention'],
            region: 'Triangle',
            serviceArea: ['Durham County', 'Wake County'],
            languages: ['English', 'French'],
            maxCaseLoad: 20,
            caseLoad: 18,
            supervisor: 'Michael Davis',
            isActive: true,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01')
          },
          {
            id: 'chw-3',
            userId: 'user-chw-3',
            certificationNumber: 'CHW-2024-003',
            certificationDate: new Date('2024-03-10'),
            expirationDate: new Date('2026-03-10'),
            specializations: ['Pediatric Care', 'Immunizations', 'Child Development'],
            region: 'Western NC',
            serviceArea: ['Buncombe County', 'Henderson County'],
            languages: ['English'],
            maxCaseLoad: 30,
            caseLoad: 15,
            supervisor: 'Lisa Rodriguez',
            isActive: true,
            createdAt: new Date('2024-03-10'),
            updatedAt: new Date('2024-03-10')
          }
        ];
        setCHWs(mockCHWs);
        setLoading(false);
        return;
      }

      // Firebase query with proper error handling
      const chwQuery = query(
        collection(db, 'communityHealthWorkers'),
        // Add any additional filters here if needed
      );
      
      const snapshot = await getDocs(chwQuery);
      const chwData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure dates are properly converted
          certificationDate: data.certificationDate?.toDate ? data.certificationDate.toDate() : new Date(data.certificationDate),
          expirationDate: data.expirationDate?.toDate ? data.expirationDate.toDate() : new Date(data.expirationDate),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        };
      }) as CommunityHealthWorker[];
      
      setCHWs(chwData);
    } catch (error) {
      console.error('Error fetching CHWs:', error);
      // Fallback to empty array on error, but log the issue
      setCHWs([]);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationStatus = (expirationDate: Date) => {
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return { status: 'expired', variant: 'danger' };
    if (daysUntilExpiration <= 30) return { status: 'expiring soon', variant: 'warning' };
    return { status: 'active', variant: 'success' };
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" className="me-2" />
        <span className="text-muted">Loading CHWs…</span>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-3">Community Health Workers</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Certification #</th>
            <th>Region</th>
            <th>Languages</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {chws.map((chw) => (
            <tr key={chw.id}>
              <td>{chw.certificationNumber}</td>
              <td>{chw.region}</td>
              <td>{Array.isArray(chw.languages) ? chw.languages.join(', ') : chw.languages}</td>
              <td>{chw.isActive ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

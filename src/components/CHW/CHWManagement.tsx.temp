'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Chip, Box, Typography } from '@mui/material';
import { getCHWs } from '@/lib/schema/data-access';
import { CHWProfile } from '@/lib/schema/unified-schema';
import { FaPlus, FaEdit, FaEye, FaCertificate } from 'react-icons/fa';

export default function CHWManagement() {
  const [chws, setCHWs] = useState<CHWProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
        const mockCHWs: CHWProfile[] = [
          {
            uid: 'chw-1',
            firstName: 'Maria',
            lastName: 'Rodriguez',
            certificationNumber: 'CHW-2024-001',
            certificationDate: new Date('2024-01-15') as any,
            expirationDate: new Date('2026-01-15') as any,
            certificationLevel: 'advanced',
            specializations: ['Maternal Health', 'Diabetes Management', 'Hypertension Care'],
            region: 'Charlotte Metro',
            serviceArea: ['Mecklenburg County', 'Union County'],
            zipCodes: ['28202', '28203', '28204'],
            languages: ['English', 'Spanish'],
            skills: ['Blood Pressure Screening', 'Diabetes Education', 'Prenatal Care'],
            primaryPhone: '704-555-1234',
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
            caseLoad: 22,
            maxCaseLoad: 25,
            completedTrainings: 12,
            totalEncounters: 156,
            profileVisible: true,
            allowContactSharing: true,
            supervisor: 'Sarah Johnson',
            resources: [],
            equipment: ['Blood Pressure Cuff', 'Tablet', 'Educational Materials'],
            createdAt: new Date('2024-01-15') as any,
            updatedAt: new Date('2024-01-15') as any
          },
          {
            uid: 'chw-2',
            firstName: 'James',
            lastName: 'Wilson',
            certificationNumber: 'CHW-2024-002',
            certificationDate: new Date('2024-02-01') as any,
            expirationDate: new Date('2025-02-15') as any, // Expiring soon
            certificationLevel: 'intermediate',
            specializations: ['Mental Health', 'Substance Abuse', 'Crisis Intervention'],
            region: 'Triangle',
            serviceArea: ['Durham County', 'Wake County'],
            zipCodes: ['27701', '27703', '27601'],
            languages: ['English', 'French'],
            skills: ['Crisis Intervention', 'Mental Health First Aid', 'Substance Abuse Counseling'],
            primaryPhone: '919-555-2345',
            availability: {
              monday: [{ start: '10:00', end: '18:00' }],
              tuesday: [{ start: '10:00', end: '18:00' }],
              wednesday: [{ start: '10:00', end: '18:00' }],
              thursday: [{ start: '10:00', end: '18:00' }],
              friday: [{ start: '10:00', end: '18:00' }],
              saturday: [],
              sunday: []
            },
            isActive: true,
            caseLoad: 18,
            maxCaseLoad: 20,
            completedTrainings: 8,
            totalEncounters: 112,
            profileVisible: true,
            allowContactSharing: true,
            supervisor: 'Michael Davis',
            resources: [],
            equipment: ['Laptop', 'Resource Guides', 'Crisis Intervention Kit'],
            createdAt: new Date('2024-02-01') as any,
            updatedAt: new Date('2024-02-01') as any
          },
          {
            uid: 'chw-3',
            firstName: 'Tasha',
            lastName: 'Johnson',
            certificationNumber: 'CHW-2024-003',
            certificationDate: new Date('2024-03-10') as any,
            expirationDate: new Date('2026-03-10') as any,
            certificationLevel: 'entry',
            specializations: ['Pediatric Care', 'Immunizations', 'Child Development'],
            region: 'Western NC',
            serviceArea: ['Buncombe County', 'Henderson County'],
            zipCodes: ['28801', '28803', '28792'],
            languages: ['English'],
            skills: ['Pediatric Assessment', 'Immunization Education', 'Child Development Screening'],
            primaryPhone: '828-555-3456',
            availability: {
              monday: [{ start: '08:00', end: '16:00' }],
              tuesday: [{ start: '08:00', end: '16:00' }],
              wednesday: [{ start: '08:00', end: '16:00' }],
              thursday: [{ start: '08:00', end: '16:00' }],
              friday: [{ start: '08:00', end: '16:00' }],
              saturday: [],
              sunday: []
            },
            isActive: true,
            caseLoad: 15,
            maxCaseLoad: 30,
            completedTrainings: 5,
            totalEncounters: 87,
            profileVisible: true,
            allowContactSharing: true,
            supervisor: 'Lisa Rodriguez',
            resources: [],
            equipment: ['Growth Charts', 'Developmental Screening Tools', 'Educational Materials'],
            createdAt: new Date('2024-03-10') as any,
            updatedAt: new Date('2024-03-10') as any
          }
        ];
        setCHWs(mockCHWs);
        setLoading(false);
        return;
      }

      // Use the unified schema data access layer
      const result = await getCHWs();
      
      if (result.success) {
        setCHWs(result.chws);
      } else {
        console.error('Error fetching CHWs:', result.error);
        setCHWs([]);
      }
    } catch (error) {
      console.error('Error fetching CHWs:', error);
      setCHWs([]);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationStatus = (expirationDate: Date) => {
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return { status: 'expired', variant: 'error' };
    if (daysUntilExpiration <= 30) return { status: 'expiring soon', variant: 'warning' };
    return { status: 'active', variant: 'success' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography color="text.secondary">Loading CHWs…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Community Health Workers</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<FaPlus />}
          onClick={() => alert('Add CHW functionality to be implemented')}
        >
          Add CHW
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Certification #</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Languages</TableCell>
              <TableCell>Certification</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chws.map((chw) => {
              // Handle both Date and Timestamp objects
              const expirationDate = typeof chw.expirationDate === 'object' && 'toDate' in chw.expirationDate 
                ? chw.expirationDate.toDate() 
                : new Date(chw.expirationDate);
              const certStatus = getCertificationStatus(expirationDate);
              
              return (
                <TableRow key={chw.uid}>
                  <TableCell>{`${chw.firstName} ${chw.lastName}`}</TableCell>
                  <TableCell>{chw.certificationNumber}</TableCell>
                  <TableCell>{chw.region}</TableCell>
                  <TableCell>{chw.languages.join(', ')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={certStatus.status}
                      color={certStatus.variant as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={chw.isActive ? 'Active' : 'Inactive'}
                      color={chw.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<FaEye />}
                        onClick={() => alert(`View CHW ${chw.uid}`)}
                      >
                        View
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<FaEdit />}
                        onClick={() => alert(`Edit CHW ${chw.uid}`)}
                      >
                        Edit
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

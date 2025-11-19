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
            userId: 'chw-1',
            firstName: 'Maria',
            lastName: 'Rodriguez',
            email: 'maria.rodriguez@example.com',
            phone: '704-555-1234',
            displayName: 'Maria Rodriguez',
            professional: {
              headline: 'Experienced CHW specializing in Maternal Health',
              bio: 'Dedicated community health worker with focus on maternal and child health',
              expertise: ['Maternal Health', 'Diabetes Management', 'Hypertension Care'],
              languages: ['English', 'Spanish'],
              availableForOpportunities: true,
              yearsOfExperience: 5,
              specializations: ['Maternal Health', 'Diabetes Management', 'Hypertension Care'],
              currentOrganization: 'Charlotte Health Center',
              currentPosition: 'Senior CHW'
            },
            serviceArea: {
              region: 'Charlotte Metro',
              countiesWorkedIn: ['Mecklenburg County', 'Union County'],
              countyResideIn: 'Mecklenburg County',
              primaryCounty: 'Mecklenburg County',
              currentOrganization: 'Charlotte Health Center',
              role: 'Senior CHW'
            },
            certification: {
              certificationNumber: 'CHW-2024-001',
              certificationStatus: 'certified',
              certificationExpiration: '2026-01-15',
              expirationDate: '2026-01-15'
            },
            membership: {
              dateRegistered: '2024-01-15',
              includeInDirectory: true
            },
            contactPreferences: {
              allowDirectMessages: true,
              showEmail: true,
              showPhone: true,
              showAddress: false
            },
            status: 'active',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-15'
          },
          {
            userId: 'chw-2',
            firstName: 'James',
            lastName: 'Wilson',
            email: 'james.wilson@example.com',
            phone: '919-555-2345',
            displayName: 'James Wilson',
            professional: {
              headline: 'Mental Health and Crisis Intervention Specialist',
              bio: 'Experienced in mental health support and crisis intervention',
              expertise: ['Mental Health', 'Substance Abuse', 'Crisis Intervention'],
              languages: ['English', 'French'],
              availableForOpportunities: true,
              yearsOfExperience: 3,
              specializations: ['Mental Health', 'Substance Abuse', 'Crisis Intervention'],
              currentOrganization: 'Triangle Mental Health',
              currentPosition: 'CHW'
            },
            serviceArea: {
              region: 'Triangle',
              countiesWorkedIn: ['Durham County', 'Wake County'],
              countyResideIn: 'Durham County',
              primaryCounty: 'Durham County',
              currentOrganization: 'Triangle Mental Health',
              role: 'CHW'
            },
            certification: {
              certificationNumber: 'CHW-2024-002',
              certificationStatus: 'certified',
              certificationExpiration: '2025-02-15',
              expirationDate: '2025-02-15'
            },
            membership: {
              dateRegistered: '2024-02-01',
              includeInDirectory: true
            },
            contactPreferences: {
              allowDirectMessages: true,
              showEmail: true,
              showPhone: true,
              showAddress: false
            },
            status: 'active',
            createdAt: '2024-02-01',
            updatedAt: '2024-02-01'
          },
          {
            userId: 'chw-3',
            firstName: 'Tasha',
            lastName: 'Johnson',
            email: 'tasha.johnson@example.com',
            phone: '828-555-3456',
            displayName: 'Tasha Johnson',
            professional: {
              headline: 'Pediatric Care and Child Development Specialist',
              bio: 'Focused on pediatric care and child development',
              expertise: ['Pediatric Care', 'Immunizations', 'Child Development'],
              languages: ['English'],
              availableForOpportunities: true,
              yearsOfExperience: 2,
              specializations: ['Pediatric Care', 'Immunizations', 'Child Development'],
              currentOrganization: 'Western NC Health',
              currentPosition: 'CHW'
            },
            serviceArea: {
              region: 'Western NC',
              countiesWorkedIn: ['Buncombe County', 'Henderson County'],
              countyResideIn: 'Buncombe County',
              primaryCounty: 'Buncombe County',
              currentOrganization: 'Western NC Health',
              role: 'CHW'
            },
            certification: {
              certificationNumber: 'CHW-2024-003',
              certificationStatus: 'certified',
              certificationExpiration: '2026-03-10',
              expirationDate: '2026-03-10'
            },
            membership: {
              dateRegistered: '2024-03-10',
              includeInDirectory: true
            },
            contactPreferences: {
              allowDirectMessages: true,
              showEmail: true,
              showPhone: true,
              showAddress: false
            },
            status: 'active',
            createdAt: '2024-03-10',
            updatedAt: '2024-03-10'
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
              // Handle certification expiration date
              const expirationDate = chw.certification?.expirationDate 
                ? new Date(chw.certification.expirationDate)
                : null;
              const certStatus = expirationDate ? getCertificationStatus(expirationDate) : { status: 'Unknown', variant: 'default' };
              
              return (
                <TableRow key={chw.userId || chw.id}>
                  <TableCell>{`${chw.firstName} ${chw.lastName}`}</TableCell>
                  <TableCell>{chw.certification?.certificationNumber || 'N/A'}</TableCell>
                  <TableCell>{chw.serviceArea.region}</TableCell>
                  <TableCell>{chw.professional.languages.join(', ')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={certStatus.status}
                      color={certStatus.variant as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={chw.status === 'active' ? 'Active' : 'Inactive'}
                      color={chw.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<FaEye />}
                        onClick={() => alert(`View CHW ${chw.userId || chw.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<FaEdit />}
                        onClick={() => alert(`Edit CHW ${chw.userId || chw.id}`)}
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

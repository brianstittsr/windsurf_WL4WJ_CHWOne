'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  Alert, Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CloudDownload as ImportIcon
} from '@mui/icons-material';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import IRSSearchModal from './IRSSearchModal';

interface Nonprofit {
  id: string;
  organizationName: string;
  organizationType: string;
  ein: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  services: {
    categories: string[];
  };
  status: string;
  approvalStatus: string;
  createdAt: any;
}

export default function AdminNonprofits() {
  const [activeTab, setActiveTab] = useState(0);
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNonprofit, setSelectedNonprofit] = useState<Nonprofit | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showIRSSearchModal, setShowIRSSearchModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    fetchNonprofits();
  }, []);

  const fetchNonprofits = async () => {
    try {
      setLoading(true);
      const nonprofitsRef = collection(db, 'nonprofits');
      const querySnapshot = await getDocs(nonprofitsRef);
      
      const fetchedNonprofits: Nonprofit[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNonprofits.push({
          id: doc.id,
          ...doc.data()
        } as Nonprofit);
      });
      
      setNonprofits(fetchedNonprofits);
      console.log('Fetched nonprofits:', fetchedNonprofits.length);
    } catch (error) {
      console.error('Error fetching nonprofits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (nonprofitId: string) => {
    if (!confirm('Are you sure you want to approve this nonprofit?')) return;

    try {
      const nonprofitRef = doc(db, 'nonprofits', nonprofitId);
      await updateDoc(nonprofitRef, {
        status: 'active',
        approvalStatus: 'approved',
        isActive: true,
        isApproved: true,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      alert('Nonprofit approved successfully!');
      fetchNonprofits();
    } catch (error) {
      console.error('Error approving nonprofit:', error);
      alert('Failed to approve nonprofit');
    }
  };

  const handleReject = async (nonprofitId: string) => {
    if (!confirm('Are you sure you want to reject this nonprofit?')) return;

    try {
      const nonprofitRef = doc(db, 'nonprofits', nonprofitId);
      await updateDoc(nonprofitRef, {
        status: 'rejected',
        approvalStatus: 'rejected',
        isActive: false,
        isApproved: false,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      alert('Nonprofit rejected');
      fetchNonprofits();
    } catch (error) {
      console.error('Error rejecting nonprofit:', error);
      alert('Failed to reject nonprofit');
    }
  };

  const handleDelete = async (nonprofitId: string) => {
    if (!confirm('Are you sure you want to delete this nonprofit? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'nonprofits', nonprofitId));
      alert('Nonprofit deleted successfully');
      fetchNonprofits();
    } catch (error) {
      console.error('Error deleting nonprofit:', error);
      alert('Failed to delete nonprofit');
    }
  };

  const handleViewDetails = (nonprofit: Nonprofit) => {
    setSelectedNonprofit(nonprofit);
    setShowDetailDialog(true);
  };

  // Handle importing organization from IRS search
  const handleImportFromIRS = async (orgData: any) => {
    try {
      // Check if organization already exists by EIN
      const existingOrg = nonprofits.find(n => n.ein === orgData.ein);
      
      if (existingOrg) {
        // Update existing organization with new IRS data
        const nonprofitRef = doc(db, 'nonprofits', existingOrg.id);
        
        // Create history entry for the update
        const irsDataHistory = {
          importedAt: new Date().toISOString(),
          taxPeriod: orgData.taxPeriod,
          assetAmount: orgData.assetAmount,
          incomeAmount: orgData.incomeAmount,
          revenueAmount: orgData.revenueAmount,
          latestFiling: orgData.latestFiling,
          filingHistory: orgData.filingHistory
        };

        await updateDoc(nonprofitRef, {
          // Update basic info
          organizationName: orgData.organizationName,
          address: {
            street: orgData.address || '',
            city: orgData.city || '',
            state: orgData.state || '',
            zipCode: orgData.zipCode || ''
          },
          // IRS specific data
          irsData: {
            nteeCode: orgData.nteeCode,
            subsectionCode: orgData.subsectionCode,
            rulingDate: orgData.rulingDate,
            deductibilityCode: orgData.deductibilityCode,
            foundationCode: orgData.foundationCode,
            exemptStatusCode: orgData.exemptStatusCode,
            affiliationCode: orgData.affiliationCode,
            classificationCodes: orgData.classificationCodes,
            activityCodes: orgData.activityCodes,
            accountingPeriod: orgData.accountingPeriod,
            lastUpdated: new Date().toISOString()
          },
          // Financial data
          financialData: {
            assetAmount: orgData.assetAmount,
            incomeAmount: orgData.incomeAmount,
            revenueAmount: orgData.revenueAmount,
            taxPeriod: orgData.taxPeriod,
            latestFiling: orgData.latestFiling
          },
          // Append to history
          irsDataHistory: [...(existingOrg as any).irsDataHistory || [], irsDataHistory],
          updatedAt: serverTimestamp(),
          lastIRSSync: serverTimestamp()
        });

        setSnackbar({
          open: true,
          message: `Updated ${orgData.organizationName} with latest IRS data`,
          severity: 'success'
        });
      } else {
        // Create new nonprofit record
        const newNonprofit = {
          organizationName: orgData.organizationName,
          organizationType: getOrganizationType(orgData.subsectionCode),
          ein: orgData.ein,
          address: {
            street: orgData.address || '',
            city: orgData.city || '',
            state: orgData.state || '',
            zipCode: orgData.zipCode || ''
          },
          primaryContact: {
            name: orgData.careOfName || '',
            email: '',
            phone: ''
          },
          services: {
            categories: getNTEECategories(orgData.nteeCode)
          },
          // IRS specific data
          irsData: {
            nteeCode: orgData.nteeCode,
            subsectionCode: orgData.subsectionCode,
            rulingDate: orgData.rulingDate,
            deductibilityCode: orgData.deductibilityCode,
            foundationCode: orgData.foundationCode,
            exemptStatusCode: orgData.exemptStatusCode,
            affiliationCode: orgData.affiliationCode,
            classificationCodes: orgData.classificationCodes,
            activityCodes: orgData.activityCodes,
            accountingPeriod: orgData.accountingPeriod,
            lastUpdated: new Date().toISOString()
          },
          // Financial data
          financialData: {
            assetAmount: orgData.assetAmount,
            incomeAmount: orgData.incomeAmount,
            revenueAmount: orgData.revenueAmount,
            taxPeriod: orgData.taxPeriod,
            latestFiling: orgData.latestFiling
          },
          // Filing history
          irsDataHistory: [{
            importedAt: new Date().toISOString(),
            taxPeriod: orgData.taxPeriod,
            assetAmount: orgData.assetAmount,
            incomeAmount: orgData.incomeAmount,
            revenueAmount: orgData.revenueAmount,
            latestFiling: orgData.latestFiling,
            filingHistory: orgData.filingHistory
          }],
          status: 'pending',
          approvalStatus: 'pending',
          isActive: false,
          isApproved: false,
          importedFromIRS: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastIRSSync: serverTimestamp()
        };

        await addDoc(collection(db, 'nonprofits'), newNonprofit);

        setSnackbar({
          open: true,
          message: `Imported ${orgData.organizationName} from IRS database`,
          severity: 'success'
        });
      }

      // Refresh the list
      await fetchNonprofits();
    } catch (error) {
      console.error('Error importing from IRS:', error);
      setSnackbar({
        open: true,
        message: `Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      throw error;
    }
  };

  // Helper function to determine organization type from subsection code
  const getOrganizationType = (subsectionCode: number): string => {
    const types: Record<number, string> = {
      3: 'Charitable Organization',
      4: 'Social Welfare Organization',
      5: 'Labor/Agricultural Organization',
      6: 'Business League',
      7: 'Social Club',
      8: 'Fraternal Beneficiary Society',
      9: 'Voluntary Employees Association',
      10: 'Domestic Fraternal Society',
      13: 'Cemetery Company',
      14: 'Credit Union',
      19: 'Veterans Organization'
    };
    return types[subsectionCode] || 'Tax Exempt Organization';
  };

  // Helper function to get service categories from NTEE code
  const getNTEECategories = (nteeCode: string): string[] => {
    if (!nteeCode) return ['General'];
    
    const firstChar = nteeCode.charAt(0).toUpperCase();
    const categories: Record<string, string[]> = {
      'A': ['Arts, Culture & Humanities'],
      'B': ['Education'],
      'C': ['Environment'],
      'D': ['Animal-Related'],
      'E': ['Health Care'],
      'F': ['Mental Health'],
      'G': ['Disease & Disorders'],
      'H': ['Medical Research'],
      'I': ['Crime & Legal'],
      'J': ['Employment'],
      'K': ['Food, Agriculture & Nutrition'],
      'L': ['Housing & Shelter'],
      'M': ['Public Safety'],
      'N': ['Recreation & Sports'],
      'O': ['Youth Development'],
      'P': ['Human Services'],
      'Q': ['International Affairs'],
      'R': ['Civil Rights'],
      'S': ['Community Improvement'],
      'T': ['Philanthropy & Voluntarism'],
      'U': ['Science & Technology'],
      'V': ['Social Science'],
      'W': ['Public & Societal Benefit'],
      'X': ['Religion'],
      'Y': ['Mutual & Membership Benefit'],
      'Z': ['Unknown']
    };
    
    return categories[firstChar] || ['General'];
  };

  // Get list of existing EINs for duplicate detection
  const existingEINs = nonprofits.map(n => n.ein).filter(Boolean);

  const getFilteredNonprofits = () => {
    switch (activeTab) {
      case 0: // All
        return nonprofits;
      case 1: // Active
        return nonprofits.filter(n => n.approvalStatus === 'approved');
      case 2: // Pending
        return nonprofits.filter(n => n.approvalStatus === 'pending');
      default:
        return nonprofits;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Nonprofit Organization Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ImportIcon />}
            onClick={() => setShowIRSSearchModal(true)}
          >
            Import from IRS
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNonprofits}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={`ALL NONPROFITS (${nonprofits.length})`} />
        <Tab label={`ACTIVE NONPROFITS (${nonprofits.filter(n => n.approvalStatus === 'approved').length})`} />
        <Tab label={`PENDING APPROVAL (${nonprofits.filter(n => n.approvalStatus === 'pending').length})`} />
      </Tabs>

      {loading ? (
        <Typography>Loading nonprofits...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Organization Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>EIN</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Services</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredNonprofits().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      No nonprofits found. Click "Add New Nonprofit" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredNonprofits().map((nonprofit) => (
                  <TableRow key={nonprofit.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {nonprofit.organizationName}
                      </Typography>
                    </TableCell>
                    <TableCell>{nonprofit.organizationType}</TableCell>
                    <TableCell>{nonprofit.ein}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{nonprofit.primaryContact?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {nonprofit.primaryContact?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {nonprofit.services?.categories?.slice(0, 2).map((cat, idx) => (
                        <Chip key={idx} label={cat} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                      {nonprofit.services?.categories?.length > 2 && (
                        <Chip label={`+${nonprofit.services.categories.length - 2}`} size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={nonprofit.approvalStatus || nonprofit.status}
                        color={getStatusColor(nonprofit.approvalStatus || nonprofit.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleViewDetails(nonprofit)} title="View Details">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {nonprofit.approvalStatus === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(nonprofit.id)}
                              title="Approve"
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(nonprofit.id)}
                              title="Reject"
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(nonprofit.id)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nonprofit Details</DialogTitle>
        <DialogContent>
          {selectedNonprofit && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedNonprofit.organizationName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography>{selectedNonprofit.organizationType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">EIN</Typography>
                <Typography>{selectedNonprofit.ein}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Primary Contact</Typography>
                <Typography>{selectedNonprofit.primaryContact?.name}</Typography>
                <Typography variant="body2">{selectedNonprofit.primaryContact?.email}</Typography>
                <Typography variant="body2">{selectedNonprofit.primaryContact?.phone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Service Categories</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedNonprofit.services?.categories?.map((cat, idx) => (
                    <Chip key={idx} label={cat} size="small" />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedNonprofit.approvalStatus || selectedNonprofit.status}
                  color={getStatusColor(selectedNonprofit.approvalStatus || selectedNonprofit.status)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* IRS Search Modal */}
      <IRSSearchModal
        open={showIRSSearchModal}
        onClose={() => setShowIRSSearchModal(false)}
        onImport={handleImportFromIRS}
        existingEINs={existingEINs}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

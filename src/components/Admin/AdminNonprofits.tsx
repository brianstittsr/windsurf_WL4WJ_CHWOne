'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  Alert, Snackbar, TablePagination, FormControl, InputLabel, Select, MenuItem,
  InputAdornment
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

// Service categories matching public wizard
const SERVICE_CATEGORIES = [
  'Healthcare Services',
  'Mental Health Services',
  'Substance Abuse Treatment',
  'Housing Assistance',
  'Food Security',
  'Transportation',
  'Employment Services',
  'Education & Training',
  'Legal Services',
  'Financial Assistance',
  'Childcare Services',
  'Senior Services',
  'Disability Services',
  'Crisis Intervention',
  'Community Health Programs'
];

// Organization types matching public wizard
const ORGANIZATION_TYPES = [
  '501(c)(3) Nonprofit',
  'Faith-Based Organization',
  'Community Health Center',
  'Hospital/Health System',
  'Government Agency',
  'Community-Based Organization',
  'Foundation',
  'Other'
];

// NC Counties for service area
const NC_COUNTIES = [
  'Alamance', 'Alexander', 'Alleghany', 'Anson', 'Ashe', 'Avery', 'Beaufort', 'Bertie',
  'Bladen', 'Brunswick', 'Buncombe', 'Burke', 'Cabarrus', 'Caldwell', 'Camden', 'Carteret',
  'Caswell', 'Catawba', 'Chatham', 'Cherokee', 'Chowan', 'Clay', 'Cleveland', 'Columbus',
  'Craven', 'Cumberland', 'Currituck', 'Dare', 'Davidson', 'Davie', 'Duplin', 'Durham',
  'Edgecombe', 'Forsyth', 'Franklin', 'Gaston', 'Gates', 'Graham', 'Granville', 'Greene',
  'Guilford', 'Halifax', 'Harnett', 'Haywood', 'Henderson', 'Hertford', 'Hoke', 'Hyde',
  'Iredell', 'Jackson', 'Johnston', 'Jones', 'Lee', 'Lenoir', 'Lincoln', 'Macon', 'Madison',
  'Martin', 'McDowell', 'Mecklenburg', 'Mitchell', 'Montgomery', 'Moore', 'Nash', 'New Hanover',
  'Northampton', 'Onslow', 'Orange', 'Pamlico', 'Pasquotank', 'Pender', 'Perquimans', 'Person',
  'Pitt', 'Polk', 'Randolph', 'Richmond', 'Robeson', 'Rockingham', 'Rowan', 'Rutherford',
  'Sampson', 'Scotland', 'Stanly', 'Stokes', 'Surry', 'Swain', 'Transylvania', 'Tyrrell',
  'Union', 'Vance', 'Wake', 'Warren', 'Washington', 'Watauga', 'Wayne', 'Wilkes', 'Wilson',
  'Yadkin', 'Yancey'
];

// Extended Nonprofit interface matching public wizard fields
interface Nonprofit {
  id: string;
  // Organization Information
  organizationName: string;
  organizationType: string;
  ein: string;
  yearEstablished?: string;
  mission?: string;
  website?: string;
  
  // Contact Details
  primaryContact: {
    name: string;
    title?: string;
    email: string;
    phone: string;
  };
  organizationPhone?: string;
  organizationEmail?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Services & Resources
  services: {
    categories: string[];
    description?: string;
    eligibilityCriteria?: string;
    operatingHours?: string;
  };
  acceptsReferrals?: boolean;
  referralProcess?: string;
  
  // Service Area
  serviceCounties?: string[];
  statewideCoverage?: boolean;
  
  // Status
  status: string;
  approvalStatus: string;
  isActive?: boolean;
  createdAt: any;
}

// Default form data for nonprofit editing
const getDefaultNonprofitFormData = () => ({
  organizationName: '',
  organizationType: '',
  ein: '',
  yearEstablished: '',
  mission: '',
  website: '',
  primaryContact: {
    name: '',
    title: '',
    email: '',
    phone: ''
  },
  organizationPhone: '',
  organizationEmail: '',
  address: {
    street: '',
    city: '',
    state: 'NC',
    zipCode: ''
  },
  services: {
    categories: [] as string[],
    description: '',
    eligibilityCriteria: '',
    operatingHours: ''
  },
  acceptsReferrals: true,
  referralProcess: '',
  serviceCounties: [] as string[],
  statewideCoverage: false,
  approvalStatus: 'pending',
  isActive: true
});

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
  
  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNonprofit, setEditingNonprofit] = useState<ReturnType<typeof getDefaultNonprofitFormData> | null>(null);
  const [editingNonprofitId, setEditingNonprofitId] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNonprofits();
  }, []);

  const fetchNonprofits = async () => {
    try {
      setLoading(true);
      const nonprofitsRef = collection(db, 'nonprofits');
      const querySnapshot = await getDocs(nonprofitsRef);
      
      const fetchedNonprofits: Nonprofit[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedNonprofits.push({
          id: docSnap.id,
          ...data
        } as Nonprofit);
      });
      
      setNonprofits(fetchedNonprofits);
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

  // Open edit dialog for existing nonprofit
  const handleOpenEditDialog = (nonprofit: Nonprofit) => {
    setEditingNonprofit({
      organizationName: nonprofit.organizationName || '',
      organizationType: nonprofit.organizationType || '',
      ein: nonprofit.ein || '',
      yearEstablished: nonprofit.yearEstablished || '',
      mission: nonprofit.mission || '',
      website: nonprofit.website || '',
      primaryContact: {
        name: nonprofit.primaryContact?.name || '',
        title: nonprofit.primaryContact?.title || '',
        email: nonprofit.primaryContact?.email || '',
        phone: nonprofit.primaryContact?.phone || ''
      },
      organizationPhone: nonprofit.organizationPhone || '',
      organizationEmail: nonprofit.organizationEmail || '',
      address: {
        street: nonprofit.address?.street || '',
        city: nonprofit.address?.city || '',
        state: nonprofit.address?.state || 'NC',
        zipCode: nonprofit.address?.zipCode || ''
      },
      services: {
        categories: nonprofit.services?.categories || [],
        description: nonprofit.services?.description || '',
        eligibilityCriteria: nonprofit.services?.eligibilityCriteria || '',
        operatingHours: nonprofit.services?.operatingHours || ''
      },
      acceptsReferrals: nonprofit.acceptsReferrals ?? true,
      referralProcess: nonprofit.referralProcess || '',
      serviceCounties: nonprofit.serviceCounties || [],
      statewideCoverage: nonprofit.statewideCoverage || false,
      approvalStatus: nonprofit.approvalStatus || 'pending',
      isActive: nonprofit.isActive ?? true
    });
    setEditingNonprofitId(nonprofit.id);
    setIsCreateMode(false);
    setShowEditDialog(true);
  };

  // Open create dialog for new nonprofit
  const handleOpenCreateDialog = () => {
    setEditingNonprofit(getDefaultNonprofitFormData());
    setEditingNonprofitId(null);
    setIsCreateMode(true);
    setShowEditDialog(true);
  };

  // Handle form field changes for edit dialog
  const handleEditFormChange = (field: string, value: any) => {
    if (!editingNonprofit) return;
    
    setEditingNonprofit(prev => {
      if (!prev) return prev;
      
      // Handle nested fields
      if (field.startsWith('primaryContact.')) {
        const contactField = field.split('.')[1];
        return {
          ...prev,
          primaryContact: { ...prev.primaryContact, [contactField]: value }
        };
      }
      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1];
        return {
          ...prev,
          address: { ...prev.address, [addressField]: value }
        };
      }
      if (field.startsWith('services.')) {
        const servicesField = field.split('.')[1];
        return {
          ...prev,
          services: { ...prev.services, [servicesField]: value }
        };
      }
      
      return { ...prev, [field]: value };
    });
  };

  // Save nonprofit (create or update)
  const handleSaveNonprofit = async () => {
    if (!editingNonprofit) return;
    
    try {
      const nonprofitData = sanitizeForFirestore({
        organizationName: editingNonprofit.organizationName,
        organizationType: editingNonprofit.organizationType,
        ein: editingNonprofit.ein,
        yearEstablished: editingNonprofit.yearEstablished,
        mission: editingNonprofit.mission,
        website: editingNonprofit.website,
        primaryContact: editingNonprofit.primaryContact,
        organizationPhone: editingNonprofit.organizationPhone,
        organizationEmail: editingNonprofit.organizationEmail,
        address: editingNonprofit.address,
        services: editingNonprofit.services,
        acceptsReferrals: editingNonprofit.acceptsReferrals,
        referralProcess: editingNonprofit.referralProcess,
        serviceCounties: editingNonprofit.serviceCounties,
        statewideCoverage: editingNonprofit.statewideCoverage,
        approvalStatus: editingNonprofit.approvalStatus,
        isActive: editingNonprofit.isActive,
        updatedAt: serverTimestamp()
      });

      if (isCreateMode) {
        // Create new nonprofit
        await addDoc(collection(db, 'nonprofits'), {
          ...nonprofitData,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Nonprofit created successfully!', severity: 'success' });
      } else if (editingNonprofitId) {
        // Update existing nonprofit
        await updateDoc(doc(db, 'nonprofits', editingNonprofitId), nonprofitData);
        setSnackbar({ open: true, message: 'Nonprofit updated successfully!', severity: 'success' });
      }

      setShowEditDialog(false);
      fetchNonprofits();
    } catch (error) {
      console.error('Error saving nonprofit:', error);
      setSnackbar({ open: true, message: 'Failed to save nonprofit', severity: 'error' });
    }
  };

  // Helper function to sanitize data for Firestore (remove undefined values)
  const sanitizeForFirestore = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null) return null;
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeForFirestore(item));
    }
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        const value = obj[key];
        // Convert undefined to null, Firestore doesn't accept undefined
        sanitized[key] = value === undefined ? null : sanitizeForFirestore(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Handle importing organization from IRS search
  const handleImportFromIRS = async (orgData: any) => {
    console.log('=== handleImportFromIRS called ===');
    console.log('Organization data received:', orgData?.organizationName, orgData?.ein);
    
    try {
      // Check if organization already exists by EIN
      const existingOrg = nonprofits.find(n => n.ein === orgData.ein);
      console.log('Existing org check:', existingOrg ? 'Found existing' : 'New organization');
      
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

        const updateData = sanitizeForFirestore({
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
          // Financial data from latest filing
          financialData: {
            assetAmount: orgData.assetAmount,
            incomeAmount: orgData.incomeAmount,
            revenueAmount: orgData.revenueAmount,
            taxPeriod: orgData.taxPeriod,
            // Latest filing details
            totalRevenue: orgData.latestFiling?.totalRevenue,
            totalExpenses: orgData.latestFiling?.totalExpenses,
            totalAssets: orgData.latestFiling?.totalAssets,
            totalLiabilities: orgData.latestFiling?.totalLiabilities,
            compensationPercent: orgData.latestFiling?.compensationPercent,
            latestFilingYear: orgData.latestFiling?.taxYear,
            latestFilingPdfUrl: orgData.latestFiling?.pdfUrl,
            latestFiling: orgData.latestFiling
          },
          // Complete filing history with all years
          filingHistory: orgData.filingHistory || [],
          allFilings: orgData.allFilings || [],
          // Append to history
          irsDataHistory: [...(existingOrg as any).irsDataHistory || [], sanitizeForFirestore(irsDataHistory)]
        });
        
        await updateDoc(nonprofitRef, {
          ...updateData,
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
          // Financial data from latest filing
          financialData: {
            assetAmount: orgData.assetAmount,
            incomeAmount: orgData.incomeAmount,
            revenueAmount: orgData.revenueAmount,
            taxPeriod: orgData.taxPeriod,
            // Latest filing details
            totalRevenue: orgData.latestFiling?.totalRevenue,
            totalExpenses: orgData.latestFiling?.totalExpenses,
            totalAssets: orgData.latestFiling?.totalAssets,
            totalLiabilities: orgData.latestFiling?.totalLiabilities,
            compensationPercent: orgData.latestFiling?.compensationPercent,
            latestFilingYear: orgData.latestFiling?.taxYear,
            latestFilingPdfUrl: orgData.latestFiling?.pdfUrl,
            latestFiling: orgData.latestFiling
          },
          // Complete filing history with all years
          filingHistory: orgData.filingHistory || [],
          allFilings: orgData.allFilings || [],
          // IRS data import history
          irsDataHistory: [{
            importedAt: new Date().toISOString(),
            taxPeriod: orgData.taxPeriod,
            assetAmount: orgData.assetAmount,
            incomeAmount: orgData.incomeAmount,
            revenueAmount: orgData.revenueAmount,
            latestFiling: orgData.latestFiling,
            filingHistory: orgData.filingHistory,
            allFilings: orgData.allFilings
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

        // Sanitize the data to remove undefined values (Firestore doesn't accept undefined)
        const sanitizedNonprofit = sanitizeForFirestore(newNonprofit);
        
        const docRef = await addDoc(collection(db, 'nonprofits'), sanitizedNonprofit);
        console.log('Created new nonprofit with ID:', docRef.id, 'Name:', orgData.organizationName);

        setSnackbar({
          open: true,
          message: `Imported ${orgData.organizationName} from IRS database`,
          severity: 'success'
        });
        
        // Add to local state immediately for faster UI update
        setNonprofits(prev => [...prev, {
          id: docRef.id,
          organizationName: orgData.organizationName,
          organizationType: getOrganizationType(orgData.subsectionCode),
          ein: orgData.ein,
          primaryContact: {
            name: orgData.careOfName || '',
            email: '',
            phone: ''
          },
          services: {
            categories: getNTEECategories(orgData.nteeCode)
          },
          status: 'pending',
          approvalStatus: 'pending',
          createdAt: new Date()
        } as Nonprofit]);
      }

      // Also refresh from server to ensure consistency
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
    let filtered = nonprofits;
    
    // Filter by tab
    switch (activeTab) {
      case 1: // Active
        filtered = filtered.filter(n => n.approvalStatus === 'approved');
        break;
      case 2: // Pending
        filtered = filtered.filter(n => n.approvalStatus === 'pending');
        break;
      default: // All
        break;
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.organizationName?.toLowerCase().includes(query) ||
        n.ein?.toLowerCase().includes(query) ||
        n.primaryContact?.name?.toLowerCase().includes(query) ||
        n.organizationType?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  // Get paginated results
  const getPaginatedNonprofits = () => {
    const filtered = getFilteredNonprofits();
    const startIndex = page * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  };
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Reset page when tab or search changes
  useEffect(() => {
    setPage(0);
  }, [activeTab, searchQuery]);

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
      {/* Apple-style Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: '#1D1D1F',
            letterSpacing: '-0.02em'
          }}
        >
          Nonprofit Organization Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<ImportIcon />}
            onClick={() => setShowIRSSearchModal(true)}
            sx={{
              backgroundColor: '#0071E3',
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '8px',
              px: 3,
              '&:hover': { backgroundColor: '#0077ED' }
            }}
          >
            Import from IRS
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNonprofits}
            sx={{
              color: '#0071E3',
              borderColor: '#0071E3',
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '8px',
              '&:hover': { 
                borderColor: '#0077ED',
                backgroundColor: 'rgba(0, 113, 227, 0.08)'
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Apple-style Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)} 
        sx={{ 
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            color: '#6E6E73',
            '&.Mui-selected': {
              color: '#0071E3',
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#0071E3',
          }
        }}
      >
        <Tab label={`All Nonprofits (${nonprofits.length})`} />
        <Tab label={`Active Nonprofits (${nonprofits.filter(n => n.approvalStatus === 'approved').length})`} />
        <Tab label={`Pending Approval (${nonprofits.filter(n => n.approvalStatus === 'pending').length})`} />
      </Tabs>
      
      {/* Apple-style Search and filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by name, EIN, contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: '#F5F5F7',
              '& fieldset': {
                borderColor: '#D2D2D7',
              },
              '&:hover fieldset': {
                borderColor: '#86868B',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0071E3',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#86868B' }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" sx={{ color: '#6E6E73' }}>
          Showing {getPaginatedNonprofits().length} of {getFilteredNonprofits().length} results
        </Typography>
      </Box>

      {loading ? (
        <Typography sx={{ color: '#6E6E73' }}>Loading nonprofits...</Typography>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '16px', 
            border: '1px solid #D2D2D7',
            boxShadow: 'none'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F7' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1D1D1F' }}>Organization Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1D1D1F' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1D1D1F' }}>EIN</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1D1D1F' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1D1D1F' }}>Services</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1D1D1F' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1D1D1F' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getPaginatedNonprofits().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      {searchQuery ? 'No nonprofits match your search.' : 'No nonprofits found. Click "Import from IRS" to add organizations.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getPaginatedNonprofits().map((nonprofit) => (
                  <TableRow key={nonprofit.id} hover sx={{ '&:hover': { backgroundColor: '#F5F5F7' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
                        {nonprofit.organizationName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#6E6E73' }}>{nonprofit.organizationType}</TableCell>
                    <TableCell sx={{ color: '#6E6E73', fontFamily: 'monospace' }}>{nonprofit.ein}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#1D1D1F' }}>{nonprofit.primaryContact?.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#6E6E73' }}>
                        {nonprofit.primaryContact?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {nonprofit.services?.categories?.slice(0, 2).map((cat, idx) => (
                        <Chip key={idx} label={cat} size="small" sx={{ mr: 0.5, mb: 0.5, backgroundColor: '#F5F5F7', color: '#1D1D1F' }} />
                      ))}
                      {nonprofit.services?.categories?.length > 2 && (
                        <Chip label={`+${nonprofit.services.categories.length - 2}`} size="small" sx={{ backgroundColor: '#E5E5EA', color: '#6E6E73' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={nonprofit.approvalStatus || nonprofit.status}
                        size="small"
                        sx={{
                          backgroundColor: (nonprofit.approvalStatus || nonprofit.status) === 'approved' ? '#34C75920' : 
                                          (nonprofit.approvalStatus || nonprofit.status) === 'pending' ? '#FF950020' : '#FF3B3020',
                          color: (nonprofit.approvalStatus || nonprofit.status) === 'approved' ? '#34C759' : 
                                 (nonprofit.approvalStatus || nonprofit.status) === 'pending' ? '#FF9500' : '#FF3B30',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenEditDialog(nonprofit)} 
                          title="Edit Nonprofit"
                          sx={{ color: '#0071E3', '&:hover': { backgroundColor: '#0071E310' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {nonprofit.approvalStatus === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(nonprofit.id)}
                              title="Approve"
                              sx={{ color: '#34C759', '&:hover': { backgroundColor: '#34C75910' } }}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReject(nonprofit.id)}
                              title="Reject"
                              sx={{ color: '#FF9500', '&:hover': { backgroundColor: '#FF950010' } }}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(nonprofit.id)}
                          title="Delete"
                          sx={{ color: '#FF3B30', '&:hover': { backgroundColor: '#FF3B3010' } }}
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
          
          {/* Pagination */}
          <TablePagination
            component="div"
            count={getFilteredNonprofits().length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            showFirstButton
            showLastButton
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
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

      {/* Edit/Create Nonprofit Dialog - Matches public wizard fields */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {isCreateMode ? 'Create New Nonprofit' : 'Edit Nonprofit'}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh' }}>
          {editingNonprofit && (
            <Grid container spacing={3}>
              {/* Section: Organization Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#0071E3', mb: 1 }}>
                  Organization Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  required
                  value={editingNonprofit.organizationName}
                  onChange={(e) => handleEditFormChange('organizationName', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Organization Type</InputLabel>
                  <Select
                    value={editingNonprofit.organizationType}
                    label="Organization Type"
                    onChange={(e) => handleEditFormChange('organizationType', e.target.value)}
                  >
                    {ORGANIZATION_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="EIN (Tax ID)"
                  value={editingNonprofit.ein}
                  onChange={(e) => handleEditFormChange('ein', e.target.value)}
                  placeholder="XX-XXXXXXX"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Year Established"
                  type="number"
                  value={editingNonprofit.yearEstablished}
                  onChange={(e) => handleEditFormChange('yearEstablished', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Website"
                  value={editingNonprofit.website}
                  onChange={(e) => handleEditFormChange('website', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mission Statement"
                  multiline
                  rows={2}
                  value={editingNonprofit.mission}
                  onChange={(e) => handleEditFormChange('mission', e.target.value)}
                />
              </Grid>
              
              {/* Section: Contact Details */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                  Contact Details
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Primary Contact Name"
                  value={editingNonprofit.primaryContact.name}
                  onChange={(e) => handleEditFormChange('primaryContact.name', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Primary Contact Title"
                  value={editingNonprofit.primaryContact.title}
                  onChange={(e) => handleEditFormChange('primaryContact.title', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Primary Contact Email"
                  type="email"
                  value={editingNonprofit.primaryContact.email}
                  onChange={(e) => handleEditFormChange('primaryContact.email', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Primary Contact Phone"
                  value={editingNonprofit.primaryContact.phone}
                  onChange={(e) => handleEditFormChange('primaryContact.phone', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Organization Phone"
                  value={editingNonprofit.organizationPhone}
                  onChange={(e) => handleEditFormChange('organizationPhone', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Organization Email"
                  type="email"
                  value={editingNonprofit.organizationEmail}
                  onChange={(e) => handleEditFormChange('organizationEmail', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={editingNonprofit.address.street}
                  onChange={(e) => handleEditFormChange('address.street', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={editingNonprofit.address.city}
                  onChange={(e) => handleEditFormChange('address.city', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="State"
                  value={editingNonprofit.address.state}
                  onChange={(e) => handleEditFormChange('address.state', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  value={editingNonprofit.address.zipCode}
                  onChange={(e) => handleEditFormChange('address.zipCode', e.target.value)}
                />
              </Grid>
              
              {/* Section: Services & Resources */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                  Services & Resources
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Service Categories</InputLabel>
                  <Select
                    multiple
                    value={editingNonprofit.services.categories}
                    label="Service Categories"
                    onChange={(e) => handleEditFormChange('services.categories', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Services Description"
                  multiline
                  rows={2}
                  value={editingNonprofit.services.description}
                  onChange={(e) => handleEditFormChange('services.description', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Eligibility Criteria"
                  multiline
                  rows={2}
                  value={editingNonprofit.services.eligibilityCriteria}
                  onChange={(e) => handleEditFormChange('services.eligibilityCriteria', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Operating Hours"
                  value={editingNonprofit.services.operatingHours}
                  onChange={(e) => handleEditFormChange('services.operatingHours', e.target.value)}
                  placeholder="e.g., Mon-Fri 9am-5pm"
                />
              </Grid>
              
              {/* Section: Service Area */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                  Service Area
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Counties Served</InputLabel>
                  <Select
                    multiple
                    value={editingNonprofit.serviceCounties}
                    label="Counties Served"
                    onChange={(e) => handleEditFormChange('serviceCounties', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).slice(0, 5).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                        {(selected as string[]).length > 5 && (
                          <Chip label={`+${(selected as string[]).length - 5} more`} size="small" />
                        )}
                      </Box>
                    )}
                  >
                    {NC_COUNTIES.map((county) => (
                      <MenuItem key={county} value={county}>{county}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Section: Status */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                  Status
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Approval Status</InputLabel>
                  <Select
                    value={editingNonprofit.approvalStatus}
                    label="Approval Status"
                    onChange={(e) => handleEditFormChange('approvalStatus', e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNonprofit}>
            {isCreateMode ? 'Create Nonprofit' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* IRS Search Modal */}
      <IRSSearchModal
        open={showIRSSearchModal}
        onClose={() => {
          setShowIRSSearchModal(false);
          // Refresh the list when modal closes to ensure all imports are visible
          fetchNonprofits();
        }}
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

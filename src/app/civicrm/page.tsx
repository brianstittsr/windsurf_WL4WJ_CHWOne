'use client';

import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Button,
  Dialog,
  DialogContent,
  Alert,
  Snackbar
} from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import ContactList from '@/components/CiviCRM/ContactList';
import ContactForm from '@/components/CiviCRM/ContactForm';
import { CiviContact } from '@/services/civicrm/CiviCrmService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`civicrm-tabpanel-${index}`}
      aria-labelledby={`civicrm-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Inner component that uses the auth context
function CiviCrmContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CiviContact | null>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleAddContact = () => {
    setSelectedContact(null);
    setShowContactForm(true);
  };
  
  const handleEditContact = (contact: CiviContact) => {
    setSelectedContact(contact);
    setShowContactForm(true);
  };
  
  const handleViewContact = (contact: CiviContact) => {
    // In a real implementation, we would navigate to a contact detail page
    setNotification({
      message: `Viewing contact: ${contact.first_name || contact.organization_name || contact.household_name}`,
      severity: 'info'
    });
  };
  
  const handleDeleteContact = (contact: CiviContact) => {
    // In a real implementation, we would show a confirmation dialog and delete the contact
    setNotification({
      message: `Delete functionality not implemented yet`,
      severity: 'info'
    });
  };
  
  const handleSaveContact = (contact: CiviContact) => {
    setShowContactForm(false);
    setNotification({
      message: `Contact ${contact.first_name || contact.organization_name || contact.household_name} saved successfully`,
      severity: 'success'
    });
  };
  
  if (authLoading) {
    return <AnimatedLoading message="Loading CiviCRM..." />;
  }
  
  if (!currentUser) {
    return (
      <UnifiedLayout>
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="warning">
            Please log in to access CiviCRM
          </Alert>
        </Box>
      </UnifiedLayout>
    );
  }
  
  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          CiviCRM
        </Typography>
      </Box>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="civicrm tabs">
            <Tab label="Contacts" id="civicrm-tab-0" aria-controls="civicrm-tabpanel-0" />
            <Tab label="Cases" id="civicrm-tab-1" aria-controls="civicrm-tabpanel-1" />
            <Tab label="Events" id="civicrm-tab-2" aria-controls="civicrm-tabpanel-2" />
            <Tab label="Activities" id="civicrm-tab-3" aria-controls="civicrm-tabpanel-3" />
            <Tab label="Reports" id="civicrm-tab-4" aria-controls="civicrm-tabpanel-4" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ContactList
            onViewContact={handleViewContact}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            onAddContact={handleAddContact}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Cases functionality coming soon
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Events functionality coming soon
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Activities functionality coming soon
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Reports functionality coming soon
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Contact Form Dialog */}
      <Dialog
        open={showContactForm}
        onClose={() => setShowContactForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <ContactForm
            contact={selectedContact || undefined}
            onSave={handleSaveContact}
            onCancel={() => setShowContactForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification ? (
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : <></>}
      </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function CiviCrmPage() {
  return (
    <AuthProvider>
      <CiviCrmContent />
    </AuthProvider>
  );
}

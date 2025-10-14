'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { civiCrmService, CiviContact } from '@/services/civicrm/CiviCrmService';

interface ContactListProps {
  onViewContact: (contact: CiviContact) => void;
  onEditContact: (contact: CiviContact) => void;
  onDeleteContact: (contact: CiviContact) => void;
  onAddContact: () => void;
}

export default function ContactList({
  onViewContact,
  onEditContact,
  onDeleteContact,
  onAddContact
}: ContactListProps) {
  const [contacts, setContacts] = useState<CiviContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchContacts();
  }, [page, rowsPerPage, searchQuery]);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        options: {
          limit: rowsPerPage,
          offset: page * rowsPerPage
        },
        sequential: 1
      };

      if (searchQuery) {
        params.display_name = { LIKE: `%${searchQuery}%` };
      }

      const response = await civiCrmService.getContacts(params);

      if (response.is_error) {
        setError(response.error_message || 'Failed to fetch contacts');
      } else {
        setContacts(response.values);
        setTotalCount(response.count);
      }
    } catch (err) {
      setError(`Error fetching contacts: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const getContactTypeChip = (contactType: string) => {
    switch (contactType) {
      case 'Individual':
        return <Chip label="Individual" size="small" color="primary" />;
      case 'Organization':
        return <Chip label="Organization" size="small" color="secondary" />;
      case 'Household':
        return <Chip label="Household" size="small" color="info" />;
      default:
        return <Chip label={contactType} size="small" />;
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Contacts
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddContact}
          >
            Add Contact
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="contacts table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>
                    {contact.contact_type === 'Individual' 
                      ? `${contact.first_name || ''} ${contact.last_name || ''}` 
                      : contact.contact_type === 'Organization'
                        ? contact.organization_name
                        : contact.household_name}
                  </TableCell>
                  <TableCell>{getContactTypeChip(contact.contact_type)}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>{contact.phone || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => onViewContact(contact)}
                      aria-label="view"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEditContact(contact)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteContact(contact)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

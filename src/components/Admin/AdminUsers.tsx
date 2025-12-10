'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
  Avatar,
} from '@mui/material';

import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';

import { UserRole, UserPermissions } from '@/types/firebase/schema';
import UserManagementService, { UserProfile as ServiceUserProfile } from '@/services/UserManagementService';

// Types for our component
interface User {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  organization: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  pendingApproval?: boolean;
}

interface UserFormData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  organization: string;
  isActive: boolean;
  permissions: UserPermissions;
}

// Default user permissions based on role
const getDefaultPermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case UserRole.ADMIN:
      return {
        canCreateForms: true,
        canEditForms: true,
        canDeleteForms: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canUploadFiles: true,
        canAccessAllOrganizations: true,
      };
    case UserRole.CHW_ASSOCIATION:
      return {
        canCreateForms: true,
        canEditForms: true,
        canDeleteForms: false,
        canViewAnalytics: true,
        canManageUsers: false,
        canUploadFiles: true,
        canAccessAllOrganizations: false,
      };
    case UserRole.NONPROFIT_STAFF:
      return {
        canCreateForms: false,
        canEditForms: false,
        canDeleteForms: false,
        canViewAnalytics: true,
        canManageUsers: false,
        canUploadFiles: true,
        canAccessAllOrganizations: false,
      };
    case UserRole.CHW:
    default:
      return {
        canCreateForms: false,
        canEditForms: false,
        canDeleteForms: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canUploadFiles: true,
        canAccessAllOrganizations: false,
      };
  }
};

export default function AdminUsers() {
  // State for user list
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for user creation/editing
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: '',
    password: '',
    displayName: '',
    role: UserRole.CHW,
    organization: 'general',
    isActive: true,
    permissions: getDefaultPermissions(UserRole.CHW),
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // State for password reset
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  
  // State for filtering and tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Fetch users using UserManagementService
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching all users from Firestore...');
      // Get all users from the service
      const serviceUsers = await UserManagementService.getAllUsers();
      console.log('Received users from service:', serviceUsers);
      
      // Convert to our component's User type
      const fetchedUsers: User[] = serviceUsers.map(serviceUser => ({
        id: serviceUser.uid,
        email: serviceUser.email,
        displayName: serviceUser.displayName || '',
        role: serviceUser.role,
        organization: serviceUser.organization,
        isActive: serviceUser.isActive,
        createdAt: serviceUser.createdAt,
        lastLoginAt: serviceUser.lastLoginAt,
        pendingApproval: serviceUser.pendingApproval,
      }));
      
      // Count pending approvals
      const pendingCount = fetchedUsers.filter(user => user.pendingApproval).length;
      
      console.log('Setting users state with', fetchedUsers.length, 'users');
      setUsers(fetchedUsers);
      setPendingApprovalCount(pendingCount);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter users based on search term and active tab
  const filteredUsers = users.filter(user => {
    // First apply search filter
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    // Then apply tab filter
    switch (activeTab) {
      case 0: // All Users
        return matchesSearch;
      case 1: // Admins
        return matchesSearch && user.role === UserRole.ADMIN;
      case 2: // CHW Coordinators
        return matchesSearch && user.role === UserRole.CHW_ASSOCIATION;
      case 3: // CHWs
        return matchesSearch && user.role === UserRole.CHW;
      case 4: // Pending Approval
        return matchesSearch && user.pendingApproval === true;
      default:
        return matchesSearch;
    }
  });

  // Handle tab change
  const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // When switching to the Admins tab, fetch admin users specifically
    if (newValue === 1) { // 1 is the Admins tab index
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching admin users for admin tab...');
        
        const adminUsers = await UserManagementService.getAdminUsers();
        
        // Convert to our component's User type
        const fetchedUsers: User[] = adminUsers.map(adminUser => ({
          id: adminUser.uid,
          email: adminUser.email,
          displayName: adminUser.displayName || '',
          role: adminUser.role,
          organization: adminUser.organization,
          isActive: adminUser.isActive,
          createdAt: adminUser.createdAt,
          lastLoginAt: adminUser.lastLoginAt,
          pendingApproval: adminUser.pendingApproval,
        }));
        
        console.log('Found', fetchedUsers.length, 'admin users');
        setUsers(fetchedUsers); // This will override the main users array, but only when viewing admins tab
      } catch (err) {
        console.error('Error fetching admin users:', err);
        setError('Failed to load admin users. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (newValue === 0) {
      // When switching back to All Users tab, refresh the full list
      fetchUsers();
    }
  };

  // Reset form data for creating a new user
  const resetUserForm = () => {
    setUserFormData({
      email: '',
      password: '',
      displayName: '',
      role: UserRole.CHW,
      organization: 'general',
      isActive: true,
      permissions: getDefaultPermissions(UserRole.CHW),
    });
    setIsEditMode(false);
    setEditingUserId(null);
    setShowPassword(false);
  };

  // Open dialog to create a new user
  const handleOpenCreateDialog = () => {
    resetUserForm();
    setOpenUserDialog(true);
  };

  // Open dialog to edit an existing user
  const handleOpenEditDialog = (user: User) => {
    setUserFormData({
      email: user.email,
      password: '', // Don't populate password when editing
      displayName: user.displayName || '',
      role: user.role,
      organization: user.organization,
      isActive: user.isActive,
      permissions: getDefaultPermissions(user.role), // In real app, you'd fetch actual permissions
    });
    setIsEditMode(true);
    setEditingUserId(user.id);
    setOpenUserDialog(true);
  };

  // Close the user dialog
  const handleCloseDialog = () => {
    setOpenUserDialog(false);
  };

  // Handle form field changes
  const handleFormChange = (field: keyof UserFormData, value: any) => {
    setUserFormData(prev => {
      // If role is changed, update permissions to defaults for that role
      if (field === 'role') {
        return {
          ...prev,
          [field]: value,
          permissions: getDefaultPermissions(value as UserRole)
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission: keyof UserPermissions) => {
    setUserFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  // Function to handle user creation using UserManagementService
  const handleCreateUser = async () => {
    try {
      setError(null);
      console.log('Creating new user with data:', userFormData);
      
      if (!userFormData.email || !userFormData.password || !userFormData.displayName) {
        setError('Email, password, and display name are required.');
        return;
      }
      
      // Create user via the service
      const newUser = await UserManagementService.createUser({
        email: userFormData.email,
        password: userFormData.password,
        displayName: userFormData.displayName,
        role: userFormData.role,
        organization: userFormData.organization,
        permissions: userFormData.permissions,
        isActive: userFormData.isActive,
        pendingApproval: false, // Admin-created users don't need approval
      });
      
      console.log('User created successfully:', newUser);
      
      // Close dialog and refresh user list
      handleCloseDialog();
      
      // Force a fresh fetch of all users
      console.log('Fetching updated user list...');
      await fetchUsers();
      console.log('User list updated with', users.length, 'users');
      
      alert('User created successfully!');
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user. Please try again.');
    }
  };
  
  // Function to handle user update using UserManagementService
  const handleUpdateUser = async () => {
    if (!editingUserId) return;
    
    try {
      setError(null);
      
      if (!userFormData.email || !userFormData.displayName) {
        setError('Email and display name are required.');
        return;
      }
      
      const updateData = {
        displayName: userFormData.displayName,
        role: userFormData.role,
        organization: userFormData.organization,
        permissions: userFormData.permissions,
        isActive: userFormData.isActive,
      };
      
      // Update user via the service
      await UserManagementService.updateUser(editingUserId, updateData);
      
      // Close dialog and refresh user list
      handleCloseDialog();
      fetchUsers();
      
      alert('User updated successfully!');
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user. Please try again.');
    }
  };
  
  // Function to handle user deletion using UserManagementService
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await UserManagementService.deleteUser(userId);
      fetchUsers();
      alert('User deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.message || 'Failed to delete user. Please try again.');
    }
  };
  
  // Function to approve a pending user using UserManagementService
  const handleApproveUser = async (userId: string) => {
    try {
      await UserManagementService.approveUser(userId);
      fetchUsers();
      alert('User approved successfully!');
    } catch (err: any) {
      console.error('Error approving user:', err);
      alert(err.message || 'Failed to approve user. Please try again.');
    }
  };
  
  // Function to toggle user active status using UserManagementService
  const handleToggleUserActive = async (user: User) => {
    try {
      await UserManagementService.setUserActiveStatus(user.id, !user.isActive);
      fetchUsers();
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      alert(err.message || 'Failed to update user status. Please try again.');
    }
  };
  
  // Open password reset dialog
  const handleOpenPasswordDialog = (user: User) => {
    setPasswordResetUser(user);
    setOpenPasswordDialog(true);
  };
  
  // Close password reset dialog
  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordResetUser(null);
    setPasswordResetLoading(false);
  };
  
  // Send password reset email
  const handleSendPasswordReset = async () => {
    if (!passwordResetUser) return;
    
    try {
      setPasswordResetLoading(true);
      setError(null);
      
      await UserManagementService.sendPasswordResetEmail(passwordResetUser.email);
      
      alert(`Password reset email sent to ${passwordResetUser.email}`);
      handleClosePasswordDialog();
    } catch (err: any) {
      console.error('Error sending password reset email:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
      setPasswordResetLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add New User
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All Users (${users.length})`} />
            <Tab label="Administrators" />
            <Tab label="CHW Coordinators" />
            <Tab label="Community Health Workers" />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Pending Approval
                  {pendingApprovalCount > 0 && (
                    <Chip 
                      size="small" 
                      label={pendingApprovalCount} 
                      color="error" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Box>
              } 
            />
          </Tabs>
        </Box>
      </Card>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          sx={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: user.role === UserRole.ADMIN ? 'error.main' : 'primary.main' }}>
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {user.displayName || 'Unnamed User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      color={
                        user.role === UserRole.ADMIN ? 'error' : 
                        user.role === UserRole.CHW_ASSOCIATION ? 'warning' : 
                        user.role === UserRole.NONPROFIT_STAFF ? 'info' : 
                        'default'
                      } 
                      variant={user.role === UserRole.CHW ? 'outlined' : 'filled'} 
                    />
                  </TableCell>
                  <TableCell>{user.organization}</TableCell>
                  <TableCell>
                    {user.pendingApproval ? (
                      <Chip label="Pending Approval" color="warning" size="small" />
                    ) : user.isActive ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : (
                      <Chip label="Inactive" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {user.pendingApproval && (
                        <Tooltip title="Approve User">
                          <IconButton onClick={() => handleApproveUser(user.id)} size="small">
                            <CheckCircleIcon color="success" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit User">
                        <IconButton onClick={() => handleOpenEditDialog(user)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton onClick={() => handleOpenPasswordDialog(user)} size="small" color="primary">
                          <VpnKeyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                        <IconButton onClick={() => handleToggleUserActive(user)} size="small">
                          {user.isActive ? <LockIcon /> : <LockOpenIcon color="success" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton onClick={() => handleDeleteUser(user.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No users found. {searchTerm ? 'Try a different search term.' : ''}
          </Typography>
        </Paper>
      )}
      
      {/* User Creation/Editing Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={userFormData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                required
                disabled={isEditMode} // Can't change email for existing users
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={userFormData.displayName}
                onChange={(e) => handleFormChange('displayName', e.target.value)}
                required
              />
            </Grid>
            
            {!isEditMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={userFormData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  required={!isEditMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userFormData.role}
                  label="Role"
                  onChange={(e) => handleFormChange('role', e.target.value)}
                >
                  <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
                  <MenuItem value={UserRole.CHW_ASSOCIATION}>CHW Coordinator</MenuItem>
                  <MenuItem value={UserRole.NONPROFIT_STAFF}>Nonprofit Staff</MenuItem>
                  <MenuItem value={UserRole.CHW}>Community Health Worker</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={userFormData.organization}
                  label="Organization"
                  onChange={(e) => handleFormChange('organization', e.target.value)}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="region1">Region 1</MenuItem>
                  <MenuItem value="region2">Region 2</MenuItem>
                  <MenuItem value="region3">Region 3</MenuItem>
                  <MenuItem value="region4">Region 4</MenuItem>
                  <MenuItem value="region5">Region 5</MenuItem>
                  <MenuItem value="region6">Region 6</MenuItem>
                  <MenuItem value="wl4wj">WL4WJ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userFormData.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                  />
                }
                label="Active Account"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Permissions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.permissions.canCreateForms}
                        onChange={() => handlePermissionToggle('canCreateForms')}
                      />
                    }
                    label="Create Forms"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.permissions.canEditForms}
                        onChange={() => handlePermissionToggle('canEditForms')}
                      />
                    }
                    label="Edit Forms"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.permissions.canDeleteForms}
                        onChange={() => handlePermissionToggle('canDeleteForms')}
                      />
                    }
                    label="Delete Forms"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.permissions.canViewAnalytics}
                        onChange={() => handlePermissionToggle('canViewAnalytics')}
                      />
                    }
                    label="View Analytics"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.permissions.canManageUsers}
                        onChange={() => handlePermissionToggle('canManageUsers')}
                      />
                    }
                    label="Manage Users"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.permissions.canUploadFiles}
                        onChange={() => handlePermissionToggle('canUploadFiles')}
                      />
                    }
                    label="Upload Files"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.permissions.canAccessAllOrganizations}
                        onChange={() => handlePermissionToggle('canAccessAllOrganizations')}
                      />
                    }
                    label="Access All Organizations"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={isEditMode ? handleUpdateUser : handleCreateUser}
          >
            {isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Password Reset Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reset Password
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {passwordResetUser && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Send a password reset email to:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {passwordResetUser.displayName ? passwordResetUser.displayName[0].toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {passwordResetUser.displayName || 'Unnamed User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {passwordResetUser.email}
                  </Typography>
                </Box>
              </Box>
              <Alert severity="info" sx={{ mt: 3 }}>
                The user will receive an email with a link to reset their password. This link will expire in 1 hour.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={passwordResetLoading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendPasswordReset}
            disabled={passwordResetLoading}
            startIcon={passwordResetLoading ? <CircularProgress size={20} /> : <VpnKeyIcon />}
          >
            {passwordResetLoading ? 'Sending...' : 'Send Reset Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

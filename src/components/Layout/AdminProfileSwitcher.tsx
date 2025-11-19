'use client';

import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import {
  SupervisorAccount as AdminIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role?: string;
  photoURL?: string;
}

export default function AdminProfileSwitcher() {
  const { currentUser, userProfile } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewingAsOther, setViewingAsOther] = useState(false);

  // Check if current user is admin
  const isAdmin = userProfile?.roles?.includes(UserRole.ADMIN) || false;

  useEffect(() => {
    if (isAdmin && currentUser) {
      fetchAllProfiles();
      // Set current user as selected by default
      setSelectedProfileId(currentUser.uid);
    }
  }, [isAdmin, currentUser]);

  const fetchAllProfiles = async () => {
    try {
      setLoading(true);
      
      // Fetch CHW profiles
      const chwProfilesRef = collection(db, 'chwProfiles');
      const chwQuery = query(chwProfilesRef, orderBy('name'), limit(100));
      const chwSnapshot = await getDocs(chwQuery);
      
      const fetchedProfiles: UserProfile[] = [];
      
      // Add current user first
      if (currentUser) {
        fetchedProfiles.push({
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Current User',
          email: currentUser.email || '',
          role: 'admin',
          photoURL: currentUser.photoURL || undefined
        });
      }
      
      // Add CHW profiles
      chwSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProfiles.push({
          uid: doc.id,
          displayName: data.name || data.displayName || 'Unknown User',
          email: data.email || '',
          role: data.role || 'chw',
          photoURL: data.photoURL || data.profilePhoto
        });
      });
      
      // Remove duplicates based on uid
      const uniqueProfiles = Array.from(
        new Map(fetchedProfiles.map(p => [p.uid, p])).values()
      );
      
      setProfiles(uniqueProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (event: SelectChangeEvent<string>) => {
    const newProfileId = event.target.value;
    setSelectedProfileId(newProfileId);
    
    // Check if viewing as another user
    const isViewingAsOther = newProfileId !== currentUser?.uid;
    setViewingAsOther(isViewingAsOther);
    
    // Store the selected profile in session storage for persistence
    if (isViewingAsOther) {
      sessionStorage.setItem('adminViewingAsProfile', newProfileId);
    } else {
      sessionStorage.removeItem('adminViewingAsProfile');
    }
    
    // Optionally reload the page to apply the profile view
    // window.location.reload();
  };

  // Don't show if not admin
  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 250, mr: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="admin-profile-switcher-label" sx={{ color: '#333' }}>
          View As
        </InputLabel>
        <Select
          labelId="admin-profile-switcher-label"
          id="admin-profile-switcher"
          value={selectedProfileId}
          label="View As"
          onChange={handleProfileChange}
          sx={{
            bgcolor: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: viewingAsOther ? 'warning.main' : 'rgba(0, 0, 0, 0.23)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: viewingAsOther ? 'warning.dark' : 'rgba(0, 0, 0, 0.87)'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: viewingAsOther ? 'warning.main' : 'primary.main'
            }
          }}
          renderValue={(selected) => {
            const profile = profiles.find(p => p.uid === selected);
            if (!profile) return 'Select Profile';
            
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                  src={profile.photoURL} 
                  sx={{ width: 24, height: 24 }}
                >
                  {profile.displayName.charAt(0)}
                </Avatar>
                <Typography variant="body2" noWrap>
                  {profile.displayName}
                </Typography>
                {viewingAsOther && (
                  <Chip 
                    label="Viewing" 
                    size="small" 
                    color="warning"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            );
          }}
        >
          {/* Current User Section */}
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              YOUR ACCOUNT
            </Typography>
          </MenuItem>
          {profiles
            .filter(p => p.uid === currentUser?.uid)
            .map((profile) => (
              <MenuItem key={profile.uid} value={profile.uid}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Avatar src={profile.photoURL} sx={{ width: 32, height: 32 }}>
                    {profile.displayName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {profile.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.email}
                    </Typography>
                  </Box>
                  <AdminIcon color="primary" fontSize="small" />
                </Box>
              </MenuItem>
            ))}
          
          {/* Other Users Section */}
          <MenuItem disabled sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              ALL USERS ({profiles.filter(p => p.uid !== currentUser?.uid).length})
            </Typography>
          </MenuItem>
          {profiles
            .filter(p => p.uid !== currentUser?.uid)
            .map((profile) => (
              <MenuItem key={profile.uid} value={profile.uid}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Avatar src={profile.photoURL} sx={{ width: 32, height: 32 }}>
                    {profile.displayName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {profile.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.email}
                    </Typography>
                  </Box>
                  <PersonIcon color="action" fontSize="small" />
                </Box>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
}

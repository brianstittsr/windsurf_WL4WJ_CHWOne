'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Dataset } from '@/types/dataset.types';

interface ActivityTabProps {
  dataset: Dataset;
}

export default function ActivityTab({ dataset }: ActivityTabProps) {
  // Mock activity data - in production, fetch from audit logs
  const activities = [
    {
      id: '1',
      action: 'create',
      description: 'Dataset created',
      timestamp: dataset.createdAt,
      user: 'System'
    },
    {
      id: '2',
      action: 'update',
      description: 'Schema updated',
      timestamp: dataset.updatedAt,
      user: 'Admin'
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <AddIcon />;
      case 'update':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'export':
        return <ExportIcon />;
      case 'import':
        return <ImportIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  const getActionColor = (action: string): any => {
    switch (action) {
      case 'create':
        return 'success';
      case 'update':
        return 'primary';
      case 'delete':
        return 'error';
      case 'export':
      case 'import':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Activity Log
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Track all changes and actions performed on this dataset
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Audit logging is enabled. All actions are tracked and stored for compliance.
      </Alert>

      <Paper sx={{ p: 2 }}>
        <List>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${getActionColor(activity.action)}.main`,
                      color: 'white'
                    }}
                  >
                    {getActionIcon(activity.action)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {activity.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {activity.user} • {formatDate(activity.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Chip
                      label={activity.action}
                      size="small"
                      sx={{ mt: 0.5 }}
                      color={getActionColor(activity.action)}
                    />
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>

        {activities.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No activity recorded yet
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

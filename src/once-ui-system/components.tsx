// Mock implementation of @once-ui-system/components
// This file provides basic components to prevent build errors

'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  IconButton,
  CircularProgress,
  LinearProgress,
  Alert,
  AlertTitle,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link as MuiLink,
  Pagination,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Re-export MUI components as Once UI components
export {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  IconButton,
  CircularProgress,
  LinearProgress,
  Alert,
  AlertTitle,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  MuiLink,
  Pagination,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
};

// Custom components specific to Once UI with proper TypeScript types
interface OnceButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

export const OnceButton = ({ children, ...props }: OnceButtonProps) => (
  <Button 
    {...props} 
    sx={{ 
      borderRadius: 2, 
      textTransform: 'none', 
      fontWeight: 500,
      ...props.sx 
    }}
  >
    {children}
  </Button>
);

interface OnceCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
}

export const OnceCard = ({ children, ...props }: OnceCardProps) => (
  <Card 
    {...props} 
    sx={{ 
      borderRadius: 2, 
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      ...props.sx 
    }}
  >
    {children}
  </Card>
);

type OnceTextFieldProps = React.ComponentProps<typeof TextField>;

export const OnceTextField = (props: OnceTextFieldProps) => (
  <TextField 
    {...props} 
    variant="outlined"
    sx={{ 
      '& .MuiOutlinedInput-root': {
        borderRadius: 1,
      },
      ...props.sx 
    }}
  />
);

interface OnceContainerProps extends React.ComponentProps<typeof Container> {
  children: React.ReactNode;
}

export const OnceContainer = ({ children, ...props }: OnceContainerProps) => (
  <Container 
    {...props} 
    sx={{ 
      py: 4,
      ...props.sx 
    }}
  >
    {children}
  </Container>
);

// Export default to make importing easier
export default {
  Box,
  Typography,
  Button: OnceButton,
  Card: OnceCard,
  CardContent,
  Container: OnceContainer,
  Grid,
  Paper,
  TextField: OnceTextField,
  // Add other components as needed
};

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
  TableRow,
  Stack,
  TextareaAutosize
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
  TableRow,
  Stack
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

// Add missing Once UI components

// Flex component (using Stack)
interface FlexProps extends React.ComponentProps<typeof Stack> {
  children: React.ReactNode;
}

export const Flex = ({ children, ...props }: FlexProps) => (
  <Stack 
    {...props} 
    sx={{ 
      display: 'flex',
      ...props.sx 
    }}
  >
    {children}
  </Stack>
);

// Heading component (using Typography)
interface HeadingProps extends Omit<React.ComponentProps<typeof Typography>, 'component'> {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = ({ children, level = 1, ...props }: HeadingProps) => {
  const variant = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  // Use type assertion to handle component prop safely
  return (
    <Typography 
      {...props} 
      variant={variant}
      // @ts-ignore - MUI typing issue with component prop
      component={`h${level}`}
      sx={{ 
        fontWeight: level <= 2 ? 700 : 600,
        lineHeight: 1.2,
        ...props.sx 
      }}
    >
      {children}
    </Typography>
  );
};

// Text component (using Typography)
interface TextProps extends React.ComponentProps<typeof Typography> {
  children: React.ReactNode;
}

export const Text = ({ children, ...props }: TextProps) => (
  <Typography 
    {...props} 
    variant={props.variant || 'body1'}
    sx={{ 
      lineHeight: 1.5,
      ...props.sx 
    }}
  >
    {children}
  </Typography>
);

// Input component (using TextField)
interface InputProps extends React.ComponentProps<typeof TextField> {}

export const Input = (props: InputProps) => (
  <TextField 
    {...props} 
    variant="outlined"
    fullWidth
    sx={{ 
      '& .MuiOutlinedInput-root': {
        borderRadius: 1,
      },
      ...props.sx 
    }}
  />
);

// Textarea component
interface TextareaProps extends React.ComponentProps<typeof TextField> {}

export const Textarea = (props: TextareaProps) => (
  <TextField 
    {...props} 
    multiline
    rows={props.rows || 4}
    variant="outlined"
    fullWidth
    sx={{ 
      '& .MuiOutlinedInput-root': {
        borderRadius: 1,
      },
      ...props.sx 
    }}
  />
);

// Export default to make importing easier
const components = {
  Box,
  Typography,
  Button: OnceButton,
  Card: OnceCard,
  CardContent,
  Container: OnceContainer,
  Grid,
  Paper,
  TextField: OnceTextField,
  Flex,
  Heading,
  Text,
  Input,
  Textarea,
  // Add other components as needed
};

export default components;

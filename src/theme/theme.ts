'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a365d', // Darker blue for primary actions
      light: '#2c5282',
      dark: '#0f2942',
    },
    secondary: {
      main: '#4a5568', // Neutral gray for secondary elements
      light: '#718096',
      dark: '#2d3748',
    },
    background: {
      default: '#f8fafc', // Very light blue-gray for background
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748', // Dark gray for main text
      secondary: '#4a5568', // Medium gray for secondary text
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    error: {
      main: '#e53e3e', // More muted red
      light: '#fc8181',
      dark: '#c53030',
    },
    warning: {
      main: '#dd6b20', // More muted orange
      light: '#f6ad55',
      dark: '#c05621',
    },
    info: {
      main: '#3182ce', // Slightly muted blue
      light: '#63b3ed',
      dark: '#2c5282',
    },
    success: {
      main: '#38a169', // Slightly muted green
      light: '#68d391',
      dark: '#2f855a',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.05)',
    '0px 3px 3px -2px rgba(0,0,0,0.05),0px 2px 6px 0px rgba(0,0,0,0.04),0px 1px 8px 0px rgba(0,0,0,0.04)',
    '0px 3px 4px -2px rgba(0,0,0,0.06),0px 3px 8px -1px rgba(0,0,0,0.04),0px 1px 12px 0px rgba(0,0,0,0.04)',
    '0px 2px 8px -1px rgba(0,0,0,0.06),0px 4px 10px 0px rgba(0,0,0,0.04),0px 1px 14px 0px rgba(0,0,0,0.04)',
    '0px 3px 10px -1px rgba(0,0,0,0.07),0px 6px 12px 0px rgba(0,0,0,0.05),0px 1px 18px 0px rgba(0,0,0,0.04)',
    '0px 4px 12px -1px rgba(0,0,0,0.07),0px 8px 14px 0px rgba(0,0,0,0.05),0px 1px 22px 0px rgba(0,0,0,0.04)',
    '0px 5px 14px -2px rgba(0,0,0,0.07),0px 10px 16px 1px rgba(0,0,0,0.05),0px 2px 24px 0px rgba(0,0,0,0.04)',
    '0px 6px 16px -3px rgba(0,0,0,0.07),0px 12px 18px 1px rgba(0,0,0,0.05),0px 3px 26px 0px rgba(0,0,0,0.04)',
    '0px 7px 18px -4px rgba(0,0,0,0.07),0px 14px 20px 2px rgba(0,0,0,0.05),0px 4px 28px 0px rgba(0,0,0,0.04)',
    '0px 8px 20px -5px rgba(0,0,0,0.07),0px 16px 24px 2px rgba(0,0,0,0.05),0px 5px 30px 0px rgba(0,0,0,0.04)',
    '0px 9px 22px -6px rgba(0,0,0,0.07),0px 18px 28px 2px rgba(0,0,0,0.05),0px 6px 32px 0px rgba(0,0,0,0.04)',
    '0px 10px 24px -7px rgba(0,0,0,0.07),0px 20px 32px 3px rgba(0,0,0,0.05),0px 7px 34px 0px rgba(0,0,0,0.04)',
    '0px 11px 26px -8px rgba(0,0,0,0.07),0px 22px 36px 3px rgba(0,0,0,0.05),0px 8px 36px 0px rgba(0,0,0,0.04)',
    '0px 12px 28px -9px rgba(0,0,0,0.07),0px 24px 40px 4px rgba(0,0,0,0.05),0px 9px 38px 0px rgba(0,0,0,0.04)',
    '0px 13px 30px -10px rgba(0,0,0,0.07),0px 26px 44px 4px rgba(0,0,0,0.05),0px 10px 40px 0px rgba(0,0,0,0.04)',
    '0px 14px 32px -11px rgba(0,0,0,0.07),0px 28px 48px 4px rgba(0,0,0,0.05),0px 11px 42px 0px rgba(0,0,0,0.04)',
    '0px 15px 34px -12px rgba(0,0,0,0.07),0px 30px 52px 5px rgba(0,0,0,0.05),0px 12px 44px 0px rgba(0,0,0,0.04)',
    '0px 16px 36px -13px rgba(0,0,0,0.07),0px 32px 56px 5px rgba(0,0,0,0.05),0px 13px 46px 0px rgba(0,0,0,0.04)',
    '0px 17px 38px -14px rgba(0,0,0,0.07),0px 34px 60px 6px rgba(0,0,0,0.05),0px 14px 48px 0px rgba(0,0,0,0.04)',
    '0px 18px 40px -15px rgba(0,0,0,0.07),0px 36px 64px 6px rgba(0,0,0,0.05),0px 15px 50px 0px rgba(0,0,0,0.04)',
    '0px 19px 42px -16px rgba(0,0,0,0.07),0px 38px 68px 7px rgba(0,0,0,0.05),0px 16px 52px 0px rgba(0,0,0,0.04)',
    '0px 20px 44px -17px rgba(0,0,0,0.07),0px 40px 72px 7px rgba(0,0,0,0.05),0px 17px 54px 0px rgba(0,0,0,0.04)',
    '0px 21px 46px -18px rgba(0,0,0,0.07),0px 42px 76px 8px rgba(0,0,0,0.05),0px 18px 56px 0px rgba(0,0,0,0.04)',
    '0px 22px 48px -19px rgba(0,0,0,0.07),0px 44px 80px 8px rgba(0,0,0,0.05),0px 19px 58px 0px rgba(0,0,0,0.04)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        body: {
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(26, 54, 93, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

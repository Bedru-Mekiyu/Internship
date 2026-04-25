import { alpha, createTheme, type Theme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066FF',
      dark: '#0052CC',
      light: '#4D94FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6366F1',
      dark: '#4F46E5',
      light: '#818CF8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E2937',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
    success: {
      main: '#10B981',
      dark: '#059669',
      light: '#34D399',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      dark: '#DC2626',
      light: '#F87171',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      dark: '#D97706',
      light: '#FBBF24',
      contrastText: '#0F172A',
    },
    info: {
      main: '#60A5FA',
      dark: '#3B82F6',
      light: '#93C5FD',
      contrastText: '#0F172A',
    },
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontWeight: 800, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.015em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: '100%',
          height: '100%',
        },
        body: {
          width: '100%',
          minHeight: '100%',
          backgroundColor: '#F8FAFC',
          color: '#1E2937',
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        },
        a: {
          color: 'inherit',
          textDecoration: 'none',
        },
        '::selection': {
          backgroundColor: alpha('#0066FF', 0.18),
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 22px',
          boxShadow: 'none',
          textTransform: 'none',
          transition: 'all 180ms ease',
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#CBD5E1',
          '&:hover': {
            borderColor: '#0066FF',
            backgroundColor: alpha('#0066FF', 0.04),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
          border: '1px solid rgba(226, 232, 240, 0.82)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#FFFFFF', 0.96),
          color: '#1E2937',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(226, 232, 240, 0.82)',
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(226, 232, 240, 0.82)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#CBD5E1',
            },
            '&:hover fieldset': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0066FF',
              borderWidth: 1.5,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#0066FF',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          height: 30,
        },
        filled: {
          backgroundColor: alpha('#0066FF', 0.08),
          color: '#0066FF',
        },
      },
    },
  },
});

export const theme = lightTheme;

export function getAdminTheme(): Theme {
  return createTheme(lightTheme, {
    palette: {
      ...lightTheme.palette,
      primary: { main: '#0066FF', dark: '#0052CC', light: '#4D94FF', contrastText: '#FFFFFF' },
      info: { main: '#0066FF', dark: '#0052CC', light: '#4D94FF', contrastText: '#FFFFFF' },
    },
  });
}

export function getLearnTheme(): Theme {
  return createTheme(lightTheme, {
    palette: {
      ...lightTheme.palette,
      primary: {
        main: '#5D5FEF',
        dark: '#4B4EE0',
        light: '#7B7EF7',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#5D5FEF',
        dark: '#4B4EE0',
        light: '#7B7EF7',
        contrastText: '#FFFFFF',
      },
    },
  });
}
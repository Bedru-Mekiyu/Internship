import { alpha, createTheme, type Theme } from '@mui/material/styles';

export const spacing = {
  xs: 0.25,
  sm: 0.5,
  md: 1,
  lg: 1.5,
  xl: 2,
  xxl: 3,
} as const;

export const authLayout = {
  pagePadding: { xs: 2.25, sm: 2.75, md: 3 },
  cardPadding: { xs: 2.5, sm: 3, md: 3.5 },
  maxWidth: 440,
  borderRadius: 3,
} as const;

export const fieldSpacing = 1.45;
export const sectionSpacing = 2;
export const stackSpacing = 2.25;

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E67F2',
      dark: '#1452CB',
      light: '#5E91F6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6366F1',
      dark: '#4F46E5',
      light: '#818CF8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#EAF0F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
    divider: '#E3E8F1',
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
    borderRadius: 12,
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
          backgroundColor: '#EAF0F7',
          color: '#111827',
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
          borderRadius: 8,
          fontWeight: 600,
          padding: '8px 16px',
          boxShadow: 'none',
          textTransform: 'none',
          transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
          minHeight: 40,
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          backgroundColor: '#1E67F2',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#1452CB',
          },
          '&:disabled': {
            backgroundColor: alpha('#1E67F2', 0.5),
            color: alpha('#FFFFFF', 0.7),
          },
        },
        outlined: {
          borderColor: '#D5DBE7',
          '&:hover': {
            borderColor: '#BFC9D9',
            backgroundColor: '#F8FAFD',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha('#1E67F2', 0.08),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          border: '1px solid #DFE5F1',
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
          backgroundColor: '#FFFFFF',
          color: '#111827',
          boxShadow: 'none',
          borderBottom: '1px solid #E3E8F1',
          backdropFilter: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E3E8F1',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
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
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#D5DBE7',
            },
            '&:hover fieldset': {
              borderColor: '#C6D0DF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1E67F2',
              borderWidth: 1,
            },
            '&.Mui-error fieldset': {
              borderColor: '#EF4444',
            },
            '&.Mui-disabled fieldset': {
              borderColor: '#E5E7EB',
              backgroundColor: '#F9FAFB',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#1E67F2',
          },
          '& .MuiInputLabel-root.Mui-error': {
            color: '#EF4444',
          },
          '& .MuiFormHelperText-root': {
            marginLeft: 0,
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#111827',
          '&.Mui-focused': {
            color: '#1E67F2',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#111827',
          '&.Mui-focused': {
            color: '#1E67F2',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          height: 26,
        },
        filled: {
          backgroundColor: alpha('#1E67F2', 0.08),
          color: '#1E67F2',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2,
          borderRadius: 999,
          backgroundColor: '#1E67F2',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 42,
          fontWeight: 600,
          color: '#6B7280',
          '&.Mui-selected': {
            color: '#1E67F2',
            fontWeight: 700,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: alpha('#1E67F2', 0.1),
            color: '#1E67F2',
            '&:hover': {
              backgroundColor: alpha('#1E67F2', 0.15),
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: '#1E67F2',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
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
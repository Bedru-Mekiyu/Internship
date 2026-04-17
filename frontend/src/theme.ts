import { alpha, createTheme, type Theme } from '@mui/material/styles';

const baseShadow = '0 8px 24px rgba(15, 23, 42, 0.05)';

const shadows = [
  'none',
  '0 1px 2px rgba(15, 23, 42, 0.03)',
  '0 2px 4px rgba(15, 23, 42, 0.04)',
  baseShadow,
  '0 10px 28px rgba(15, 23, 42, 0.06)',
  '0 12px 32px rgba(15, 23, 42, 0.07)',
  '0 14px 36px rgba(15, 23, 42, 0.07)',
  '0 16px 40px rgba(15, 23, 42, 0.08)',
  '0 18px 44px rgba(15, 23, 42, 0.08)',
  '0 20px 48px rgba(15, 23, 42, 0.09)',
  '0 22px 52px rgba(15, 23, 42, 0.09)',
  '0 24px 56px rgba(15, 23, 42, 0.1)',
  '0 26px 60px rgba(15, 23, 42, 0.1)',
  '0 28px 64px rgba(15, 23, 42, 0.11)',
  '0 30px 68px rgba(15, 23, 42, 0.11)',
  '0 32px 72px rgba(15, 23, 42, 0.12)',
  '0 34px 76px rgba(15, 23, 42, 0.12)',
  '0 36px 80px rgba(15, 23, 42, 0.13)',
  '0 38px 84px rgba(15, 23, 42, 0.13)',
  '0 40px 88px rgba(15, 23, 42, 0.14)',
  '0 42px 92px rgba(15, 23, 42, 0.14)',
  '0 44px 96px rgba(15, 23, 42, 0.15)',
  '0 46px 100px rgba(15, 23, 42, 0.15)',
  '0 48px 104px rgba(15, 23, 42, 0.16)',
] as unknown as Theme['shadows'];

const adminTheme = createTheme({
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
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0066FF',
      dark: '#0052CC',
      light: '#4D94FF',
      contrastText: '#FFFFFF',
    },
    divider: '#E2E8F0',
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
  shadows,
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
          boxShadow: baseShadow,
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

export const learnTheme = createTheme(adminTheme, {
  palette: {
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

export const theme = learnTheme;

export function themeForPath(pathname: string): Theme {
  if (pathname.startsWith('/admin') || pathname.startsWith('/cms')) {
    return adminTheme;
  }
  return learnTheme;
}
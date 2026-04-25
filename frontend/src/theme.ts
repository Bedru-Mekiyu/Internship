import { alpha, createTheme, type Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'system';

const getBaseTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
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
        }
      : {
          primary: {
            main: '#60A5FA',
            dark: '#3B82F6',
            light: '#93C5FD',
            contrastText: '#0F172A',
          },
          secondary: {
            main: '#818CF8',
            dark: '#6366F1',
            light: '#A5B4FC',
            contrastText: '#0F172A',
          },
          background: {
            default: '#0F172A',
            paper: '#1E293B',
          },
          text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
          },
          divider: '#334155',
        }),
    success: {
      main: '#10B981',
      dark: '#059669',
      light: '#34D399',
      contrastText: mode === 'light' ? '#FFFFFF' : '#0F172A',
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
      contrastText: mode === 'light' ? '#0F172A' : '#FFFFFF',
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
          backgroundColor: mode === 'light' ? '#F8FAFC' : '#0F172A',
          color: mode === 'light' ? '#1E2937' : '#F1F5F9',
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
          borderColor: mode === 'light' ? '#CBD5E1' : '#475569',
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
          boxShadow: mode === 'light' ? '0 8px 24px rgba(15, 23, 42, 0.05)' : '0 8px 24px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${mode === 'light' ? 'rgba(226, 232, 240, 0.82)' : 'rgba(51, 65, 85, 0.5)'}`,
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
          backgroundColor: alpha(mode === 'light' ? '#FFFFFF' : '#1E293B', 0.96),
          color: mode === 'light' ? '#1E2937' : '#F1F5F9',
          boxShadow: 'none',
          borderBottom: `1px solid ${mode === 'light' ? 'rgba(226, 232, 240, 0.82)' : 'rgba(51, 65, 85, 0.5)'}`,
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
          borderRight: `1px solid ${mode === 'light' ? 'rgba(226, 232, 240, 0.82)' : 'rgba(51, 65, 85, 0.5)'}`,
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
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
            '& fieldset': {
              borderColor: mode === 'light' ? '#CBD5E1' : '#475569',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? '#94A3B8' : '#64748B',
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

export const lightTheme = getBaseTheme('light');
export const darkTheme = getBaseTheme('dark');

export function getTheme(mode: ThemeMode): Theme {
  if (mode === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;
    }
    return lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
}

export function getAdminTheme(mode: ThemeMode): Theme {
  const baseTheme = getTheme(mode);
  return createTheme(baseTheme, {
    palette: {
      ...baseTheme.palette,
      primary: baseTheme.palette.mode === 'dark'
        ? { main: '#60A5FA', dark: '#3B82F6', light: '#93C5FD', contrastText: '#0F172A' }
        : { main: '#0066FF', dark: '#0052CC', light: '#4D94FF', contrastText: '#FFFFFF' },
      info: baseTheme.palette.mode === 'dark'
        ? { main: '#60A5FA', dark: '#3B82F6', light: '#93C5FD', contrastText: '#0F172A' }
        : { main: '#0066FF', dark: '#0052CC', light: '#4D94FF', contrastText: '#FFFFFF' },
    },
  });
}

export function getLearnTheme(mode: ThemeMode): Theme {
  const baseTheme = getTheme(mode);
  return createTheme(baseTheme, {
    palette: {
      ...baseTheme.palette,
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

export const theme = lightTheme;

export function themeForPath(pathname: string, mode: ThemeMode = 'light'): Theme {
  if (pathname.startsWith('/admin') || pathname.startsWith('/cms')) {
    return getAdminTheme(mode);
  }
  return getLearnTheme(mode);
}
import { alpha, createTheme, type Theme } from '@mui/material/styles';
import { BRAND } from './theme/brand';

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
      main: BRAND.primary,
      dark: BRAND.primaryHover,
      light: BRAND.primaryLight,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#64748B',
      dark: '#475569',
      light: '#94A3B8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: BRAND.pageBackground,
      paper: '#FFFFFF',
    },
    text: {
      primary: BRAND.textPrimary,
      secondary: BRAND.textSecondary,
    },
    divider: BRAND.border,
    action: {
      hover: alpha(BRAND.primary, 0.04),
      selected: alpha(BRAND.primary, 0.08),
      disabled: 'rgba(15, 23, 42, 0.12)',
      disabledBackground: 'rgba(15, 23, 42, 0.04)',
    },
    success: {
      main: '#16A34A',
      dark: '#15803D',
      light: '#22C55E',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      dark: '#B91C1C',
      light: '#EF4444',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',
      dark: '#B45309',
      light: '#F59E0B',
      contrastText: '#0F172A',
    },
    info: {
      main: '#2563EB',
      dark: '#1D4ED8',
      light: '#60A5FA',
      contrastText: '#FFFFFF',
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
    borderRadius: 8,
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
          backgroundColor: BRAND.pageBackground,
          color: BRAND.textPrimary,
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
          backgroundColor: alpha(BRAND.primary, 0.22),
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
        contained: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: theme.palette.primary.dark,
          },
          '&:disabled': {
            backgroundColor: alpha(theme.palette.primary.main, 0.5),
            color: alpha('#FFFFFF', 0.7),
          },
        }),
        outlined: {
          borderColor: '#D5DBE7',
          '&:hover': {
            borderColor: '#BFC9D9',
            backgroundColor: '#F8FAFD',
          },
        },
        text: ({ theme }) => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
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
          border: `1px solid ${BRAND.border}`,
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
          borderBottom: `1px solid ${BRAND.border}`,
          backdropFilter: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${BRAND.border}`,
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
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            minHeight: 44,
            '& fieldset': {
              borderColor: '#D5DBE7',
            },
            '&:hover fieldset': {
              borderColor: '#C6D0DF',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
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
            color: theme.palette.primary.main,
          },
          '& .MuiInputLabel-root.Mui-error': {
            color: '#EF4444',
          },
          '& .MuiFormHelperText-root': {
            marginLeft: 0,
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 600,
          fontSize: '0.875rem',
          color: BRAND.textPrimary,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 600,
          fontSize: '0.875rem',
          color: BRAND.textPrimary,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }),
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
        filled: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          height: 2,
          borderRadius: 999,
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          minHeight: 42,
          fontWeight: 600,
          color: BRAND.textSecondary,
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 700,
          },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            },
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 600,
          color: theme.palette.primary.main,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }),
      },
    },
  },
});

export const theme = lightTheme;

export function getAdminTheme(): Theme {
  return lightTheme;
}

export function getLearnTheme(): Theme {
  return lightTheme;
}
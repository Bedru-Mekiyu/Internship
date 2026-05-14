export const RADIUS = {
  xs: 0.35,
  sm: 0.55,
  md: 0.75,
  lg: 1,
  xl: 1.5,
  xxl: 2,
  full: 9999,
} as const;

export const SPACING = {
  xs: 0.5,
  sm: 1,
  md: 1.5,
  lg: 2,
  xl: 3,
  cardPadding: { xs: 2, md: 2.5 } as const,
  cardPaddingTight: { xs: 1.5, md: 2 } as const,
} as const;

export const TYPOGRAPHY = {
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    md: '1.125rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.875rem',
    '3xl': '2.25rem',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

export const COLORS = {
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  secondary: '#64748B',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  bgDefault: '#F4F7FB',
  bgPaper: '#FFFFFF',
  bgHover: '#F1F5F9',
  bgActive: '#EEF2FF',
  borderDefault: '#E5EAF2',
  borderLight: '#EDF1F6',
  borderInput: '#E2E8F0',
  borderCard: '#DFE5F1',
  brandPurple: '#4F46E5',
  brandIndigo: '#0066FF',
  brandSky: '#38BDF8',
  brandPink: '#F9A8D4',
  brandAmber: '#F59E0B',
} as const;

export const ACCENT_COLORS = {
  blue:   '#0066FF',
  indigo: '#6366F1',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  teal:   '#0EA5E9',
} as const;

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px rgba(15,23,42,0.05)',
  md: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
  lg: '0 4px 16px rgba(0,102,255,0.15)',
  xl: '0 8px 24px rgba(0,0,0,0.08)',
} as const;

export const TRANSITIONS = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
} as const;

export const card = {
  borderRadius: '16px',
  border: `1px solid ${COLORS.borderInput}`,
  boxShadow: SHADOWS.md,
} as const;

export const statCard = {
  ...card,
  transition: 'border-color 180ms ease',
} as const;

export const innerCard = {
  borderRadius: '12px',
  border: `1px solid ${COLORS.borderInput}`,
  boxShadow: 'none',
  bgcolor: COLORS.bgPaper,
} as const;

export const insetCard = {
  borderRadius: '12px',
  border: `1px solid ${COLORS.borderInput}`,
  boxShadow: 'none',
  bgcolor: '#F8FAFC',
} as const;

export const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: SPACING.lg,
  mb: SPACING.lg,
  flexWrap: 'wrap',
} as const;

export const brandedPadding = { xs: 2.25, sm: 2.75, md: 3 } as const;
export const formFieldSpacing = 1.75 as const;
export const pageContainerPadding = { xs: 2.25, sm: 2.75, md: 3 } as const;

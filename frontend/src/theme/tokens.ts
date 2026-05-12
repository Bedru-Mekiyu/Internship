/**
 * tokens.ts — Single source of truth for visual design tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Merges DS (designSystem.ts) and dashboardTokens into one coherent contract.
 * All frontend components should import from here. No more hardcoded hex values.
 *
 * COLOR MAPPING:
 *   DS.colors.*  → base palette
 *   theme.ts     → MUI palette (primary.main = #4F46E5, etc.)
 *
 * RULE: When in doubt, use theme tokens (theme.palette.*) in components.
 *        Use tokens.ts for spacing, radius, typography, and brand colors.
 */

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

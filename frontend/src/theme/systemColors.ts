/**
 * Unified color system - use these instead of hardcoded hex values
 * These map to the theme palette for consistency across all pages
 */
export const systemColors = {
  // Primary brand
  primary: '#1E67F2',
  primaryHover: '#1452CB',
  primaryLight: '#5E91F6',

  // Secondary/accent
  secondary: '#6366F1',
  secondaryHover: '#4F46E5',

  // Neutrals - use theme text colors instead
  // text.primary = #111827 (use theme.palette.text.primary)
  // text.secondary = #6B7280 (use theme.palette.text.secondary)

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#60A5FA',

  // Borders
  border: '#E2E8F0',
  borderLight: '#EDF1F7',

  // Backgrounds
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F4F7FB',
  bgMuted: '#F8FAFC',
} as const;

/**
 * Standard spacing scale - use MUI spacing or these values
 * Avoid random values like 0.55, 1.25, 2.8
 */
export const systemSpacing = {
  xs: 0.25,   // 2px
  sm: 0.5,    // 4px
  md: 1,      // 8px
  lg: 1.5,    // 12px
  xl: 2,      // 16px
  xxl: 3,     // 24px
} as const;

/**
 * Standard border radius
 */
export const systemRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/**
 * Font size scale - use consistent values
 * Avoid random: 0.55rem, 0.58rem, 0.62rem, 0.66rem
 */
export const systemFontSize = {
  xs: '0.625rem',   // 10px - badges only
  sm: '0.75rem',    // 12px - captions
  md: '0.875rem',   // 14px - body small
  lg: '1rem',       // 16px - body
  xl: '1.125rem',   // 18px - subtitles
  xxl: '1.25rem',   // 20px - h6
  xxxl: '1.5rem',   // 24px - h5
} as const;
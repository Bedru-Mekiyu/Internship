/**
 * dashboardTokens.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for visual tokens shared across all dashboard views.
 *
 * WHY THIS EXISTS:
 * The pre-refactor codebase had 6 different shadow values and 5 different
 * border-radius values across StudentDashboard, InstructorDashboard, and
 * AdminDashboard — with no shared contract. This file eliminates that drift.
 *
 * USAGE:
 *   import { card, innerCard, statCard, SPACING } from './dashboardTokens';
 *   <Card sx={card}>...</Card>
 */

import { BRAND } from '../../theme/brand';

// ─── Elevation tokens ─────────────────────────────────────────────────────────

/**
 * Primary surface card — used as a section container.
 * Has a subtle shadow so it floats above the page background.
 */
export const card = {
  borderRadius: '16px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
} as const;

/**
 * Elevated card for stat/metric tiles — slightly more prominent.
 * Hover lifts it further to reinforce interactivity.
 */
export const statCard = {
  ...card,
  transition: 'border-color 180ms ease',
} as const;

/**
 * Inner card — used INSIDE a container card (e.g., course row inside a section).
 * NEVER use a shadow here — it fights the parent elevation. Border only.
 */
export const innerCard = {
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  boxShadow: 'none',
  bgcolor: '#FFFFFF',
} as const;

/**
 * Inset card — filled with a subtle tint, no shadow, no border elevation.
 * Used for content areas inside already-elevated surfaces.
 */
export const insetCard = {
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  boxShadow: 'none',
  bgcolor: '#F8FAFC',
} as const;

// ─── Spacing tokens (8px grid) ───────────────────────────────────────────────

/**
 * All spacing snapped to half MUI units (0.5 = 4px, 1 = 8px, 1.5 = 12px…).
 * No arbitrary decimals (.9, 1.25, 1.75, 2.25 etc).
 */
export const SPACING = {
  /** 4px — tight inline gaps */
  xs: 0.5,
  /** 8px — standard component gap */
  sm: 1,
  /** 12px — comfortable row gap */
  md: 1.5,
  /** 16px — section gap inside a card */
  lg: 2,
  /** 24px — card padding */
  xl: 3,
  /** Card content padding — responsive */
  cardPadding: { xs: 2, md: 2.5 } as const,
  /** Tight card content padding */
  cardPaddingTight: { xs: 1.5, md: 2 } as const,
} as const;

// ─── Semantic color helpers ──────────────────────────────────────────────────

export const ACCENT_COLORS = {
  blue: BRAND.primary,
  indigo: '#6366F1',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  teal:   '#0EA5E9',
} as const;

// ─── Section header pattern ──────────────────────────────────────────────────

/** Consistent section header spacing */
export const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  mb: SPACING.lg,
  flexWrap: 'wrap',
} as const;

/**
 * Auth/Card page padding — matches login page design standard.
 * Use this for any centered card form or auth-adjacent pages.
 */
export const brandedPadding = { xs: 2.25, sm: 2.75, md: 3 } as const;

/**
 * Auth form internal spacing — Stack between form fields.
 */
export const formFieldSpacing = 1.75 as const;

/**
 * Page-level container padding for centered auth pages.
 */
export const pageContainerPadding = { xs: 2.25, sm: 2.75, md: 3 } as const;

import { describe, expect, it } from 'vitest';
import { SPACING, sectionHeader } from './tokens';

describe('theme tokens', () => {
  it('includes shared card padding spacing tokens used by dashboards', () => {
    expect(SPACING.cardPadding).toEqual({ xs: 2, md: 2.5 });
    expect(SPACING.cardPaddingTight).toEqual({ xs: 1.5, md: 2 });
  });

  it('keeps section header spacing aligned to the spacing scale', () => {
    expect(sectionHeader.gap).toBe(SPACING.lg);
    expect(sectionHeader.mb).toBe(SPACING.lg);
  });
});

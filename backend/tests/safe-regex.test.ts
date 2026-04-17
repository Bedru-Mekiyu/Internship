import { describe, expect, it } from '@jest/globals';
import { escapeRegExp, safeRegexFragment, MAX_SEARCH_QUERY_LENGTH } from '../src/utils/safe-regex';

describe('safe-regex', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegExp('a+b')).toBe('a\\+b');
    expect(escapeRegExp('file.txt')).toBe('file\\.txt');
  });

  it('returns null for empty search', () => {
    expect(safeRegexFragment('')).toBeNull();
    expect(safeRegexFragment('   ')).toBeNull();
  });

  it('truncates overly long input', () => {
    const long = 'x'.repeat(MAX_SEARCH_QUERY_LENGTH + 50);
    const out = safeRegexFragment(long);
    expect(out?.length).toBeLessThanOrEqual(MAX_SEARCH_QUERY_LENGTH);
  });
});

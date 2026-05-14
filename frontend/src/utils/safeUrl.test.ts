import { describe, expect, it } from 'vitest';
import { sanitizeHttpUrl, sanitizeUrl } from './safeUrl';

describe('safeUrl helpers', () => {
  it('returns null for non-string and empty values', () => {
    expect(sanitizeUrl(undefined)).toBeNull();
    expect(sanitizeUrl(null)).toBeNull();
    expect(sanitizeUrl('   ')).toBeNull();
  });

  it('allows http and https URLs and normalizes output', () => {
    expect(sanitizeHttpUrl('https://example.com/path')).toBe('https://example.com/path');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('rejects javascript URLs and values containing control characters', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('https://example.com/\u0007test')).toBeNull();
  });

  it('resolves relative URLs against the current origin', () => {
    expect(sanitizeHttpUrl('/assets/logo.png')).toBe(
      new URL('/assets/logo.png', window.location.origin).toString(),
    );
  });

  it('supports custom protocol allowlists', () => {
    const allowed = new Set(['mailto:', 'tel:']);
    expect(sanitizeUrl('mailto:test@example.com', allowed)).toBe('mailto:test@example.com');
    expect(sanitizeUrl('tel:+1234567890', allowed)).toBe('tel:+1234567890');
    expect(sanitizeUrl('https://example.com', allowed)).toBeNull();
  });

  it('returns null when a custom allowlist is empty', () => {
    expect(sanitizeUrl('https://example.com', new Set())).toBeNull();
  });
});

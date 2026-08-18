import { describe, expect, it } from '@jest/globals';
import { sanitizeHtml, sanitizeInput } from '../src/utils/sanitize';

describe('sanitize', () => {
  describe('sanitizeHtml', () => {
    it('returns empty string for undefined input', () => {
      expect(sanitizeHtml(undefined)).toBe('');
    });

    it('returns empty string for null input', () => {
      expect(sanitizeHtml(null as any)).toBe('');
    });

    it('returns empty string for empty string input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('returns empty string for non-string inputs like arrays or numbers', () => {
      expect(sanitizeHtml(['test'] as any)).toBe('');
      expect(sanitizeHtml(123 as any)).toBe('');
      expect(sanitizeHtml({} as any)).toBe('');
    });

    it('html encodes basic characters', () => {
      expect(sanitizeHtml('<div>"&\'</div>')).toBe('&lt;div&gt;&quot;&amp;&#x27;&lt;/div&gt;');
    });
  });

  describe('sanitizeInput', () => {
    it('sanitizes string input', () => {
      expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
    });

    it('sanitizes array input', () => {
      expect(sanitizeInput(['<script>', 'test'])).toEqual(['&lt;script&gt;', 'test']);
    });

    it('sanitizes object input', () => {
      expect(sanitizeInput({ a: '<script>', b: 123 })).toEqual({ a: '&lt;script&gt;', b: 123 });
    });

    it('does not sanitize raw value keys', () => {
      expect(sanitizeInput({ password: '<script>', token: '<script>' })).toEqual({ password: '<script>', token: '<script>' });
    });

    it('returns null/undefined/number directly', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
      expect(sanitizeInput(123)).toBe(123);
    });
  });
});

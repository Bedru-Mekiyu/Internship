import { parseSameSite } from '../src/controllers/auth.controller';

describe('auth.controller - parseSameSite', () => {
  it('should return fallback when value is undefined', () => {
    expect(parseSameSite(undefined, 'lax')).toBe('lax');
    expect(parseSameSite(undefined, 'strict')).toBe('strict');
    expect(parseSameSite(undefined, 'none')).toBe('none');
  });

  it('should return the normalized value for valid inputs', () => {
    expect(parseSameSite('lax', 'strict')).toBe('lax');
    expect(parseSameSite('strict', 'lax')).toBe('strict');
    expect(parseSameSite('none', 'lax')).toBe('none');
  });

  it('should handle different casing for valid inputs', () => {
    expect(parseSameSite('LAX', 'strict')).toBe('lax');
    expect(parseSameSite('Strict', 'lax')).toBe('strict');
    expect(parseSameSite('NoNe', 'strict')).toBe('none');
  });

  it('should return fallback for invalid inputs', () => {
    expect(parseSameSite('invalid', 'lax')).toBe('lax');
    expect(parseSameSite('foo', 'strict')).toBe('strict');
    expect(parseSameSite('', 'none')).toBe('none');
  });
});

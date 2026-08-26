import { parseBoolean } from '../src/utils/parse-boolean';

describe('parseBoolean Utility', () => {
  it('should return fallback when value is undefined', () => {
    expect(parseBoolean(undefined, true)).toBe(true);
    expect(parseBoolean(undefined, false)).toBe(false);
  });

  it('should return true for "true" regardless of case', () => {
    expect(parseBoolean('true', false)).toBe(true);
    expect(parseBoolean('TRUE', false)).toBe(true);
    expect(parseBoolean('True', false)).toBe(true);
    expect(parseBoolean('tRuE', false)).toBe(true);
  });

  it('should return false for any value other than "true"', () => {
    expect(parseBoolean('false', true)).toBe(false);
    expect(parseBoolean('FALSE', true)).toBe(false);
    expect(parseBoolean('0', true)).toBe(false);
    expect(parseBoolean('1', true)).toBe(false);
    expect(parseBoolean('yes', true)).toBe(false);
    expect(parseBoolean('', true)).toBe(false);
    expect(parseBoolean(' ', true)).toBe(false);
    expect(parseBoolean('null', true)).toBe(false);
  });
});

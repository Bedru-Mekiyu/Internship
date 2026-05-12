import { beforeEach, describe, expect, it } from '@jest/globals';
import { requireEnv } from '../src/utils/env';

describe('requireEnv', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.CUSTOM_ENV;
    process.env.NODE_ENV = 'test';
  });

  it('throws when environment variable is missing', () => {
    expect(() => requireEnv('CUSTOM_ENV')).toThrow('Missing required environment variable: CUSTOM_ENV');
  });

  it('returns value when variable exists outside production', () => {
    process.env.JWT_ACCESS_SECRET = 'secret';
    expect(requireEnv('JWT_ACCESS_SECRET')).toBe('secret');
  });

  it('does not enforce production-secret rules for non-secret variable names', () => {
    process.env.NODE_ENV = 'production';
    process.env.CUSTOM_ENV = 'short';
    expect(requireEnv('CUSTOM_ENV')).toBe('short');
  });

  it('rejects weak production secrets', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'too-short';
    expect(() => requireEnv('JWT_ACCESS_SECRET')).toThrow(
      'Environment variable JWT_ACCESS_SECRET must be a strong production secret.',
    );
  });

  it('rejects placeholder production secrets', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'replace_with_a_real_and_secure_secret_value';
    expect(() => requireEnv('JWT_ACCESS_SECRET')).toThrow(
      'Environment variable JWT_ACCESS_SECRET must be a strong production secret.',
    );
  });

  it('accepts strong production secrets', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_ACCESS_SECRET = 'this_is_a_strong_production_secret_12345';
    expect(requireEnv('JWT_ACCESS_SECRET')).toBe('this_is_a_strong_production_secret_12345');
  });
});

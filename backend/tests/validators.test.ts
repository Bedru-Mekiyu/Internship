import { refreshTokenSchema } from '../src/utils/validators';

describe('Validators', () => {
  describe('refreshTokenSchema', () => {
    it('should validate a correct JWT-like string', () => {
      const validPayload = { refreshToken: 'header.payload.signature' };
      const { error, value } = refreshTokenSchema.validate(validPayload);
      expect(error).toBeUndefined();
      expect(value).toEqual(validPayload);
    });

    it('should allow valid JWT characters like hyphens and underscores', () => {
      const validPayload = { refreshToken: 'header-with-hyphens.payload_with_underscores.sign-a-ture' };
      const { error, value } = refreshTokenSchema.validate(validPayload);
      expect(error).toBeUndefined();
      expect(value).toEqual(validPayload);
    });

    it('should invalidate an empty string', () => {
      const invalidPayload = { refreshToken: '' };
      const { error } = refreshTokenSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should invalidate a string with missing parts (only one dot)', () => {
      const invalidPayload = { refreshToken: 'header.payload' };
      const { error } = refreshTokenSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should invalidate a string with missing parts (no dots)', () => {
      const invalidPayload = { refreshToken: 'headerpayloadsignature' };
      const { error } = refreshTokenSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should invalidate a string with too many dots', () => {
      const invalidPayload = { refreshToken: 'header.payload.signature.extra' };
      const { error } = refreshTokenSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should invalidate a string with special characters not allowed in JWT', () => {
      const invalidPayload = { refreshToken: 'header.payl@ad.signature' };
      const { error } = refreshTokenSchema.validate(invalidPayload);
      expect(error).toBeDefined();
    });

    it('should validate when refreshToken is omitted (optional)', () => {
      const validPayload = {};
      const { error, value } = refreshTokenSchema.validate(validPayload);
      expect(error).toBeUndefined();
      expect(value).toEqual(validPayload);
    });

    it('should trim whitespace around the token', () => {
      const payload = { refreshToken: '  header.payload.signature  ' };
      const { error, value } = refreshTokenSchema.validate(payload);
      expect(error).toBeUndefined();
      expect(value?.refreshToken).toBe('header.payload.signature');
    });
  });
});

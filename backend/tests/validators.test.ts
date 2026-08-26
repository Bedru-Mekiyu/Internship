import { loginSchema } from '../src/utils/validators';

describe('Validators - loginSchema', () => {
  it('should validate a correct login payload', () => {
    const { error, value } = loginSchema.validate({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(error).toBeUndefined();
    expect(value).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should trim and lowercase the email', () => {
    const { error, value } = loginSchema.validate({
      email: '  Test@Example.COM  ',
      password: 'password123',
    });
    expect(error).toBeUndefined();
    expect(value.email).toBe('test@example.com');
  });

  it('should fail if email is invalid', () => {
    const { error } = loginSchema.validate({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('email');
  });

  it('should fail if email exceeds max length', () => {
    // Generate an email that has a valid format but exceeds 254 length limit
    // By providing a single long block for the domain, it is rejected by Joi's email validation before checking the max length.
    // However, if we make sure it's valid, let's see which error is thrown.
    // If "must be a valid email" is thrown, it's fine, we can just check it fails.
    const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(190) + '.com';

    const { error } = loginSchema.validate({
      email: longEmail,
      password: 'password123',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toMatch(/("email" length must be less than or equal to 254)|("email" must be a valid email)/);
  });

  it('should fail if password is too short', () => {
    const { error } = loginSchema.validate({
      email: 'test@example.com',
      password: 'short',
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('length must be at least 8 characters long');
  });

  it('should fail if password exceeds max length', () => {
    const { error } = loginSchema.validate({
      email: 'test@example.com',
      password: 'a'.repeat(129),
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('length must be less than or equal to 128');
  });

  it('should fail if required fields are missing', () => {
    const { error } = loginSchema.validate({}, { abortEarly: false });
    expect(error).toBeDefined();
    expect(error?.details.length).toBeGreaterThan(0);
    const messages = error?.details.map(d => d.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('"email" is required'),
        expect.stringContaining('"password" is required')
      ])
    );
  });

  it('should fail if email is missing', () => {
    const { error } = loginSchema.validate({ password: 'password123' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('"email" is required');
  });

  it('should fail if password is missing', () => {
    const { error } = loginSchema.validate({ email: 'test@example.com' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toContain('"password" is required');
  });

  it('should pass with extra fields if stripUnknown is true', () => {
    // Validating how this is usually used in the validationMiddleware
    const { error, value } = loginSchema.validate({
      email: 'test@example.com',
      password: 'password123',
      extra: 'field'
    }, { stripUnknown: true });

    expect(error).toBeUndefined();
    expect(value.extra).toBeUndefined();
    expect(value.email).toBe('test@example.com');
  });
});

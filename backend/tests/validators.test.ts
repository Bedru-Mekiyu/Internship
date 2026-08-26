import { registerSchema } from '../src/utils/validators';

describe('Validators - registerSchema', () => {
  const validUser = {
    email: 'test@example.com',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
  };

  it('should validate a correct user without role', () => {
    const { error, value } = registerSchema.validate(validUser);
    expect(error).toBeUndefined();
    expect(value.role).toBe('student'); // tests default
  });

  it('should validate a correct user with valid role', () => {
    const { error, value } = registerSchema.validate({ ...validUser, role: 'instructor' });
    expect(error).toBeUndefined();
    expect(value.role).toBe('instructor');
  });

  describe('email validation', () => {
    it('should require an email', () => {
      const { email, ...rest } = validUser;
      const { error } = registerSchema.validate(rest);
      expect(error).toBeDefined();
      expect(error?.details[0].context?.key).toBe('email');
    });

    it('should reject invalid email format', () => {
      const { error } = registerSchema.validate({ ...validUser, email: 'not-an-email' });
      expect(error).toBeDefined();
    });

    it('should lowercase the email', () => {
      const { error, value } = registerSchema.validate({ ...validUser, email: 'TEST@EXAMPLE.COM' });
      expect(error).toBeUndefined();
      expect(value.email).toBe('test@example.com');
    });

    it('should reject email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const { error } = registerSchema.validate({ ...validUser, email: longEmail });
      expect(error).toBeDefined();
    });
  });

  describe('password validation', () => {
    it('should require a password', () => {
      const { password, ...rest } = validUser;
      const { error } = registerSchema.validate(rest);
      expect(error).toBeDefined();
      expect(error?.details[0].context?.key).toBe('password');
    });

    it('should reject password less than 8 characters', () => {
      const { error } = registerSchema.validate({ ...validUser, password: 'Pas1!' });
      expect(error).toBeDefined();
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'P1!' + 'a'.repeat(130);
      const { error } = registerSchema.validate({ ...validUser, password: longPassword });
      expect(error).toBeDefined();
    });

    it('should reject password without uppercase letter', () => {
      const { error } = registerSchema.validate({ ...validUser, password: 'password123!' });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const { error } = registerSchema.validate({ ...validUser, password: 'PASSWORD123!' });
      expect(error).toBeDefined();
    });

    it('should reject password without number', () => {
      const { error } = registerSchema.validate({ ...validUser, password: 'Password!' });
      expect(error).toBeDefined();
    });

    it('should reject password without special character', () => {
      const { error } = registerSchema.validate({ ...validUser, password: 'Password123' });
      expect(error).toBeDefined();
    });
  });

  describe('firstName and lastName validation', () => {
    it('should require firstName', () => {
      const { firstName, ...rest } = validUser;
      const { error } = registerSchema.validate(rest);
      expect(error).toBeDefined();
      expect(error?.details[0].context?.key).toBe('firstName');
    });

    it('should require lastName', () => {
      const { lastName, ...rest } = validUser;
      const { error } = registerSchema.validate(rest);
      expect(error).toBeDefined();
      expect(error?.details[0].context?.key).toBe('lastName');
    });

    it('should reject firstName less than 2 characters', () => {
      const { error } = registerSchema.validate({ ...validUser, firstName: 'A' });
      expect(error).toBeDefined();
    });

    it('should reject lastName less than 2 characters', () => {
      const { error } = registerSchema.validate({ ...validUser, lastName: 'A' });
      expect(error).toBeDefined();
    });

    it('should reject firstName longer than 50 characters', () => {
      const longName = 'A'.repeat(51);
      const { error } = registerSchema.validate({ ...validUser, firstName: longName });
      expect(error).toBeDefined();
    });

    it('should reject lastName longer than 50 characters', () => {
      const longName = 'A'.repeat(51);
      const { error } = registerSchema.validate({ ...validUser, lastName: longName });
      expect(error).toBeDefined();
    });
  });

  describe('role validation', () => {
    it('should reject invalid role', () => {
      const { error } = registerSchema.validate({ ...validUser, role: 'admin' });
      expect(error).toBeDefined();
    });
  });
});

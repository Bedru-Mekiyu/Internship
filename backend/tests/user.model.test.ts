import mongoose from 'mongoose';
import { User } from '../src/models/User.model';

describe('User Model', () => {
  it('should create a user with default values', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const user = new User(userData);

    // Assert required fields
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);

    // Assert default values
    expect(user.role).toBe('student');
    expect(user.isActive).toBe(true);
    expect(user.emailVerified).toBe(false);
    expect(user.tokenVersion).toBe(0);

    // Preferences defaults
    expect(user.preferences?.language).toBe('en');
    expect(user.preferences?.timezone).toBe('UTC');
    expect(user.preferences?.notifications?.email).toBe(true);
    expect(user.preferences?.notifications?.push).toBe(true);
    expect(user.preferences?.notifications?.marketingEmails).toBe(false);

    // Gamification defaults
    expect(user.gamification?.points).toBe(0);
    expect(user.gamification?.level).toBe(1);
    expect(Array.isArray(user.gamification?.badges)).toBe(true);
    expect(user.gamification?.badges?.length).toBe(0);

    // Date defaults
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should throw validation error when required fields are missing', async () => {
    const user = new User({});

    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }

    expect(err).toBeDefined();
    expect(err?.errors?.email).toBeDefined();
    expect(err?.errors?.password).toBeDefined();
    expect(err?.errors?.firstName).toBeDefined();
    expect(err?.errors?.lastName).toBeDefined();
  });

  it('should throw validation error for invalid role', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'invalid_role'
    };

    const user = new User(userData);

    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error as mongoose.Error.ValidationError;
    }

    expect(err).toBeDefined();
    expect(err?.errors?.role).toBeDefined();
    expect(err?.errors?.role?.kind).toBe('enum');
  });

  it('should accept valid roles', async () => {
    const roles = ['student', 'instructor', 'admin', 'content_manager'];

    for (const role of roles) {
      const user = new User({
        email: `test-${role}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role
      });

      const err = user.validateSync();
      expect(err).toBeUndefined();
    }
  });
});
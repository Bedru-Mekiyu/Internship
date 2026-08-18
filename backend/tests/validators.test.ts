import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationMiddleware, registerSchema, loginSchema } from '../src/utils/validators';

describe('Validators and validationMiddleware', () => {
  describe('validationMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      mockRequest = {
        body: {}
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      nextFunction = jest.fn();
    });

    const testSchema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().optional()
    });

    const middleware = validationMiddleware(testSchema);

    it('should call next() and update req.body on successful validation', () => {
      mockRequest.body = { name: 'John Doe', age: 30, unknownField: 'should be stripped' };

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.body).toEqual({ name: 'John Doe', age: 30 }); // stripUnknown is true
    });

    it('should return 400 with error details on validation failure', () => {
      mockRequest.body = { age: 30 }; // Missing required 'name'

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation error',
        details: expect.any(Array)
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('registerSchema', () => {
    it('should validate correctly with valid data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      };

      const { error, value } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should set default role to student if not provided', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const { error, value } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value.role).toBe('student');
    });

    it('should fail if email is invalid', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should fail if password does not meet complexity requirements', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('loginSchema', () => {
    it('should validate correctly with valid data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const { error, value } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should fail if email is missing', () => {
      const invalidData = {
        password: 'Password123!'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should fail if password is missing', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});

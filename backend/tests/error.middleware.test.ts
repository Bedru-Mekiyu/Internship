import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { errorMiddleware } from '../src/middlewares/error.middleware';

describe('errorMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('mongoose.Error.ValidationError', () => {
    it('should handle Mongoose ValidationError correctly', () => {
      // Setup mock ValidationError
      const validationError = new mongoose.Error.ValidationError();

      const emailError = new mongoose.Error.ValidatorError({
        message: 'Email is required',
        path: 'email',
        type: 'required',
        value: '',
      });

      const passwordError = new mongoose.Error.ValidatorError({
        message: 'Password is too short',
        path: 'password',
        type: 'minlength',
        value: '123',
      });

      validationError.errors = {
        email: emailError,
        password: passwordError,
      };

      errorMiddleware(validationError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'The data provided is invalid. Please check your input.',
          details: [
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is too short' },
          ],
        })
      );
    });
  });
});

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { errorMiddleware } from '../src/middlewares/error.middleware';

describe('Error Middleware - Duplicate Key Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      requestId: 'test-request-id',
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should handle MongoDB duplicate key error (code 11000) and extract field name', () => {
    const errorMsg = 'E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "test@example.com" }';
    const error = new mongoose.mongo.MongoServerError({ message: errorMsg });
    error.code = 11000;

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'This value already exists. Please use a different test@example.com.',
      requestId: 'test-request-id',
    });
  });

  it('should handle MongoDB duplicate key error (code 11000) with default field fallback', () => {
    // Error message format without the expected field extraction pattern
    const errorMsg = 'E11000 duplicate key error in unknown format';
    const error = new mongoose.mongo.MongoServerError({ message: errorMsg });
    error.code = 11000;

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'This value already exists. Please use a different field.',
      requestId: 'test-request-id',
    });
  });
});

import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../src/middlewares/error.middleware';
import { AppError } from '../src/utils/http-error';

describe('errorMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('AppError handling', () => {
    it('handles basic AppError without details or requestId', () => {
      const error = new AppError('Test error message', 400);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Test error message',
        requestId: null,
      });
    });

    it('handles AppError with requestId in the request object', () => {
      const error = new AppError('Test error with requestId', 403);
      mockRequest = { requestId: 'req-123' } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Test error with requestId',
        requestId: 'req-123',
      });
    });

    it('handles AppError where details is a non-object (e.g. string)', () => {
      const error = new AppError('Error with string details', 400, 'Some string details');
      mockRequest = { requestId: 'req-abc' } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error with string details',
        requestId: 'req-abc',
        details: 'Some string details',
      });
    });

    it('handles AppError where details is an object without code', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new AppError('Error with object details', 422, details);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error with object details',
        requestId: null,
        details: details,
      });
    });

    it('handles AppError where details is an object with a code string property', () => {
      const details = { code: 'ERR_INVALID_INPUT', field: 'username' };
      const error = new AppError('Error with code in details', 400, details);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error with code in details',
        requestId: null,
        details: details,
        code: 'ERR_INVALID_INPUT',
      });
    });
  });
});

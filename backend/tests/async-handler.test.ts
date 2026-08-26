import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../src/utils/async-handler';

describe('asyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should call the handler with req, res, and next', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrappedHandler = asyncHandler(handler);

    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(handler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next with error when handler returns a rejected promise', async () => {
    const error = new Error('Async error');
    const handler = jest.fn().mockRejectedValue(error);
    const wrappedHandler = asyncHandler(handler);

    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    expect(handler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

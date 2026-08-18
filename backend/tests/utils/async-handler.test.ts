import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../src/utils/async-handler';

describe('asyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should call next with error when handler throws an error', async () => {
    const error = new Error('Test Error');
    const mockHandler = jest.fn().mockRejectedValue(error);
    const handler = asyncHandler(mockHandler);

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should not call next when handler resolves successfully', async () => {
    const mockHandler = jest.fn().mockResolvedValue('Success');
    const handler = asyncHandler(mockHandler);

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should pass req, res, next to the original handler', async () => {
    const mockHandler = jest.fn().mockResolvedValue('Success');
    const handler = asyncHandler(mockHandler);

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it('should call next with error when a synchronous error is thrown', async () => {
    const error = new Error('Sync Error');
    const mockHandler = jest.fn().mockImplementation(() => { throw error; });
    const handler = asyncHandler(mockHandler);

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

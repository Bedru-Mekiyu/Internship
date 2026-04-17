import { describe, expect, it, jest, beforeAll, afterAll } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { optionalAuthMiddleware } from '../src/middlewares/auth.middleware';

describe('optionalAuthMiddleware', () => {
  const prevSecret = process.env.JWT_ACCESS_SECRET;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test_optional_auth_secret';
  });

  afterAll(() => {
    process.env.JWT_ACCESS_SECRET = prevSecret;
  });

  it('continues as guest when Bearer token is not a valid JWT', async () => {
    const req = {
      headers: { authorization: 'Bearer not-a-jwt' },
      cookies: {},
    } as unknown as Request;

    const next = jest.fn() as NextFunction;

    await optionalAuthMiddleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as { user?: unknown }).user).toBeUndefined();
  });
});

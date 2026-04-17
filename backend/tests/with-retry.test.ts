import { describe, expect, it, jest } from '@jest/globals';
import { withRetry } from '../src/utils/with-retry';

describe('withRetry', () => {
  it('returns first success', async () => {
    const fn = jest.fn<() => Promise<number>>().mockResolvedValueOnce(42);
    await expect(withRetry(fn, { retries: 2, baseDelayMs: 1 })).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries then succeeds', async () => {
    const fn = jest
      .fn<() => Promise<number>>()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(1);
    await expect(withRetry(fn, { retries: 2, baseDelayMs: 1, maxDelayMs: 10 })).resolves.toBe(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

export type RetryOptions = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retries async operations for transient failures (network, 5xx). Not for 4xx business errors.
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> => {
  const retries = options.retries ?? 3;
  const base = options.baseDelayMs ?? 200;
  const maxDelay = options.maxDelayMs ?? 4000;

  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (attempt === retries) break;
      const exp = Math.min(maxDelay, base * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 100);
      await sleep(exp + jitter);
    }
  }
  throw last;
};

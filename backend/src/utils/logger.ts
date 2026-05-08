type LogLevel = 'info' | 'warn' | 'error';

const sensitiveKeyPattern = /(password|token|secret|authorization|cookie|set-cookie|api[-_]?key|email)/i;
const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

const redactValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    if (jwtPattern.test(value.trim())) {
      return '[redacted]';
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
        key,
        sensitiveKeyPattern.test(key) ? '[redacted]' : redactValue(entryValue),
      ]),
    );
  }

  return value;
};

const write = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const safeMeta = meta ? redactValue(meta) as Record<string, unknown> : undefined;
  const payload = {
    level,
    message,
    ts: new Date().toISOString(),
    ...safeMeta,
  };

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(payload));
    return;
  }

  const rest = safeMeta && Object.keys(safeMeta).length > 0 ? ` ${JSON.stringify(safeMeta)}` : '';
  const line = `[${payload.ts}] ${level.toUpperCase()} ${message}${rest}`;
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
};

export const logInfo = (message: string, meta?: Record<string, unknown>) => write('info', message, meta);
export const logWarn = (message: string, meta?: Record<string, unknown>) => write('warn', message, meta);
export const logError = (message: string, meta?: Record<string, unknown>) => write('error', message, meta);

type LogLevel = 'info' | 'warn' | 'error';

const write = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = {
    level,
    message,
    ts: new Date().toISOString(),
    ...meta,
  };

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(payload));
    return;
  }

  const rest = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
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

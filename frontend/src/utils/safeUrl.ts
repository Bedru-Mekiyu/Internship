const DEFAULT_ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const hasUnsafeControlChars = (value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.charCodeAt(index);
    if ((codePoint >= 0 && codePoint <= 31) || codePoint === 127) {
      return true;
    }
  }

  return false;
};

export const sanitizeUrl = (
  rawValue: string | undefined | null,
  allowedProtocols: ReadonlySet<string> = DEFAULT_ALLOWED_PROTOCOLS,
): string | null => {
  if (typeof rawValue !== 'string') {
    return null;
  }

  const value = rawValue.trim();
  if (!value || hasUnsafeControlChars(value)) {
    return null;
  }

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(value, base);
    if (!allowedProtocols.has(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

export const sanitizeHttpUrl = (rawValue: string | undefined | null) => sanitizeUrl(rawValue);

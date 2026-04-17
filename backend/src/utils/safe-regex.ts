/** Limit search string length to reduce ReDoS / load from pathological queries. */
export const MAX_SEARCH_QUERY_LENGTH = 200;

export const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Returns a regex-safe fragment or null if empty after trim.
 * Always use for user-controlled `$regex` values (NoSQL injection / ReDoS mitigation).
 */
export const safeRegexFragment = (raw: string | undefined, maxLen = MAX_SEARCH_QUERY_LENGTH): string | null => {
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  return escapeRegExp(trimmed.slice(0, maxLen));
};

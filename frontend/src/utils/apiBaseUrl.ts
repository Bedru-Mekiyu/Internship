const DEFAULT_WHEN_NO_ENV = 'http://localhost:5000';

/**
 * API origin for REST, uploads, and Socket.io.
 * - If `VITE_API_URL` is set (e.g. production), use it.
 * - In Vite dev, return '' so requests use the dev server origin and `vite.config` proxies forward to the backend.
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return DEFAULT_WHEN_NO_ENV;
}

/** Socket.io client `io()` URL: same rules as API, but never empty (use current origin in dev). */
export function resolveRealtimeUrl(): string {
  const base = resolveApiBaseUrl();
  if (base) {
    return base;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_WHEN_NO_ENV;
}

/** Origin for absolute links (e.g. opening certificate HTML in a new tab). */
export function resolvePublicApiOrigin(): string {
  const base = resolveApiBaseUrl().replace(/\/$/, '');
  if (base) {
    return base;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_WHEN_NO_ENV;
}

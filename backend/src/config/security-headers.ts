import type { HelmetOptions } from 'helmet';

/**
 * API server: responses are JSON; CSP for the SPA belongs on nginx/CDN.
 * HSTS and related headers still apply when TLS terminates at this app.
 */
export const getHelmetOptions = (): HelmetOptions => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    hsts: isProd
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  };
};

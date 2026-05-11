import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';

export interface ApiErrorPayload {
  message: string;
  status?: number;
  data?: unknown;
  requestId?: string;
  code?: string;
}

type RtkQueryErrorLike = {
  status?: number | string;
  data?: unknown;
  error?: string;
};

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  _retry?: boolean;
};

const csrfCookieName = 'csrfToken';

const getApiBaseUrl = () => resolveApiBaseUrl();

export const getCookieValue = (cookieName: string) => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${cookieName}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(cookieName.length + 1));
};

export const getCsrfToken = () => getCookieValue(csrfCookieName);

let csrfTokenPromise: Promise<string | null> | null = null;

export const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 15000,
});

const refreshClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 15000,
});

refreshClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

export const ensureCsrfToken = async () => {
  const existingToken = getCsrfToken();
  if (existingToken) {
    return existingToken;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = api
      .get<{ csrfToken: string }>('/api/auth/csrf-token', {
        skipAuthRefresh: true,
      } as AxiosRequestConfig)
      .then(() => getCsrfToken())
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
};

const isUnsafeMethod = (method?: string) => {
  const normalizedMethod = method?.toUpperCase();
  return normalizedMethod ? !['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod) : false;
};

const authPathSet = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/refresh-token',
  '/api/auth/csrf-token',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]);

const isAuthPath = (url?: string) => {
  if (!url) return false;
  return authPathSet.has(url);
};

const applyRequestInterceptors = (config: AuthenticatedRequestConfig) => {
  if (isUnsafeMethod(config.method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }

  return config;
};

api.interceptors.request.use(applyRequestInterceptors);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalConfig = error.config as AuthenticatedRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401
      && originalConfig
      && !originalConfig._retry
      && !originalConfig.skipAuthRefresh
      && !isAuthPath(originalConfig.url)
    ) {
      originalConfig._retry = true;

      try {
        await refreshClient.post(
          '/api/auth/refresh-token',
          {},
        );
        return api.request(originalConfig);
      } catch (refreshError) {
        return Promise.reject(normalizeApiError(refreshError));
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export const normalizeApiError = (error: unknown): ApiErrorPayload => {
  const statusFallbackMessages: Record<number, string> = {
    400: 'Please review your input and try again.',
    401: 'Your session has expired. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action could not be completed due to a conflict.',
    413: 'The uploaded file is too large.',
    422: 'Some fields are invalid. Please check and try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our side. Please try again.',
    502: 'The service is temporarily unavailable. Please try again.',
    503: 'The service is temporarily unavailable. Please try again.',
    504: 'The request timed out. Please try again.',
  };

  const resolveStatusMessage = (status?: number) => {
    if (!status) {
      return 'Unable to complete your request right now. Please try again.';
    }
    return statusFallbackMessages[status] || 'Unable to complete your request right now. Please try again.';
  };

  const sanitizeMessage = (message: string | undefined, status?: number) => {
    const normalized = message?.trim();
    if (!normalized) {
      return resolveStatusMessage(status);
    }

    const lower = normalized.toLowerCase();
    if (
      lower === 'network error'
      || lower.includes('failed to fetch')
      || lower.includes('timeout')
      || lower.includes('request failed')
    ) {
      return 'Network connection issue. Please check your connection and try again.';
    }

    return normalized;
  };

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const responseData = error.response?.data;
    const responseMessage =
      typeof responseData?.message === 'string'
        ? responseData.message
        : error.message;
    const status = error.response?.status;

    return {
      message: sanitizeMessage(responseMessage, status),
      status,
      data: responseData,
      requestId: typeof responseData?.requestId === 'string' ? responseData.requestId : undefined,
      code: typeof responseData?.code === 'string' ? responseData.code : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      message: sanitizeMessage(error.message),
    };
  }

  if (error && typeof error === 'object') {
    const maybeRtk = error as RtkQueryErrorLike;
    const status = typeof maybeRtk.status === 'number' ? maybeRtk.status : undefined;
    const data = maybeRtk.data;

    const messageFromData =
      typeof data === 'object' && data && 'message' in data && typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : undefined;
    const fallbackMessage = typeof maybeRtk.error === 'string' ? maybeRtk.error : undefined;

    return {
      message: sanitizeMessage(messageFromData || fallbackMessage, status),
      status,
      data,
    };
  }

  return {
    message: 'Unable to complete your request right now. Please try again.',
  };
};

export const isApiError = (error: unknown): error is ApiErrorPayload => {
  return Boolean(error && typeof error === 'object' && 'message' in error);
};

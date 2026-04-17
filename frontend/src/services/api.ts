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

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  _retry?: boolean;
};

const storageKey = 'learnspace.accessToken';
const csrfCookieName = 'csrfToken';

const getApiBaseUrl = () => resolveApiBaseUrl();

export const getStoredAccessToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(storageKey);
};

export const setStoredAccessToken = (token: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, token);
};

export const clearStoredAccessToken = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(storageKey);
};

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
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 15000,
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

const isAuthPath = (url?: string) => {
  if (!url) {
    return false;
  }

  return [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/me',
    '/api/auth/refresh-token',
    '/api/auth/csrf-token',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ].some((path) => url.includes(path));
};

const applyRequestInterceptors = (config: AuthenticatedRequestConfig) => {
  const storedToken = getStoredAccessToken();

  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
  }

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
        const refreshResponse = await refreshClient.post<{ accessToken?: string }>(
          '/api/auth/refresh-token',
          {},
        );
        if (typeof refreshResponse.data?.accessToken === 'string' && refreshResponse.data.accessToken) {
          setStoredAccessToken(refreshResponse.data.accessToken);
        }
        return api.request(originalConfig);
      } catch (refreshError) {
        clearStoredAccessToken();
        return Promise.reject(normalizeApiError(refreshError));
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export const normalizeApiError = (error: unknown): ApiErrorPayload => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const responseData = error.response?.data;
    const responseMessage =
      typeof responseData?.message === 'string'
        ? responseData.message
        : error.message;

    return {
      message: responseMessage || 'Request failed',
      status: error.response?.status,
      data: responseData,
      requestId: typeof responseData?.requestId === 'string' ? responseData.requestId : undefined,
      code: typeof responseData?.code === 'string' ? responseData.code : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'Request failed',
  };
};

export const isApiError = (error: unknown): error is ApiErrorPayload => {
  return Boolean(error && typeof error === 'object' && 'message' in error);
};
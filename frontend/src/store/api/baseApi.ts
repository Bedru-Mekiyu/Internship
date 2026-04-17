import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { clearStoredAccessToken, getCsrfToken, getStoredAccessToken } from '../../services/api';
import { clearUser } from '../slices/authSlice';

const defaultApiBaseUrl = 'http://localhost:5000';

const getApiBaseUrl = () => {
  const candidate = import.meta.env.VITE_API_URL as string | undefined;

  if (candidate && candidate.trim()) {
    return candidate.trim();
  }

  return defaultApiBaseUrl;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState, endpoint, forced }) => {
    const token = getStoredAccessToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }

    if (!headers.has('Content-Type') && endpoint !== 'uploadMedia' && !forced) {
      headers.set('Content-Type', 'application/json');
    }

    void getState;

    return headers;
  },
});

const shouldTryRefresh = (
  args: string | FetchArgs,
  error: FetchBaseQueryError | undefined,
  isRetried: boolean,
) => {
  if (isRetried) {
    return false;
  }

  if (error?.status !== 401) {
    return false;
  }

  const requestUrl = typeof args === 'string' ? args : args.url;
  return !requestUrl.includes('/api/auth/');
};

const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (!shouldTryRefresh(args, result.error, false)) {
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: '/api/auth/refresh-token',
      method: 'POST',
      body: {},
    },
    api,
    extraOptions,
  );

  if (!refreshResult.error) {
    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  }

  clearStoredAccessToken();
  api.dispatch(clearUser());
  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Auth', 'Course', 'Content', 'Media', 'Discussion', 'Quiz'],
  endpoints: () => ({}),
});

export type AppBaseQueryApi = BaseQueryApi;

import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getCsrfToken } from '../../services/api';
import { resolveApiBaseUrl } from '../../utils/apiBaseUrl';
import { clearUser } from '../slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: resolveApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { endpoint, arg }) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }

    const body = typeof arg === 'object' && arg !== null && 'body' in arg ? arg.body : undefined;
    if (body instanceof FormData) {
      return headers;
    }

    if (!headers.has('Content-Type') && endpoint !== 'uploadMedia') {
      headers.set('Content-Type', 'application/json');
    }

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

  api.dispatch(clearUser());
  window.location.href = '/auth/login?expired=true';
  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Auth', 'Course', 'Content', 'Media', 'Discussion', 'Quiz', 'Payment'],
  endpoints: () => ({}),
});

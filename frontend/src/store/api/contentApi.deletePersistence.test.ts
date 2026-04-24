import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
vi.mock('../../utils/apiBaseUrl', () => ({
  resolveApiBaseUrl: () => 'http://localhost:5000',
}));
import { baseApi } from './baseApi';
import { contentApi } from './contentApi';

type MockMedia = {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
};

const jsonResponse = (status: number, data: unknown) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('content API media delete persistence', () => {
  let mediaRecords: MockMedia[];

  beforeEach(() => {
    mediaRecords = [
      {
        _id: 'media-1',
        filename: 'media-1.jpg',
        originalName: 'media-1.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: '/uploads/media-1.jpg',
        createdAt: '2026-01-01T10:00:00.000Z',
      },
      {
        _id: 'media-2',
        filename: 'media-2.jpg',
        originalName: 'media-2.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
        url: '/uploads/media-2.jpg',
        createdAt: '2026-01-02T10:00:00.000Z',
      },
    ];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      const method = (
        (typeof input === 'object' && !(input instanceof URL) && 'method' in input
          ? String(input.method || '')
          : '')
        || init?.method
        || 'GET'
      ).toUpperCase();

      if (url.includes('/api/content/media') && method === 'GET') {
        return jsonResponse(200, mediaRecords);
      }

      const deleteMatch = url.match(/\/api\/content\/media\/([^/?#]+)/);
      if (deleteMatch && method === 'DELETE') {
        const id = decodeURIComponent(deleteMatch[1]);
        const exists = mediaRecords.some((item) => item._id === id);
        if (!exists) {
          return jsonResponse(404, { message: 'Media not found' });
        }
        mediaRecords = mediaRecords.filter((item) => item._id !== id);
        return jsonResponse(200, { message: 'Media deleted', id });
      }

      return jsonResponse(404, { message: 'Not found' });
    });

    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps deleted media removed across cache invalidation, refresh, and navigation', async () => {
    const store = configureStore({
      reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });

    const initialSubscription = store.dispatch(contentApi.endpoints.getMediaLibrary.initiate());
    const initial = await initialSubscription.unwrap();
    expect(initial.map((item) => item._id)).toEqual(['media-1', 'media-2']);

    await store.dispatch(contentApi.endpoints.deleteMedia.initiate('media-1')).unwrap();

    const refreshed = await store.dispatch(
      contentApi.endpoints.getMediaLibrary.initiate(undefined, { forceRefetch: true }),
    ).unwrap();
    expect(refreshed.map((item) => item._id)).toEqual(['media-2']);

    initialSubscription.unsubscribe();
    const navigationResult = await store.dispatch(contentApi.endpoints.getMediaLibrary.initiate()).unwrap();
    expect(navigationResult.map((item) => item._id)).toEqual(['media-2']);
  });

  it('does not resurrect deleted items under concurrent delete requests', async () => {
    const store = configureStore({
      reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });

    await store.dispatch(contentApi.endpoints.getMediaLibrary.initiate()).unwrap();

    const outcomes = await Promise.allSettled([
      store.dispatch(contentApi.endpoints.deleteMedia.initiate('media-1')).unwrap(),
      store.dispatch(contentApi.endpoints.deleteMedia.initiate('media-1')).unwrap(),
    ]);

    expect(outcomes.some((result) => result.status === 'fulfilled')).toBe(true);

    const postRace = await store.dispatch(
      contentApi.endpoints.getMediaLibrary.initiate(undefined, { forceRefetch: true }),
    ).unwrap();
    expect(postRace.map((item) => item._id)).toEqual(['media-2']);
  });
});

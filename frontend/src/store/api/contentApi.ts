import type { ContentItem, MediaItem } from '../../types';
import { baseApi } from './baseApi';

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentList: builder.query<ContentItem[], void>({
      query: () => ({
        url: '/api/content',
      }),
      providesTags: ['Content'],
    }),
    getManagedContentList: builder.query<ContentItem[], void>({
      query: () => ({
        url: '/api/content/manage',
      }),
      providesTags: ['Content'],
    }),
    getContentBySlug: builder.query<ContentItem, string>({
      query: (slug) => ({
        url: `/api/content/${slug}`,
      }),
      providesTags: (_result, _error, slug) => [{ type: 'Content', id: slug }],
    }),
    getMediaLibrary: builder.query<MediaItem[], void>({
      query: () => ({
        url: '/api/content/media',
      }),
      providesTags: ['Media'],
    }),
    createContent: builder.mutation<ContentItem, Partial<ContentItem>>({
      query: (payload) => ({
        url: '/api/content',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Content'],
    }),
    updateContent: builder.mutation<ContentItem, { id: string; payload: Partial<ContentItem> }>({
      query: ({ id, payload }) => ({
        url: `/api/content/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Content'],
    }),
    deleteContent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),
    uploadMedia: builder.mutation<{ url?: string; filename?: string; message?: string }, FormData>({
      query: (payload) => ({
        url: '/api/content/upload',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Media'],
    }),
  }),
});

export const {
  useGetContentListQuery,
  useGetManagedContentListQuery,
  useGetContentBySlugQuery,
  useGetMediaLibraryQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useUploadMediaMutation,
} = contentApi;

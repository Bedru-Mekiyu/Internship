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
      providesTags: (result) =>
        result
          ? [
            ...result.map((item) => ({ type: 'Media' as const, id: item._id })),
            { type: 'Media' as const, id: 'LIST' },
          ]
          : [{ type: 'Media' as const, id: 'LIST' }],
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
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),
    deleteMedia: builder.mutation<{ message: string; id: string }, string>({
      query: (id) => ({
        url: `/api/content/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Media', id }, { type: 'Media', id: 'LIST' }],
    }),
    renameMedia: builder.mutation<MediaItem, { id: string; originalName: string }>({
      query: ({ id, originalName }) => ({
        url: `/api/content/media/${id}`,
        method: 'PATCH',
        body: { originalName },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Media', id: arg.id }, { type: 'Media', id: 'LIST' }],
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
  useDeleteMediaMutation,
  useRenameMediaMutation,
} = contentApi;

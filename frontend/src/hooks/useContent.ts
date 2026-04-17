import {
  useCreateContentMutation,
  useDeleteContentMutation,
  useGetContentBySlugQuery,
  useGetContentListQuery,
  useGetManagedContentListQuery,
  useGetMediaLibraryQuery,
  useUploadMediaMutation,
  useUpdateContentMutation,
} from '../store/api/contentApi';
import type { ContentItem } from '../types';

export const useContent = () => {
  const contentQuery = useGetContentListQuery();
  const managedContentQuery = useGetManagedContentListQuery();
  const mediaQuery = useGetMediaLibraryQuery();

  const [createContent, createState] = useCreateContentMutation();
  const [updateContent, updateState] = useUpdateContentMutation();
  const [deleteContent, deleteState] = useDeleteContentMutation();
  const [uploadMedia, uploadState] = useUploadMediaMutation();

  const create = async (payload: Partial<ContentItem>) => {
    return createContent(payload).unwrap();
  };

  const update = async (id: string, payload: Partial<ContentItem>) => {
    return updateContent({ id, payload }).unwrap();
  };

  const remove = async (id: string) => {
    await deleteContent(id).unwrap();
  };

  const upload = async (payload: FormData) => {
    return uploadMedia(payload).unwrap();
  };

  return {
    content: contentQuery.data ?? [],
    managedContent: managedContentQuery.data ?? [],
    media: mediaQuery.data ?? [],
    isLoading: contentQuery.isLoading || managedContentQuery.isLoading || mediaQuery.isLoading,
    isFetching: contentQuery.isFetching || managedContentQuery.isFetching || mediaQuery.isFetching,
    error: contentQuery.error ?? managedContentQuery.error ?? mediaQuery.error,
    refetch: () => {
      void contentQuery.refetch();
      void managedContentQuery.refetch();
      void mediaQuery.refetch();
    },
    create,
    isCreating: createState.isLoading,
    update,
    isUpdating: updateState.isLoading,
    remove,
    isDeleting: deleteState.isLoading,
    upload,
    isUploading: uploadState.isLoading,
  };
};

export const useContentBySlug = (slug: string) => {
  return useGetContentBySlugQuery(slug, {
    skip: !slug,
  });
};

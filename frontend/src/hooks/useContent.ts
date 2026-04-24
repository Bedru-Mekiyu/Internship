import {
  useCreateContentMutation,
  useDeleteContentMutation,
  useDeleteMediaMutation,
  useGetContentBySlugQuery,
  useGetContentListQuery,
  useGetManagedContentListQuery,
  useGetMediaLibraryQuery,
  useUploadMediaMutation,
  useUpdateContentMutation,
  useRenameMediaMutation,
} from '../store/api/contentApi';
import type { ContentItem } from '../types';

export const useContent = () => {
  const contentQuery = useGetContentListQuery();
  const managedContentQuery = useGetManagedContentListQuery();
  const mediaQuery = useGetMediaLibraryQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [createContent, createState] = useCreateContentMutation();
  const [updateContent, updateState] = useUpdateContentMutation();
  const [deleteContent, deleteState] = useDeleteContentMutation();
  const [deleteMedia, deleteMediaState] = useDeleteMediaMutation();
  const [uploadMedia, uploadState] = useUploadMediaMutation();
  const [renameMedia, renameMediaState] = useRenameMediaMutation();

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

  const removeMedia = async (id: string) => {
    await deleteMedia(id).unwrap();
  };

  const renameMediaFile = async (id: string, originalName: string) => {
    return renameMedia({ id, originalName }).unwrap();
  };

  return {
    content: contentQuery.data ?? [],
    managedContent: managedContentQuery.data ?? [],
    media: mediaQuery.data ?? [],
    isLoading: contentQuery.isLoading || managedContentQuery.isLoading || mediaQuery.isLoading,
    isFetching: contentQuery.isFetching || managedContentQuery.isFetching || mediaQuery.isFetching,
    error: contentQuery.error ?? managedContentQuery.error ?? mediaQuery.error,
    refetch: async () => {
      await Promise.all([
        contentQuery.refetch(),
        managedContentQuery.refetch(),
        mediaQuery.refetch(),
      ]);
    },
    create,
    isCreating: createState.isLoading,
    update,
    isUpdating: updateState.isLoading,
    remove,
    isDeleting: deleteState.isLoading,
    upload,
    isUploading: uploadState.isLoading,
    removeMedia,
    isDeletingMedia: deleteMediaState.isLoading,
    renameMedia: renameMediaFile,
    isRenamingMedia: renameMediaState.isLoading,
  };
};

export const useContentBySlug = (slug: string) => {
  return useGetContentBySlugQuery(slug, {
    skip: !slug,
  });
};

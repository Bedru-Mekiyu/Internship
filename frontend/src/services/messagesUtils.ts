export const maxMessageLength = 2000;

export const getTrimmedMessage = (draft: string) => draft.trim();

export const isMessageTooLong = (draft: string) => getTrimmedMessage(draft).length > maxMessageLength;

export const canSendMessage = (
  hasActiveConversation: boolean,
  isPending: boolean,
  draft: string
) => {
  const trimmed = getTrimmedMessage(draft);

  if (!hasActiveConversation || isPending) {
    return false;
  }

  if (!trimmed) {
    return false;
  }

  return trimmed.length <= maxMessageLength;
};

export const getStatusSeverity = (statusMessage: string | null) => {
  if (!statusMessage) {
    return 'info' as const;
  }

  return statusMessage === 'Message sent successfully.' ? 'success' : 'info';
};

export const flattenPaginatedItems = <T>(pages: Array<{ items: T[] }> | undefined): T[] => {
  if (!pages?.length) {
    return [];
  }

  return [...pages]
    .reverse()
    .flatMap((page) => page.items || []);
};

export const canLoadOlderMessages = (hasActiveConversation: boolean, hasNextPage: boolean) => {
  return hasActiveConversation && hasNextPage;
};

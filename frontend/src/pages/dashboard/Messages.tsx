import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  AddOutlined,
  CallOutlined,
  CircleOutlined,
  ImageOutlined,
  InsertEmoticonOutlined,
  MoreHorizOutlined,
  SendOutlined,
  SearchOutlined,
  VideoCallOutlined,
} from '@mui/icons-material';
import { api, normalizeApiError } from '../../services/api';
import { BRAND } from '../../theme/brand';
import { useAuth } from '../../context/AuthContext';
import {
  canLoadOlderMessages,
  canSendMessage,
  flattenPaginatedItems,
  getStatusSeverity,
  getTrimmedMessage,
  isMessageTooLong,
  maxMessageLength,
} from '../../services/messagesUtils';

type MessageSide = 'received' | 'sent';
type ConversationGroup = 'Courses / Groups';

interface ApiDiscussion {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  user?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface PaginatedDiscussionsResponse {
  items: ApiDiscussion[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface CourseRef {
  courseId: string;
  title: string;
}

interface ChatMessage {
  id: string;
  side: MessageSide;
  text: string;
  time: string;
  authorName: string;
}

interface Conversation {
  id: string;
  name: string;
  group: ConversationGroup;
  preview: string;
  initials: string;
  accent: string;
  timeLabel: string;
  unreadCount?: number;
}

function toRelativeTime(createdAt?: string) {
  if (!createdAt) {
    return 'Just now';
  }

  const createdAtDate = new Date(createdAt);
  if (Number.isNaN(createdAtDate.getTime())) {
    return 'Just now';
  }

  const diffMinutes = Math.max(1, Math.floor((Date.now() - createdAtDate.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  return createdAtDate.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
  });
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'LS';
}

function ConversationRow({
  conversation,
  active,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        selected={active}
        sx={{
          borderRadius: 1,
          px: 1,
          py: 0.9,
          alignItems: 'flex-start',
          gap: 1,
          '&.Mui-selected': {
            bgcolor: '#E9F0FE',
            '&:hover': { bgcolor: '#E9F0FE' },
          },
        }}
      >
        <Avatar sx={{ width: 30, height: 30, bgcolor: conversation.accent, color: '#FFFFFF', fontWeight: 700, fontSize: '0.74rem' }}>
          {conversation.initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }} noWrap>
              {conversation.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8A94A6', whiteSpace: 'nowrap' }}>
              {conversation.timeLabel}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
            {conversation.preview}
          </Typography>
          {conversation.unreadCount ? (
            <Box sx={{ mt: 0.35, display: 'inline-grid', placeItems: 'center', minWidth: 16, height: 16, px: 0.5, borderRadius: 999, bgcolor: '#EF4444', color: '#FFFFFF', fontSize: '0.58rem', fontWeight: 700 }}>
              {conversation.unreadCount}
            </Box>
          ) : null}
        </Box>
      </ListItemButton>
    </ListItem>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isSent = message.side === 'sent';

  return (
    <Box sx={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start' }}>
      <Box sx={{ maxWidth: { xs: '100%', sm: '84%', md: '72%' } }}>
        <Box
          sx={{
            borderRadius: 1.5,
            bgcolor: isSent ? 'primary.main' : 'background.default',
            color: isSent ? '#FFFFFF' : 'text.primary',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {message.text}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.75,
            color: 'text.secondary',
            textAlign: isSent ? 'right' : 'left',
          }}
        >
          {message.authorName} • {message.time}
        </Typography>
      </Box>
    </Box>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState('');
  const [search, setSearch] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollEnabledRef = useRef(true);

  const {
    data: accessibleCourses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    error: coursesRequestError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ['messages', 'accessible-courses'],
    queryFn: async (): Promise<CourseRef[]> => {
      const response = await api.get<Array<{ courseId?: string; title?: string }>>('/api/discussions/conversations');
      return (response.data || [])
        .filter((course): course is { courseId: string; title: string } => Boolean(course.courseId && course.title))
        .map((course) => ({ courseId: course.courseId, title: course.title }));
    },
  });

  const resolvedConversationId = useMemo(() => {
    if (!accessibleCourses.length) {
      return '';
    }

    const exists = accessibleCourses.some((course) => course.courseId === activeConversationId);
    return exists ? activeConversationId : accessibleCourses[0].courseId;
  }, [accessibleCourses, activeConversationId]);

  const activeCourse = useMemo(
    () => accessibleCourses.find((course) => course.courseId === resolvedConversationId) ?? null,
    [accessibleCourses, resolvedConversationId],
  );

  const {
    data: paginatedDiscussions,
    isLoading: discussionsLoading,
    isError: discussionsError,
    error: discussionsRequestError,
    refetch: refetchDiscussions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', 'discussion', activeCourse?.courseId],
    enabled: Boolean(activeCourse?.courseId),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<PaginatedDiscussionsResponse> => {
      const response = await api.get<PaginatedDiscussionsResponse>(
        `/api/discussions/course/${activeCourse?.courseId}?paginated=true&page=${pageParam}&limit=25`
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasMore) {
        return undefined;
      }

      return lastPage.meta.page + 1;
    },
  });

  const discussions = useMemo(() => {
    return flattenPaginatedItems<ApiDiscussion>(paginatedDiscussions?.pages);
  }, [paginatedDiscussions]);

  const sendMessageMutation = useMutation({
    mutationKey: ['messages', 'send', activeCourse?.courseId],
    mutationFn: async (content: string) => {
      if (!activeCourse?.courseId) {
        throw new Error('No active conversation selected.');
      }

      await api.post(`/api/discussions/course/${activeCourse.courseId}`, {
        title: `Message in ${activeCourse.title}`,
        content,
      });
      return content;
    },
    onMutate: async (content) => {
      const courseId = activeCourse?.courseId;
      if (!courseId) {
        return null;
      }

      const cacheKey = ['messages', 'discussion', courseId] as const;
      await queryClient.cancelQueries({ queryKey: cacheKey });

      const previousDiscussions = queryClient.getQueryData<InfiniteData<PaginatedDiscussionsResponse>>(cacheKey) ?? null;
      const optimisticMessage: ApiDiscussion = {
        _id: `temp-${Date.now()}`,
        title: `Message in ${activeCourse?.title || 'course'}`,
        content,
        createdAt: new Date().toISOString(),
        user: {
          _id: user?._id,
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
      };

      if (previousDiscussions?.pages?.length) {
        queryClient.setQueryData<InfiniteData<PaginatedDiscussionsResponse>>(cacheKey, {
          ...previousDiscussions,
          pages: previousDiscussions.pages.map((page, index) =>
            index === 0
              ? {
                ...page,
                items: [...page.items, optimisticMessage],
                meta: {
                  ...page.meta,
                  total: page.meta.total + 1,
                },
              }
              : page
          ),
        });
      }

      return {
        cacheKey,
        previousDiscussions,
      };
    },
    onSuccess: async () => {
      setDraftMessage('');
      setStatusMessage('Message sent successfully.');
      autoScrollEnabledRef.current = true;
      await queryClient.invalidateQueries({ queryKey: ['messages', 'discussion', activeCourse?.courseId] });
    },
    onError: (requestError, _content, context) => {
      if (context?.cacheKey && context.previousDiscussions) {
        queryClient.setQueryData(context.cacheKey, context.previousDiscussions);
      }
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to send message.');
    },
  });

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const conversations = useMemo<Conversation[]>(() => {
    return accessibleCourses.map((course, index) => {
      const latestForActiveCourse = activeCourse?.courseId === course.courseId
        ? discussions[discussions.length - 1]
        : null;
      const preview = latestForActiveCourse?.content || 'Open course discussion';

      return {
        id: course.courseId,
        name: course.title,
        group: 'Courses / Groups',
        preview,
        initials: initialsFromName(course.title),
        accent: ['#0EA5E9', '#6366F1', BRAND.primary, '#F97316', '#14B8A6'][index % 5],
        timeLabel: latestForActiveCourse ? toRelativeTime(latestForActiveCourse.createdAt) : '—',
        unreadCount: 0,
      };
    });
  }, [accessibleCourses, activeCourse?.courseId, discussions]);

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return [conversation.name, conversation.group, conversation.preview].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [conversations, search]);

  const chatMessages = useMemo<ChatMessage[]>(() => {
    return discussions.map((discussion) => {
      const authorName = [discussion.user?.firstName, discussion.user?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || 'User';
      const isSent = Boolean(user?._id && discussion.user?._id && discussion.user._id === user._id);

      return {
        id: discussion._id,
        side: isSent ? 'sent' : 'received',
        text: discussion.content,
        time: toRelativeTime(discussion.createdAt),
        authorName,
      };
    });
  }, [discussions, user]);

  const trimmedDraftMessage = getTrimmedMessage(draftMessage);
  const isDraftTooLong = isMessageTooLong(draftMessage);
  const sendDisabled = !canSendMessage(Boolean(activeCourse), sendMessageMutation.isPending, draftMessage);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) {
      return;
    }

    if (autoScrollEnabledRef.current) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
      return;
    }

    autoScrollEnabledRef.current = true;
  }, [chatMessages.length]);

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = getTrimmedMessage(draftMessage);
    if (!canSendMessage(Boolean(activeCourse), sendMessageMutation.isPending, trimmedMessage)) {
      return;
    }

    void sendMessageMutation.mutateAsync(trimmedMessage);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setStatusMessage(null);
  };

  const hasAnyConversation = visibleConversations.length > 0;
  const hasAnyCourseConversation = accessibleCourses.length > 0;
  const courseLoadError = coursesError ? normalizeApiError(coursesRequestError).message : null;
  const discussionLoadError = discussionsError ? normalizeApiError(discussionsRequestError).message : null;
  const shouldShowLoadOlderMessages = canLoadOlderMessages(Boolean(activeCourse), Boolean(hasNextPage));
  const firstReceivedMessage = chatMessages.find((message) => message.side === 'received') ?? null;
  const activePeerName = firstReceivedMessage?.authorName || 'Discussion';

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#EEF2F7', p: { xs: 1.5, md: 2 } }}>
      {statusMessage ? (
        <Alert severity={getStatusSeverity(statusMessage)} sx={{ mb: 1.5 }}>
          {statusMessage}
        </Alert>
      ) : null}

      <Box sx={{ border: '1px solid #DDE5F0', borderRadius: 1.5, bgcolor: '#F7F9FD', overflow: 'hidden' }}>
        <Grid container sx={{ minHeight: { md: 640 } }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ height: '100%', borderRight: { lg: '1px solid #DDE5F0' } }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #DDE5F0', bgcolor: '#F3F6FC' }}>
                <Typography sx={{ fontSize: '0.92rem', fontWeight: 700 }}>Conversations</Typography>
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search messages..."
                  size="small"
                  sx={{ mt: 1.2 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box sx={{ p: 1.2, bgcolor: '#E8EFFA', height: { xs: 'auto', lg: 'calc(100% - 84px)' }, minHeight: 300, overflowY: 'auto' }}>
                {coursesLoading ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : null}
                {courseLoadError ? (
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={() => void refetchCourses()}>
                        Retry
                      </Button>
                    }
                  >
                    {courseLoadError}
                  </Alert>
                ) : null}
                {!coursesLoading && !courseLoadError ? (
                  <>
                    <Typography variant="caption" sx={{ color: '#7D8799', fontWeight: 800, letterSpacing: '0.08em' }}>
                      COURSES / GROUPS
                    </Typography>
                    <List disablePadding sx={{ mt: 0.8, display: 'grid', gap: 0.6 }}>
                      {visibleConversations.map((conversation) => (
                        <ConversationRow
                          key={conversation.id}
                          conversation={conversation}
                          active={conversation.id === resolvedConversationId}
                          onClick={() => handleSelectConversation(conversation.id)}
                        />
                      ))}
                    </List>
                    {!hasAnyConversation ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.2 }}>
                        No conversations match your search.
                      </Typography>
                    ) : null}
                    {!hasAnyCourseConversation ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.2 }}>
                        You do not have any course discussions yet.
                      </Typography>
                    ) : null}
                  </>
                ) : null}
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F7F9FD' }}>
              <Box sx={{ px: 2, py: 1.4, borderBottom: '1px solid #DDE5F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#93A7CB', fontSize: '0.72rem' }}>
                    {initialsFromName(activePeerName)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.83rem' }} noWrap>
                      {activePeerName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CircleOutlined sx={{ fontSize: 8, color: '#22C55E' }} />
                      <Typography sx={{ color: '#22C55E', fontSize: '0.67rem', fontWeight: 600 }}>Online</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton size="small" sx={{ border: '1px solid #DDE5F0', bgcolor: '#FFFFFF' }}>
                    <CallOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" sx={{ border: '1px solid #DDE5F0', bgcolor: '#FFFFFF' }}>
                    <VideoCallOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" sx={{ border: '1px solid #DDE5F0', bgcolor: '#FFFFFF' }}>
                    <MoreHorizOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>

              <Box ref={chatContainerRef} sx={{ p: { xs: 1.25, sm: 1.75 }, flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#F7F9FD' }}>
                {discussionsLoading ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : null}
                {discussionLoadError ? (
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={() => void refetchDiscussions()}>
                        Retry
                      </Button>
                    }
                  >
                    {discussionLoadError}
                  </Alert>
                ) : null}
                {!discussionsLoading && !discussionLoadError && chatMessages.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No messages yet for this course. Send the first one.
                  </Typography>
                ) : null}
                {!discussionsLoading && !discussionLoadError && chatMessages.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 1.2 }}>
                    {shouldShowLoadOlderMessages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={isFetchingNextPage}
                          onClick={() => {
                            autoScrollEnabledRef.current = false;
                            void fetchNextPage();
                          }}
                        >
                          {isFetchingNextPage ? 'Loading older messages...' : 'Load older messages'}
                        </Button>
                      </Box>
                    ) : null}
                    {chatMessages.map((message) => (
                      <ChatBubble key={message.id} message={message} />
                    ))}
                  </Box>
                ) : null}
              </Box>

              <Divider />
              <Box sx={{ px: 1.5, py: 1.2, bgcolor: '#F6F8FC' }}>
                <Box component="form" onSubmit={handleSendMessage}>
                  <Box sx={{ border: '1px solid #DDE5F0', borderRadius: 1, bgcolor: '#FFFFFF' }}>
                    <Box sx={{ px: 1, py: 0.4, borderBottom: '1px solid #EEF2F7', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small"><AddOutlined sx={{ fontSize: 14 }} /></IconButton>
                      <IconButton size="small"><ImageOutlined sx={{ fontSize: 14 }} /></IconButton>
                      <IconButton size="small"><InsertEmoticonOutlined sx={{ fontSize: 14 }} /></IconButton>
                    </Box>
                    <TextField
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      placeholder={activeCourse ? `Message ${activePeerName}...` : 'Select a conversation...'}
                      multiline
                      minRows={3}
                      variant="standard"
                      slotProps={{ htmlInput: { maxLength: maxMessageLength } }}
                      disabled={!activeCourse || sendMessageMutation.isPending}
                      sx={{
                        width: '100%',
                        px: 1.2,
                        py: 0.8,
                        '& .MuiInputBase-root': { fontSize: '0.86rem' },
                        '& .MuiInputBase-root:before, & .MuiInputBase-root:after': { display: 'none' },
                      }}
                    />
                    <Box sx={{ px: 1, pb: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: isDraftTooLong ? 'error.main' : 'text.secondary' }}>
                        {trimmedDraftMessage.length}/{maxMessageLength}
                      </Typography>
                      <IconButton
                        type="submit"
                        disabled={sendDisabled}
                        sx={{ bgcolor: '#2563EB', color: '#FFFFFF', width: 28, height: 28, borderRadius: 1, '&:hover': { bgcolor: '#1D4ED8' }, '&.Mui-disabled': { bgcolor: '#BFDBFE', color: '#FFFFFF' } }}
                      >
                        <SendOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AttachFileOutlined,
  CallOutlined,
  EditOutlined,
  EmojiEmotionsOutlined,
  FormatBoldOutlined,
  FormatItalicOutlined,
  FormatUnderlinedOutlined,
  LinkOutlined,
  ListOutlined,
  MoreHorizOutlined,
  SearchOutlined,
  SendOutlined,
  VideoCallOutlined,
} from '@mui/icons-material';
import { theme } from '../../theme';
import { api, normalizeApiError } from '../../services/api';
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
          borderRadius: '16px',
          px: 1.25,
          py: 1.25,
          alignItems: 'flex-start',
          gap: 1.25,
          '&.Mui-selected': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
          },
        }}
      >
        <Avatar sx={{ width: 42, height: 42, bgcolor: conversation.accent, fontWeight: 700, flexShrink: 0 }}>
          {conversation.initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {conversation.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {conversation.group}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }} noWrap>
            {conversation.preview}
          </Typography>
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
            borderRadius: '16px',
            bgcolor: isSent ? 'primary.main' : '#F1F5F9',
            color: isSent ? '#FFFFFF' : 'text.primary',
            px: 2,
            py: 1.5,
            boxShadow: isSent ? '0 10px 22px rgba(0,102,255,0.12)' : '0 4px 14px rgba(15,23,42,0.05)',
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
      const lookupErrors: string[] = [];

      try {
        const studentResponse = await api.get<{
          enrolledCourses: Array<{ courseId?: string; title?: string }>;
        }>('/api/dashboard/student');

        return (studentResponse.data.enrolledCourses || [])
          .filter((course): course is { courseId: string; title: string } => Boolean(course.courseId && course.title))
          .map((course) => ({ courseId: course.courseId, title: course.title }));
      } catch (error) {
        lookupErrors.push(normalizeApiError(error).message || 'Student dashboard request failed.');
      }

      try {
        const instructorResponse = await api.get<{
          courses: Array<{ _id: string; title: string }>;
        }>('/api/dashboard/instructor');

        return (instructorResponse.data.courses || [])
          .filter((course) => Boolean(course._id && course.title))
          .map((course) => ({ courseId: course._id, title: course.title }));
      } catch (error) {
        lookupErrors.push(normalizeApiError(error).message || 'Instructor dashboard request failed.');
      }

      throw new Error(lookupErrors[lookupErrors.length - 1] || 'Unable to load accessible course discussions.');
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
      const preview = activeCourse?.courseId === course.courseId
        ? (discussions[discussions.length - 1]?.content || 'No messages yet. Start the conversation.')
        : 'Open conversation';

      return {
        id: course.courseId,
        name: course.title,
        group: 'Courses / Groups',
        preview,
        initials: initialsFromName(course.title),
        accent: ['#0EA5E9', '#6366F1', '#0066FF', '#F97316', '#14B8A6'][index % 5],
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
        .trim() || 'Learner';
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

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
          Messages
        </Typography>

        {statusMessage ? (
          <Alert severity={getStatusSeverity(statusMessage)} sx={{ mb: 2 }}>
            {statusMessage}
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', overflow: 'hidden' }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Conversations
                    </Typography>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ position: 'relative', mt: 2 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 18,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'text.secondary',
                        pointerEvents: 'none',
                      }}
                    >
                      <SearchOutlined fontSize="small" />
                    </Box>
                    <TextField
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search conversations..."
                      sx={{
                        '& .MuiInputBase-root': {
                          pl: 5.25,
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
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
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.12em' }}>
                        COURSES / GROUPS
                      </Typography>
                      <List disablePadding sx={{ mt: 1.5, display: 'grid', gap: 0.75 }}>
                        {visibleConversations.map((conversation) => (
                          <ConversationRow
                            key={conversation.id}
                            conversation={conversation}
                            active={conversation.id === activeConversationId}
                            onClick={() => handleSelectConversation(conversation.id)}
                          />
                        ))}
                      </List>

                      {!hasAnyConversation ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                          No conversations match your search.
                        </Typography>
                      ) : null}

                      {!hasAnyCourseConversation ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                          You do not have any course discussions yet.
                        </Typography>
                      ) : null}
                    </Box>
                  ) : null}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%', overflow: 'hidden' }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: { xs: 2.25, md: 2.75 }, borderBottom: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: '#0066FF', fontWeight: 700 }}>
                        {initialsFromName(activeCourse?.title || 'Messages')}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
                          {activeCourse?.title || 'Select a conversation'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '999px', bgcolor: 'success.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Live discussion
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main' }}>
                        <CallOutlined />
                      </IconButton>
                      <IconButton sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main' }}>
                        <VideoCallOutlined />
                      </IconButton>
                      <IconButton sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main' }}>
                        <MoreHorizOutlined />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                <Box ref={chatContainerRef} sx={{ p: { xs: 2.25, md: 3 }, flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
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
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
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

                <Box sx={{ p: { xs: 2.25, md: 2.75 }, borderTop: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', flexWrap: 'wrap' }}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <FormatBoldOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <FormatItalicOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <FormatUnderlinedOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <LinkOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <ListOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Course discussion message
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSendMessage}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <TextField
                        value={draftMessage}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        placeholder={activeCourse ? `Message ${activeCourse.title}...` : 'Select a conversation...'}
                        multiline
                        minRows={3}
                        slotProps={{ htmlInput: { maxLength: maxMessageLength } }}
                        disabled={!activeCourse || sendMessageMutation.isPending}
                        sx={{
                          '& .MuiInputBase-root': {
                            alignItems: 'flex-start',
                            pt: 1.5,
                          },
                        }}
                      />

                      <Typography variant="caption" sx={{ color: isDraftTooLong ? 'error.main' : 'text.secondary', textAlign: 'right' }}>
                        {trimmedDraftMessage.length}/{maxMessageLength}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                          <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main' }}>
                            <AttachFileOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main' }}>
                            <EmojiEmotionsOutlined fontSize="small" />
                          </IconButton>
                        </Box>

                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SendOutlined />}
                          disabled={sendDisabled}
                          sx={{ minWidth: 130, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                        >
                          {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      <style>
        {`@keyframes typingPulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }`}
      </style>
    </Box>
  );
}

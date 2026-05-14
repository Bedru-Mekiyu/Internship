import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  MoreVert,
  SearchOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import type { Thread, ThreadCategory } from '../../components/ui/CourseDiscussionThreadCard';
import { normalizeApiError } from '../../services/api';
import { useAccessibleDiscussionCourses, useCourseDiscussions, usePostDiscussion } from '../../hooks/useDiscussions';
import { useDiscussionRealtime } from '../../hooks/useDiscussionRealtime';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
import { BRAND } from '../../theme/brand';
const LazyThreadItem = lazy(() =>
  import('../../components/ui/CourseDiscussionThreadCard').then((module) => ({ default: module.ThreadItem }))
);

const LazyReplyBubble = lazy(() =>
  import('../../components/ui/CourseDiscussionThreadCard').then((module) => ({ default: module.ReplyBubble }))
);

function slugifyPathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildThreadPath(courseSlug: string, lessonSlug: string, threadId: number) {
  return `/courses/${courseSlug}/lessons/${lessonSlug}/discussions/${threadId}`;
}

function courseCategoryLabel(category: ThreadCategory) {
  if (category === 'All') return 'All threads';
  return category;
}

function relativeTimeLabel(lastActivity: string) {
  return `Updated ${lastActivity}`;
}

const reactionOptions = ['👍', '🎉', '💡', '🙌'];

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

export default function CourseDiscussions() {
  const navigate = useNavigate();
  const { courseSlug, lessonSlug, threadId } = useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeCategory, setActiveCategory] = useState<ThreadCategory>('All');
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState(() => {
    const parsedThreadId = threadId ? Number(threadId) : Number.NaN;

    if (Number.isFinite(parsedThreadId)) {
      return parsedThreadId;
    }

    return 1;
  });
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionBody, setNewDiscussionBody] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyAttachmentName, setReplyAttachmentName] = useState('');
  const newDiscussionSectionRef = useRef<HTMLDivElement | null>(null);
  const newDiscussionTitleRef = useRef<HTMLInputElement | null>(null);

  const routeThreadId = threadId ? Number(threadId) : Number.NaN;

  const {
    courses: accessibleCourses,
    isFetching: isFetchingAccessibleCourses,
    error: accessibleCoursesError,
  } = useAccessibleDiscussionCourses();

  const activeCourse = useMemo(() => {
    if (accessibleCourses.length === 0) {
      return null;
    }

    if (courseSlug) {
      const fromSlug = accessibleCourses.find((course) => slugifyPathSegment(course.title) === courseSlug);
      if (fromSlug) {
        return fromSlug;
      }
    }

    return accessibleCourses[0];
  }, [accessibleCourses, courseSlug]);

  const {
    discussions: apiDiscussions,
    isFetching: isFetchingDiscussions,
    error: discussionsError,
  } = useCourseDiscussions(activeCourse?.courseId ?? '');
  const { postDiscussion, isPosting } = usePostDiscussion();

  useDiscussionRealtime(activeCourse?.courseId);

  const lastPulse = useMemo(() => {
    if (isFetchingAccessibleCourses || isFetchingDiscussions) {
      return 'Syncing discussions...';
    }

    return 'Live sync via Socket.io';
  }, [isFetchingAccessibleCourses, isFetchingDiscussions]);

  useEffect(() => {
    const loadError = accessibleCoursesError ?? discussionsError;
    if (!loadError) {
      return;
    }

    const errorTimer = window.setTimeout(() => {
      setStatusMessage(normalizeApiError(loadError).message || 'Unable to load discussions.');
    }, 0);

    return () => window.clearTimeout(errorTimer);
  }, [accessibleCoursesError, discussionsError]);

  useEffect(() => {
    if (!activeCourse) {
      return;
    }

    if (isFetchingDiscussions) {
      return;
    }

    if (apiDiscussions.length === 0) {
      const clearTimer = window.setTimeout(() => {
        setThreads([]);
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }

    const mappedThreads = apiDiscussions.map((discussion, index) => {
      const authorName = [discussion.user?.firstName, discussion.user?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || 'User';
      const authorInitials = authorName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'LS';
      const itemId = index + 1;

      return {
        id: itemId,
        title: discussion.title || 'Discussion',
        category: 'Q&A' as const,
        courseLabel: activeCourse.title,
        lessonLabel: lessonSlug ? `Lesson · ${lessonSlug.replace(/-/g, ' ')}` : 'General Discussion',
        deepLinkPath: buildThreadPath(
          slugifyPathSegment(activeCourse.title),
          lessonSlug ?? 'discussion',
          itemId,
        ),
        author: authorName,
        avatar: authorInitials,
        accent: BRAND.primary,
        summary: discussion.content,
        replies: 1,
        unread: 0,
        lastActivity: toRelativeTime(discussion.createdAt),
        pinned: false,
        live: true,
        tags: ['Live'],
        repliesList: [
          {
            id: 1,
            author: authorName,
            role: 'User',
            time: toRelativeTime(discussion.createdAt),
            text: discussion.content,
            accent: BRAND.primary,
            isRead: true,
            reactions: [],
          },
        ],
      };
    });

    const threadSyncTimer = window.setTimeout(() => {
      setThreads(mappedThreads);
      setSelectedThreadId((currentSelected) => {
        const exists = mappedThreads.some((thread) => thread.id === currentSelected);
        return exists ? currentSelected : mappedThreads[0].id;
      });
    }, 0);

    return () => window.clearTimeout(threadSyncTimer);
  }, [activeCourse, apiDiscussions, isFetchingDiscussions, lessonSlug]);

  useEffect(() => {
    if (activeCourse) {
      return;
    }
    if (isFetchingAccessibleCourses) {
      return;
    }
    const t = window.setTimeout(() => setThreads([]), 0);
    return () => window.clearTimeout(t);
  }, [activeCourse, isFetchingAccessibleCourses]);

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return threads.filter((thread) => {
      const matchesCategory = activeCategory === 'All' ? true : thread.category === activeCategory;
      const matchesSearch =
        !query ||
        thread.title.toLowerCase().includes(query) ||
        thread.summary.toLowerCase().includes(query) ||
        thread.author.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, threads]);

  const resolvedSelectedThreadId = useMemo(() => {
    if (Number.isFinite(routeThreadId) && routeThreadId > 0 && threads.some((thread) => thread.id === routeThreadId)) {
      return routeThreadId;
    }

    if (threads.some((thread) => thread.id === selectedThreadId)) {
      return selectedThreadId;
    }

    return filteredThreads[0]?.id ?? threads[0]?.id ?? selectedThreadId;
  }, [filteredThreads, routeThreadId, selectedThreadId, threads]);

  const selectedThread = threads.find((thread) => thread.id === resolvedSelectedThreadId) ?? filteredThreads[0] ?? threads[0];

  useEffect(() => {
    if (!selectedThread) {
      return;
    }

    if (selectedThread.unread === 0) {
      return;
    }

    const markReadTimer = window.setTimeout(() => {
      setThreads((current) =>
        current.map((thread) =>
          thread.id === selectedThread.id
            ? {
                ...thread,
                unread: 0,
              }
            : thread,
        ),
      );
    }, 0);

    return () => window.clearTimeout(markReadTimer);
  }, [selectedThread]);

  const courseLessonGroups = useMemo(() => {
    const groupedCourses = new Map<string, { courseLabel: string; lessons: Map<string, Thread[]> }>();

    filteredThreads.forEach((thread) => {
      if (!groupedCourses.has(thread.courseLabel)) {
        groupedCourses.set(thread.courseLabel, { courseLabel: thread.courseLabel, lessons: new Map<string, Thread[]>() });
      }

      const courseGroup = groupedCourses.get(thread.courseLabel);
      if (!courseGroup) {
        return;
      }

      if (!courseGroup.lessons.has(thread.lessonLabel)) {
        courseGroup.lessons.set(thread.lessonLabel, []);
      }

      courseGroup.lessons.get(thread.lessonLabel)?.push(thread);
    });

    return Array.from(groupedCourses.values()).map((courseGroup) => ({
      courseLabel: courseGroup.courseLabel,
      lessons: Array.from(courseGroup.lessons.entries()).map(([lessonLabel, items]) => ({
        lessonLabel,
        items: items.sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.replies - left.replies),
      })),
    }));
  }, [filteredThreads]);

  const addReaction = (replyId: number, emoji: string) => {
    if (!selectedThread) {
      return;
    }

    setThreads((current) =>
      current.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              repliesList: thread.repliesList.map((reply) => {
                if (reply.id !== replyId) {
                  return reply;
                }

                const existing = reply.reactions ?? [];
                const found = existing.find((item) => item.emoji === emoji);

                return {
                  ...reply,
                  reactions: found
                    ? existing.map((item) => (item.emoji === emoji ? { ...item, count: item.count + 1 } : item))
                    : [...existing, { emoji, count: 1 }],
                };
              }),
            }
          : thread,
      ),
    );
  };

  const handleStartNewThread = () => {
    newDiscussionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      newDiscussionTitleRef.current?.focus();
    }, 150);
  };

  const clearReplyAttachment = () => {
    setReplyAttachmentName('');
  };

  const createDiscussion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newDiscussionTitle.trim();
    const body = newDiscussionBody.trim();
    if (!title || !body) {
      return;
    }

    if (!activeCourse?.courseId) {
      setStatusMessage('No accessible course available for discussions.');
      return;
    }

    try {
      await postDiscussion(activeCourse.courseId, {
        title,
        content: body,
      });
      setStatusMessage('Discussion message posted successfully.');
    } catch (requestError) {
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to post discussion message.');
      return;
    }

    const nextId = threads.length + 1;
    navigate(
      buildThreadPath(
        slugifyPathSegment(courseSlug ?? activeCourse?.title ?? 'discussion'),
        lessonSlug ?? 'discussion',
        nextId,
      ),
    );
    setActiveCategory('All');
    setNewDiscussionTitle('');
    setNewDiscussionBody('');
  };

  const postReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = replyText.trim();
    if (!text || !selectedThread) {
      return;
    }

    if (!activeCourse?.courseId) {
      setStatusMessage('No accessible course available for discussions.');
      return;
    }

    try {
      await postDiscussion(activeCourse.courseId, {
        title: selectedThread.title,
        content: replyAttachmentName
          ? `${text}\n\nAttachment: ${replyAttachmentName}`
          : text,
      });
      setStatusMessage('Reply posted successfully.');
    } catch (requestError) {
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to post reply.');
      return;
    }

    setReplyText('');
    setReplyAttachmentName('');
  };

  return (
    <DashboardPageFrame
      title="Course Discussions"
      description="Keep learners engaged with threaded conversations, replies, and quick instructor follow-up."
      breadcrumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Discussions' },
      ]}
      actions={
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
            {lastPulse}
          </Typography>
          <Button variant="contained" onClick={handleStartNewThread}>
            New thread
          </Button>
        </Stack>
      }
    >
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
        {statusMessage ? (
          <Alert
            severity={statusMessage.toLowerCase().includes('failed') || statusMessage.toLowerCase().includes('no accessible') ? 'error' : 'success'}
            sx={{ mx: { xs: 2, sm: 3, lg: 4 }, mt: 2.5, borderRadius: 1.5 }}
            onClose={() => setStatusMessage(null)}
          >
            {statusMessage}
          </Alert>
        ) : null}

        <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 15, backdropFilter: 'blur(14px)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                Course Discussions
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.75 }}>
                Keep learners engaged with threaded conversations, replies, and quick instructor follow-up.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, xl: 4 }}>
              <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2} sx={{ height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          Discussion Threads
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          Browse cohort conversations and follow active questions.
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {threads.length} total
                      </Typography>
                    </Box>

                    <Box>
                      <TextField
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search threads..."
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

                    <FormControl fullWidth>
                      <InputLabel id="thread-category-label">Category</InputLabel>
                      <Select labelId="thread-category-label" label="Category" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value as ThreadCategory)}>
                        {(['All', 'Announcements', 'Q&A', 'Study Group', 'Project Help'] as ThreadCategory[]).map((category) => (
                          <MenuItem key={category} value={category}>
                            {courseCategoryLabel(category)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
                      {courseLessonGroups.length === 0 ? (
                        <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.secondary', px: 1 }}>
                          {activeCourse
                            ? 'No discussion posts yet for this course. Start a thread below — updates sync live for other learners in the room.'
                            : accessibleCourses.length === 0
                              ? 'Enroll in a course (or teach one) to access discussions.'
                              : 'Pick a course from your enrollments to load threads.'}
                        </Typography>
                      ) : null}
                      <Stack spacing={2.25}>
                        {courseLessonGroups.map((courseGroup) => (
                          <Box key={courseGroup.courseLabel}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.12em', mb: 1, display: 'block' }}>
                              {courseGroup.courseLabel}
                            </Typography>

                            <Stack spacing={2}>
                              {courseGroup.lessons.map((lessonGroup) => (
                                <Box key={`${courseGroup.courseLabel}-${lessonGroup.lessonLabel}`}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                      {lessonGroup.lessonLabel}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                      {lessonGroup.items.length} thread{lessonGroup.items.length === 1 ? '' : 's'}
                                    </Typography>
                                  </Box>

                                  <Stack spacing={1.25}>
                                    {lessonGroup.items.map((thread) => (
                                      <Suspense key={thread.id} fallback={<Box sx={{ height: 118, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} />}>
                                        <LazyThreadItem
                                        thread={thread}
                                        active={thread.id === selectedThread?.id}
                                        onClick={() => {
                                          setSelectedThreadId(thread.id);
                                          setThreads((current) =>
                                            current.map((item) =>
                                              item.id === thread.id
                                                ? {
                                                    ...item,
                                                    unread: 0,
                                                  }
                                                : item,
                                            ),
                                          );
                                          navigate(thread.deepLinkPath);
                                        }}
                                        />
                                      </Suspense>
                                    ))}
                                  </Stack>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, xl: 8 }}>
              {!selectedThread ? (
                <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', maxWidth: 420 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                      No thread selected
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Choose a thread from the list or create a new discussion. New posts appear in real time via Socket.io when others post in the same course.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
              <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: { xs: 2.5, md: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: selectedThread.accent, fontWeight: 800 }}>
                          {selectedThread.avatar}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900 }} noWrap>
                            {selectedThread.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {selectedThread.author} • {selectedThread.replies} replies
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {selectedThread.pinned ? <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Pinned</Typography> : null}
                        <IconButton aria-label="Open thread route" onClick={() => navigate(selectedThread.deepLinkPath)}>
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      {selectedThread.courseLabel} • {selectedThread.lessonLabel} • {selectedThread.tags.join(', ')} • {relativeTimeLabel(selectedThread.lastActivity)}
                    </Typography>
                  </Box>

                  <Box sx={{ p: { xs: 2.5, md: 3 }, flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: 'background.paper' }}>
                    <Stack spacing={2.25}>
                      <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.75 }}>
                          {selectedThread.summary}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                          {activeCourse?.courseId
                            ? 'New posts in this course appear for everyone in the room without a manual refresh (Socket.io).'
                            : 'Open a course discussion to sync with your cohort in real time.'}
                        </Typography>
                      </Box>

                      <Stack spacing={1.8}>
                        {selectedThread.repliesList.map((reply) => (
                          <Box key={reply.id}>
                            <Suspense fallback={<Box sx={{ height: 138, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} />}>
                              <LazyReplyBubble reply={reply} />
                            </Suspense>
                            <Stack direction="row" spacing={1} sx={{ ml: 6.1, mt: 1.15, flexWrap: 'wrap' }}>
                              {reactionOptions.map((emoji) => (
                                <Button key={`${reply.id}-${emoji}`} size="small" variant="outlined" onClick={() => addReaction(reply.id, emoji)} sx={{ minWidth: 44, px: 1.1 }}>
                                  {emoji}
                                </Button>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </Box>

                  <Box sx={{ p: { xs: 2.5, md: 3 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em' }}>
                          POST A REPLY
                        </Typography>
                      </Box>

                      <Box component="form" onSubmit={postReply}>
                        <Stack spacing={1.5}>
                          <TextField
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            placeholder={`Reply to ${selectedThread.title}...`}
                            multiline
                            minRows={3}
                            sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start', pt: 1.5 } }}
                          />

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', flexWrap: 'wrap' }}>
                              <Button component="label" size="small" variant="text">
                                Attach file
                                <input
                                  hidden
                                  type="file"
                                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    const file = event.target.files?.[0];
                                    setReplyAttachmentName(file ? file.name : '');
                                  }}
                                />
                              </Button>
                              <IconButton
                                size="small"
                                sx={{ color: 'text.secondary' }}
                                aria-label="Clear attachment"
                                onClick={clearReplyAttachment}
                                disabled={!replyAttachmentName}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Box>

                            <Button type="submit" variant="contained" disabled={isPosting || !activeCourse?.courseId} sx={{ minWidth: 150 }}>
                              Post Reply
                            </Button>
                          </Box>

                          {replyAttachmentName ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Attachment ready: {replyAttachmentName}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
              )}
            </Grid>
          </Grid>

          <Card ref={newDiscussionSectionRef} sx={{ mt: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={2.25}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Start a new discussion
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Create a fresh thread for a question, announcement, or peer topic.
                  </Typography>
                </Box>

                <Box component="form" onSubmit={createDiscussion}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <TextField
                        inputRef={newDiscussionTitleRef}
                        value={newDiscussionTitle}
                        onChange={(event) => setNewDiscussionTitle(event.target.value)}
                        label="Thread title"
                        placeholder="Ask a question or start a topic"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <TextField value={newDiscussionBody} onChange={(event) => setNewDiscussionBody(event.target.value)} label="Opening post" placeholder="Write the first message for this discussion..." multiline minRows={3} />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button type="submit" variant="contained" disabled={isPosting || !activeCourse?.courseId}>
                      Create Discussion
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

    </Box>
    </DashboardPageFrame>
  );
}

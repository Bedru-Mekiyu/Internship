import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckCircleOutlined,
  CloseOutlined,
  DescriptionOutlined,
  ExpandMoreOutlined,
  MenuOutlined,
  PictureAsPdfOutlined,
  QuizOutlined,
  PlayArrowOutlined,
  PauseOutlined,
  RestartAltOutlined,
  SkipNextOutlined,
  SkipPreviousOutlined,
  TextSnippetOutlined,
  VolumeUpOutlined,
  FullscreenOutlined,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCourseModules, useCourseProgress } from '../../hooks/useCourses';
import { api, normalizeApiError } from '../../services/api';
import { buildLessonQuizPath } from '../../services/lessonFlow';
import { theme } from '../../theme';
import { BRAND } from '../../theme/brand';
import { resolvePublicApiOrigin } from '../../utils/apiBaseUrl';
import { sanitizeHttpUrl } from '../../utils/safeUrl';

type LessonType = 'video' | 'pdf' | 'quiz' | 'text';

type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  description: string;
  resources: string[];
  videoUrl?: string;
  textContent?: string[];
};

type Module = {
  title: string;
  lessons: Lesson[];
};

interface ApiProgress {
  completedLessons: string[];
}

type ResumeLessonState = {
  lessonId: string;
  lessonTitle?: string;
};

function resolveMediaUrl(value: string | undefined | null) {
  const trimmedValue = typeof value === 'string' ? value.trim() : '';
  if (!trimmedValue) {
    return undefined;
  }

  if (trimmedValue.startsWith('/uploads/')) {
    return new URL(trimmedValue, resolvePublicApiOrigin()).toString();
  }

  return trimmedValue;
}

function slugifyPathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function lessonTypeChip(type: LessonType) {
  switch (type) {
    case 'video':
      return { label: 'Video', color: BRAND.primary };
    case 'pdf':
      return { label: 'PDF', color: '#EF4444' };
    case 'quiz':
      return { label: 'Quiz', color: '#F59E0B' };
    default:
      return { label: 'Text', color: '#10B981' };
  }
}

function curriculumIcon(lesson: Lesson) {
  switch (lesson.type) {
    case 'video':
      return <PlayArrowOutlined />;
    case 'pdf':
      return <PictureAsPdfOutlined />;
    case 'quiz':
      return <QuizOutlined />;
    default:
      return <TextSnippetOutlined />;
  }
}

function SidebarRow({
  label,
  icon,
  active = false,
  completed = false,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  completed?: boolean;
  onClick?: () => void;
}) {
  return (
    <ListItemButton
      onClick={onClick}
      selected={active}
      sx={{
        borderRadius: '14px',
        minHeight: 48,
        px: 1.5,
        color: active ? '#FFFFFF' : 'text.primary',
        bgcolor: active ? 'primary.main' : 'transparent',
        '& .MuiListItemIcon-root': { color: active ? '#FFFFFF' : 'text.secondary', minWidth: 40 },
        '&.Mui-selected': { bgcolor: 'primary.main', color: '#FFFFFF', '&:hover': { bgcolor: 'primary.dark' } },
        '&:hover': { bgcolor: active ? 'primary.dark' : alpha(theme.palette.primary.main, 0.06) },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>} />
      {completed ? <CheckCircleOutlined sx={{ color: active ? '#FFFFFF' : 'success.main', fontSize: 18 }} /> : null}
    </ListItemButton>
  );
}

export default function CoursePlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const queryLessonId = new URLSearchParams(location.search).get('lesson') || undefined;
  const lessonResumeKey = `learnspace-active-lesson-${courseId || ''}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string>('');
  const [activeLessonId, setActiveLessonId] = useState(() => {
    if (!courseId) {
      return '';
    }

    if (queryLessonId) {
      return queryLessonId;
    }

    const storedResumeValue = window.localStorage.getItem(lessonResumeKey);
    if (!storedResumeValue) {
      return '';
    }

    try {
      const parsed = JSON.parse(storedResumeValue) as ResumeLessonState;
      if (parsed?.lessonId) {
        return parsed.lessonId;
      }
    } catch {
      return '';
    }

    return '';
  });
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [videoState, setVideoState] = useState({ playing: false, currentTime: 0, duration: 0, volume: 0.85 });
  const [lastSaved, setLastSaved] = useState('Saving progress...');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const modulesQuery = useCourseModules(courseId || '');
  const progressQuery = useCourseProgress(courseId || '');

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!courseId) {
        return null;
      }

      const response = await api.post<ApiProgress>(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
      return response.data;
    },
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      setCompletedLessons(result.completedLessons || []);
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      if (!courseId) {
        return null;
      }

      const response = await api.patch<ApiProgress>(`/api/courses/${courseId}/progress`, { progress });
      return response.data;
    },
  });

  const mappedApiModules = useMemo<Module[] | null>(() => {
    if (!modulesQuery.data) {
      return null;
    }

    return modulesQuery.data.map((moduleItem, moduleIndex) => ({
      title: moduleItem.title || `Module ${moduleIndex + 1}`,
      lessons: (moduleItem.lessons || []).map((lesson, lessonIndex) => ({
        id: lesson._id ? String(lesson._id) : `lesson-${moduleIndex}-${lessonIndex}`,
        title: lesson.title || `Lesson ${lessonIndex + 1}`,
        type: lesson.type === 'video' || lesson.type === 'quiz' ? lesson.type : 'text',
        duration: typeof lesson.duration === 'number' ? `${lesson.duration} min` : '--',
        description: lesson.content || '',
        resources: (lesson.attachments || [])
          .map((attachment) => attachment.name || attachment.url || '')
          .filter(Boolean),
        videoUrl: lesson.type === 'video' ? resolveMediaUrl(lesson.videoUrl || lesson.content) : undefined,
        textContent:
          lesson.type === 'text' || lesson.type === 'assignment'
            ? (lesson.content ? lesson.content.split('\n').filter(Boolean) : [])
            : undefined,
      })),
    }));
  }, [modulesQuery.data]);

  const courseModules = useMemo<Module[]>(() => mappedApiModules ?? [], [mappedApiModules]);

  useEffect(() => {
    if (!progressQuery.data?.completedLessons) {
      return;
    }

    const syncTimer = window.setTimeout(() => {
      setCompletedLessons(progressQuery.data?.completedLessons || []);
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [progressQuery.data]);

  const flatCourseLessons = useMemo(() => courseModules.flatMap((moduleItem) => moduleItem.lessons), [courseModules]);
  const lessonPool = useMemo(() => flatCourseLessons, [flatCourseLessons]);

  const resolvedActiveLessonId = useMemo(() => {
    if (lessonPool.length === 0) {
      return activeLessonId;
    }

    return lessonPool.some((lesson) => lesson.id === activeLessonId)
      ? activeLessonId
      : lessonPool[0].id;
  }, [activeLessonId, lessonPool]);

  const activeLesson = useMemo(
    () => lessonPool.find((lesson) => lesson.id === resolvedActiveLessonId) ?? lessonPool[0] ?? null,
    [lessonPool, resolvedActiveLessonId]
  );
  const activeIndex = useMemo(() => lessonPool.findIndex((lesson) => lesson.id === resolvedActiveLessonId), [lessonPool, resolvedActiveLessonId]);

  useEffect(() => {
    if (!activeLesson || !resolvedActiveLessonId) {
      return;
    }

    window.localStorage.setItem(
      lessonResumeKey,
      JSON.stringify({
        lessonId: resolvedActiveLessonId,
        lessonTitle: activeLesson.title,
      } satisfies ResumeLessonState),
    );
  }, [activeLesson, lessonResumeKey, resolvedActiveLessonId]);

  useEffect(() => {
    const storageKey = `learnspace-course-progress-${courseId || ''}-${resolvedActiveLessonId}`;
    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      const parsed = JSON.parse(saved) as { currentTime?: number; completed?: boolean };
      const loadTimer = window.setTimeout(() => {
        if (typeof parsed.currentTime === 'number') {
          setVideoState((current) => ({ ...current, currentTime: parsed.currentTime ?? current.currentTime }));
        }
        if (parsed.completed) {
          setCompletedLessons((current) =>
            current.includes(resolvedActiveLessonId) ? current : [...current, resolvedActiveLessonId],
          );
        }
      }, 0);

      return () => window.clearTimeout(loadTimer);
    }
    return undefined;
  }, [courseId, resolvedActiveLessonId]);

  useEffect(() => {
    if (!videoRef.current || !activeLesson || activeLesson.type !== 'video') {
      return;
    }

    videoRef.current.currentTime = videoState.currentTime;
    videoRef.current.volume = videoState.volume;
  }, [activeLesson, videoState.currentTime, videoState.volume, activeLessonId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storageKey = `learnspace-course-progress-${courseId || ''}-${resolvedActiveLessonId}`;
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentTime: videoState.currentTime,
          completed: completedLessons.includes(resolvedActiveLessonId),
        })
      );
      setLastSaved(`Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [courseId, resolvedActiveLessonId, videoState.currentTime, completedLessons]);

  // Handle 90% video completion auto-complete
  useEffect(() => {
    if (!activeLesson) {
      return undefined;
    }

    if (activeLesson.type === 'video' && videoState.duration > 0) {
      const progress = videoState.currentTime / videoState.duration;
      if (progress >= 0.9 && !completedLessons.includes(activeLesson.id)) {
        if (courseId) {
          completeLessonMutation.mutate(activeLesson.id);
        } else {
          const completeTimer = window.setTimeout(() => {
            setCompletedLessons((current) => [...current, activeLesson.id]);
          }, 0);

          return () => window.clearTimeout(completeTimer);
        }
      }
    }
    return undefined;
  }, [activeLesson, videoState.currentTime, videoState.duration, completedLessons, courseId, completeLessonMutation]);

  const setLesson = (lesson: Lesson) => {
      setActiveLessonId(lesson.id);
      setVideoState((current) => ({ ...current, playing: false, currentTime: 0, duration: 0 }));
      if (lesson.type === 'video') {
      setExpandedModule(courseModules.find((module) => module.lessons.some((item) => item.id === lesson.id))?.title ?? '');
      }
  };

  const goNext = () => {
    const nextLesson = lessonPool[activeIndex + 1];
    if (nextLesson) {
      setLesson(nextLesson);
    }
  };

  const goPrevious = () => {
    const previousLesson = lessonPool[activeIndex - 1];
    if (previousLesson) {
      setLesson(previousLesson);
    }
  };

  const toggleComplete = () => {
    if (!activeLesson) {
      return;
    }

    if (completedLessons.includes(activeLesson.id)) {
      return;
    }

    completeLessonMutation.mutate(activeLesson.id);
  };

  const lessonInfo = activeLesson ? lessonTypeChip(activeLesson.type) : null;
  const safeVideoUrl = sanitizeHttpUrl(resolveMediaUrl(activeLesson?.videoUrl));
  const discussionPath = activeLesson
    ? `/courses/${courseId || ''}/lessons/${slugifyPathSegment(activeLesson.title)}/discussions/1`
    : `/courses/${courseId || ''}/discussions/1`;
  const noLessonsAvailable = Boolean(courseId) && !modulesQuery.isLoading && flatCourseLessons.length === 0;

  const saveProgressNow = () => {
    const storageKey = `learnspace-course-progress-${courseId || ''}-${resolvedActiveLessonId}`;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        currentTime: videoState.currentTime,
          completed: completedLessons.includes(resolvedActiveLessonId),
      })
    );

    const progress = lessonPool.length === 0 ? 0 : Math.round((completedLessons.length / lessonPool.length) * 100);
    updateProgressMutation.mutate(progress);

    setLastSaved(`Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const toggleFullscreen = async () => {
    const mediaElement = videoRef.current;
    if (!mediaElement) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await mediaElement.requestFullscreen();
  };

  if (!courseId) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Select a course from your dashboard before opening the course player.
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/courses')}>
          Back to my courses
        </Button>
      </Box>
    );
  }

  if (modulesQuery.isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Alert severity="info">Loading course lessons...</Alert>
      </Box>
    );
  }

  if (!activeLesson || noLessonsAvailable) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No lessons are available for this course yet.
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/courses')}>Back to my courses</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <>
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: '100%', maxWidth: 340, bgcolor: 'background.paper' } }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Curriculum</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><CloseOutlined /></IconButton>
          </Box>
          <List disablePadding sx={{ display: 'grid', gap: 0.75 }}>
            {courseModules.map((module) => (
              <Accordion key={module.title} expanded={expandedModule === module.title} onChange={(_, next) => setExpandedModule(next ? module.title : '')} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                  <Typography sx={{ fontWeight: 800 }}>{module.title}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Stack spacing={0.75}>
                    {module.lessons.map((lesson) => (
                      <SidebarRow key={lesson.id} label={`${lesson.title} · ${lesson.duration}`} icon={curriculumIcon(lesson)} active={lesson.id === activeLesson.id} completed={completedLessons.includes(lesson.id)} onClick={() => setLesson(lesson)} />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr) 340px' }, minHeight: '100vh' }}>
        <Box sx={{ display: { xs: 'none', lg: 'block' }, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', p: 2.5, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <Stack spacing={2.25}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Curriculum</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Modules and lessons</Typography>
              </Box>
              <IconButton sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: { lg: 'none' } }} onClick={() => setMobileOpen(true)}>
                <MenuOutlined />
              </IconButton>
            </Box>

            <List disablePadding sx={{ display: 'grid', gap: 1 }}>
              {courseModules.map((module) => (
                <Accordion key={module.title} expanded={expandedModule === module.title} onChange={(_, next) => setExpandedModule(next ? module.title : '')} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                    <Typography sx={{ fontWeight: 800 }}>{module.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={0.75}>
                      {module.lessons.map((lesson) => (
                        <SidebarRow key={lesson.id} label={`${lesson.title} · ${lesson.duration}`} icon={curriculumIcon(lesson)} active={lesson.id === activeLesson.id} completed={completedLessons.includes(lesson.id)} onClick={() => setLesson(lesson)} />
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, minWidth: 0 }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <IconButton sx={{ display: { xs: 'inline-flex', lg: 'none' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }} onClick={() => setMobileOpen(true)}>
                  <MenuOutlined />
                </IconButton>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}>{activeLesson.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>Course player and lesson workspace</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: lessonInfo?.color || 'text.secondary', fontWeight: 700 }}>
                {lessonInfo?.label || 'Lesson'}
              </Typography>
            </Box>

            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 0 }}>
                {activeLesson.type === 'video' ? (
                  <Box sx={{ position: 'relative', background: '#0F172A' }}>
                    {safeVideoUrl ? (
                      <Box
                        component="video"
                        ref={videoRef}
                        src={safeVideoUrl}
                        onLoadedMetadata={(event) => setVideoState((current) => ({ ...current, duration: event.currentTarget.duration }))}
                        onTimeUpdate={(event) => setVideoState((current) => ({ ...current, currentTime: event.currentTarget.currentTime, duration: event.currentTarget.duration }))}
                        onPlay={() => setVideoState((current) => ({ ...current, playing: true }))}
                        onPause={() => setVideoState((current) => ({ ...current, playing: false }))}
                        sx={{ width: '100%', display: 'block', maxHeight: 540, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', p: 3 }}>
                        <Alert severity="warning">Video URL is invalid and was blocked for security.</Alert>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ p: { xs: 2.5, md: 4 }, minHeight: 420, display: 'grid', placeItems: 'center', bgcolor: 'background.paper' }}>
                    {activeLesson.type === 'pdf' ? (
                      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 620 }}>
                        <Box sx={{ width: 88, height: 88, borderRadius: '24px', bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', display: 'grid', placeItems: 'center' }}>
                          <DescriptionOutlined sx={{ fontSize: 44 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>PDF lesson preview</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{activeLesson.description}</Typography>
                        <Button variant="contained" onClick={() => navigate('/docs')} sx={{ borderRadius: 1.5, fontWeight: 800 }}>Open PDF resource</Button>
                      </Stack>
                    ) : activeLesson.type === 'quiz' ? (
                      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 620 }}>
                        <Box sx={{ width: 88, height: 88, borderRadius: '24px', bgcolor: alpha('#F59E0B', 0.14), color: '#F59E0B', display: 'grid', placeItems: 'center' }}>
                          <QuizOutlined sx={{ fontSize: 44 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Quiz lesson</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{activeLesson.description}</Typography>
                        <Button variant="contained" onClick={() => navigate(buildLessonQuizPath(courseId, activeLesson.id))} sx={{ borderRadius: 1.5, fontWeight: 800 }}>Start Quiz</Button>
                      </Stack>
                    ) : (
                      <Stack spacing={2} sx={{ maxWidth: 760 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Text lesson</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{activeLesson.description}</Typography>
                        <Card sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                          <CardContent>
                            <Stack spacing={1.5}>
                              {(activeLesson.textContent ?? []).map((paragraph) => (
                                <Typography key={paragraph} variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary' }}>{paragraph}</Typography>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Stack>
                    )}
                  </Box>
                )}

                <Box sx={{ p: { xs: 2, md: 2.5 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  {activeLesson.type === 'video' ? (
                    <Stack spacing={1.5}>
                      <LinearProgress variant="determinate" value={activeLesson.type === 'video' && videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0} sx={{ height: 10, borderRadius: '999px', bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: '999px' } }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton onClick={() => (videoRef.current ? (videoRef.current.currentTime = 0) : null)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <RestartAltOutlined />
                          </IconButton>
                          <IconButton onClick={() => (videoRef.current ? (videoState.playing ? videoRef.current.pause() : videoRef.current.play()) : null)} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                            {videoState.playing ? <PauseOutlined /> : <PlayArrowOutlined />}
                          </IconButton>
                          <IconButton onClick={goPrevious} disabled={activeIndex <= 0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <SkipPreviousOutlined />
                          </IconButton>
                          <IconButton onClick={goNext} disabled={activeIndex >= lessonPool.length - 1} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <SkipNextOutlined />
                          </IconButton>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {Math.floor(videoState.currentTime / 60)}:{String(Math.floor(videoState.currentTime % 60)).padStart(2, '0')} / {activeLesson.duration}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 190 }}>
                            <VolumeUpOutlined sx={{ color: 'text.secondary' }} />
                            <LinearProgress variant="determinate" value={videoState.volume * 100} sx={{ flex: 1, height: 8, borderRadius: '999px', bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: '999px' } }} />
                          </Box>
                          <IconButton onClick={toggleFullscreen} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <FullscreenOutlined />
                          </IconButton>
                        </Box>
                      </Box>
                    </Stack>
                  ) : null}
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={2.25}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>Lesson Details</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{activeLesson.description}</Typography>
                        </Box>
                        <Button component={RouterLink} to="/messages" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}>
                          Discussion
                        </Button>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Card sx={{ boxShadow: 'none', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>Resources</Typography>
                                <Stack spacing={1} sx={{ mt: 1.25 }}>
                                  {activeLesson.resources.map((resource) => (
                                  <Box key={resource} sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{resource}</Typography>
                                  </Box>
                                ))}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Card sx={{ boxShadow: 'none', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>Completion</Typography>
                              <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                  <Checkbox checked={completedLessons.includes(activeLesson.id)} onChange={toggleComplete} />
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Mark lesson as complete</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{lastSaved}</Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>

                      {activeLesson.type === 'text' ? (
                        <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                          This lesson is text-based. Read the overview above and use the discussion area for questions.
                        </Alert>
                      ) : null}

                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={goPrevious} disabled={activeIndex <= 0} sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}>
                          Previous Lesson
                        </Button>
                        <Button variant="contained" onClick={goNext} disabled={activeIndex >= lessonPool.length - 1} sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}>
                          Next Lesson
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', position: { lg: 'sticky' }, top: { lg: 24 } }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={2.25}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{activeLesson.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, lineHeight: 1.8 }}>{activeLesson.description}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>Lesson Type</Typography>
                        <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 700, color: 'text.primary', textTransform: 'capitalize' }}>{activeLesson.type}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>Quick Actions</Typography>
                        <Stack spacing={1.2} sx={{ mt: 1.25 }}>
                          <Button variant="contained" onClick={saveProgressNow} fullWidth sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}>
                            Save progress
                          </Button>
                          <Button variant="outlined" onClick={() => navigate('/docs')} fullWidth sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}>
                            Open resources
                          </Button>
                          <Button variant="outlined" onClick={() => navigate(discussionPath)} fullWidth sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}>
                            Ask a question
                          </Button>
                        </Stack>
                      </Box>

                      {modulesQuery.error || progressQuery.error || completeLessonMutation.error || updateProgressMutation.error ? (
                        <Alert severity="error">
                          {normalizeApiError(
                            modulesQuery.error
                            || progressQuery.error
                            || completeLessonMutation.error
                            || updateProgressMutation.error
                          ).message}
                        </Alert>
                      ) : null}

                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>Lesson Progress</Typography>
                        <LinearProgress variant="determinate" value={completedLessons.includes(activeLesson.id) ? 100 : videoState.currentTime && activeLesson.type === 'video' ? Math.min((videoState.currentTime / Math.max(videoState.duration, 1)) * 100, 100) : 0} sx={{ mt: 1.25, height: 10, borderRadius: '999px', bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: '999px' } }} />
                      </Box>

                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Need help?</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, lineHeight: 1.8 }}>
                          Join the discussion for peer support, instructor feedback, and quick clarification on this lesson.
                        </Typography>
                        <Button component={RouterLink} to="/messages" variant="text" sx={{ mt: 1, px: 0, color: 'primary.main', fontWeight: 800, textTransform: 'none' }}>
                          Go to discussions
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Box>
      </>
    </Box>
  );
}

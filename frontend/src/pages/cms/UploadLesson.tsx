import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  InputBase,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  AnalyticsOutlined,
  ArrowBackIosNewOutlined,
  AttachFileOutlined,
  CalendarMonthOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  HelpOutlineOutlined,
  InsertDriveFileOutlined,
  MenuBookOutlined,
  NotificationsNoneOutlined,
  PeopleOutlineOutlined,
  SchoolOutlined,
  SettingsOutlined,
  VideocamOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { api, ensureCsrfToken, normalizeApiError } from '../../services/api';
import { resolvePublicApiOrigin } from '../../utils/apiBaseUrl';

type Visibility = 'Public' | 'Private' | 'Scheduled';
type LessonStatus = 'published' | 'draft' | 'scheduled';

interface UploadedMedia {
  _id?: string;
  filename?: string;
  originalName?: string;
  mimetype?: string;
  size?: number;
  url?: string;
}

interface AttachmentItem {
  name: string;
  size: string;
  url?: string;
  mediaId?: string;
}

interface CourseOption {
  _id: string;
  title: string;
}

interface ModuleOption {
  _id: string;
  title: string;
  order?: number;
}

interface CourseSectionOption {
  _id: string;
  title: string;
  courseId: string;
  courseTitle: string;
}

const sidebarWidth = 160;
const maxVideoBytes = 2 * 1024 * 1024 * 1024;

const panelSx = {
  bgcolor: '#FFFFFF',
  border: '1px solid #DDE5F0',
  borderRadius: '6px',
  boxShadow: 'none',
};

const labelSx = {
  color: '#111827',
  fontSize: '0.63rem',
  fontWeight: 700,
  lineHeight: 1.2,
};

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 MB';
  }

  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

function resolveMediaUrl(value: string | undefined) {
  const trimmedValue = typeof value === 'string' ? value.trim() : '';
  if (!trimmedValue) {
    return '';
  }

  if (trimmedValue.startsWith('/uploads/')) {
    return new URL(trimmedValue, resolvePublicApiOrigin()).toString();
  }

  return trimmedValue;
}

function visibilityToStatus(visibility: Visibility): LessonStatus {
  if (visibility === 'Private') {
    return 'draft';
  }

  if (visibility === 'Scheduled') {
    return 'scheduled';
  }

  return 'published';
}

function roleLabel(role: string | undefined) {
  if (role === 'admin') return 'Super Admin';
  if (role === 'content_manager') return 'Content Manager';
  if (role === 'instructor') return 'Instructor';
  return 'Member';
}

function dashboardPath(role: string | undefined) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'instructor') return '/instructor/dashboard';
  if (role === 'content_manager') return '/cms/content';
  return '/dashboard';
}

function AdminBrand() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, px: 1.8, height: 42 }}>
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '4px',
          bgcolor: '#2563EB',
          color: '#FFFFFF',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <SchoolOutlined sx={{ fontSize: 12 }} />
      </Box>
      <Typography sx={{ color: '#2563EB', fontSize: '0.84rem', fontWeight: 800, lineHeight: 1 }}>
        EduAdmin
      </Typography>
    </Box>
  );
}

function SidebarItem({
  icon,
  label,
  to,
  active,
}: {
  icon: ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        minHeight: 24,
        px: 1.9,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: active ? '#111827' : '#8B9AAF',
        bgcolor: active ? '#DBEAFE' : 'transparent',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '0.66rem',
        fontWeight: active ? 700 : 600,
        '& svg': { fontSize: 13.5, color: active ? '#111827' : '#8B9AAF' },
        '&:hover': {
          bgcolor: active ? '#DBEAFE' : '#F3F6FB',
        },
      }}
    >
      {icon}
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </Box>
    </Box>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.55 }}>
      <Typography
        sx={{
          px: 1.9,
          color: '#8B9AAF',
          fontSize: '0.52rem',
          fontWeight: 800,
          lineHeight: 1,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>
      <Stack spacing={0.22}>{children}</Stack>
    </Box>
  );
}

function EduAdminSidebar() {
  const { user } = useAuth();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Maria Garcia';
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'MG';

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        width: sidebarWidth,
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #DDE5F0',
      }}
    >
      <AdminBrand />

      <Stack spacing={2.65} sx={{ px: 1.1, pt: 2, flex: 1 }}>
        <SidebarSection title="Overview">
          <SidebarItem icon={<DashboardOutlined />} label="Dashboard" to={dashboardPath(user?.role)} />
          <SidebarItem icon={<AnalyticsOutlined />} label="Analytics" to="/admin/analytics" />
        </SidebarSection>

        <SidebarSection title="Management">
          {user?.role === 'admin' ? (
            <SidebarItem icon={<PeopleOutlineOutlined />} label="Users" to="/admin/users" />
          ) : null}
          <SidebarItem icon={<MenuBookOutlined />} label="Courses" to="/lessons/upload" active />
          <SidebarItem icon={<CalendarMonthOutlined />} label="Schedule" to="/activity" />
        </SidebarSection>

        <SidebarSection title="System">
          <SidebarItem icon={<SettingsOutlined />} label="Settings" to={user?.role === 'admin' ? '/admin/settings' : '/profile-settings'} />
          <SidebarItem icon={<HelpOutlineOutlined />} label="Support" to="/help" />
        </SidebarSection>
      </Stack>

      <Box sx={{ px: 1.9, py: 2.2, borderTop: '1px solid #EEF2F6' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
          <Avatar sx={{ width: 23, height: 23, bgcolor: '#D5E7FF', color: '#2563EB', fontSize: '0.55rem', fontWeight: 800 }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#111827', fontSize: '0.64rem', fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {userName}
            </Typography>
            <Typography sx={{ color: '#8B9AAF', fontSize: '0.54rem', fontWeight: 600, lineHeight: 1.2 }} noWrap>
              {roleLabel(user?.role)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function AttachmentRow({ attachment, onRemove }: { attachment: AttachmentItem; onRemove: () => void }) {
  return (
    <Box
      sx={{
        minHeight: 35,
        px: 1.1,
        py: 0.8,
        bgcolor: '#FFFFFF',
        border: '1px solid #E6ECF4',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
        <Box
          sx={{
            width: 21,
            height: 21,
            borderRadius: '4px',
            bgcolor: '#EDF4FF',
            color: '#2563EB',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <InsertDriveFileOutlined sx={{ fontSize: 13 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: '#111827', fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {attachment.name}
          </Typography>
          <Typography sx={{ color: '#8B9AAF', fontSize: '0.52rem', lineHeight: 1.2 }}>
            {attachment.size}
          </Typography>
        </Box>
      </Box>

      <IconButton size="small" onClick={onRemove} aria-label={`Remove ${attachment.name}`} sx={{ width: 20, height: 20, color: '#A7B1C2' }}>
        <CloseOutlined sx={{ fontSize: 12 }} />
      </IconButton>
    </Box>
  );
}

export default function UploadLesson() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseIdFromUrl = searchParams.get('courseId')?.trim() || '';
  const moduleIdFromUrl = searchParams.get('moduleId')?.trim() || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('0');
  const [visibility, setVisibility] = useState<Visibility>('Public');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [courseSections, setCourseSections] = useState<CourseSectionOption[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<UploadedMedia | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  const selectedSection = useMemo(
    () => courseSections.find((section) => section._id === selectedModuleId) ?? null,
    [courseSections, selectedModuleId],
  );

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let isActive = true;

    const loadSections = async () => {
      setIsLoadingSections(true);
      setStatusMessage(null);

      try {
        const endpoints = user.role === 'instructor'
          ? [
            `/api/courses?status=published&instructor=${encodeURIComponent(user._id)}`,
            `/api/courses?status=draft&instructor=${encodeURIComponent(user._id)}`,
          ]
          : [
            '/api/courses?status=published',
            '/api/courses?status=draft',
          ];

        const courseResponses = await Promise.allSettled(endpoints.map((endpoint) => api.get<CourseOption[]>(endpoint)));
        const courseMap = new Map<string, CourseOption>();

        courseResponses.forEach((response) => {
          if (response.status !== 'fulfilled') {
            return;
          }

          (response.value.data || []).forEach((course) => {
            if (course?._id) {
              courseMap.set(course._id, course);
            }
          });
        });

        let courses = [...courseMap.values()];
        if (courseIdFromUrl) {
          courses = courses.filter((course) => course._id === courseIdFromUrl);
        }

        if (courses.length === 0) {
          if (!isActive) return;
          setCourseSections([]);
          setSelectedModuleId('');
          setStatusMessage({
            type: 'error',
            text: 'Create a course and module before uploading a lesson.',
          });
          return;
        }

        const moduleResponses = await Promise.allSettled(
          courses.map(async (course) => {
            const response = await api.get<ModuleOption[]>(`/api/courses/${course._id}/modules`);
            return { course, modules: response.data || [] };
          }),
        );

        const nextSections = moduleResponses.flatMap((response) => {
          if (response.status !== 'fulfilled') {
            return [];
          }

          return response.value.modules.map((moduleItem) => ({
            _id: moduleItem._id,
            title: moduleItem.title,
            courseId: response.value.course._id,
            courseTitle: response.value.course.title,
          }));
        });

        if (!isActive) return;

        setCourseSections(nextSections);
        setSelectedModuleId((current) => {
          if (current && nextSections.some((section) => section._id === current)) {
            return current;
          }

          if (moduleIdFromUrl && nextSections.some((section) => section._id === moduleIdFromUrl)) {
            return moduleIdFromUrl;
          }

          return nextSections[0]?._id ?? '';
        });

        if (nextSections.length === 0) {
          setStatusMessage({
            type: 'error',
            text: 'Add a module to your course before uploading a lesson.',
          });
        }
      } catch (requestError) {
        if (!isActive) return;
        setStatusMessage({
          type: 'error',
          text: normalizeApiError(requestError).message || 'Failed to load course sections.',
        });
      } finally {
        if (isActive) {
          setIsLoadingSections(false);
        }
      }
    };

    void loadSections();

    return () => {
      isActive = false;
    };
  }, [courseIdFromUrl, moduleIdFromUrl, user]);

  const uploadMediaFile = async (file: File) => {
    await ensureCsrfToken();

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadedMedia>('/api/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
    });

    return response.data;
  };

  const handleVideoFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const file = files[0];
    if (file.size > maxVideoBytes) {
      setStatusMessage({ type: 'error', text: 'Video files must be 2GB or smaller.' });
      return;
    }

    setUploadedVideoName(file.name);
    setIsUploadingVideo(true);
    setStatusMessage(null);

    try {
      const media = await uploadMediaFile(file);
      setUploadedVideo(media);
      setStatusMessage({ type: 'success', text: `Video uploaded: ${file.name}` });
    } catch (requestError) {
      setUploadedVideo(null);
      setUploadedVideoName('');
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || `Failed to upload video: ${file.name}`,
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void handleVideoFiles(event.dataTransfer.files);
  };

  const addAttachment = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsUploadingAttachment(true);
    setStatusMessage(null);

    try {
      const media = await uploadMediaFile(file);
      setAttachments((current) => [
        ...current,
        {
          name: file.name,
          size: formatFileSize(file.size),
          url: resolveMediaUrl(media.url),
          mediaId: media._id,
        },
      ]);
      setStatusMessage({ type: 'success', text: `Attachment uploaded: ${file.name}` });
    } catch (requestError) {
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || `Failed to upload attachment: ${file.name}`,
      });
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const createLesson = async (nextVisibility: Visibility) => {
    const trimmedTitle = title.trim();
    const numericDuration = Number(duration);
    const status = visibilityToStatus(nextVisibility);

    if (!trimmedTitle) {
      setStatusMessage({ type: 'error', text: 'Lesson title is required.' });
      return;
    }

    if (!selectedModuleId) {
      setStatusMessage({ type: 'error', text: 'Select a course section before saving.' });
      return;
    }

    if (status === 'published' && !uploadedVideo?.url) {
      setStatusMessage({ type: 'error', text: 'Upload a video before publishing this lesson.' });
      return;
    }

    if (!Number.isFinite(numericDuration) || numericDuration < 0) {
      setStatusMessage({ type: 'error', text: 'Duration must be a valid non-negative number.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await ensureCsrfToken();
      await api.post(`/api/courses/modules/${selectedModuleId}/lessons`, {
        title: trimmedTitle,
        content: description.trim(),
        videoUrl: resolveMediaUrl(uploadedVideo?.url),
        type: 'video',
        duration: Math.round(numericDuration),
        status,
        attachments: attachments.map((attachment) => ({
          name: attachment.name,
          size: attachment.size,
          url: attachment.url || '',
          mediaId: attachment.mediaId || undefined,
        })),
        notes: selectedSection ? `Course: ${selectedSection.courseTitle}` : '',
      });

      setStatusMessage({
        type: 'success',
        text: status === 'published'
          ? 'Lesson published successfully.'
          : status === 'scheduled'
            ? 'Lesson scheduled successfully.'
            : 'Lesson draft saved successfully.',
      });
      setTitle('');
      setDescription('');
      setDuration('0');
      setUploadedVideo(null);
      setUploadedVideoName('');
      setAttachments([]);
    } catch (requestError) {
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || 'Failed to save lesson.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isUploadingVideo || isUploadingAttachment || isSubmitting;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#EEF3FA',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: `${sidebarWidth}px minmax(0, 1fr)` },
      }}
    >
      <EduAdminSidebar />

      <Box sx={{ minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            height: 42,
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #DDE5F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 1.5, md: 2 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            <IconButton
              aria-label="Go back"
              onClick={() => navigate(-1)}
              sx={{
                width: 22,
                height: 22,
                border: '1px solid #E4EAF2',
                color: '#A2ACBB',
                bgcolor: '#FFFFFF',
              }}
            >
              <ArrowBackIosNewOutlined sx={{ fontSize: 11 }} />
            </IconButton>
            <Typography sx={{ color: '#111827', fontSize: '0.85rem', fontWeight: 800 }} noWrap>
              Upload Lesson
            </Typography>
          </Box>

          <IconButton
            component={RouterLink}
            to="/notifications"
            aria-label="Notifications"
            sx={{
              width: 24,
              height: 24,
              border: '1px solid #E4EAF2',
              color: '#111827',
              bgcolor: '#FFFFFF',
            }}
          >
            <NotificationsNoneOutlined sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        <Box component="main" sx={{ px: { xs: 1.5, md: 2.5 }, py: { xs: 1.5, md: 2.8 } }}>
          {statusMessage ? (
            <Alert
              severity={statusMessage.type}
              onClose={() => setStatusMessage(null)}
              sx={{ mb: 1.6, borderRadius: '6px', py: 0.35, fontSize: '0.72rem' }}
            >
              {statusMessage.text}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(460px, 1fr) 232px' },
              gap: 2,
              alignItems: 'start',
              maxWidth: 900,
            }}
          >
            <Box>
              <Box sx={{ ...panelSx, p: 1.9 }}>
                <Stack spacing={1.75}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                    <VideocamOutlined sx={{ color: '#2563EB', fontSize: 13 }} />
                    <Typography sx={{ color: '#111827', fontSize: '0.72rem', fontWeight: 800 }}>
                      Video Source
                    </Typography>
                  </Box>

                  <Box
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDrop}
                    sx={{
                      height: { xs: 178, md: 180 },
                      border: '1px dashed #BFD2EC',
                      borderRadius: '5px',
                      bgcolor: '#DDEAFB',
                      display: 'grid',
                      placeItems: 'center',
                      px: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Stack spacing={1.15} sx={{ alignItems: 'center', textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          bgcolor: '#FFFFFF',
                          color: '#2563EB',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <CloudUploadOutlined sx={{ fontSize: 23 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 800, lineHeight: 1.2 }}>
                          {uploadedVideoName || isUploadingVideo ? (isUploadingVideo ? 'Uploading video...' : uploadedVideoName) : 'Drag and drop video files here'}
                        </Typography>
                        <Typography sx={{ mt: 0.35, color: '#8B9AAF', fontSize: '0.61rem', lineHeight: 1.2 }}>
                          MP4, WebM or Ogg. Max file size 2GB.
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isUploadingVideo}
                        onClick={(event) => {
                          event.stopPropagation();
                          videoInputRef.current?.click();
                        }}
                        sx={{
                          minWidth: 67,
                          height: 24,
                          px: 1.1,
                          py: 0,
                          borderColor: '#C9D4E4',
                          color: '#111827',
                          bgcolor: '#EEF4FB',
                          fontSize: '0.58rem',
                          fontWeight: 600,
                        }}
                      >
                        Select Files
                      </Button>
                    </Stack>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      hidden
                      onChange={(event) => {
                        void handleVideoFiles(event.target.files);
                        event.target.value = '';
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ ...labelSx, mb: 0.7 }}>Lesson Title</Typography>
                    <InputBase
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Introduction to UX Design Principles"
                      fullWidth
                      sx={{
                        minHeight: 24,
                        fontSize: '0.66rem',
                        color: '#111827',
                        '& input::placeholder': { color: '#8D97A6', opacity: 1 },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ ...labelSx, mb: 0.7 }}>Description</Typography>
                    <InputBase
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe what students will learn in this lesson..."
                      fullWidth
                      multiline
                      minRows={4}
                      sx={{
                        minHeight: 66,
                        alignItems: 'flex-start',
                        bgcolor: '#FFFFFF',
                        fontSize: '0.66rem',
                        color: '#111827',
                        '& textarea::placeholder': { color: '#8D97A6', opacity: 1 },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ mt: 2.45 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, mb: 1.05 }}>
                  <AttachFileOutlined sx={{ color: '#2563EB', fontSize: 14 }} />
                  <Typography sx={{ color: '#111827', fontSize: '0.75rem', fontWeight: 800 }}>
                    Attachments
                  </Typography>
                </Box>
                <Stack spacing={0.8}>
                  {attachments.map((attachment) => (
                    <AttachmentRow
                      key={`${attachment.name}-${attachment.url || attachment.size}`}
                      attachment={attachment}
                      onRemove={() => setAttachments((current) => current.filter((item) => item !== attachment))}
                    />
                  ))}

                  <Button
                    variant="outlined"
                    disabled={isUploadingAttachment}
                    onClick={() => attachmentInputRef.current?.click()}
                    sx={{
                      minHeight: 24,
                      borderStyle: 'dashed',
                      borderColor: '#D7E0EC',
                      color: '#111827',
                      bgcolor: 'transparent',
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      py: 0.2,
                      '&:hover': { borderStyle: 'dashed', bgcolor: '#F7FAFE' },
                    }}
                  >
                    {`+  ${isUploadingAttachment ? 'Uploading Attachment' : 'Add Attachment'}`}
                  </Button>
                  <input ref={attachmentInputRef} type="file" hidden onChange={(event) => { void addAttachment(event); }} />
                </Stack>
              </Box>
            </Box>

            <Box sx={{ ...panelSx, p: 1.9 }}>
              <Typography sx={{ color: '#111827', fontSize: '0.75rem', fontWeight: 800, mb: 1.55 }}>
                Publish Settings
              </Typography>

              <Stack spacing={2.05}>
                <Box>
                  <Typography sx={{ ...labelSx, mb: 0.65 }}>Visibility</Typography>
                  <RadioGroup
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value as Visibility)}
                    sx={{
                      gap: 0.12,
                      '& .MuiFormControlLabel-root': { m: 0, minHeight: 19 },
                      '& .MuiRadio-root': { p: 0.35, color: '#D1D8E4' },
                      '& .MuiRadio-root.Mui-checked': { color: '#2563EB' },
                      '& .MuiSvgIcon-root': { fontSize: 13 },
                      '& .MuiFormControlLabel-label': { fontSize: '0.64rem', color: '#111827' },
                    }}
                  >
                    <FormControlLabel value="Public" control={<Radio />} label="Public" />
                    <FormControlLabel value="Private" control={<Radio />} label="Private (Draft)" />
                    <FormControlLabel value="Scheduled" control={<Radio />} label="Scheduled" />
                  </RadioGroup>
                </Box>

                <Box>
                  <Typography sx={{ ...labelSx, mb: 0.75 }}>Course Section</Typography>
                  <Select
                    value={selectedModuleId}
                    onChange={(event) => setSelectedModuleId(event.target.value)}
                    variant="standard"
                    fullWidth
                    disableUnderline
                    disabled={isLoadingSections}
                    displayEmpty
                    sx={{
                      color: '#111827',
                      fontSize: '0.64rem',
                      fontWeight: 600,
                      minHeight: 24,
                      '& .MuiSelect-select': { px: 0, py: 0.2, pr: 2.5 },
                      '& .MuiSelect-icon': { color: '#9CA7B8', fontSize: 16 },
                    }}
                    renderValue={(value) => {
                      const section = courseSections.find((item) => item._id === value);
                      if (section) return section.title;
                      return isLoadingSections ? 'Loading sections...' : 'No sections available';
                    }}
                  >
                    {courseSections.length === 0 ? (
                      <MenuItem value="" disabled>
                        {isLoadingSections ? 'Loading sections...' : 'No sections available'}
                      </MenuItem>
                    ) : null}
                    {courseSections.map((section) => (
                      <MenuItem key={section._id} value={section._id}>
                        <Box>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            {section.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#8B9AAF' }}>
                            {section.courseTitle}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Typography sx={{ ...labelSx, mb: 0.75 }}>Duration (min)</Typography>
                  <InputBase
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    inputProps={{ inputMode: 'numeric' }}
                    fullWidth
                    sx={{
                      minHeight: 24,
                      color: '#111827',
                      fontSize: '0.64rem',
                      '& input': { px: 0 },
                    }}
                  />
                </Box>

                <Box sx={{ height: 1, bgcolor: '#E7EDF5', my: 0.25 }} />

                <Stack spacing={0.9}>
                  <Button
                    variant="contained"
                    disabled={isBusy}
                    onClick={() => { void createLesson(visibility); }}
                    sx={{
                      height: 26,
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      py: 0,
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    {isSubmitting ? 'Saving...' : 'Publish Lesson'}
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={isBusy}
                    onClick={() => {
                      setVisibility('Private');
                      void createLesson('Private');
                    }}
                    sx={{
                      height: 27,
                      bgcolor: '#EAF2FD',
                      borderColor: '#C9D8EA',
                      color: '#111827',
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      py: 0,
                      '&:hover': { bgcolor: '#DFEBFA', borderColor: '#B9CAE0' },
                    }}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Draft'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

import { useEffect, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CloseOutlined,
  CloudUploadOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { api, normalizeApiError } from '../../services/api';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
type Visibility = 'Public' | 'Private' | 'Scheduled';

interface AttachmentItem {
  name: string;
  size: string;
  url?: string;
}

interface CourseOption {
  _id: string;
  title: string;
}

interface ModuleOption {
  _id: string;
  title: string;
}

function FileChip({ attachment, onRemove }: { attachment: AttachmentItem; onRemove: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
          {attachment.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {attachment.size}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onRemove} sx={{ color: 'text.secondary' }}>
        <CloseOutlined fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function UploadLesson() {
  const { upload, isUploading } = useContent();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('0');
  const [visibility, setVisibility] = useState<Visibility>('Public');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseModules, setCourseModules] = useState<ModuleOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await api.get<CourseOption[]>('/api/courses');
        const nextCourses = response.data ?? [];
        setCourses(nextCourses);
        if (nextCourses.length > 0) {
          setSelectedCourseId(nextCourses[0]._id);
        }
      } catch (requestError) {
        setStatusMessage({
          type: 'error',
          text: normalizeApiError(requestError).message || 'Failed to load courses.',
        });
      } finally {
        setIsLoadingCourses(false);
      }
    };

    void loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setCourseModules([]);
      setSelectedModuleId('');
      return;
    }

    const loadModules = async () => {
      setIsLoadingModules(true);
      try {
        const response = await api.get<ModuleOption[]>(`/api/courses/${selectedCourseId}/modules`);
        const nextModules = response.data ?? [];
        setCourseModules(nextModules);
        setSelectedModuleId(nextModules[0]?._id ?? '');
      } catch (requestError) {
        setCourseModules([]);
        setSelectedModuleId('');
        setStatusMessage({
          type: 'error',
          text: normalizeApiError(requestError).message || 'Failed to load course sections.',
        });
      } finally {
        setIsLoadingModules(false);
      }
    };

    void loadModules();
  }, [selectedCourseId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const file = files[0];
    setUploadedVideoName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadedMedia = await upload(formData);
      setUploadedVideoUrl(typeof uploadedMedia.url === 'string' ? uploadedMedia.url : null);
      setStatusMessage({ type: 'success', text: `Video uploaded: ${file.name}` });
    } catch (requestError) {
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || `Failed to upload video: ${file.name}`,
      });
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void handleFiles(event.dataTransfer.files);
  };

  const handleSelectFiles = () => {
    videoInputRef.current?.click();
  };

  const handleSelectAttachment = () => {
    attachmentInputRef.current?.click();
  };

  const removeAttachment = (name: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.name !== name));
  };

  const addAttachment = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadedMedia = await upload(formData);
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setAttachments((current) => [
        ...current,
        { name: file.name, size: `${sizeInMb} MB`, url: typeof uploadedMedia.url === 'string' ? uploadedMedia.url : undefined },
      ]);
      setStatusMessage({ type: 'success', text: `Attachment uploaded: ${file.name}` });
    } catch (requestError) {
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || `Failed to upload attachment: ${file.name}`,
      });
    }
  };

  const createLesson = async (nextVisibility: Visibility) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setStatusMessage({ type: 'error', text: 'Lesson title is required.' });
      return;
    }
    if (!selectedCourseId) {
      setStatusMessage({ type: 'error', text: 'Select a course before saving.' });
      return;
    }
    if (!selectedModuleId) {
      setStatusMessage({ type: 'error', text: 'Select a course section before saving.' });
      return;
    }

    const numericDuration = Number(duration);
    if (!Number.isFinite(numericDuration) || numericDuration < 0) {
      setStatusMessage({ type: 'error', text: 'Duration must be a valid non-negative number.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const notesLines = [
        uploadedVideoUrl ? `Video URL: ${uploadedVideoUrl}` : null,
        attachments.length > 0
          ? `Attachments: ${attachments.map((attachment) => `${attachment.name}${attachment.url ? ` (${attachment.url})` : ''}`).join(', ')}`
          : null,
      ].filter(Boolean);

      await api.post(`/api/courses/modules/${selectedModuleId}/lessons`, {
        title: trimmedTitle,
        content: description.trim(),
        type: 'video',
        duration: Math.round(numericDuration),
        notes: notesLines.join('\n'),
      });

      setStatusMessage({
        type: 'success',
        text: nextVisibility === 'Public' ? 'Lesson published successfully.' : 'Lesson draft saved successfully.',
      });
      setTitle('');
      setDescription('');
      setDuration('0');
      setUploadedVideoName(null);
      setUploadedVideoUrl(null);
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

  const publishLesson = () => {
    void createLesson(visibility);
  };

  const saveDraft = () => {
    void createLesson('Private');
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      <DashboardPageFrame
        title="Lesson Upload"
        description="Create lesson content and publish it into structured course modules."
        actions={(
          <Button
            component={RouterLink}
            to="/courses/new"
            variant="outlined"
          >
            Back to Course Builder
          </Button>
        )}
      >
        {statusMessage ? (
          <Alert severity={statusMessage.type} sx={{ mb: 2.25, borderRadius: 1.5 }} onClose={() => setStatusMessage(null)}>
            {statusMessage.text}
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2.5}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2.25}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                        Video Source
                      </Typography>
                      <Box
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={handleDrop}
                        sx={{
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          bgcolor: 'background.default',
                          minHeight: 250,
                          display: 'grid',
                          placeItems: 'center',
                          p: 3,
                          transition: 'border-color 160ms ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 420 }}>
                          <Box
                            sx={{
                              width: 68,
                              height: 68,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              color: 'primary.main',
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            <CloudUploadOutlined sx={{ fontSize: 34 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              Drag and drop video files here
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                              MP4, WebM or Ogg. Max file size 2GB.
                            </Typography>
                          </Box>
                          <Button variant="contained" onClick={handleSelectFiles} sx={{ minWidth: 160 }}>
                            Select Files
                          </Button>
                        </Stack>
                        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/ogg" hidden onChange={(event) => {
                          void handleFiles(event.target.files);
                          event.target.value = '';
                        }} />
                      </Box>
                      {uploadedVideoName ? (
                        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary', fontWeight: 600 }}>
                          Selected video: {uploadedVideoName}
                        </Typography>
                      ) : null}
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                        Lesson Title
                      </Typography>
                      <TextField value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Introduction to UX Design Principles" fullWidth />
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                        Description
                      </Typography>
                      <TextField
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Describe what students will learn in this lesson..."
                        fullWidth
                        multiline
                        minRows={5}
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                        Attachments
                      </Typography>
                      <Stack spacing={1.25}>
                        {attachments.map((attachment) => (
                          <FileChip key={attachment.name} attachment={attachment} onRemove={() => removeAttachment(attachment.name)} />
                        ))}
                        <Button variant="outlined" onClick={handleSelectAttachment} sx={{ alignSelf: 'flex-start' }} disabled={isUploading}>
                          + Add Attachment
                        </Button>
                        <input ref={attachmentInputRef} type="file" hidden onChange={(event) => { void addAttachment(event); }} />
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.25}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                      Publish Settings
                    </Typography>
                    <FormControl>
                      <FormLabel sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>Visibility</FormLabel>
                      <RadioGroup value={visibility} onChange={(event) => setVisibility(event.target.value as Visibility)}>
                        <FormControlLabel value="Public" control={<Radio />} label="Public" />
                        <FormControlLabel value="Private" control={<Radio />} label="Private (Draft)" />
                        <FormControlLabel value="Scheduled" control={<Radio />} label="Scheduled" />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Course
                    </Typography>
                    <Select
                      value={selectedCourseId}
                      onChange={(event) => setSelectedCourseId(event.target.value)}
                      fullWidth
                      displayEmpty
                      disabled={isLoadingCourses}
                    >
                      {courses.length === 0 ? (
                        <MenuItem value="" disabled>
                          {isLoadingCourses ? 'Loading courses...' : 'No courses available'}
                        </MenuItem>
                      ) : null}
                      {courses.map((course) => (
                        <MenuItem key={course._id} value={course._id}>{course.title}</MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Course Section
                    </Typography>
                    <Select value={selectedModuleId} onChange={(event) => setSelectedModuleId(event.target.value)} fullWidth displayEmpty disabled={!selectedCourseId || isLoadingModules}>
                      {courseModules.length === 0 ? (
                        <MenuItem value="" disabled>
                          {isLoadingModules ? 'Loading sections...' : 'No sections available'}
                        </MenuItem>
                      ) : null}
                      {courseModules.map((moduleItem) => (
                        <MenuItem key={moduleItem._id} value={moduleItem._id}>{moduleItem.title}</MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Duration (min)
                    </Typography>
                    <TextField value={duration} onChange={(event) => setDuration(event.target.value)} fullWidth />
                  </Box>

                  <Stack spacing={1.25}>
                    <Button variant="contained" fullWidth onClick={publishLesson} disabled={isUploading || isSubmitting} sx={{ py: 1.5 }}>
                      {isSubmitting ? 'Saving...' : 'Publish Lesson'}
                    </Button>
                    <Button variant="outlined" fullWidth onClick={saveDraft} disabled={isUploading || isSubmitting} sx={{ py: 1.5 }}>
                      {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DashboardPageFrame>
    </Box>
  );
}

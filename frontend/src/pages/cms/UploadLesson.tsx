import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
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
import { alpha } from '@mui/material/styles';
import {
  ArrowBack,
  CloseOutlined,
  CloudUploadOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { normalizeApiError } from '../../services/api';
type Visibility = 'Public' | 'Private' | 'Scheduled';

interface AttachmentItem {
  name: string;
  size: string;
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
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
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
  const [attachments, setAttachments] = useState<AttachmentItem[]>([{ name: 'UX-Glossary.pdf', size: '1.2 MB' }]);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const file = files[0];
    setUploadedVideoName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await upload(formData);
      setStatusMessage(`Video uploaded: ${file.name}`);
    } catch (error) {
      setStatusMessage(normalizeApiError(error).message || `Video selected locally: ${file.name}`);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void handleFiles(event.dataTransfer.files);
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = (name: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.name !== name));
  };

  const addAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setAttachments((current) => [...current, { name: file.name, size: `${sizeInMb} MB` }]);
    event.target.value = '';
  };

  const publishLesson = () => {
    setStatusMessage(`Publishing lesson: ${title || 'Untitled lesson'}`);
  };

  const saveDraft = () => {
    setStatusMessage('Lesson draft saved');
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
          Upload lesson
        </Typography>

        {statusMessage ? (
          <Alert severity="success" sx={{ mb: 2.25, borderRadius: '12px' }} onClose={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
          <Button component={RouterLink} to="/courses/new" variant="text" startIcon={<ArrowBack />} sx={{ px: 0, color: 'text.primary', '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}>
            Upload Lesson
          </Button>
        </Box>

        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2.5}>
              <Card>
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
                          border: '2px dashed #93C5FD',
                          borderRadius: '12px',
                          bgcolor: '#EFF6FF',
                          minHeight: 250,
                          display: 'grid',
                          placeItems: 'center',
                          p: 3,
                          transition: 'all 160ms ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 10px 24px rgba(0,102,255,0.08)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 420 }}>
                          <Box
                            sx={{
                              width: 68,
                              height: 68,
                              borderRadius: '18px',
                              bgcolor: '#FFFFFF',
                              color: 'primary.main',
                              display: 'grid',
                              placeItems: 'center',
                              boxShadow: '0 10px 24px rgba(0,102,255,0.12)',
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
                        <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/ogg" hidden onChange={(event) => {
                          addAttachment(event);
                          void handleFiles(event.target.files);
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
                        <Button variant="outlined" onClick={handleSelectFiles} sx={{ alignSelf: 'flex-start' }}>
                          + Add Attachment
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%' }}>
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

                  <Divider />

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Course Section
                    </Typography>
                    <Select value="Module 1: Fundamentals" fullWidth>
                      <MenuItem value="Module 1: Fundamentals">Module 1: Fundamentals</MenuItem>
                    </Select>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Duration (min)
                    </Typography>
                    <TextField value={duration} onChange={(event) => setDuration(event.target.value)} fullWidth />
                  </Box>

                  <Stack spacing={1.25}>
                    <Button variant="contained" fullWidth onClick={publishLesson} disabled={isUploading} sx={{ py: 1.5 }}>
                      Publish Lesson
                    </Button>
                    <Button variant="outlined" fullWidth onClick={saveDraft} disabled={isUploading} sx={{ py: 1.5, bgcolor: alpha('#0066FF', 0.04) }}>
                      Save Draft
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
}

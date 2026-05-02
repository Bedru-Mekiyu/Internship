import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useCreateCourseMutation } from '../../store/api/courseApi';
import type { CreateCoursePayload } from '../../store/api/courseApi';

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCourseDialog({ open, onClose }: CreateCourseDialogProps) {
  const navigate = useNavigate();
  const [createCourse, { isLoading, isError, error }] = useCreateCourseMutation();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [visibility, setVisibility] = useState<CreateCoursePayload['visibility']>('Draft');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        visibility,
      };
      
      console.log('[CreateCourse] Submitting payload:', payload);
      
      const result = await createCourse(payload).unwrap();

      console.log('[CreateCourse] Success:', result);

      setSnackbarOpen(true);
      handleClose();

      if (result._id) {
        navigate(`/courses/new?courseId=${result._id}`);
      } else {
        navigate('/courses/new');
      }
    } catch (err) {
      console.error('[CreateCourse] Error:', err);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSubtitle('');
    setVisibility('Draft');
    onClose();
  };

  const getErrorMessage = () => {
    if (!error) return 'Failed to create course. Please try again.';

    // Handle SerializedError (top-level message)
    const serializedError = error as { message?: string };
    if (serializedError?.message) return serializedError.message;

    // Handle RTK Query error format
    const rtkError = error as { status?: number | string; data?: unknown };
    if (rtkError?.data && typeof rtkError.data === 'object') {
      const data = rtkError.data as { message?: string };
      if (data?.message) return data.message;
    }

    // Fallback
    return 'Failed to create course. Please try again.';
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
            Create New Course
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Fill in the basic details to get started. You can edit everything later.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {isError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {getErrorMessage()}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Course Title"
                placeholder="e.g., Advanced React Patterns"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Course Subtitle"
                placeholder="Briefly describe what learners will achieve by the end."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                slotProps={{
                  htmlInput: {
                    maxLength: 200,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="visibility-label">Visibility</InputLabel>
                <Select
                  labelId="visibility-label"
                  label="Visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as CreateCoursePayload['visibility'])}
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Published">Published</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? 'Creating...' : 'Create & Continue'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Course created successfully!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}

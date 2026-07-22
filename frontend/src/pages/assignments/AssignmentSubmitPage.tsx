import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  useGetAssignmentsByCourseQuery,
  useSubmitAssignmentMutation,
  useGetMySubmissionsByCourseQuery,
} from '../../store/api/assignmentApi';
import type { Assignment } from '../../types';

export default function AssignmentSubmitPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: assignments, isLoading: loadingAssignments } = useGetAssignmentsByCourseQuery(courseId || '');
  const { data: mySubmissions, isLoading: loadingSubmissions } = useGetMySubmissionsByCourseQuery(courseId || '');
  const [submitAssignment, { isLoading: submitting }] = useSubmitAssignmentMutation();

  const assignment: Assignment | undefined = assignments?.find((a) => a._id === assignmentId);
  const existingSubmission = mySubmissions?.find((s) => s.assignmentId === assignmentId);
  const isOverdue = useMemo(() => {
    if (!assignment?.dueDate) return false;
    // eslint-disable-next-line react-hooks/purity
    return new Date(assignment.dueDate).getTime() < Date.now();
  }, [assignment?.dueDate]);

  useEffect(() => {
    if (existingSubmission?.content && !content) {
      setContent(existingSubmission.content);
    }
  }, [existingSubmission, content]);

  const handleSubmit = async () => {
    if (!assignmentId || !content.trim()) return;
    await submitAssignment({ assignmentId, content: content.trim() });
    setSubmitted(true);
  };

  if (loadingAssignments || loadingSubmissions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">Assignment not found.</Alert>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', textAlign: 'center', py: 8 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Assignment submitted successfully!
        </Alert>
        <Button variant="outlined" onClick={() => navigate(`/courses/${courseId}/assignments`)}>
          Back to Assignments
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button sx={{ mb: 2 }} onClick={() => navigate(`/courses/${courseId}/assignments`)}>
        ← Back to Assignments
      </Button>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>{assignment.title}</Typography>
          {assignment.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {assignment.description}
            </Typography>
          )}
          {assignment.dueDate && (
            <Chip
              label={`Due: ${new Date(assignment.dueDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
              color={isOverdue ? 'error' : 'info'}
              size="small"
              variant="outlined"
            />
          )}
          {isOverdue && !existingSubmission && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This assignment is past due and submissions are closed.
            </Alert>
          )}
        </CardContent>
      </Card>

      {existingSubmission && typeof existingSubmission.grade === 'number' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your grade: <strong>{existingSubmission.grade}</strong>
        </Alert>
      )}

      <TextField
        label="Your submission"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fullWidth
        multiline
        rows={8}
        disabled={isOverdue && !existingSubmission}
        placeholder={existingSubmission ? 'Update your submission...' : 'Write your answer here...'}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!content.trim() || submitting || !!(isOverdue && !existingSubmission)}
        >
          {submitting ? 'Submitting...' : existingSubmission ? 'Resubmit' : 'Submit'}
        </Button>
        {existingSubmission && (
          <Button variant="outlined" onClick={() => navigate(`/courses/${courseId}/assignments`)}>
            Cancel
          </Button>
        )}
      </Stack>
    </Box>
  );
}

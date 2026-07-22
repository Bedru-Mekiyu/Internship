import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  useGetAssignmentsByCourseQuery,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
} from '../../store/api/assignmentApi';
import type { Submission } from '../../types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AssignmentGradePage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const [gradeDialog, setGradeDialog] = useState<{ submission: Submission; grade: string } | null>(null);

  const { data: assignments } = useGetAssignmentsByCourseQuery(courseId || '');
  const { data: submissions, isLoading } = useGetAssignmentSubmissionsQuery(assignmentId || '', {
    skip: !assignmentId,
  });
  const [gradeSubmission] = useGradeSubmissionMutation();

  const assignment = assignments?.find((a) => a._id === assignmentId);

  const handleGrade = async () => {
    if (!gradeDialog || !assignmentId) return;
    const grade = Number(gradeDialog.grade);
    if (isNaN(grade)) return;
    await gradeSubmission({
      assignmentId,
      submissionId: gradeDialog.submission._id,
      grade,
    });
    setGradeDialog(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      <Button sx={{ mb: 2 }} onClick={() => navigate(`/courses/${courseId}/assignments`)}>
        ← Back to Assignments
      </Button>

      <Typography variant="h5" gutterBottom>
        {assignment?.title || 'Assignment'} — Submissions
      </Typography>

      {!submissions || submissions.length === 0 ? (
        <Alert severity="info">No submissions yet for this assignment.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => {
                const studentUser = typeof submission.userId === 'object' ? submission.userId : null;
                return (
                  <TableRow key={submission._id} hover>
                    <TableCell>
                      {studentUser
                        ? `${studentUser.firstName} ${studentUser.lastName}`
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>{studentUser?.email || '—'}</TableCell>
                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell>
                      {typeof submission.grade === 'number' ? submission.grade : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setGradeDialog({ submission, grade: String(submission.grade ?? '') })
                          }
                        >
                          {typeof submission.grade === 'number' ? 'Regrade' : 'Grade'}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Grade Dialog */}
      <Dialog
        open={!!gradeDialog}
        onClose={() => setGradeDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          {gradeDialog && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle2">
                Student: {
                  (() => {
                    const u = gradeDialog.submission.userId;
                    return typeof u === 'object' ? `${u.firstName} ${u.lastName}` : 'Unknown';
                  })()
                }
              </Typography>
              <Card variant="outlined" sx={{ bgcolor: 'grey.50', p: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {gradeDialog.submission.content}
                </Typography>
              </Card>
              <TextField
                label="Grade"
                type="number"
                value={gradeDialog.grade}
                onChange={(e) =>
                  setGradeDialog({ ...gradeDialog, grade: e.target.value })
                }
                fullWidth
                slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialog(null)}>Cancel</Button>
          <Button
            onClick={handleGrade}
            variant="contained"
            disabled={!gradeDialog?.grade || isNaN(Number(gradeDialog?.grade))}
          >
            Save Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

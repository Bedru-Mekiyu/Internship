import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Grading as GradingIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  useGetAssignmentsByCourseQuery,
  useCreateAssignmentMutation,
} from '../../store/api/assignmentApi';
import { useGetMySubmissionsByCourseQuery } from '../../store/api/assignmentApi';
import { useAuth } from '../../hooks/useAuth';
import type { Assignment } from '../../types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isPastDue(dueDate?: string) {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

export default function AssignmentListPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const { data: assignments, isLoading } = useGetAssignmentsByCourseQuery(courseId || '');
  const { data: mySubmissions } = useGetMySubmissionsByCourseQuery(courseId || '', {
    skip: user?.role !== 'student',
  });
  const [createAssignment] = useCreateAssignmentMutation();

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const getSubmissionForAssignment = (assignmentId: string) => {
    if (!mySubmissions) return undefined;
    return mySubmissions.find((s) => s.assignmentId === assignmentId);
  };

  const handleCreate = async () => {
    if (!courseId || !newTitle.trim()) return;
    await createAssignment({
      courseId,
      body: {
        title: newTitle.trim(),
        description: newDescription.trim(),
        dueDate: newDueDate || undefined,
      },
    });
    setCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Assignments</Typography>
        {isInstructor && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Create Assignment
          </Button>
        )}
      </Box>

      {!assignments || assignments.length === 0 ? (
        <Alert severity="info">No assignments yet for this course.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment: Assignment) => {
                const submission = getSubmissionForAssignment(assignment._id);
                const overdue = isPastDue(assignment.dueDate);
                return (
                  <TableRow key={assignment._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{assignment.title}</Typography>
                      {assignment.description && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {assignment.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<ScheduleIcon />}
                        label={formatDate(assignment.dueDate)}
                        size="small"
                        color={overdue ? 'error' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {submission ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={typeof submission.grade === 'number' ? `Graded: ${submission.grade}` : 'Submitted'}
                          color={typeof submission.grade === 'number' ? 'success' : 'info'}
                          size="small"
                        />
                      ) : (
                        <Chip
                          label={overdue ? 'Overdue' : 'Pending'}
                          color={overdue ? 'error' : 'default'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {isInstructor ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<GradingIcon />}
                          onClick={() => navigate(`/courses/${courseId}/assignments/${assignment._id}/grade`)}
                        >
                          Grade
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant={submission ? 'outlined' : 'contained'}
                          startIcon={<AssignmentIcon />}
                          disabled={overdue && !submission}
                          onClick={() => navigate(`/courses/${courseId}/assignments/${assignment._id}/submit`)}
                        >
                          {submission ? 'View/Resubmit' : 'Submit'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Due Date"
              type="datetime-local"
              value={newDueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDueDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!newTitle.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

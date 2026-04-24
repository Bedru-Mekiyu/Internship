import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { api } from '../../services/api';

type DraftCourse = {
  _id: string;
  title: string;
  category?: string;
  instructor?: {
    firstName?: string;
    lastName?: string;
  };
};

export default function AdminApprovals() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<DraftCourse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin', 'courses', 'draft'],
    queryFn: async () => {
      // In a real scenario, the backend needs to support filtering by status=draft
      const response = await api.get<DraftCourse[]>('/api/courses?status=draft');
      return response.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.put(`/api/courses/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'draft'] });
      setModalOpen(false);
    },
  });

  const handleAction = (course: DraftCourse) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const confirmAction = (status: 'published' | 'archived') => {
    if (selectedCourse) {
      updateStatusMutation.mutate({ id: selectedCourse._id, status });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading pending approvals...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Pending Approvals</Typography>
        <Typography variant="body1" color="text.secondary">Review and approve new courses submitted by instructors.</Typography>
      </Box>

      <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid', borderColor: 'divider', fontWeight: 800, color: 'text.secondary' } }}>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">No pending approvals at this time.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses?.map((course) => (
                    <TableRow key={course._id} hover sx={{ '& .MuiTableCell-root': { borderBottomColor: 'divider' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{course.title}</TableCell>
                      <TableCell>{course.instructor?.firstName} {course.instructor?.lastName}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          Pending
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAction(course)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Review Course</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to approve or reject <strong>{selectedCourse?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => confirmAction('archived')}
            disabled={updateStatusMutation.isPending}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => confirmAction('published')}
            disabled={updateStatusMutation.isPending}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

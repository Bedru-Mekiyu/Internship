import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import DashboardPageFrame, { DashboardSection } from '../../components/common/DashboardPageFrame';

interface AdminCourseListItem {
  _id: string;
  title: string;
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  enrollmentCount?: number;
}

export default function AdminCourseManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [courses, setCourses] = useState<AdminCourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<AdminCourseListItem[]>('/api/courses');
      setCourses(response.data);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    navigate('/courses/new');
  };

  const handleEdit = (id: string) => {
    // In a real app, this would navigate to an edit page
    // For now, we can redirect to a detailed view or a generic editor
    navigate(`/admin/courses/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/api/courses/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      fetchCourses();
    } catch (err) {
      setError(normalizeApiError(err).message);
    }
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      <DashboardPageFrame
        eyebrow="Administration"
        title="Course Management"
        description="Create, organize, and manage the course catalog from one workspace."
        breadcrumbs={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Administration' },
          { label: 'Courses' },
        ]}
        actionLabel="Create New Course"
        actionTo="/courses/new"
      >
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : null}

        <DashboardSection title="Find courses" description="Search by title or course ID.">
          <TextField
            fullWidth
            placeholder="Search courses by title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ maxWidth: { xs: '100%', md: 420 } }}
          />
        </DashboardSection>

        <DashboardSection
          title="Courses"
          description={`${filteredCourses.length} course${filteredCourses.length === 1 ? '' : 's'} in the catalog.`}
        >
          <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 760 }}>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Course Details</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Students</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', align: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">Loading courses...</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'action.hover', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
                            <BookOutlined sx={{ fontSize: '1.1rem' }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {course.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              ID: {course._id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.status === 'published' ? 'Published' : course.status === 'archived' ? 'Archived' : 'Draft'}
                          size="small"
                          color={course.status === 'published' ? 'success' : course.status === 'archived' ? 'warning' : 'default'}
                          sx={{ fontWeight: 600, fontSize: '0.65rem', borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {course.category || 'General'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {course.enrollmentCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => handleEdit(course._id)} sx={{ color: 'text.secondary' }}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(course._id)} sx={{ color: 'error.main' }}>
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Stack spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No courses found
                        </Typography>
                        <Button onClick={handleCreateNew} size="small" variant="text">
                          Create your first course
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardSection>
      </DashboardPageFrame>
    </Box>
  );
}

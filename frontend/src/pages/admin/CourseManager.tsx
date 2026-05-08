import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { alpha } from '@mui/material/styles';
import { theme } from '../../theme';

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
    <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Header Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Course Management
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Create, organize, and manage all educational content across the platform.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={handleCreateNew}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Create New Course
            </Button>
          </Box>

          {error && (
            <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${theme.palette.error.main}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography color="error.main" variant="body2" sx={{ fontWeight: 600 }}>
                  {error}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
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
                sx={{ maxWidth: 400 }}
              />
            </CardContent>
          </Card>

          {/* Course Table */}
          <TableContainer component={Card} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
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
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'grid',
                            placeItems: 'center',
                            color: 'primary.main'
                          }}>
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
                          label={course.status === 'published' ? 'Published' : 'Draft'}
                          size="small"
                          color={course.status === 'published' ? 'success' : 'default'}
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
        </Stack>
      </Container>
    </Box>
  );
}

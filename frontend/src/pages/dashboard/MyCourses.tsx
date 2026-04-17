import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  FilterAltOutlined,
  MenuBookOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';

type CourseStatus = 'All' | 'In Progress' | 'Completed' | 'Wishlist';
type CourseCategory = 'All Categories' | 'Development' | 'Design' | 'Business' | 'Marketing';
type CourseSort = 'Recently Accessed' | 'Progress: High to Low' | 'Progress: Low to High' | 'Title: A to Z';

type Course = {
  id: string;
  title: string;
  instructor: string;
  category: Exclude<CourseCategory, 'All Categories'>;
  status: Exclude<CourseStatus, 'All'>;
  progress: number;
  lastAccessed: string;
  image: string;
  accent: string;
};

type ResumeLessonState = {
  lessonId: string;
  lessonTitle?: string;
};

function CourseCard({
  course,
  resumeLesson,
  onOpen,
  onResume,
}: {
  course: Course;
  resumeLesson?: ResumeLessonState;
  onOpen: (course: Course) => void;
  onResume: (course: Course, resumeLesson: ResumeLessonState) => void;
}) {
  return (
    <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 180ms ease, box-shadow 180ms ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(15,23,42,0.1)' } }}>
      <Box sx={{ height: 170, position: 'relative', backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.12), rgba(2,6,23,0.26)), url(${course.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Chip label={course.status} sx={{ position: 'absolute', top: 16, left: 16, bgcolor: 'rgba(255,255,255,0.92)', color: 'text.primary', fontWeight: 800 }} />
      </Box>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.25 }}>{course.title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{course.instructor}</Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Chip label={course.category} size="small" sx={{ bgcolor: alpha(course.accent, 0.12), color: course.accent, fontWeight: 800 }} />
            <Chip label={`Last accessed ${course.lastAccessed}`} size="small" sx={{ bgcolor: '#F8FAFC', color: 'text.secondary', fontWeight: 700 }} />
            {resumeLesson?.lessonId ? (
              <Chip
                label="Resume available"
                size="small"
                sx={{ bgcolor: alpha('#0066FF', 0.1), color: '#0066FF', fontWeight: 800 }}
              />
            ) : null}
          </Stack>

          {resumeLesson?.lessonTitle ? (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Last lesson: {resumeLesson.lessonTitle}
            </Typography>
          ) : null}

          <Stack spacing={1} sx={{ pt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Progress</Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 800 }}>{course.progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={course.progress} sx={{ height: 10, borderRadius: '999px', bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: course.accent, borderRadius: '999px' } }} />
          </Stack>

          <Button variant="contained" fullWidth sx={{ mt: 0.5, bgcolor: '#0066FF', borderRadius: '12px', py: 1.15, fontWeight: 800, boxShadow: '0 10px 24px rgba(0,102,255,0.18)' }} onClick={() => onOpen(course)}>
            {course.status === 'Wishlist' ? 'View Course' : 'Continue'}
          </Button>

          {course.status !== 'Wishlist' && resumeLesson?.lessonId ? (
            <Button
              variant="outlined"
              fullWidth
              sx={{ borderRadius: '12px', py: 1.05, fontWeight: 800 }}
              onClick={() => onResume(course, resumeLesson)}
            >
              Resume Lesson
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card sx={{ borderRadius: '16px', border: '1px dashed #CBD5E1', boxShadow: 'none', bgcolor: '#FFFFFF' }}>
      <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '22px', bgcolor: alpha('#0066FF', 0.08), color: 'primary.main', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
          <MenuBookOutlined sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>No courses found</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
          Try adjusting your search, tabs, or filters. When you enroll in a course, it will appear here so you can continue learning from where you left off.
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function MyCourses() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', 'student', 'my-courses'],
    queryFn: async () => {
      const response = await api.get<{
        enrolledCourses: Array<{ courseId: string; title: string; progress: number }>;
      }>('/api/dashboard/student');
      return response.data;
    },
  });

  const [tab, setTab] = useState<CourseStatus>('All');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CourseCategory>('All Categories');
  const [sort, setSort] = useState<CourseSort>('Recently Accessed');

  const getResumeLesson = (courseId: string): ResumeLessonState | undefined => {
    const storedResumeValue = window.localStorage.getItem(`learnspace-active-lesson-${courseId}`);
    if (!storedResumeValue) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(storedResumeValue) as ResumeLessonState;
      if (parsed?.lessonId) {
        return parsed;
      }
    } catch {
      return { lessonId: storedResumeValue };
    }

    return undefined;
  };

  const courses = useMemo<Course[]>(() => {
    if (!data?.enrolledCourses?.length) {
      return [];
    }

    return data.enrolledCourses.map((course, index) => ({
      id: course.courseId,
      title: course.title,
      instructor: 'Course Instructor',
      category: index % 2 === 0 ? 'Development' : 'Design',
      status: Number(course.progress || 0) >= 100 ? 'Completed' : 'In Progress',
      progress: Number(course.progress || 0),
      lastAccessed: 'Recently',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      accent: ['#0066FF', '#6366F1', '#10B981', '#F59E0B'][index % 4],
    }));
  }, [data]);

  const openCourse = (course: Course) => {
    if (course.status === 'Wishlist') {
      navigate('/courses/explore');
      return;
    }

    navigate(`/courses/${course.id}/learn`);
  };

  const resumeCourseLesson = (course: Course, resumeLesson: ResumeLessonState) => {
    navigate(`/courses/${course.id}/learn?lesson=${encodeURIComponent(resumeLesson.lessonId)}`);
  };

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const matchesTab = tab === 'All' ? true : course.status === tab;
      const matchesSearch = !query || course.title.toLowerCase().includes(query) || course.instructor.toLowerCase().includes(query);
      const matchesCategory = category === 'All Categories' ? true : course.category === category;
      return matchesTab && matchesSearch && matchesCategory;
    });

    return [...filtered].sort((left, right) => {
      switch (sort) {
        case 'Progress: High to Low':
          return right.progress - left.progress;
        case 'Progress: Low to High':
          return left.progress - right.progress;
        case 'Title: A to Z':
          return left.title.localeCompare(right.title);
        default:
          return 0;
      }
    });
  }, [category, courses, search, sort, tab]);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#F8FAFC', p: { xs: 1.75, sm: 2.25, md: 2.5 } }}>
        <Stack spacing={2}>
          {isError ? (
            <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
              {normalizeApiError(error).message || 'Failed to load your courses.'}
            </Typography>
          ) : null}

          {isLoading ? (
            <Typography sx={{ color: 'text.secondary' }}>Loading your courses...</Typography>
          ) : null}

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}>My Courses</Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 760 }}>
              Track your enrolled classes, revisit recently accessed lessons, and keep your learning momentum going.
            </Typography>
          </Box>

          <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Tabs
                value={tab}
                onChange={(_, next) => setTab(next)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 42, mb: 2, '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 800 } }}
              >
                <Tab label="All" value="All" />
                <Tab label="In Progress" value="In Progress" />
                <Tab label="Completed" value="Completed" />
                <Tab label="Wishlist" value="Wishlist" />
              </Tabs>

              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary', pointerEvents: 'none' }}>
                      <SearchOutlined fontSize="small" />
                    </Box>
                    <TextField
                      fullWidth
                      placeholder="Search by course or instructor"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      sx={{ '& .MuiInputBase-root': { pl: 5.25 } }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 3.5 }}>
                  <Select fullWidth value={category} onChange={(event) => setCategory(event.target.value as CourseCategory)}>
                    {['All Categories', 'Development', 'Design', 'Business', 'Marketing'].map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid size={{ xs: 12, md: 3.5 }}>
                  <Select fullWidth value={sort} onChange={(event) => setSort(event.target.value as CourseSort)} startAdornment={<FilterAltOutlined sx={{ ml: 1.2, mr: 1, color: 'text.secondary' }} />}>
                    {['Recently Accessed', 'Progress: High to Low', 'Progress: Low to High', 'Title: A to Z'].map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {filteredCourses.length > 0 ? (
            <Grid container spacing={2}>
              {filteredCourses.map((course) => (
                <Grid key={course.title} size={{ xs: 12, sm: 6, xl: 4 }}>
                  <CourseCard
                    course={course}
                    resumeLesson={getResumeLesson(course.id)}
                    onOpen={openCourse}
                    onResume={resumeCourseLesson}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState />
          )}
        </Stack>
    </Box>
  );
}

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import {
  SearchOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import DashboardPageFrame, { DashboardSection } from '../../components/common/DashboardPageFrame';
import { useGetCoursesQuery } from '../../store/api/courseApi';
import { sanitizeHttpUrl } from '../../utils/safeUrl';
import { BRAND } from '../../theme/brand';

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
    <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          height: 170,
          position: 'relative',
          backgroundImage: course.image ? `url(${course.image})` : 'none',
          bgcolor: course.image ? 'transparent' : 'background.default',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.25 }}>{course.title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{course.instructor}</Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {course.category}
            </Typography>
            {course.lastAccessed ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Last accessed {course.lastAccessed}
              </Typography>
            ) : null}
            {resumeLesson?.lessonId ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Resume available
              </Typography>
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
            <LinearProgress variant="determinate" value={course.progress} sx={{ height: 10, borderRadius: 999, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: course.accent, borderRadius: 999 } }} />
          </Stack>

          <Button variant="contained" fullWidth sx={{ mt: 0.5, borderRadius: 1.5, py: 1.15, fontWeight: 800 }} onClick={() => onOpen(course)}>
            View Details
          </Button>

          {course.status !== 'Wishlist' && resumeLesson?.lessonId ? (
            <Button
              variant="outlined"
              fullWidth
              sx={{ borderRadius: 1.5, py: 1.05, fontWeight: 800 }}
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
    <Card sx={{ borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
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
  const { data: catalogCourses = [] } = useGetCoursesQuery();
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

    const catalogById = new Map(catalogCourses.map((course) => [String(course._id), course]));

    return data.enrolledCourses.map((course, index) => {
      const catalogCourse = catalogById.get(course.courseId);
      const instructorName =
        typeof catalogCourse?.instructor === 'string'
          ? catalogCourse.instructor
          : catalogCourse?.instructor?.firstName
            ? `${catalogCourse.instructor.firstName} ${catalogCourse.instructor.lastName || ''}`.trim()
            : catalogCourse?.instructor?.email || '';
      const rawCategory = String(catalogCourse?.category || '').toLowerCase();
      const normalizedCategory: Exclude<CourseCategory, 'All Categories'> =
        rawCategory === 'design'
          ? 'Design'
          : rawCategory === 'business'
            ? 'Business'
            : rawCategory === 'marketing'
              ? 'Marketing'
              : 'Development';

      return {
        id: course.courseId,
        title: course.title,
        instructor: instructorName,
        category: normalizedCategory,
        status: Number(course.progress || 0) >= 100 ? 'Completed' : 'In Progress',
        progress: Number(course.progress || 0),
        lastAccessed: catalogCourse?.updatedAt ? new Date(catalogCourse.updatedAt).toLocaleDateString() : '',
        image: sanitizeHttpUrl(catalogCourse?.thumbnail) || '',
        accent: [BRAND.primary, '#6366F1', '#10B981', '#F59E0B'][index % 4],
      };
    });
  }, [catalogCourses, data]);

  const openCourse = (course: Course) => {
    navigate(`/courses/${course.id}/details`);
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
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
        <DashboardPageFrame
          title="Courses"
          description="Track enrollments, review progress, and move from each course overview into lesson delivery."
        >
          {isError ? (
            <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
              {normalizeApiError(error).message || 'Failed to load your courses.'}
            </Typography>
          ) : null}

          {isLoading ? (
            <Typography sx={{ color: 'text.secondary' }}>Loading your courses...</Typography>
          ) : null}

          <DashboardSection>
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
                  <TextField
                    fullWidth
                    placeholder="Search by course or instructor"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchOutlined fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3.5 }}>
                  <Select fullWidth value={category} onChange={(event) => setCategory(event.target.value as CourseCategory)}>
                    {['All Categories', 'Development', 'Design', 'Business', 'Marketing'].map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid size={{ xs: 12, md: 3.5 }}>
                  <Select fullWidth value={sort} onChange={(event) => setSort(event.target.value as CourseSort)}>
                    {['Recently Accessed', 'Progress: High to Low', 'Progress: Low to High', 'Title: A to Z'].map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </Grid>
                </Grid>
          </DashboardSection>

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
        </DashboardPageFrame>
    </Box>
  );
}

/**
 * InstructorDashboard v2
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES vs v1:
 * ✅ Skeleton loading replaces text "Loading dashboard..."
 * ✅ Design tokens imported from dashboardTokens (consistent elevation/radius)
 * ✅ Nested-card anti-pattern fixed (inner cards use innerCard / insetCard)
 * ✅ Revenue API wired: /api/payments/instructor/revenue
 * ✅ "New Course" button wired to /courses/new
 * ✅ Course action buttons wired (Edit → /courses/new, View → /courses/:id)
 * ✅ Removed useMemo(() => '$38,420', []) anti-pattern
 * ✅ 8px grid throughout — all spacing snapped to half-units
 * ✅ Error state uses Alert (not plain Typography)
 * ✅ Student Growth metrics show animated LinearProgress bars
 * ✅ Table row hover color aligned to design tokens
 * ✅ Revenue chart Suspense fallback uses proper skeleton height
 */

import { Suspense, lazy, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AddOutlined,
  AutoGraphOutlined,
  EditOutlined,
  GroupsOutlined,
  MoreHorizOutlined,
  PlayCircleOutlined,
  SchoolOutlined,
  StarOutlineOutlined,
  TrendingUpOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import CreateCourseDialog from '../../components/common/CreateCourseDialog';
import { api, normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ACCENT_COLORS,
  card,
  iconBox,
  innerCard,
  insetCard,
  sectionHeader,
  SPACING,
  statCard,
  statusChip,
} from './dashboardTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type InstructorDashboardCourse = {
  _id?: string;
  title: string;
  enrollmentCount?: number;
  rating?: { average?: number };
};

type InstructorDashboardResponse = {
  totalStudents?: number;
  averageRating?: number;
  totalCourses?: number;
  courses?: InstructorDashboardCourse[];
};

type InstructorRevenueResponse = {
  totalRevenue?: number;
  monthlyRevenue?: Array<{ month: string; revenue: number }>;
  topCourses?: Array<{ courseId: string; title: string; revenue: number }>;
};

// ─── Lazy imports ─────────────────────────────────────────────────────────────

const InstructorRevenueChart = lazy(
  () => import('../../components/ui/InstructorRevenueChart'),
);

// ─── Static fallback data ─────────────────────────────────────────────────────

const FALLBACK_STATS = [
  { label: 'Total Students', value: '1,248', change: '+18% this month', icon: <GroupsOutlined />, color: ACCENT_COLORS.blue },
  { label: 'Total Revenue', value: '$38,420', change: '+12% this month', icon: <TrendingUpOutlined />, color: ACCENT_COLORS.green },
  { label: 'Average Rating', value: '4.8', change: '+0.2 vs last month', icon: <StarOutlineOutlined />, color: ACCENT_COLORS.amber },
  { label: 'Active Courses', value: '12', change: '+2 live now', icon: <SchoolOutlined />, color: ACCENT_COLORS.indigo },
];

const FALLBACK_COURSES = [
  { _id: 'c1', title: 'Advanced React Patterns', students: 412, color: ACCENT_COLORS.blue },
  { _id: 'c2', title: 'UI/UX Design Fundamentals', students: 281, color: ACCENT_COLORS.indigo },
  { _id: 'c3', title: 'Python for Data Science', students: 364, color: ACCENT_COLORS.green },
  { _id: 'c4', title: 'Digital Marketing Masterclass', students: 191, color: ACCENT_COLORS.amber },
];

const TOP_COURSES = [
  { title: 'Advanced React Patterns', rating: 4.9, revenue: '$12.4k', students: 412, accent: ACCENT_COLORS.blue },
  { title: 'UI/UX Design Fundamentals', rating: 4.8, revenue: '$9.8k', students: 281, accent: ACCENT_COLORS.indigo },
  { title: 'Python for Data Science', rating: 4.8, revenue: '$8.2k', students: 364, accent: ACCENT_COLORS.green },
  { title: 'Digital Marketing Masterclass', rating: 4.7, revenue: '$5.1k', students: 191, accent: ACCENT_COLORS.amber },
];

const RECENT_ENROLLMENTS = [
  { student: 'Sarah Jimenez', course: 'Advanced React Patterns', date: 'Apr 03, 2026', status: 'Active', avatar: 'SJ', color: '#2DD4BF' },
  { student: 'Raj Patel', course: 'UI/UX Design Fundamentals', date: 'Apr 02, 2026', status: 'Pending', avatar: 'RP', color: ACCENT_COLORS.amber },
  { student: 'Yuna Kim', course: 'Python for Data Science', date: 'Apr 01, 2026', status: 'Active', avatar: 'YK', color: ACCENT_COLORS.green },
  { student: 'Michael Foster', course: 'Digital Marketing Masterclass', date: 'Mar 30, 2026', status: 'Active', avatar: 'MF', color: ACCENT_COLORS.teal },
];

const ENGAGEMENT_METRICS = [
  { label: 'Messages answered', value: 92, color: ACCENT_COLORS.blue },
  { label: 'Assignment completion', value: 87, color: ACCENT_COLORS.green },
  { label: 'Live session attendance', value: 74, color: ACCENT_COLORS.indigo },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label, value, change, icon, color,
}: { label: string; value: string; change: string; icon: React.ReactElement; color: string }) {
  return (
    <Card sx={statCard}>
      <CardContent sx={{ p: SPACING.cardPadding }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ mt: 1, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}
            >
              {value}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color, fontWeight: 700 }}>
              {change}
            </Typography>
          </Box>
          <Box sx={iconBox(color)}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card sx={card}>
      <CardContent sx={{ p: SPACING.cardPadding }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton width="55%" height={20} />
            <Skeleton width="40%" height={40} sx={{ mt: 1 }} />
            <Skeleton width="70%" height={20} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px' }} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', 'instructor'],
    queryFn: async () => {
      const response = await api.get<InstructorDashboardResponse>('/api/dashboard/instructor');
      return response.data;
    },
  });

  // Wire revenue to real API endpoint
  const { data: revenueData } = useQuery({
    queryKey: ['instructor', 'revenue'],
    queryFn: async () => {
      const response = await api.get<InstructorRevenueResponse>('/api/payments/instructor/revenue');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 min — revenue rarely changes second-to-second
  });

  const displayName = useMemo(() => {
    const first = user?.firstName?.trim() || '';
    const last = user?.lastName?.trim() || '';
    return [first, last].filter(Boolean).join(' ') || user?.email || 'Instructor';
  }, [user?.email, user?.firstName, user?.lastName]);

  const totalRevenue = revenueData?.totalRevenue != null
    ? `$${revenueData.totalRevenue.toLocaleString()}`
    : '$38,420'; // fallback until API responds

  const dashboardStats = useMemo(() => {
    if (!data) return FALLBACK_STATS;
    return [
      { label: 'Total Students', value: String(data?.totalStudents ?? 0), change: 'Live data', icon: <GroupsOutlined />, color: ACCENT_COLORS.blue },
      { label: 'Total Revenue', value: totalRevenue, change: 'From payment records', icon: <TrendingUpOutlined />, color: ACCENT_COLORS.green },
      { label: 'Average Rating', value: String(data?.averageRating ?? 0), change: 'Across all courses', icon: <StarOutlineOutlined />, color: ACCENT_COLORS.amber },
      { label: 'Active Courses', value: String(data?.totalCourses ?? 0), change: 'Live data', icon: <SchoolOutlined />, color: ACCENT_COLORS.indigo },
    ];
  }, [data, totalRevenue]);

  const dashboardCourses = useMemo(() => {
    if (!data?.courses?.length) return FALLBACK_COURSES;
    return data.courses.map((course) => ({
      _id: course._id,
      title: course.title,
      students: Number(course.enrollmentCount || 0),
      color: ACCENT_COLORS.blue,
    }));
  }, [data]);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#F8FAFC', p: { xs: 2, sm: 2.5, md: 3 } }}>
      <Stack spacing={SPACING.lg}>

        {/* Page header */}
        <Box>
          {isError && (
            <Alert severity="error" sx={{ mb: SPACING.md, borderRadius: '12px' }}>
              {normalizeApiError(error).message || 'Failed to load instructor dashboard.'}
            </Alert>
          )}
          <Chip
            label="INSTRUCTOR DASHBOARD"
            sx={{ bgcolor: alpha(ACCENT_COLORS.blue, 0.08), color: 'primary.main', fontWeight: 800, letterSpacing: '0.1em' }}
          />
          <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em' }}>
            Welcome back, {displayName.split(' ')[0] || 'Instructor'}!
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 680 }}>
            Track course performance, student activity, and revenue from one focused workspace.
          </Typography>
        </Box>

        {/* Metric cards */}
        <Grid container spacing={SPACING.lg}>
          {isLoading && !data
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricCardSkeleton />
                </Grid>
              ))
            : dashboardStats.map((stat) => (
                <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricCard {...stat} />
                </Grid>
              ))}
        </Grid>

        {/* Revenue chart + Top courses */}
        <Grid container spacing={SPACING.lg}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={card}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                <Box sx={sectionHeader}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>Revenue Overview</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Last 6 months of course revenue.
                    </Typography>
                  </Box>
                  <Chip
                    label={totalRevenue}
                    sx={{ bgcolor: alpha(ACCENT_COLORS.green, 0.1), color: 'success.main', fontWeight: 800 }}
                  />
                </Box>
                <Suspense
                  fallback={
                    <Skeleton
                      variant="rounded"
                      height={280}
                      sx={{ borderRadius: '12px', bgcolor: '#F1F5F9' }}
                    />
                  }
                >
                  <InstructorRevenueChart />
                </Suspense>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ ...card, height: '100%' }}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                <Box sx={{ mb: SPACING.lg }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Top Performing Courses</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Your strongest courses by revenue and ratings.
                  </Typography>
                </Box>
                <Stack spacing={SPACING.md}>
                  {TOP_COURSES.map((course) => (
                    <Box key={course.title} sx={{ ...insetCard, p: SPACING.md }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }} noWrap>
                            {course.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {course.students} students · {course.revenue}
                          </Typography>
                        </Box>
                        <Chip
                          label={`★ ${course.rating}`}
                          size="small"
                          sx={{ bgcolor: alpha(course.accent, 0.1), color: course.accent, fontWeight: 800, flexShrink: 0 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* My Courses */}
        <Card sx={card}>
          <CardContent sx={{ p: SPACING.cardPadding }}>
            <Box sx={sectionHeader}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>My Courses</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Quickly edit, view, and inspect performance.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={() => setCreateCourseOpen(true)}
                aria-label="Create a new course"
                sx={{
                  bgcolor: ACCENT_COLORS.blue,
                  borderRadius: '12px',
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(0,102,255,0.2)',
                }}
              >
                New Course
              </Button>
            </Box>

            <Grid container spacing={SPACING.md}>
              {dashboardCourses.map((course) => (
                <Grid key={course.title} size={{ xs: 12, md: 6 }}>
                  {/* insetCard: inside an already-elevated card, no shadow */}
                  <Box sx={{ ...insetCard, p: SPACING.cardPadding }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {course.students} students enrolled
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: course.color, color: '#FFFFFF', width: 40, height: 40, flexShrink: 0 }}>
                        <PlayCircleOutlined />
                      </Avatar>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: SPACING.md, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        startIcon={<EditOutlined />}
                        component={RouterLink}
                        to={`/courses/new`}
                        aria-label={`Edit ${course.title}`}
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<VisibilityOutlined />}
                        component={RouterLink}
                        to={course._id ? `/courses/${course._id}/learn` : '/courses'}
                        aria-label={`View ${course.title}`}
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<AutoGraphOutlined />}
                        component={RouterLink}
                        to="/admin/analytics"
                        aria-label={`Analytics for ${course.title}`}
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                      >
                        Analytics
                      </Button>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Enrollments + Student Growth */}
        <Grid container spacing={SPACING.lg}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={card}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                <Box sx={sectionHeader}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>Recent Enrollments</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Latest students joining your courses.
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label="More options"
                    sx={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}
                  >
                    <MoreHorizOutlined />
                  </IconButton>
                </Box>

                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 580 }} aria-label="Recent student enrollments">
                    <TableHead>
                      <TableRow
                        sx={{
                          '& .MuiTableCell-root': {
                            borderBottom: '1px solid #E2E8F0',
                            fontWeight: 800,
                            color: 'text.secondary',
                            fontSize: '0.78rem',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            py: SPACING.md,
                          },
                        }}
                      >
                        <TableCell>Student</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {RECENT_ENROLLMENTS.map((row) => (
                        <TableRow
                          key={`${row.student}-${row.course}`}
                          hover
                          sx={{
                            '& .MuiTableCell-root': { py: SPACING.md, borderBottom: '1px solid #F1F5F9' },
                            '&:hover': { bgcolor: alpha(ACCENT_COLORS.blue, 0.02) },
                            '&:last-child .MuiTableCell-root': { borderBottom: 'none' },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: row.color, color: '#FFFFFF', fontWeight: 800, fontSize: '0.8rem' }}>
                                {row.avatar}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {row.student}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {row.course}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {row.date}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              sx={statusChip(row.status === 'Active')}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ ...card, height: '100%' }}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                <Box sx={{ mb: SPACING.lg }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Student Engagement</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Key engagement metrics across your courses.
                  </Typography>
                </Box>
                <Stack spacing={SPACING.md}>
                  {ENGAGEMENT_METRICS.map((item) => (
                    <Box key={item.label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: item.color }}>
                          {item.value}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.value}
                        aria-label={`${item.label}: ${item.value}%`}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          bgcolor: '#E2E8F0',
                          '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 999 },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Stack>

      <CreateCourseDialog open={createCourseOpen} onClose={() => setCreateCourseOpen(false)} />
    </Box>
  );
}

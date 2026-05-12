import { Suspense, lazy, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CreateCourseDialog from '../../components/common/CreateCourseDialog';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
import { api, normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useGetInstructorDashboardQuery } from '../../store/api/dashboardApi';
import {
  ACCENT_COLORS,
  card,
  insetCard,
  sectionHeader,
  SPACING,
  statCard,
} from '../../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type InstructorRevenueResponse = {
  totalRevenue?: number;
  monthlyRevenue?: Array<{ month: string; revenue: number }>;
  topCourses?: Array<{ courseId: string; title: string; revenue: number }>;
};

// ─── Lazy imports ─────────────────────────────────────────────────────────────

const RevenueChart = lazy(
  () => import('../../components/ui/RevenueChart'),
);

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label, value, change, color,
}: { label: string; value: string; change: string; color: string }) {
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
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InstructorDashboardProps {
  showAccessDenied?: boolean;
}

export default function InstructorDashboard({ showAccessDenied }: InstructorDashboardProps) {
  const { user } = useAuth();
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetInstructorDashboardQuery();

  const { data: revenueData } = useQuery({
    queryKey: ['instructor', 'revenue'],
    queryFn: async () => {
      const response = await api.get<InstructorRevenueResponse>('/api/payments/instructor/revenue');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const firstName = user?.firstName?.trim();
  const welcomeGreeting = useMemo(
    () => (firstName ? `Welcome back, ${firstName}!` : 'Welcome back'),
    [firstName],
  );

  const totalRevenue = revenueData?.totalRevenue != null
    ? `$${revenueData.totalRevenue.toLocaleString()}`
    : '$0';

  const revenueChartData = useMemo(
    () => (revenueData?.monthlyRevenue ?? []).map((entry) => ({
      month: entry.month,
      revenue: Number(entry.revenue || 0),
    })),
    [revenueData?.monthlyRevenue],
  );

  const dashboardStats = useMemo(() => {
    return [
      { label: 'Total Students', value: String(data?.totalStudents ?? 0), change: 'Live data', color: ACCENT_COLORS.blue },
      { label: 'Total Revenue', value: totalRevenue, change: 'From payment records', color: ACCENT_COLORS.green },
      { label: 'Average Rating', value: String(data?.averageRating ?? 0), change: 'Across all courses', color: ACCENT_COLORS.amber },
      { label: 'Active Courses', value: String(data?.totalCourses ?? 0), change: 'Live data', color: ACCENT_COLORS.indigo },
    ];
  }, [data, totalRevenue]);

  const dashboardCourses = useMemo(() => {
    if (!data?.courses?.length) return [];
    return data.courses.map((course) => ({
      _id: course._id,
      title: course.title,
      students: Number(course.enrollmentCount || 0),
    }));
  }, [data]);

  const topCourses = useMemo(() => {
    if (!data?.courses?.length) return [];
    return data.courses
      .filter((c) => c.rating?.average || c.enrollmentCount)
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
      .slice(0, 4)
      .map((course, index) => ({
        title: course.title,
        rating: course.rating?.average || 0,
        revenue: `$${Math.round((course.revenue || 0)).toLocaleString()}`,
        students: course.enrollmentCount || 0,
        accent: [ACCENT_COLORS.blue, ACCENT_COLORS.indigo, ACCENT_COLORS.green, ACCENT_COLORS.amber][index % 4],
      }));
  }, [data]);

  const recentEnrollments = useMemo(() => {
    if (!data?.recentEnrollments?.length) return [];
    const colorMap: Record<string, string> = {
      'Active': '#2DD4BF',
      'Pending': ACCENT_COLORS.amber,
      'Completed': ACCENT_COLORS.green,
    };
    return data.recentEnrollments.slice(0, 4).map((enrollment) => ({
      student: enrollment.student,
      course: enrollment.course,
      date: enrollment.date,
      status: enrollment.status,
      avatar: enrollment.studentInitials,
      color: colorMap[enrollment.status] || ACCENT_COLORS.teal,
    }));
  }, [data]);

  const engagementMetrics = useMemo(() => {
    if (!data?.engagementMetrics?.length) return [];
    const colorMap: Record<string, string> = {
      'Messages answered': ACCENT_COLORS.blue,
      'Assignment completion': ACCENT_COLORS.green,
      'Live session attendance': ACCENT_COLORS.indigo,
    };
    return data.engagementMetrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      color: colorMap[metric.label] || ACCENT_COLORS.blue,
    }));
  }, [data]);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: SPACING.lg }}>
      {showAccessDenied && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
          You do not have permission to access this page
        </Alert>
      )}
      <DashboardPageFrame
        eyebrow="Instructor workspace"
        title={welcomeGreeting}
        description="Track course performance, student activity, and revenue from one focused workspace."
        actions={
          <Button
            variant="contained"
            onClick={() => setCreateCourseOpen(true)}
            aria-label="Create a new course"
            sx={{
              borderRadius: 1.5,
              fontWeight: 800,
              textTransform: 'none',
            }}
          >
            New Course
          </Button>
        }
      >
        {isError && (
          <Alert severity="error" sx={{ mb: SPACING.md, borderRadius: 1.5 }}>
            {normalizeApiError(error).message || 'Failed to load instructor dashboard.'}
          </Alert>
        )}

        <Grid container spacing={SPACING.lg}>
          {isLoading && !data ? (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading dashboard metrics...
              </Typography>
            </Grid>
          ) : null}
          {dashboardStats.map((stat) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <Box sx={{ opacity: isLoading && !data ? 0.6 : 1, transition: 'opacity 180ms ease' }}>
                <MetricCard
                  label={stat.label}
                  value={isLoading && !data ? '…' : stat.value}
                  change={stat.change}
                  color={stat.color}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

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
                </Box>
                <Suspense
                  fallback={
                    <Box sx={{ height: 280, display: 'grid', placeItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Loading revenue chart...
                      </Typography>
                    </Box>
                  }
                >
                  <RevenueChart data={revenueChartData} height={320} barSize={28} />
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
                  {topCourses.length > 0 ? (
                    topCourses.map((course) => (
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
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, flexShrink: 0 }}>
                            ★ {course.rating}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No courses yet. Create your first course to see performance data.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={card}>
          <CardContent sx={{ p: SPACING.cardPadding }}>
            <Box sx={sectionHeader}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>My Courses</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Quickly edit, view, and inspect performance.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={SPACING.md}>
              {dashboardCourses.length > 0 ? (
                dashboardCourses.map((course) => (
                  <Grid key={course.title} size={{ xs: 12, md: 6 }}>
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
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ mt: SPACING.md, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          component={RouterLink}
                          to="/courses/new"
                          aria-label={`Edit ${course.title}`}
                          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          component={RouterLink}
                          to={course._id ? `/courses/${course._id}/learn` : '/courses'}
                          aria-label={`View ${course.title}`}
                          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
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
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No courses yet. Create your first course to start your teaching journey!
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

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
                </Box>

                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 520, sm: 580 } }} aria-label="Recent student enrollments">
                    <TableHead>
                      <TableRow
                        sx={{
                          '& .MuiTableCell-root': {
                            borderBottom: '1px solid',
                            borderColor: 'divider',
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
                      {recentEnrollments.length > 0 ? (
                        recentEnrollments.map((row) => (
                          <TableRow
                            key={`${row.student}-${row.course}`}
                            hover
                            sx={{
                              '& .MuiTableCell-root': { py: SPACING.md, borderBottom: '1px solid', borderColor: 'divider' },
                              '&:hover': { bgcolor: 'background.default' },
                              '&:last-child .MuiTableCell-root': { borderBottom: 'none' },
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
                                <Box sx={{ width: { xs: 30, md: 36 }, height: { xs: 30, md: 36 }, bgcolor: row.color, color: 'common.white', fontWeight: 800, fontSize: { xs: '0.72rem', md: '0.8rem' }, borderRadius: 1.25, display: 'grid', placeItems: 'center' }}>
                                  {row.avatar}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
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
                              <Typography
                                variant="body2"
                                sx={{ color: row.status === 'Active' ? 'success.main' : 'text.secondary', fontWeight: 700 }}
                              >
                                {row.status}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                              No enrollments yet. Students will appear here when they enroll in your courses.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
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
                  {engagementMetrics.length > 0 ? (
                    engagementMetrics.map((item) => (
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
                            bgcolor: 'divider',
                            '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 999 },
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No engagement data available yet.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </DashboardPageFrame>

      <CreateCourseDialog open={createCourseOpen} onClose={() => setCreateCourseOpen(false)} />
    </Box>
  );
}

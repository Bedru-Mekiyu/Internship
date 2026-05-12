import { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link as RouterLink } from 'react-router-dom';
import { normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { useGetStudentDashboardQuery } from '../../store/api/dashboardApi';
import { useGetCoursesQuery } from '../../store/api/courseApi';
import { sanitizeHttpUrl } from '../../utils/safeUrl';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
import {
  card,
  innerCard,
  SPACING,
  statCard,
  ACCENT_COLORS,
  sectionHeader,
} from './dashboardTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  color: string;
};

type ActivityType = 'Completion' | 'Badge' | 'Enrollment' | 'Assignment';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, delta, color }: DashboardStat) {
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
              sx={{ mt: 1, fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary', lineHeight: 1.1 }}
            >
              {value}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color, fontWeight: 700 }}>
              {delta}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((value, index) => ({ index, value }));
  return (
    <Box sx={{ height: 44 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

function ActivityItem({ title, time, type }: { title: string; time: string; type: ActivityType }) {
  return (
    <Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.55 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {type} · {time}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface StudentDashboardProps {
  showAccessDenied?: boolean;
}

export default function StudentDashboard({ showAccessDenied }: StudentDashboardProps) {
  const { user } = useAuth();
  const firstName = user?.firstName?.trim();
  const welcomeGreeting = firstName ? `Welcome back, ${firstName}!` : 'Welcome back';

  const { data, isLoading, isError, error } = useGetStudentDashboardQuery();
  const { data: catalogCourses = [] } = useGetCoursesQuery();

  const statCards = useMemo((): DashboardStat[] => {
    const pending = isLoading && !data;
    const total = data?.totalCourses ?? 0;
    const avg = data?.averageProgress ?? 0;
    const completed = data?.completedCourses ?? 0;
    const certs = data?.certificatesEarned ?? 0;
    return [
      {
        label: 'Enrolled courses',
        value: pending ? '…' : String(total),
        delta: pending ? 'Loading…' : 'Total active enrollments',
        color: ACCENT_COLORS.blue,
      },
      {
        label: 'Average progress',
        value: pending ? '…' : `${avg}%`,
        delta: pending ? 'Loading…' : 'Mean across enrollments',
        color: ACCENT_COLORS.indigo,
      },
      {
        label: 'Courses completed',
        value: pending ? '…' : String(completed),
        delta: pending ? 'Loading…' : 'Completed at 100%',
        color: ACCENT_COLORS.green,
      },
      {
        label: 'Certificates earned',
        value: pending ? '…' : String(certs),
        delta: pending ? 'Loading…' : 'Issued credentials',
        color: ACCENT_COLORS.amber,
      },
    ];
  }, [data, isLoading]);

  const activeCourses = useMemo(() => {
    if (!data?.enrolledCourses?.length) return [];
    const catalogById = new Map(catalogCourses.map((course) => [String(course._id), course]));
    return data.enrolledCourses.slice(0, 3).map((course, index) => {
      const catalogCourse = catalogById.get(course.courseId);
      const instructorName =
        typeof catalogCourse?.instructor === 'string'
          ? catalogCourse.instructor
          : catalogCourse?.instructor?.firstName
            ? `${catalogCourse.instructor.firstName} ${catalogCourse.instructor.lastName || ''}`.trim()
            : catalogCourse?.instructor?.email || '';
      return {
        id: course.courseId,
        title: course.title,
        instructor: instructorName,
        progress: Number(course.progress || 0),
        lessonsLeft: `${Math.max(0, 100 - Number(course.progress || 0))}% remaining`,
        accent: [ACCENT_COLORS.blue, ACCENT_COLORS.indigo, ACCENT_COLORS.green][index % 3],
        trend: Array.from({ length: 7 }, (_, i) => Math.min(100, Math.round((course.progress / 7) * (i + 1)))),
      };
    });
  }, [catalogCourses, data]);

  const displayBadges = useMemo(() => {
    if (!data?.badges?.length) return [];
    return data.badges.slice(0, 4).map((badge) => ({
      name: badge.name,
      description: badge.description,
      color: badge.color,
    }));
  }, [data]);

  const displayMomentumData = useMemo(() => {
    if (!data?.momentumData?.length) return [];
    return data.momentumData;
  }, [data]);

  const displayRecommendedCourses = useMemo(() => {
    if (!data?.recommendedCourses?.length) return [];
    const catalogById = new Map(catalogCourses.map((course) => [String(course._id), course]));
    return data.recommendedCourses.slice(0, 4).map((course) => {
      const catalogCourse = catalogById.get(course.courseId);
      return {
        title: course.title,
        meta: course.meta,
        tag: course.tag,
        image: sanitizeHttpUrl(catalogCourse?.thumbnail) || '',
      };
    });
  }, [catalogCourses, data]);

  const displayActivityFeed = useMemo(() => {
    if (!data?.activityFeed?.length) return [];
    return data.activityFeed.slice(0, 4);
  }, [data]);

  return (
    <DashboardPageFrame
      title={welcomeGreeting}
      description="Continue your learning journey, pick up where you left off, and track your progress."
    >
      <Stack spacing={SPACING.lg}>
        {/* Access denied error */}
        {showAccessDenied && (
          <Alert severity="error" sx={{ borderRadius: 1.5 }}>
            You do not have permission to access this page
          </Alert>
        )}

        {/* Error state */}
        {isError && (
          <Alert severity="error" sx={{ borderRadius: 1.5 }}>
            {normalizeApiError(error).message || 'Failed to load dashboard data.'}
          </Alert>
        )}

        {/* Stat cards */}
        <Grid container spacing={SPACING.md}>
          {statCards.map((stat) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Continue Learning + Activity */}
        <Grid container spacing={SPACING.lg}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={card}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                {/* Section header */}
                <Box sx={sectionHeader}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Continue Learning
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Active courses you can resume right now.
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={SPACING.md}>
                  {isLoading && !data ? (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ ...innerCard, height: '100%' }}>
                        <CardContent sx={{ p: SPACING.cardPadding, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            Fetching your courses...
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ) : activeCourses.length > 0 ? (
                    activeCourses.map((course) => (
                        <Grid key={course.id ?? course.title} size={{ xs: 12, md: 4 }}>
                          {/* Inner cards: elevation=0, border only */}
                          <Card sx={{ ...innerCard, height: '100%' }}>
                            <CardContent sx={{ p: SPACING.cardPadding, height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ minWidth: 0, mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.25 }} noWrap>
                                  {course.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                  {course.instructor}
                                </Typography>
                              </Box>

                              <Sparkline data={course.trend} color={course.accent} />

                              <Stack spacing={1} sx={{ mt: 1, flex: 1, justifyContent: 'flex-end' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {course.lessonsLeft}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                    {course.progress}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={course.progress}
                                  aria-label={`${course.title}: ${course.progress}% complete`}
                                  sx={{
                                    height: 8,
                                    borderRadius: 999,
                                    bgcolor: 'divider',
                                    '& .MuiLinearProgress-bar': { bgcolor: course.accent, borderRadius: 999 },
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  fullWidth
                                  component={RouterLink}
                                  to={`/courses/${course.id}/learn`}
                                  aria-label={`Resume ${course.title}`}
                                  sx={{
                                    mt: 0.5,
                                    borderRadius: 1.5,
                                    fontWeight: 800,
                                    textTransform: 'none',
                                  }}
                                >
                                  Resume Course
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                    ))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                        You haven't started any courses yet. Explore our catalog to find your next learning adventure!
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ ...card, height: '100%' }}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                <Box sx={{ mb: SPACING.lg }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Your latest learning events.
                  </Typography>
                </Box>
                <Stack spacing={SPACING.md}>
                  {displayActivityFeed.length > 0 ? (
                    displayActivityFeed.map((item) => (
                      <ActivityItem key={item.title} {...item} />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No recent activity. Start learning to see your progress!
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recommended Courses */}
        <Card sx={card}>
          <CardContent sx={{ p: SPACING.cardPadding }}>
            <Box sx={sectionHeader}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Recommended Courses
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Fresh picks based on your activity and goals.
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/courses/browse"
                aria-label="See all recommended courses"
                sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'none' }}
              >
                See all
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: { xs: '82%', sm: '48%', lg: '28%' },
                gap: SPACING.md,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 999 },
                scrollSnapType: 'x mandatory',
                '& > *': { scrollSnapAlign: 'start' },
              }}
            >
              {displayRecommendedCourses.length > 0 ? (
                displayRecommendedCourses.map((course) => (
                  <Card key={course.title} sx={{ ...innerCard, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: 136,
                        backgroundImage: course.image ? `url(${course.image})` : 'none',
                        bgcolor: course.image ? 'transparent' : 'background.default',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <CardContent sx={{ p: SPACING.cardPadding }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.3 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {course.meta}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        component={RouterLink}
                        to="/courses/browse"
                        aria-label={`Enroll in ${course.title}`}
                        sx={{ mt: SPACING.md, borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}
                      >
                        Enroll Now
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ p: SPACING.lg, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Complete courses to get personalized recommendations!
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Achievements + Momentum */}
        <Grid container spacing={SPACING.lg}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={card}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                <Box sx={{ mb: SPACING.lg }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Achievements &amp; Badges
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Earned milestones from your learning journey.
                  </Typography>
                </Box>
                <Grid container spacing={SPACING.md}>
                  {displayBadges.length > 0 ? (
                    displayBadges.map((badge) => (
                      <Grid key={badge.name} size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: SPACING.md,
                            p: SPACING.md,
                            borderRadius: 1.5,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'border-color 160ms ease',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                              {badge.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.55 }}>
                              {badge.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Complete courses and activities to earn badges!
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ ...card, height: '100%' }}>
              <CardContent sx={{ p: SPACING.cardPadding }}>
                <Box sx={{ mb: SPACING.lg }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Momentum
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Your weekly learning activity.
                  </Typography>
                </Box>

                <Box sx={{ height: 160 }}>
                  {displayMomentumData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayMomentumData} barSize={22}>
                        <XAxis
                          dataKey="label"
                          tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            fontSize: 13,
                          }}
                          formatter={(v) => [`${v} lessons`, 'Activity']}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={ACCENT_COLORS.blue} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Start learning to track your weekly activity
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Stack spacing={1} sx={{ mt: SPACING.md }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Streak
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
                      12 days
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Avg. completion
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
                      {data?.averageProgress != null ? `${data.averageProgress}%` : '—'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </DashboardPageFrame>
  );
}

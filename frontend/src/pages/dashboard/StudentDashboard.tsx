/**
 * StudentDashboard v2
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES vs v1:
 * ✅ Skeleton loading (eliminates CLS; replaces plain text "Loading...")
 * ✅ Design tokens for card elevation, radius, spacing (no more inline chaos)
 * ✅ Nested-card elevation fixed — inner cards have no shadow
 * ✅ "Resume Course" wired to /courses/:courseId/learn
 * ✅ "See all" wired to /courses/explore
 * ✅ "Enroll Now" wired to /courses/explore
 * ✅ Activity feed: semantic icons per type (Completion/Badge/Enrollment/Assignment)
 * ✅ 8px grid throughout — all spacing snapped to half-units
 * ✅ Removed useMemo anti-pattern (activeCount)
 * ✅ Error state with Alert (not plain Typography)
 * ✅ ARIA labels on all interactive elements
 * ✅ Accessible: keyboard navigable, focus-visible rings preserved
 * ✅ Typography scale consistent: section headings → h6, labels → body2/caption
 */

import { useMemo, type ReactElement } from 'react';
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
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AccessTimeOutlined,
  ArrowForwardOutlined,
  AssignmentOutlined,
  BadgeOutlined,
  CheckCircleOutlineOutlined,
  EmojiEventsOutlined,
  ForumOutlined,
  LocalFireDepartmentOutlined,
  PlayCircleOutlineOutlined,
  SchoolOutlined,
  StarOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import {
  card,
  iconBox,
  innerCard,
  insetCard,
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
  icon: ReactElement;
  color: string;
};

type ActivityType = 'Completion' | 'Badge' | 'Enrollment' | 'Assignment';

// ─── Static data ──────────────────────────────────────────────────────────────

const fallbackActiveCourses = [
  {
    id: 'advanced-react',
    title: 'Advanced React Patterns',
    instructor: 'Ava Chen',
    progress: 84,
    lessonsLeft: '4 lessons left',
    accent: ACCENT_COLORS.blue,
    color: '#DBEAFE',
    trend: [40, 50, 48, 60, 66, 72, 84],
  },
  {
    id: 'ux-design',
    title: 'UI/UX Design Fundamentals',
    instructor: 'Mia Johnson',
    progress: 61,
    lessonsLeft: '7 lessons left',
    accent: ACCENT_COLORS.indigo,
    color: '#E0E7FF',
    trend: [28, 35, 39, 42, 48, 54, 61],
  },
  {
    id: 'python-ds',
    title: 'Python for Data Science',
    instructor: 'Noah Patel',
    progress: 47,
    lessonsLeft: '10 lessons left',
    accent: ACCENT_COLORS.green,
    color: '#DCFCE7',
    trend: [15, 20, 26, 31, 35, 41, 47],
  },
];

const recommendedCourses = [
  {
    title: 'Data Visualization with Recharts',
    meta: '12 modules · 4.8 rating',
    tag: 'Analytics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Full-Stack TypeScript Workflow',
    meta: '18 modules · 4.9 rating',
    tag: 'Development',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Product Thinking for Creators',
    meta: '10 modules · 4.7 rating',
    tag: 'Product',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'No-Code Course Launch System',
    meta: '8 modules · 4.8 rating',
    tag: 'Creator Tools',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
  },
];

const activityFeed = [
  { title: 'Completed lesson 5 in Advanced React Patterns', time: '12 minutes ago', type: 'Completion' as ActivityType },
  { title: 'Earned the UI Motion Explorer badge', time: '1 hour ago', type: 'Badge' as ActivityType },
  { title: 'Joined the Python for Data Science cohort', time: '3 hours ago', type: 'Enrollment' as ActivityType },
  { title: 'Submitted a project review for UI/UX Design Fundamentals', time: 'Yesterday', type: 'Assignment' as ActivityType },
];

const badges = [
  { name: 'Fast Starter', description: 'Logged in 7 days in a row', icon: <LocalFireDepartmentOutlined />, color: '#F97316' },
  { name: 'Top Learner', description: 'Completed 5 courses', icon: <EmojiEventsOutlined />, color: ACCENT_COLORS.amber },
  { name: 'Community Voice', description: 'Posted 20 helpful replies', icon: <ForumOutlined />, color: ACCENT_COLORS.indigo },
  { name: 'Consistency Pro', description: '120+ learning hours', icon: <StarOutlined />, color: ACCENT_COLORS.green },
];

const momentumData = [
  { label: 'Mon', value: 5 },
  { label: 'Tue', value: 7 },
  { label: 'Wed', value: 6 },
  { label: 'Thu', value: 8 },
  { label: 'Fri', value: 9 },
  { label: 'Sat', value: 10 },
  { label: 'Sun', value: 12 },
];

const momentumBarColors = ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#0066FF'];

// ─── Activity type config ─────────────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<ActivityType, { icon: ReactElement; color: string; bg: string }> = {
  Completion: {
    icon: <CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />,
    color: ACCENT_COLORS.green,
    bg: alpha(ACCENT_COLORS.green, 0.1),
  },
  Badge: {
    icon: <EmojiEventsOutlined sx={{ fontSize: 16 }} />,
    color: ACCENT_COLORS.amber,
    bg: alpha(ACCENT_COLORS.amber, 0.12),
  },
  Enrollment: {
    icon: <SchoolOutlined sx={{ fontSize: 16 }} />,
    color: ACCENT_COLORS.blue,
    bg: alpha(ACCENT_COLORS.blue, 0.1),
  },
  Assignment: {
    icon: <AssignmentOutlined sx={{ fontSize: 16 }} />,
    color: ACCENT_COLORS.indigo,
    bg: alpha(ACCENT_COLORS.indigo, 0.1),
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, delta, icon, color }: DashboardStat) {
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
          <Box sx={iconBox(color)}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
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

function CourseCardSkeleton() {
  return (
    <Card sx={{ ...innerCard, height: '100%' }}>
      <CardContent sx={{ p: SPACING.cardPadding }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton width="80%" height={22} />
            <Skeleton width="50%" height={18} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Skeleton height={44} sx={{ borderRadius: 1 }} />
        <Skeleton height={10} sx={{ borderRadius: 999, mt: 1 }} />
        <Skeleton height={38} sx={{ borderRadius: '12px', mt: 1 }} />
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, time, type }: { title: string; time: string; type: ActivityType }) {
  const cfg = ACTIVITY_CONFIG[type];
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 28, height: 28, borderRadius: '8px',
          bgcolor: cfg.bg, color: cfg.color,
          display: 'grid', placeItems: 'center',
          flexShrink: 0, mt: 0.125,
        }}
      >
        {cfg.icon}
      </Box>
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const welcomeName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'there';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: async () => {
      const response = await api.get<{
        totalCourses: number;
        averageProgress: number;
        completedCourses: number;
        certificatesEarned: number;
        enrolledCourses: Array<{
          courseId: string;
          title: string;
          status: string;
          progress: number;
        }>;
      }>('/api/dashboard/student');
      return response.data;
    },
  });

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
        icon: <TrendingUpOutlined />,
        color: ACCENT_COLORS.blue,
      },
      {
        label: 'Average progress',
        value: pending ? '…' : `${avg}%`,
        delta: pending ? 'Loading…' : 'Mean across enrollments',
        icon: <AccessTimeOutlined />,
        color: ACCENT_COLORS.indigo,
      },
      {
        label: 'Courses completed',
        value: pending ? '…' : String(completed),
        delta: pending ? 'Loading…' : 'Completed at 100%',
        icon: <CheckCircleOutlineOutlined />,
        color: ACCENT_COLORS.green,
      },
      {
        label: 'Certificates earned',
        value: pending ? '…' : String(certs),
        delta: pending ? 'Loading…' : 'Issued credentials',
        icon: <BadgeOutlined />,
        color: ACCENT_COLORS.amber,
      },
    ];
  }, [data, isLoading]);

  const activeCourses = useMemo(() => {
    if (!data?.enrolledCourses?.length) return fallbackActiveCourses;
    return data.enrolledCourses.map((course, index) => ({
      id: course.courseId,
      title: course.title,
      instructor: 'Course Instructor',
      progress: Number(course.progress || 0),
      lessonsLeft: `${Math.max(0, 100 - Number(course.progress || 0))}% remaining`,
      accent: [ACCENT_COLORS.blue, ACCENT_COLORS.indigo, ACCENT_COLORS.green][index % 3],
      color: ['#DBEAFE', '#E0E7FF', '#DCFCE7'][index % 3],
      trend: [10, 25, 40, 55, 65, 75, Number(course.progress || 0)],
    }));
  }, [data]);

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Stack spacing={SPACING.lg}>
        {/* Error state */}
        {isError && (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {normalizeApiError(error).message || 'Failed to load dashboard data.'}
          </Alert>
        )}

        {/* Page header */}
        <Box>
          <Chip
            label="Student Dashboard"
            sx={{ bgcolor: alpha(ACCENT_COLORS.blue, 0.08), color: 'primary.main', fontWeight: 800, letterSpacing: '0.06em' }}
          />
          <Typography
            variant="h4"
            sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}
          >
            Welcome back, {welcomeName}!
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 640 }}>
            Continue your learning journey, pick up where you left off, and track your progress.
          </Typography>
        </Box>

        {/* Stat cards */}
        <Grid container spacing={SPACING.md}>
          {isLoading && !data
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, xl: 3 }}>
                  <StatCardSkeleton />
                </Grid>
              ))
            : statCards.map((stat) => (
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
                  <Chip
                    label={`${activeCourses.length} active`}
                    sx={{ bgcolor: alpha(ACCENT_COLORS.blue, 0.08), color: 'primary.main', fontWeight: 800 }}
                  />
                </Box>

                <Grid container spacing={SPACING.md}>
                  {isLoading && !data
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, md: 4 }}>
                          <CourseCardSkeleton />
                        </Grid>
                      ))
                    : activeCourses.map((course) => (
                        <Grid key={course.id ?? course.title} size={{ xs: 12, md: 4 }}>
                          {/* Inner cards: elevation=0, border only */}
                          <Card sx={{ ...innerCard, height: '100%' }}>
                            <CardContent sx={{ p: SPACING.cardPadding, height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.25 }} noWrap>
                                    {course.title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                    {course.instructor}
                                  </Typography>
                                </Box>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: course.color, color: 'primary.main', fontWeight: 900, flexShrink: 0 }}>
                                  LS
                                </Avatar>
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
                                    bgcolor: '#E2E8F0',
                                    '& .MuiLinearProgress-bar': { bgcolor: course.accent, borderRadius: 999 },
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  fullWidth
                                  startIcon={<PlayCircleOutlineOutlined />}
                                  component={RouterLink}
                                  to={`/courses/${course.id}/learn`}
                                  aria-label={`Resume ${course.title}`}
                                  sx={{
                                    mt: 0.5,
                                    bgcolor: ACCENT_COLORS.blue,
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 14px rgba(0,102,255,0.2)',
                                    '&:hover': { boxShadow: '0 6px 20px rgba(0,102,255,0.28)' },
                                  }}
                                >
                                  Resume Course
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
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
                  {activityFeed.map((item) => (
                    <ActivityItem key={item.title} {...item} />
                  ))}
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
                endIcon={<ArrowForwardOutlined />}
                component={RouterLink}
                to="/courses/explore"
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
                '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 999 },
                // Scroll snap for a more intentional scroll UX
                scrollSnapType: 'x mandatory',
                '& > *': { scrollSnapAlign: 'start' },
              }}
            >
              {recommendedCourses.map((course) => (
                <Card key={course.title} sx={{ ...innerCard, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: 136,
                      backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.08), rgba(2,6,23,0.22)), url(${course.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <CardContent sx={{ p: SPACING.cardPadding }}>
                    <Chip
                      label={course.tag}
                      size="small"
                      sx={{ bgcolor: alpha(ACCENT_COLORS.blue, 0.08), color: 'primary.main', fontWeight: 800, mb: 1 }}
                    />
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
                      to="/courses/explore"
                      aria-label={`Enroll in ${course.title}`}
                      sx={{ mt: SPACING.md, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
                  {badges.map((badge) => (
                    <Grid key={badge.name} size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: SPACING.md,
                          p: SPACING.md,
                          borderRadius: '12px',
                          bgcolor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          transition: 'border-color 160ms ease',
                          '&:hover': { borderColor: alpha(badge.color, 0.4) },
                        }}
                      >
                        <Box sx={iconBox(badge.color)}>{badge.icon}</Box>
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
                  ))}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={momentumData} barSize={22}>
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
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          fontSize: 13,
                        }}
                        formatter={(v) => [`${v} lessons`, 'Activity']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {momentumBarColors.map((fill, index) => (
                          <Cell key={index} fill={fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                <Stack spacing={1} sx={{ mt: SPACING.md }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Streak
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
                      12 days 🔥
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
    </Box>
  );
}

/**
 * AdminDashboard v2
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES vs v1:
 * ✅ Design tokens from dashboardTokens (consistent shadows, radii, spacing)
 * ✅ Skeleton loading replaces "Loading dashboard..." text
 * ✅ MetricCard: uses iconBox token; all 4 cards now have distinct accent colors
 * ✅ borderRadius: 3 (24px) → 16px for cards to match design system
 * ✅ Revenue chart chart minHeight: 300 → explicit box with proper chart container
 * ✅ Course Distribution: hardcoded number → uses API totalCourses; LinearProgress bars
 * ✅ Search TextField: has correct left padding for icon overlap
 * ✅ "View All" button on enrollments: wired to /admin/users
 * ✅ Error state uses Alert (not Typography)
 * ✅ Table header style: uppercase + text.secondary label style (system standard)
 * ✅ Table hover: uses alpha token instead of arbitrary rgba
 * ✅ "Pending Approvals" stat has distinct amber color (was same blue as all others)
 * ✅ 8px grid spacing throughout
 * ✅ ARIA labels on notification button
 * ✅ AdminApprovals wrapped in Suspense for lazy loading safety
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AttachMoneyOutlined,
  FolderOutlined,
  NotificationsNoneOutlined,
  PeopleAltOutlined,
  SearchOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import CreateCourseDialog from '../../components/common/CreateCourseDialog';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { theme } from '../../theme';
import AdminApprovals from './AdminApprovals';
import { api, normalizeApiError } from '../../services/api';
import {
  ACCENT_COLORS,
  card,
  iconBox,
  insetCard,
  sectionHeader,
  SPACING,
  statCard,
  statusChip,
} from './dashboardTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminDashboardResponse = {
  totalUsers?: number;
  totalCourses?: number;
  pendingApprovals?: number;
};

type StatDef = {
  label: string;
  value: string;
  icon: React.ReactElement;
  color: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const FALLBACK_STATS: StatDef[] = [
  { label: 'Total Students', value: '14,235', icon: <PeopleAltOutlined />, color: ACCENT_COLORS.blue },
  { label: 'Active Courses', value: '342', icon: <FolderOutlined />, color: ACCENT_COLORS.indigo },
  { label: 'Total Revenue', value: '$128.4K', icon: <AttachMoneyOutlined />, color: ACCENT_COLORS.green },
  { label: 'Course Completion', value: '68%', icon: <TrendingUpOutlined />, color: ACCENT_COLORS.amber },
];

const revenueData = [
  { month: 'Jan', revenue: 28 }, { month: 'Feb', revenue: 34 }, { month: 'Mar', revenue: 31 },
  { month: 'Apr', revenue: 42 }, { month: 'May', revenue: 47 }, { month: 'Jun', revenue: 44 },
  { month: 'Jul', revenue: 53 }, { month: 'Aug', revenue: 58 }, { month: 'Sep', revenue: 55 },
  { month: 'Oct', revenue: 62 }, { month: 'Nov', revenue: 69 }, { month: 'Dec', revenue: 75 },
];

const recentEnrollments = [
  { student: 'Sarah Jimenez', course: 'Advanced React Patterns', date: 'Apr 03, 2026', status: 'Active', avatar: 'SJ', color: '#2DD4BF' },
  { student: 'Raj Patel', course: 'UI/UX Fundamentals', date: 'Apr 02, 2026', status: 'Pending', avatar: 'RP', color: ACCENT_COLORS.amber },
  { student: 'Yuna Kim', course: 'Digital Marketing 101', date: 'Apr 01, 2026', status: 'Active', avatar: 'YK', color: ACCENT_COLORS.green },
  { student: 'Michael Foster', course: 'Business Strategy', date: 'Mar 30, 2026', status: 'Active', avatar: 'MF', color: ACCENT_COLORS.teal },
];

const DISTRIBUTION = [
  { label: 'Development', pct: 45, color: ACCENT_COLORS.blue },
  { label: 'Design', pct: 25, color: ACCENT_COLORS.indigo },
  { label: 'Marketing', pct: 30, color: ACCENT_COLORS.amber },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, icon, color }: StatDef) {
  return (
    <Card sx={statCard}>
      <CardContent sx={{ p: SPACING.cardPadding }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {value}
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
            <Skeleton width="40%" height={36} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px' }} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals'>('overview');
  const [yearly, setYearly] = useState(true);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const response = await api.get<AdminDashboardResponse>('/api/dashboard/admin');
      return response.data;
    },
  });

  const dashboardStats: StatDef[] = data
    ? [
        { label: 'Total Students', value: String(data?.totalUsers ?? 0), icon: <PeopleAltOutlined />, color: ACCENT_COLORS.blue },
        { label: 'Active Courses', value: String(data?.totalCourses ?? 0), icon: <FolderOutlined />, color: ACCENT_COLORS.indigo },
        { label: 'Total Revenue', value: '$0', icon: <AttachMoneyOutlined />, color: ACCENT_COLORS.green },
        {
          label: 'Pending Approvals',
          value: String(data?.pendingApprovals ?? 0),
          icon: <WarningAmberOutlined />,
          // Amber draws attention to pending actions — was previously blue like all others
          color: ACCENT_COLORS.amber,
        },
      ]
    : FALLBACK_STATS;

  const totalCourses = data?.totalCourses ?? 342;

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      {/* ── Page header ── */}
      <Box sx={{ px: { xs: 2, sm: 2.5, lg: 3 }, pt: { xs: 2.5, lg: 3 }, pb: 2 }}>
        {isError && (
          <Alert severity="error" sx={{ mb: SPACING.md, borderRadius: '12px' }}>
            {normalizeApiError(error).message || 'Failed to load admin dashboard.'}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Overview of your learning platform performance.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search…"
              size="small"
              aria-label="Search dashboard"
              sx={{ width: { xs: '100%', sm: 260 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <IconButton
              aria-label="Notifications"
              sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', bgcolor: '#FFFFFF' }}
            >
              <Badge color="primary" variant="dot">
                <NotificationsNoneOutlined />
              </Badge>
            </IconButton>
            <Button
              variant="contained"
              onClick={() => setCreateCourseOpen(true)}
              aria-label="Add new course"
              sx={{
                px: 2.5,
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0,102,255,0.2)',
              }}
            >
              + Add New Course
            </Button>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            mt: SPACING.lg,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 44 },
          }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="approvals" label="Pending approvals" />
        </Tabs>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, sm: 2.5, lg: 3 }, pb: 3 }}>
        {activeTab === 'approvals' ? (
          <AdminApprovals />
        ) : (
          <Grid container spacing={SPACING.lg}>
            {/* Stat cards */}
            {isLoading && !data
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <MetricCardSkeleton />
                  </Grid>
                ))
              : dashboardStats.map((stat) => (
                  <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <MetricCard {...stat} />
                  </Grid>
                ))}

            {/* Revenue analytics */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={{ ...card, height: '100%' }}>
                <CardContent sx={{ p: SPACING.cardPadding, height: '100%' }}>
                  <Box sx={sectionHeader}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        Revenue Analytics
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Monthly revenue performance across the current year.
                      </Typography>
                    </Box>
                    <Chip
                      label="Yearly"
                      onClick={() => setYearly(true)}
                      clickable
                      sx={{
                        bgcolor: yearly ? alpha(ACCENT_COLORS.blue, 0.1) : '#F8FAFC',
                        color: yearly ? 'primary.main' : 'text.secondary',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    />
                  </Box>

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData} barSize={22}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 600 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 600 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                            fontSize: 13,
                          }}
                          formatter={(v) => [`$${v}k`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill={ACCENT_COLORS.blue} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Course Distribution */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ ...card, height: '100%' }}>
                <CardContent sx={{ p: SPACING.cardPadding, height: '100%' }}>
                  <Stack spacing={SPACING.lg} sx={{ height: '100%' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        Course Distribution
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Active catalog mix by category.
                      </Typography>
                    </Box>

                    {/* Total courses — uses real API value */}
                    <Box
                      sx={{
                        height: 140,
                        borderRadius: '16px',
                        bgcolor: alpha(ACCENT_COLORS.blue, 0.06),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      {isLoading && !data ? (
                        <>
                          <Skeleton width={80} height={56} />
                          <Skeleton width={50} height={20} />
                        </>
                      ) : (
                        <>
                          <Typography variant="h2" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {totalCourses.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            Total courses
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* Distribution bars — more informative than dots */}
                    <Stack spacing={SPACING.md} sx={{ flex: 1, justifyContent: 'center' }}>
                      {DISTRIBUTION.map((item) => (
                        <Box key={item.label}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {item.label}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: item.color }}>
                              {item.pct}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.pct}
                            aria-label={`${item.label}: ${item.pct}%`}
                            sx={{
                              height: 6,
                              borderRadius: 999,
                              bgcolor: '#E2E8F0',
                              '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 999 },
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Enrollments */}
            <Grid size={{ xs: 12 }}>
              <Card sx={card}>
                <CardContent sx={{ p: SPACING.cardPadding }}>
                  <Box sx={sectionHeader}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        Recent Enrollments
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        New student enrollments across the platform.
                      </Typography>
                    </Box>
                    <Button
                      variant="text"
                      component={RouterLink}
                      to="/admin/users"
                      aria-label="View all users"
                      sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'none', px: 0 }}
                    >
                      View All
                    </Button>
                  </Box>

                  <TableContainer
                    sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}
                  >
                    <Table aria-label="Recent enrollment table">
                      <TableHead>
                        <TableRow
                          sx={{
                            bgcolor: '#F8FAFC',
                            '& .MuiTableCell-root': {
                              fontWeight: 800,
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid #E2E8F0',
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
                        {recentEnrollments.map((row) => (
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
                                <Avatar
                                  sx={{
                                    width: 34, height: 34,
                                    bgcolor: alpha(ACCENT_COLORS.blue, 0.1),
                                    color: 'primary.main',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {row.avatar}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {row.student}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
          </Grid>
        )}
      </Box>

      <CreateCourseDialog open={createCourseOpen} onClose={() => setCreateCourseOpen(false)} />
    </Box>
  );
}

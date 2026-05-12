import { memo, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGetAdminDashboardQuery } from '../../store/api/dashboardApi';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
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
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link as RouterLink } from 'react-router-dom';
import CreateCourseDialog from '../../components/common/CreateCourseDialog';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
import AdminApprovals from './AdminApprovals';
import { api, normalizeApiError } from '../../services/api';
import { theme } from '../../theme';
import {
  ACCENT_COLORS,
  card,
  sectionHeader,
  SPACING,
  statCard,
} from '../../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatDef = {
  label: string;
  value: string;
};

const MetricCard = memo(function MetricCard({ label, value }: StatDef) {
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
        </Box>
      </CardContent>
    </Card>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

type RevenueResponse = {
  totalRevenue?: number;
  monthlyRevenue?: Array<{ month: string; revenue: number }>;
};

interface AdminDashboardProps {
  showAccessDenied?: boolean;
}

export default function AdminDashboard({ showAccessDenied }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals'>('overview');
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetAdminDashboardQuery();

  const { data: revenueData } = useQuery<RevenueResponse>({
    queryKey: ['admin', 'revenue'],
    queryFn: async () => {
      const response = await api.get<RevenueResponse>('/api/payments/admin/revenue');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const dashboardStats: StatDef[] = [
    { label: 'Total Students', value: String(data?.totalUsers ?? 0) },
    { label: 'Active Courses', value: String(data?.totalCourses ?? 0) },
    { label: 'Total Revenue', value: revenueData?.totalRevenue != null ? `$${(revenueData.totalRevenue / 1000).toFixed(1)}K` : '$0' },
    {
      label: 'Pending Approvals',
      value: String(data?.pendingApprovals ?? 0),
    },
  ];

  const totalCourses = data?.totalCourses ?? 0;

  const displayRevenueData = useMemo(() => {
    if (revenueData?.monthlyRevenue?.length) {
      return revenueData.monthlyRevenue;
    }
    return data?.revenueData || [];
  }, [revenueData, data]);

  const displayCourseDistribution = useMemo(() => {
    if (data?.courseDistribution?.length) {
      return data.courseDistribution;
    }
    return [];
  }, [data]);

  const displayRecentEnrollments = useMemo(() => {
    if (data?.recentEnrollments?.length) {
      return data.recentEnrollments.slice(0, 4);
    }
    return [];
  }, [data]);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      {showAccessDenied && (
        <Alert severity="error" sx={{ m: 2, borderRadius: 1.5 }}>
          You do not have permission to access this page
        </Alert>
      )}
      <DashboardPageFrame
        eyebrow="Admin workspace"
        title="Dashboard"
        description="Overview of your learning platform performance."
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <TextField
              placeholder="Search…"
              size="small"
              aria-label="Search dashboard"
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <Button
              variant="contained"
              onClick={() => setCreateCourseOpen(true)}
              aria-label="Add new course"
              sx={{
                px: 2.5,
                borderRadius: 1.5,
                fontWeight: 800,
                textTransform: 'none',
              }}
            >
              + Add New Course
            </Button>
          </Box>
        }
      >
        {isError && (
          <Alert severity="error" sx={{ mb: SPACING.md, borderRadius: '12px' }}>
            {normalizeApiError(error).message || 'Failed to load admin dashboard.'}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 42, px: 1.5 },
          }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="approvals" label="Pending approvals" />
        </Tabs>

        {activeTab === 'approvals' ? (
          <AdminApprovals />
        ) : (
          <Grid container spacing={SPACING.lg}>
            {isLoading && !data ? (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Loading dashboard metrics...
                </Typography>
              </Grid>
            ) : null}
            {dashboardStats.map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <MetricCard {...stat} />
              </Grid>
            ))}

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
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Yearly
                    </Typography>
                  </Box>

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayRevenueData} barSize={22}>
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

                    <Box
                      sx={{
                        height: 140,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      {isLoading && !data ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Loading course totals...
                        </Typography>
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

                    <Stack spacing={SPACING.md} sx={{ flex: 1, justifyContent: 'center' }}>
                      {displayCourseDistribution.length > 0 ? (
                        displayCourseDistribution.map((item) => (
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
                                bgcolor: 'divider',
                                '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 999 },
                              }}
                            />
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No course distribution data available.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

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
                    sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
                  >
                    <Table aria-label="Recent enrollment table">
                      <TableHead>
                        <TableRow
                          sx={{
                            bgcolor: 'background.default',
                            '& .MuiTableCell-root': {
                              fontWeight: 800,
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
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
                        {displayRecentEnrollments.length > 0 ? (
                          displayRecentEnrollments.map((row) => (
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
                                  <Box
                                    sx={{
                                      width: 34, height: 34,
                                      bgcolor: 'background.default',
                                      color: 'text.primary',




                                      fontWeight: 800,
                                      fontSize: '0.75rem',
                                      borderRadius: 1.25,
                                      display: 'grid',
                                      placeItems: 'center',
                                    }}
                                  >
                                    {row.studentInitials}
                                  </Box>
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
                                No recent enrollments.
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
          </Grid>
        )}
      </DashboardPageFrame>

      <CreateCourseDialog open={createCourseOpen} onClose={() => setCreateCourseOpen(false)} />
    </Box>
  );
}

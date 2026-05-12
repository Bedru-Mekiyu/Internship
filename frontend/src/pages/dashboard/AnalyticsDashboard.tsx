import { memo, Suspense, lazy, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ExpandMoreOutlined,
} from '@mui/icons-material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { api, normalizeApiError } from '../../services/api';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';

const AnalyticsRevenueChart = lazy(() => import('../../components/ui/AnalyticsRevenueChart'));

type InstructorDashboardResponse = {
  totalCourses: number;
  totalStudents: number;
  averageCompletionRate: number;
  courses: Array<{
    _id: string;
    title: string;
    enrollmentCount: number;
  }>;
};

type AdminDashboardResponse = {
  totalCourses: number;
  totalEnrollments: number;
  courseDistribution?: Array<{
    label: string;
    pct: number;
  }>;
  recentEnrollments?: Array<{
    status: string;
  }>;
};

type RevenueResponse = {
  totalRevenue: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topCourses?: Array<{
    title: string;
    revenue: number;
  }>;
};

const revenueTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  padding: '10px 12px',
};

function formatMonthLabel(rawMonth: string) {
  if (/^\d{4}-\d{2}$/.test(rawMonth)) {
    const [year, month] = rawMonth.split('-');
    const parsed = new Date(Number(year), Number(month) - 1, 1);
    return parsed.toLocaleString('en-US', { month: 'short' });
  }

  return rawMonth;
}

type StatDef = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

const StatCard = memo(function StatCard({ label, value, change, positive }: StatDef) {
  const changeColor = positive ? '#10B981' : '#EF4444';
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.9, fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
              <Typography variant="body2" sx={{ color: changeColor, fontWeight: 700 }}>
                {change}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState('Last 30 Days');
  const [tab, setTab] = useState(1);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useQuery<InstructorDashboardResponse | AdminDashboardResponse>({
    queryKey: ['analytics-dashboard', user?.role],
    queryFn: async () => {
      const endpoint = isAdmin ? '/api/dashboard/admin' : '/api/dashboard/instructor';
      const response = await api.get<InstructorDashboardResponse | AdminDashboardResponse>(endpoint);
      return response.data;
    },
    enabled: isAdmin || isInstructor,
  });

  const { data: revenueData, error: revenueError, isLoading: revenueLoading } = useQuery<RevenueResponse>({
    queryKey: ['analytics-revenue', user?.role],
    queryFn: async () => {
      const endpoint = isAdmin ? '/api/payments/admin/revenue' : '/api/payments/instructor/revenue';
      const response = await api.get<RevenueResponse>(endpoint);
      return response.data;
    },
    enabled: isAdmin || isInstructor,
  });

  const stats: StatDef[] = useMemo(() => {
    const totalRevenue = revenueData?.totalRevenue ?? 0;

    if (isAdmin) {
      const admin = dashboardData as AdminDashboardResponse | undefined;
      const completedCount = admin?.recentEnrollments?.filter((item) => item.status.toLowerCase() === 'completed').length ?? 0;
      const totalTracked = admin?.recentEnrollments?.length ?? 0;
      const completionRate = totalTracked > 0 ? Math.round((completedCount / totalTracked) * 100) : 0;

      return [
        {
          label: 'Total Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          change: 'Platform-wide',
          positive: true,
        },
        {
          label: 'New Enrollments',
          value: String(admin?.totalEnrollments ?? 0),
          change: 'Across all courses',
          positive: true,
        },
        {
          label: 'Active Courses',
          value: String(admin?.totalCourses ?? 0),
          change: 'Published and draft',
          positive: true,
        },
        {
          label: 'Completion Rate',
          value: `${completionRate}%`,
          change: 'Recent enrollment snapshot',
          positive: completionRate >= 50,
        },
      ];
    }

    const instructor = dashboardData as InstructorDashboardResponse | undefined;
    const completionRate = instructor?.averageCompletionRate ?? 0;
    return [
      {
        label: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: 'From completed payments',
        positive: true,
      },
      {
        label: 'Total Students',
        value: String(instructor?.totalStudents ?? 0),
        change: 'Across your courses',
        positive: true,
      },
      {
        label: 'Active Courses',
        value: String(instructor?.totalCourses ?? 0),
        change: 'Published and draft',
        positive: true,
      },
      {
        label: 'Completion Rate',
        value: `${completionRate}%`,
        change: 'Average learner progress',
        positive: completionRate >= 50,
      },
    ];
  }, [dashboardData, isAdmin, revenueData]);

  const chartRevenueData = useMemo(() => (
    revenueData?.monthlyRevenue?.map((item) => ({
      month: formatMonthLabel(item.month),
      revenue: Number(item.revenue || 0),
    })) ?? []
  ), [revenueData]);

  const enrollmentData = useMemo(() => {
    if (chartRevenueData.length > 0) {
      return chartRevenueData.map((item) => ({
        month: item.month,
        enrollments: Math.max(0, Math.round(item.revenue)),
      }));
    }

    return [];
  }, [chartRevenueData]);

  const topCourses = useMemo(() => {
    if (isAdmin) {
      const admin = dashboardData as AdminDashboardResponse | undefined;
      if (admin?.courseDistribution?.length) {
        return admin.courseDistribution.slice(0, 5).map((item) => ({
          name: item.label,
          completion: item.pct,
          color: '#0066FF',
        }));
      }
      return [];
    }

    const courseRevenue = revenueData?.topCourses ?? [];
    if (!courseRevenue.length) {
      return [];
    }

    const maxRevenue = Math.max(...courseRevenue.map((item) => Number(item.revenue || 0)), 1);
    return courseRevenue.slice(0, 5).map((item, index) => ({
      name: item.title,
      completion: Math.max(1, Math.round((Number(item.revenue || 0) / maxRevenue) * 100)),
      color: index % 2 === 0 ? '#0066FF' : '#8B5CF6',
    }));
  }, [dashboardData, isAdmin, revenueData]);

  const combinedError = dashboardError || revenueError;
  const isLoading = dashboardLoading || revenueLoading;

  const handleExportData = () => {
    if (chartRevenueData.length === 0) {
      setExportMessage({ type: 'error', text: 'No analytics data available to export.' });
      return;
    }

    const csvEscape = (value: string | number) => {
      const raw = String(value ?? '');
      const escaped = raw.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows: string[] = [
      ['Range', range].map(csvEscape).join(','),
      ['Generated At', new Date().toISOString()].map(csvEscape).join(','),
      '',
      ['Stat', 'Value', 'Context'].map(csvEscape).join(','),
      ...stats.map((stat) => [stat.label, stat.value, stat.change].map(csvEscape).join(',')),
      '',
      ['Month', 'Revenue', 'Enrollments'].map(csvEscape).join(','),
      ...chartRevenueData.map((revenuePoint, index) => {
        const enrollmentValue = enrollmentData[index]?.enrollments ?? '';
        return [revenuePoint.month, revenuePoint.revenue, enrollmentValue].map(csvEscape).join(',');
      }),
    ];

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setExportMessage({ type: 'success', text: 'Analytics export downloaded.' });
  };

  return (
    <DashboardPageFrame
      title="Analytics Dashboard"
      description="Track performance metrics, student engagement, and revenue analytics."
      breadcrumbs={isAdmin
        ? [
            { label: 'Dashboard', to: '/admin/dashboard' },
            { label: 'Analytics' },
          ]
        : [
            { label: 'Dashboard', to: '/instructor/dashboard' },
            { label: 'Analytics' },
          ]
      }
    >
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 1.5, sm: 2, md: 2.5 } }}>
      {combinedError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {normalizeApiError(combinedError).message || 'Unable to load analytics right now.'}
        </Alert>
      ) : null}
      {exportMessage ? (
        <Alert severity={exportMessage.type} sx={{ mb: 2 }} onClose={() => setExportMessage(null)}>
          {exportMessage.text}
        </Alert>
      ) : null}

      <Card sx={{ borderRadius: 2, mb: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Tabs
            value={tab}
            onChange={(_, next) => setTab(next)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 42, '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 800 } }}
          >
            <Tab label="Overview" />
            <Tab label="Analytics" />
          </Tabs>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 760 }}>
            Track enrollments, revenue, and student engagement.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              IconComponent={ExpandMoreOutlined}
              sx={{ bgcolor: 'background.paper', borderRadius: 1.5, fontWeight: 700 }}
            >
              <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
              <MenuItem value="This Quarter">This Quarter</MenuItem>
              <MenuItem value="This Year">This Year</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleExportData}
            disabled={isLoading || chartRevenueData.length === 0}
            sx={{
              px: 2.2,
              py: 1.3,
              borderRadius: 1.5,
            }}
          >
            Export Data
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 0.25 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.25 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.75 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    Revenue Overview
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Monthly revenue performance.
                  </Typography>
                </Box>
              </Box>

              <Suspense
                fallback={<Box sx={{ height: 320, borderRadius: 1.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }} />}
              >
                <AnalyticsRevenueChart data={chartRevenueData} />
              </Suspense>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.75 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    Top Courses Completion
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Completion and performance across top courses.
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={1.75}>
                {topCourses.length > 0 ? (
                  topCourses.map((course) => (
                    <Box key={course.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {course.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                          {course.completion}%
                        </Typography>
                      </Box>
                      <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'divider', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${course.completion}%`,
                            height: '100%',
                            borderRadius: 999,
                            bgcolor: course.color,
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {isLoading ? 'Loading top course performance...' : 'No top course performance data yet.'}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    Enrollment Trends
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Enrollment movement over time.
                  </Typography>
                </Box>
              </Box>

              {enrollmentData.length > 0 ? (
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={revenueTooltipStyle}
                        formatter={(value) => [value ?? 0, 'Enrollments']}
                        labelStyle={{ color: '#1E2937', fontWeight: 800 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="enrollments"
                        stroke="#8B5CF6"
                        strokeWidth={4}
                        dot={{ r: 5, fill: '#8B5CF6', stroke: '#FFFFFF', strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 320, display: 'grid', placeItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {isLoading ? 'Loading enrollment trend...' : 'No enrollment trend data available yet.'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </DashboardPageFrame>
  );
}

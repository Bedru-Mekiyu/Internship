import { Suspense, lazy, useState } from 'react';
import {
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
import { alpha } from '@mui/material/styles';
import {
  DownloadOutlined,
  ExpandMoreOutlined,
  SchoolOutlined,
  LeaderboardOutlined,
  TrendingDownOutlined,
  TrendingUpOutlined,
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
import { theme } from '../../theme';
const AnalyticsRevenueChart = lazy(() => import('../../components/ui/AnalyticsRevenueChart'));

const topCourses = [
  { name: 'Advanced React Patterns', completion: 92, color: '#0066FF' },
  { name: 'UI/UX Design Fundamentals', completion: 85, color: '#F59E0B' },
  { name: 'Python for Data Science', completion: 78, color: '#0066FF' },
  { name: 'Digital Marketing Masterclass', completion: 65, color: '#0066FF' },
  { name: 'Introduction to Cyber Security', completion: 54, color: '#EF4444' },
];

const enrollmentData = [
  { month: 'Jan', enrollments: 120 },
  { month: 'Feb', enrollments: 145 },
  { month: 'Mar', enrollments: 158 },
  { month: 'Apr', enrollments: 174 },
  { month: 'May', enrollments: 196 },
  { month: 'Jun', enrollments: 215 },
  { month: 'Jul', enrollments: 238 },
  { month: 'Aug', enrollments: 255 },
  { month: 'Sep', enrollments: 278 },
  { month: 'Oct', enrollments: 301 },
  { month: 'Nov', enrollments: 324 },
  { month: 'Dec', enrollments: 351 },
];

const revenueTooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
  padding: '10px 12px',
};

const stats = [
  {
    label: 'Total Revenue',
    value: '$124,592',
    change: '+12.5% from last month',
    positive: true,
    icon: <TrendingUpOutlined />,
  },
  {
    label: 'New Enrollments',
    value: '1,482',
    change: '+8.2% from last month',
    positive: true,
    icon: <LeaderboardOutlined />,
  },
  {
    label: 'Active Courses',
    value: '248',
    change: '+4 new this month',
    positive: true,
    icon: <SchoolOutlined />,
  },
  {
    label: 'Completion Rate',
    value: '68%',
    change: '-2.1% from last month',
    positive: false,
    icon: <TrendingDownOutlined />,
  },
];


function StatCard({ label, value, change, positive, icon }: (typeof stats)[number]) {
  const changeColor = positive ? '#10B981' : '#EF4444';
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
        border: '1px solid #E2E8F0',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.10)' },
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
              {positive ? <TrendingUpOutlined sx={{ color: '#10B981', fontSize: 18 }} /> : <TrendingDownOutlined sx={{ color: '#EF4444', fontSize: 18 }} />}
              <Typography variant="body2" sx={{ color: changeColor, fontWeight: 700 }}>
                {change}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '14px',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState('Last 30 Days');
  const [tab, setTab] = useState(1);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#F8FAFC', p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
          Analytics
        </Typography>

        <Card sx={{ borderRadius: '16px', mb: 2.5, boxShadow: '0 10px 28px rgba(15,23,42,0.06)', border: '1px solid #E2E8F0' }}>
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
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: '#1E2937' }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: '#64748B', maxWidth: 760 }}>
              Track enrollments, revenue, and student engagement.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select
                value={range}
                onChange={(event) => setRange(event.target.value)}
                IconComponent={ExpandMoreOutlined}
                sx={{ bgcolor: '#FFFFFF', borderRadius: '12px', fontWeight: 700 }}
              >
                <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                <MenuItem value="This Quarter">This Quarter</MenuItem>
                <MenuItem value="This Year">This Year</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<DownloadOutlined />}
              sx={{
                bgcolor: '#0066FF',
                px: 2.2,
                py: 1.3,
                borderRadius: '12px',
                boxShadow: '0 10px 24px rgba(0,102,255,0.22)',
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
                borderRadius: '16px',
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                border: '1px solid #E2E8F0',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.75 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E2937' }}>
                      Revenue Overview
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                      Monthly revenue performance for the current year.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: '999px',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: '#C7D2FE',
                      color: '#0066FF',
                      bgcolor: alpha('#0066FF', 0.04),
                    }}
                  >
                    This Year
                  </Button>
                </Box>

                <Suspense
                  fallback={<Box sx={{ height: 320, borderRadius: '14px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }} />}
                >
                  <AnalyticsRevenueChart />
                </Suspense>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                border: '1px solid #E2E8F0',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.75 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E2937' }}>
                      Top Courses Completion
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                      Completion rates across your highest-performing courses.
                    </Typography>
                  </Box>
                  <Button sx={{ textTransform: 'none', fontWeight: 800, color: '#0066FF', minWidth: 'auto' }}>View All</Button>
                </Box>

                <Stack spacing={1.75}>
                  {topCourses.map((course) => (
                    <Box key={course.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E2937' }}>
                          {course.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748B' }}>
                          {course.completion}%
                        </Typography>
                      </Box>
                      <Box sx={{ height: 10, borderRadius: '999px', bgcolor: '#E2E8F0', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${course.completion}%`,
                            height: '100%',
                            borderRadius: '999px',
                            bgcolor: course.color,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                border: '1px solid #E2E8F0',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E2937' }}>
                      Enrollment Trends
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                      Student enrollment growth is trending upward over time.
                    </Typography>
                  </Box>
                </Box>

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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
}

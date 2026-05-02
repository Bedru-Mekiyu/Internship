import { useState } from 'react';
import { Box, Card, CardContent, Container, Grid, LinearProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import {
  TimelineOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';

interface ProgressData {
  courseId: string;
  courseName: string;
  progress: number;
  lastAccessed: string;
  totalLessons: number;
  completedLessons: number;
}

function ProgressCard({ progress }: { progress: ProgressData }) {
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {progress.courseName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {progress.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'background.default',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: progress.progress === 100 ? 'success.main' : 'primary.main',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {progress.completedLessons} of {progress.totalLessons} lessons
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Last accessed {progress.lastAccessed}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ActivityPage() {
  const [tabValue, setTabValue] = useState(0);
  const [progress] = useState<ProgressData[]>([
    {
      courseId: 'bootcamp-2025',
      courseName: 'Full-Stack Web Development Bootcamp',
      progress: 68,
      lastAccessed: 'Today',
      totalLessons: 25,
      completedLessons: 17,
    },
    {
      courseId: 'python-intro',
      courseName: 'Introduction to Python',
      progress: 100,
      lastAccessed: '3 days ago',
      totalLessons: 12,
      completedLessons: 12,
    },
    {
      courseId: 'typescript-advanced',
      courseName: 'Advanced TypeScript Patterns',
      progress: 15,
      lastAccessed: '2 weeks ago',
      totalLessons: 20,
      completedLessons: 3,
    },
  ]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const inProgressCourses = progress.filter((p) => p.progress > 0 && p.progress < 100);
  const completedCourses = progress.filter((p) => p.progress === 100);

  return (
    <DashboardPageFrame
      title="Activity"
      description="Track your learning journey and see recent activity"
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 56,
                },
              }}
            >
              <Tab icon={<TimelineOutlined />} iconPosition="start" label="In Progress" />
              <Tab
                icon={<WorkspacePremiumOutlined />}
                iconPosition="start"
                label="Completed"
              />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Stack spacing={2}>
              {inProgressCourses.length === 0 ? (
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Stack spacing={2} sx={{ alignItems: 'center' }}>
                      <TimelineOutlined sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        No courses in progress
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', maxWidth: 300 }}
                      >
                        Explore courses to start learning
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={2}>
                  {inProgressCourses.map((item) => (
                    <Grid key={item.courseId} size={{ xs: 12, md: 6 }}>
                      <ProgressCard progress={item} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          )}

          {tabValue === 1 && (
            <Stack spacing={2}>
              {completedCourses.length === 0 ? (
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Stack spacing={2} sx={{ alignItems: 'center' }}>
                      <WorkspacePremiumOutlined
                        sx={{ fontSize: 48, color: 'text.secondary' }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        No completed courses yet
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', maxWidth: 300 }}
                      >
                        Keep learning to earn your first certificate
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={2}>
                  {completedCourses.map((item) => (
                    <Grid key={item.courseId} size={{ xs: 12, md: 6 }}>
                      <ProgressCard progress={item} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </DashboardPageFrame>
  );
}
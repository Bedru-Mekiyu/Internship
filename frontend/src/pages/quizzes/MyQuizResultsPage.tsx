import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  MenuBookOutlined,
  TimerOutlined,
} from '@mui/icons-material';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
import { useGetAllQuizAttemptsQuery } from '../../store/api/quizApi';

interface QuizAttempt {
  id: string;
  quizTitle: string;
  courseName: string;
  courseId?: string;
  courseSlug?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
  grade?: 'excellent' | 'good' | 'pass' | 'fail';
  quizId: string;
}

interface ApiQuizAttempt {
  _id: string;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  quiz?: {
    _id: string;
    title: string;
    totalPoints?: number;
    questionCount?: number;
    course?: {
      _id?: string;
      title: string;
      slug?: string;
    };
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getGradeColor(grade?: string): string {
  switch (grade) {
    case 'excellent':
      return '#10B981';
    case 'good':
      return '#3B82F6';
    case 'pass':
      return '#F59E0B';
    case 'fail':
      return '#EF4444';
    default:
      return '#64748B';
  }
}

function getGradeLabel(grade?: string): string {
  switch (grade) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'pass':
      return 'Pass';
    case 'fail':
      return 'Needs Improvement';
    default:
      return '';
  }
}

function QuizAttemptCard({ attempt }: { attempt: QuizAttempt }) {
  const navigate = useNavigate();
  const courseIdentifier = attempt.courseSlug || attempt.courseId;

  const openCourse = () => {
    if (courseIdentifier) {
      navigate(`/courses/${courseIdentifier}/details`);
    }
  };

  const handleOpenCourse = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCourse();
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: attempt.passed ? 'success.main' : 'error.main',
        cursor: courseIdentifier ? 'pointer' : 'default',
        transition: 'all 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        },
      }}
      onClick={openCourse}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
              <Chip
                label={attempt.passed ? 'Passed' : 'Failed'}
                size="small"
                color={attempt.passed ? 'success' : 'error'}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={getGradeLabel(attempt.grade)}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: `${getGradeColor(attempt.grade)}15`,
                  color: getGradeColor(attempt.grade),
                }}
              />
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              {attempt.quizTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {attempt.courseName}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              variant="determinate"
              value={attempt.score}
              size={64}
              thickness={4}
              sx={{
                color: attempt.passed ? 'success.main' : 'error.main',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
              {attempt.score}%
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Correct Answers
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {attempt.correctAnswers} / {attempt.totalQuestions}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Raw Score
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {attempt.score}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Completed
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatDate(attempt.completedAt)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<MenuBookOutlined />}
            onClick={handleOpenCourse}
            disabled={!courseIdentifier}
          >
            Open Course
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MyQuizResultsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const { data: quizAttempts = [], isLoading: isLoadingAttempts } = useGetAllQuizAttemptsQuery();

  const apiAttempts: QuizAttempt[] = (quizAttempts ?? []).map((attempt: ApiQuizAttempt) => {
    const totalQuestions = Math.max(0, Number(attempt.quiz?.questionCount || 0));
    const percentage = Math.round(Number(attempt.percentage || 0));

    return {
      id: attempt._id,
      quizTitle: attempt.quiz?.title || 'Quiz',
      courseName: attempt.quiz?.course?.title || 'Course',
      courseId: attempt.quiz?.course?._id,
      courseSlug: attempt.quiz?.course?.slug,
      score: percentage,
      totalQuestions,
      correctAnswers: totalQuestions > 0 ? Math.round((percentage / 100) * totalQuestions) : 0,
      passed: attempt.passed,
      completedAt: attempt.submittedAt,
      quizId: attempt.quiz?._id || '',
      grade: percentage >= 90 ? 'excellent' : percentage >= 75 ? 'good' : percentage >= 60 ? 'pass' : 'fail',
    };
  });

  const filteredAttempts = isLoadingAttempts ? [] : apiAttempts.filter(
    (attempt) => statusFilter === 'all' || (statusFilter === 'passed' ? attempt.passed : !attempt.passed)
  );

  const totalAttempts = apiAttempts.length;
  const passedAttempts = apiAttempts.filter((a) => a.passed).length;
  const averageScore = totalAttempts > 0
    ? Math.round(apiAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
    : 0;

  const overallProgress = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

  return (
    <DashboardPageFrame
      title="Quiz Results"
      description="Review your quiz attempts and track your learning progress"
      breadcrumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Quiz Results' },
      ]}
    >
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#FFF',
                    }}
                  >
                    <MenuBookOutlined />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {totalAttempts}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Quizzes
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'success.main',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#FFF',
                    }}
                  >
                    <CheckCircleOutlined />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {passedAttempts}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Passed
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'info.main',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#FFF',
                    }}
                  >
                    <TimerOutlined />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {averageScore}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Average Score
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Overall Progress
            </Typography>
            <Box sx={{ mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    bgcolor: 'success.main',
                  },
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {passedAttempts} of {totalAttempts} quizzes passed ({Math.round(overallProgress)}%)
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1}>
                {(['all', 'passed', 'failed'] as const).map((status) => (
                  <Chip
                    key={status}
                    label={status === 'all' ? 'All' : status === 'passed' ? 'Passed' : 'Failed'}
                    onClick={() => setStatusFilter(status)}
                    color={statusFilter === status ? 'primary' : 'default'}
                    sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                  />
                ))}
              </Stack>
            </Box>

            {filteredAttempts.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  No {statusFilter === 'all' ? '' : statusFilter} quizzes found.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} sx={{ p: 2 }}>
                {filteredAttempts.map((attempt) => (
                  <QuizAttemptCard key={attempt.id} attempt={attempt} />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </DashboardPageFrame>
  );
}

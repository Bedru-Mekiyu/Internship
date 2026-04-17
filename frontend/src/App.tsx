import { lazy, Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  BrowserRouter,
  Link as RouterLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  Container,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  GitHub,
  KeyOutlined,
  MailOutlined,
  PersonOutlined,
  BadgeOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api, ensureCsrfToken, normalizeApiError } from './services/api';
import ThemeRouteProvider from './components/common/ThemeRouteProvider';
import { createAuthenticatedSocket } from './services/realtimeSocket';
import { theme } from './theme';
import LearnSpaceShell from './routes/LearnSpaceShell';
import type { LearnSpaceRole, PageProps } from './routes/learnSpaceNavigation';
import { getLandingRouteForRole } from './routes/learnSpaceNavigation';

const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetailPage'));
const ExploreCourses = lazy(() => import('./pages/courses/ExploreCourses'));
const CreateCourse = lazy(() => import('./pages/courses/CreateCourse'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const Messages = lazy(() => import('./pages/dashboard/Messages'));
const CourseDiscussions = lazy(() => import('./pages/courses/CourseDiscussions'));
const MediaLibrary = lazy(() => import('./pages/cms/MediaLibrary'));
const QuizTaker = lazy(() => import('./pages/courses/QuizTaker'));
const MyCertificates = lazy(() => import('./pages/dashboard/MyCertificates'));
const AdminNotifications = lazy(() => import('./pages/dashboard/AdminNotifications'));
const BlogPostEditor = lazy(() => import('./pages/cms/BlogPostEditor'));
const ContentManager = lazy(() => import('./pages/cms/ContentManager'));
const UploadLesson = lazy(() => import('./pages/cms/UploadLesson'));
const UserManagement = lazy(() => import('./pages/dashboard/UserManagement'));
const AnalyticsDashboard = lazy(() => import('./pages/dashboard/AnalyticsDashboard'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const ContactUs = lazy(() => import('./pages/main/ContactUs'));
const MyCourses = lazy(() => import('./pages/dashboard/MyCourses'));
const CoursePlayer = lazy(() => import('./pages/courses/CoursePlayer'));
const PricingPage = lazy(() => import('./pages/main/PricingPage'));
const InstructorDashboard = lazy(() => import('./pages/dashboard/InstructorDashboard'));
const CheckoutPage = lazy(() => import('./pages/courses/CheckoutPage'));
const SystemSettings = lazy(() => import('./pages/dashboard/SystemSettings'));
const ProfileSettings = lazy(() => import('./pages/dashboard/ProfileSettings'));

function RequireSession() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Loading LearnSpace
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Preparing your session...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}

function RequireRole({ allowedRoles }: { allowedRoles: LearnSpaceRole[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Loading LearnSpace
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Checking access...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getLandingRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
}

function PageFrame({ title, description, eyebrow, actionLabel, actionTo, children }: PageProps) {
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={1.5}>
            {eyebrow ? (
              <Chip
                label={eyebrow}
                sx={{ alignSelf: 'flex-start' }}
                color="primary"
                variant="filled"
              />
            ) : null}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {title}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 760 }}>
                  {description}
                </Typography>
              </Box>
              {actionLabel && actionTo ? (
                <Button component={RouterLink} to={actionTo} variant="contained">
                  {actionLabel}
                </Button>
              ) : null}
            </Box>
          </Stack>
        </CardContent>
      </Card>
      {children}
    </Stack>
  );
}

function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  }

  if (user?.role === 'content_manager') {
    return <Navigate to="/cms/content" replace />;
  }

  return <StudentDashboard />;
}

function PlaceholderPage({ title, description, actionLabel, actionTo, eyebrow }: PageProps) {
  return (
    <PageFrame
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionTo={actionTo}
      eyebrow={eyebrow}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Experience ready
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  This page is wired into the LearnSpace layout, theme, and route structure so it can be
                  replaced with a full production page without changing the shell.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="MUI v5" />
                  <Chip label="React Router" />
                  <Chip label="Recharts" />
                  <Chip label="Design system locked" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Next step
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Hook this route to the backend API endpoint and swap in the real Figma-driven page
                  component.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageFrame>
  );
}

function BlogLandingPage() {
  const articles = [
    {
      title: 'How to launch a course that feels premium from day one',
      category: 'Product',
      readTime: '6 min read',
    },
    {
      title: 'Why clean dashboards improve learner completion rates',
      category: 'Analytics',
      readTime: '4 min read',
    },
    {
      title: 'Building a community loop inside your learning product',
      category: 'Community',
      readTime: '5 min read',
    },
  ];

  return (
    <PageFrame
      eyebrow="Blog"
      title="LearnSpace Blog"
      description="Product updates, teaching strategies, and practical guidance for teams building modern learning experiences."
      actionLabel="Explore courses"
      actionTo="/courses/explore"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%', overflow: 'hidden' }}>
            <Box
              sx={{
                minHeight: 320,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 55%, #6366F1 100%)',
                color: '#FFFFFF',
              }}
            >
              <Stack spacing={1.5} sx={{ maxWidth: 520 }}>
                <Chip label="Featured story" sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.16)', color: '#FFFFFF', fontWeight: 700 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                  Designing a learning platform people actually want to return to
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.84)', lineHeight: 1.8 }}>
                  Explore the product thinking behind LearnSpace and the patterns that make content feel clear, modern, and easy to complete.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap' }}>
                {['UX', 'Analytics', 'Retention'].map((tag) => (
                  <Chip key={tag} label={tag} sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#FFFFFF', fontWeight: 700 }} />
                ))}
              </Stack>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            {articles.map((article) => (
              <Card key={article.title} sx={{ border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.05)' }}>
                <CardContent sx={{ p: 2.25 }}>
                  <Stack spacing={1}>
                    <Chip label={article.category} size="small" sx={{ alignSelf: 'flex-start' }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {article.readTime}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </PageFrame>
  );
}

function LearnSpaceBrandMark() {
  return (
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: 3,
        bgcolor: 'primary.main',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 10px 24px rgba(0, 102, 255, 0.22)',
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        sx={{ width: 28, height: 28, color: '#FFFFFF' }}
      >
        <path
          fill="currentColor"
          d="M12 2.5 5 5.25v5.53c0 4.52 2.95 8.57 7 10.22 4.05-1.65 7-5.7 7-10.22V5.25L12 2.5Zm0 6.5a1.5 1.5 0 0 1 1.5 1.5v.75h1.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-4a.75.75 0 0 1 .75-.75H10v-.75A1.5 1.5 0 0 1 12 9Zm0 1.5a.5.5 0 0 0-.5.5v.75h1v-.75a.5.5 0 0 0-.5-.5Zm-1.75 2.5v2.5h3.5V13h-3.5Z"
        />
        <path
          fill="currentColor"
          opacity="0.95"
          d="M6.5 12.5c0-1.1.9-2 2-2h1.5v1.5H8.5a.5.5 0 0 0-.5.5v4.5c0 .28.22.5.5.5h7c.28 0 .5-.22.5-.5V12.5a.5.5 0 0 0-.5-.5H14V10.5h1.5c1.1 0 2 .9 2 2v4.5c0 1.1-.9 2-2 2h-7c-1.1 0-2-.9-2-2v-4.5Z"
        />
      </Box>
    </Box>
  );
}

function GoogleIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      sx={{ width: 18, height: 18, flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.95h5.62c-.24 1.25-1 2.32-2.07 3.04v2.52h3.35c1.96-1.8 3.1-4.46 3.1-7.64 0-.74-.07-1.46-.2-2.13H12Z"
      />
      <path
        fill="#4285F4"
        d="M12 23c2.64 0 4.85-.88 6.47-2.39l-3.35-2.52c-.93.63-2.11 1.01-3.12 1.01-2.4 0-4.43-1.62-5.16-3.8H3.35v2.6A10 10 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M6.84 15.3a6 6 0 0 1 0-3.6v-2.6H3.35a10 10 0 0 0 0 8.8l3.49-2.6Z"
      />
      <path
        fill="#34A853"
        d="M12 5.02c1.44 0 2.73.5 3.75 1.47l2.81-2.81A9.66 9.66 0 0 0 12 1a10 10 0 0 0-8.65 5.7l3.49 2.6C7.57 6.64 9.6 5.02 12 5.02Z"
      />
    </Box>
  );
}

function LegacyResetPasswordRedirect() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const to = token
    ? `/auth/reset-password?token=${encodeURIComponent(token)}`
    : '/auth/reset-password';
  return <Navigate to={to} replace />;
}

function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';

  const [activeStep, setActiveStep] = useState<'request' | 'new-password'>(() =>
    tokenFromUrl ? 'new-password' : 'request',
  );
  const [requestEmail, setRequestEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resetError, setResetError] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setActiveStep('new-password');
    }
  }, [tokenFromUrl]);

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setForgotError('');
    setRequestSubmitting(true);
    try {
      await ensureCsrfToken();
      await api.post('/api/auth/forgot-password', { email: requestEmail.trim().toLowerCase() });
      setShowSuccessBanner(true);
    } catch (error) {
      setForgotError(normalizeApiError(error).message);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleSetNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetError('');
    if (!tokenFromUrl) {
      setResetError('Open the reset link from your email, or request a new reset above.');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetSubmitting(true);
    try {
      await ensureCsrfToken();
      await api.post('/api/auth/reset-password', { token: tokenFromUrl, password: newPassword });
      navigate('/auth/login', { replace: true });
    } catch (error) {
      setResetError(normalizeApiError(error).message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const getCardStyle = (step: 'request' | 'new-password') => ({
    border: activeStep === step ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
    boxShadow: activeStep === step ? '0 12px 30px rgba(0,102,255,0.08)' : '0 4px 20px rgba(0,0,0,0.06)',
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, md: 6 },
        background: `radial-gradient(circle at 15% 12%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 28%), radial-gradient(circle at 85% 18%, ${alpha(theme.palette.success.main, 0.08)}, transparent 24%), linear-gradient(180deg, #FFFFFF 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto' }}>
        <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Card sx={{ borderRadius: 4, ...getCardStyle('request'), height: '100%' }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
                  <Stack spacing={2.25}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <KeyOutlined />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}>
                        STEP 1: REQUEST RESET
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                        Forgot password?
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
                        No worries, we&apos;ll send you reset instructions.
                      </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleResetRequest}>
                      <Stack spacing={2}>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 18,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 1,
                              pointerEvents: 'none',
                              color: 'text.secondary',
                            }}
                          >
                            <MailOutlined fontSize="small" />
                          </Box>
                          <TextField
                            value={requestEmail}
                            onChange={(event) => setRequestEmail(event.target.value)}
                            placeholder="Enter your email"
                            label="Email Address"
                            sx={{
                              '& .MuiOutlinedInput-root': { pl: 5.5 },
                            }}
                          />
                        </Box>

                        {forgotError ? (
                          <Alert severity="error" sx={{ borderRadius: 3 }}>
                            {forgotError}
                          </Alert>
                        ) : null}

                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          disabled={requestSubmitting}
                          sx={{
                            bgcolor: 'primary.main',
                            color: '#FFFFFF',
                            py: 1.6,
                            fontSize: 16,
                            '&:hover': { bgcolor: 'primary.dark' },
                          }}
                        >
                          {requestSubmitting ? 'Sending…' : 'Send reset link'}
                        </Button>

                        <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'primary.main', fontWeight: 600, alignSelf: 'center' }}>
                          ← Back to log in
                        </Link>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {showSuccessBanner ? (
                <Alert
                  icon={<CheckCircleOutlined />}
                  severity="success"
                  sx={{
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.success.main, 0.08),
                    color: 'text.primary',
                    border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`,
                    alignItems: 'flex-start',
                    '& .MuiAlert-icon': { color: 'success.main', mt: 0.3 },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    Check your email
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                    We have sent a password reset link to {requestEmail || 'user@example.com'}.
                  </Typography>
                </Alert>
              ) : null}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 4, ...getCardStyle('new-password'), height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.25, sm: 2.75, md: 3.25 } }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LockOutlined />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}>
                      STEP 2: SET NEW PASSWORD
                    </Typography>
                  </Box>

                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                      Set new password
                    </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, color: 'text.secondary' }}>
                      Your new password must be different to previously used passwords.
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSetNewPassword}>
                    <Stack spacing={1.75}>
                      {resetError ? (
                        <Alert severity="error" sx={{ borderRadius: 3 }}>
                          {resetError}
                        </Alert>
                      ) : null}
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 18,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1,
                            pointerEvents: 'none',
                            color: 'text.secondary',
                          }}
                        >
                          <LockOutlined fontSize="small" />
                        </Box>
                        <TextField
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="New password"
                          label="New password"
                          type="password"
                          helperText="Must be at least 8 characters."
                          sx={{
                            '& .MuiOutlinedInput-root': { pl: 5.5 },
                          }}
                        />
                      </Box>

                      <Box sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 18,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1,
                            pointerEvents: 'none',
                            color: 'text.secondary',
                          }}
                        >
                          <LockOutlined fontSize="small" />
                        </Box>
                        <TextField
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Confirm new password"
                          label="Confirm new password"
                          type="password"
                          sx={{
                            '& .MuiOutlinedInput-root': { pl: 5.5 },
                          }}
                        />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={resetSubmitting}
                        sx={{
                          bgcolor: 'primary.main',
                          color: '#FFFFFF',
                          py: 1.6,
                          fontSize: 16,
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        {resetSubmitting ? 'Updating…' : 'Set new password'}
                      </Button>

                      <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'primary.main', fontWeight: 600, alignSelf: 'center' }}>
                        ← Back to log in
                      </Link>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function PublicAuthPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getLandingRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(formValues);
      navigate(getLandingRouteForRole(authenticatedUser.role), { replace: true });
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Loading LearnSpace
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Preparing authentication...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getLandingRouteForRole(user.role)} replace />;
  }

  const updateField = (field: keyof typeof formValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2.25,
        py: 3.25,
        background: `radial-gradient(circle at 15% 12%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 28%), radial-gradient(circle at 85% 18%, ${alpha(theme.palette.secondary.main, 0.08)}, transparent 24%), linear-gradient(180deg, #FFFFFF 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0',
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, sm: 2.75, md: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <LearnSpaceBrandMark />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Welcome back
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
                Enter your credentials to access your courses
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.75}>
                <TextField
                  value={formValues.email}
                  onChange={updateField('email')}
                  placeholder="name@example.com"
                  label="Email"
                  type="email"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Typography component="label" htmlFor="password" variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Password
                  </Typography>
                  <Link component={RouterLink} to="/auth/reset-password" underline="none" sx={{ color: 'primary.main', fontWeight: 600, fontSize: 14 }}>
                    Forgot password?
                  </Link>
                </Box>
                <TextField
                  value={formValues.password}
                  onChange={updateField('password')}
                  placeholder="••••••••"
                  id="password"
                  type="password"
                />

                {errorMessage ? (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {errorMessage}
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    py: 1.6,
                    fontSize: 16,
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ color: 'text.secondary', '&::before, &::after': { borderColor: '#E2E8F0' } }}>
              <Typography variant="caption" sx={{ letterSpacing: '0.14em', fontWeight: 700, color: 'text.secondary' }}>
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Tooltip title="Coming soon">
                <span style={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled
                    startIcon={<GitHub />}
                    sx={{ py: 1.35, borderColor: '#CBD5E1', color: 'text.primary' }}
                  >
                    GitHub
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Coming soon">
                <span style={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled
                    startIcon={<GoogleIcon />}
                    sx={{ py: 1.35, borderColor: '#CBD5E1', color: 'text.primary' }}
                  >
                    Google
                  </Button>
                </span>
              </Tooltip>
            </Stack>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/auth/signup" underline="none" sx={{ color: 'primary.main', fontWeight: 700 }}>
                Sign up
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function SignupAuthPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student');
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getLandingRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const updateField = (field: keyof typeof formValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const isStudent = activeTab === 'student';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const nameParts = formValues.fullName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      setErrorMessage('Enter both a first and last name.');
      setIsSubmitting(false);
      return;
    }

    const [firstName, ...rest] = nameParts;
    const lastName = rest.join(' ');

    try {
      await register({
        firstName,
        lastName,
        email: formValues.email,
        password: formValues.password,
        role: isStudent ? 'student' : 'instructor',
      });

      navigate('/auth/login', { replace: true });
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Loading LearnSpace
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Preparing authentication...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getLandingRouteForRole(user.role)} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2.25,
        py: 3.25,
        background: `radial-gradient(circle at 15% 12%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 28%), radial-gradient(circle at 85% 18%, ${alpha(theme.palette.secondary.main, 0.08)}, transparent 24%), linear-gradient(180deg, #FFFFFF 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0',
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, sm: 2.75, md: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <LearnSpaceBrandMark />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Create an account
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
                Start your learning journey today
              </Typography>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value as 'student' | 'instructor')}
              variant="fullWidth"
              sx={{
                minHeight: 48,
                backgroundColor: '#F1F5F9',
                borderRadius: 999,
                p: 0.5,
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  minHeight: 40,
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                  flex: 1,
                  transition: 'all 160ms ease',
                },
                '& .MuiTab-root.Mui-selected': {
                  backgroundColor: '#EAF2FF',
                  color: 'primary.main',
                },
              }}
            >
              <Tab icon={<PersonOutlined fontSize="small" />} iconPosition="start" label="Student" value="student" />
              <Tab icon={<BadgeOutlined fontSize="small" />} iconPosition="start" label="Instructor" value="instructor" />
            </Tabs>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.75}>
                <TextField
                  value={formValues.fullName}
                  onChange={updateField('fullName')}
                  placeholder="Jane Doe"
                  label="Full Name"
                />
                <TextField
                  value={formValues.email}
                  onChange={updateField('email')}
                  placeholder="jane@example.com"
                  label="Email Address"
                  type="email"
                />
                <TextField
                  value={formValues.password}
                  onChange={updateField('password')}
                  placeholder="Create a password"
                  label="Password"
                  type="password"
                />

                {errorMessage ? (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {errorMessage}
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    py: 1.6,
                    fontSize: 16,
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 1.7 }}>
              By clicking continue, you agree to our{' '}
              <Link component={RouterLink} to="/terms" underline="none" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Privacy Policy
              </Link>
            </Typography>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'primary.main', fontWeight: 700 }}>
                Log in
              </Link>
            </Typography>

            <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {isStudent ? 'Student onboarding selected' : 'Instructor onboarding selected'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function MarketingHomepagePage() {
  const navLinks = [
    { label: 'Features', to: '#features' },
    { label: 'Courses', to: '#courses' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Blog', to: '/blog' },
    { label: 'About Us', to: '#about' },
  ];

  const trustPartners = ['ASU', 'Meta', 'Notion', 'Khan Academy', 'Udacity'];

  const features = [
    {
      title: 'Drag & Drop Builder',
      description: 'Create lessons, modules, and landing pages with a flexible visual editor.',
      color: '#DBEAFE',
    },
    {
      title: 'Advanced Analytics',
      description: 'Track enrollments, completion rates, and revenue with clear reporting.',
      color: '#E0E7FF',
    },
    {
      title: 'Community Hub',
      description: 'Keep learners engaged with discussions, Q&A, and cohort updates.',
      color: '#DCFCE7',
    },
    {
      title: 'Mobile Ready',
      description: 'Deliver a polished experience on every screen, from desktop to phone.',
      color: '#FDE68A',
    },
    {
      title: 'Certification',
      description: 'Reward course completion with branded certificates that learners value.',
      color: '#FCE7F3',
    },
    {
      title: 'Seamless Payments',
      description: 'Collect one-time or subscription payments with flexible pricing options.',
      color: '#FFE4E6',
    },
  ];

  const courses = [
    {
      title: 'Product Design Fundamentals',
      instructor: 'Ava Chen',
      rating: '4.9',
      price: '$49',
      category: 'Design',
      image:
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Modern JavaScript Mastery',
      instructor: 'Noah Patel',
      rating: '4.8',
      price: '$79',
      category: 'Development',
      image:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Data Storytelling for Teams',
      instructor: 'Mia Johnson',
      rating: '5.0',
      price: '$59',
      category: 'Analytics',
      image:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Leadership for Creators',
      instructor: 'Jordan Lee',
      rating: '4.7',
      price: '$39',
      category: 'Leadership',
      image:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const testimonials = [
    {
      name: 'Sara Williams',
      role: 'Learning Ops Lead',
      quote:
        'LearnSpace helped our team launch a premium training program without stitching together six tools.',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Daniel Kim',
      role: 'Course Creator',
      quote:
        'The dashboard, payments, and certificates all feel polished. It looks like a product built for scale.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Priya Shah',
      role: 'Instructional Designer',
      quote:
        'The experience is clean, responsive, and easy to teach with. Our learners adopted it instantly.',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const pricing = [
    {
      name: 'Basic',
      price: '$0',
      description: 'For trying out the platform and launching your first course.',
      features: ['1 course', 'Basic analytics', 'Community access', 'Email support'],
      featured: false,
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For creators who want to scale with confidence and better insights.',
      features: ['Unlimited courses', 'Advanced analytics', 'Certificates', 'Payments', 'Priority support'],
      featured: true,
    },
    {
      name: 'Business',
      price: '$99',
      description: 'For teams, academies, and organizations that need full control.',
      features: ['Everything in Pro', 'Team roles', 'Custom branding', 'Dedicated onboarding'],
      featured: false,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#FFFFFF', color: 'text.primary' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha('#FFFFFF', 0.94), backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  bgcolor: 'primary.main',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 10px 20px rgba(0,102,255,0.18)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                }}
              >
                LS
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                LearnSpace
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              {navLinks.map((item) => (
                item.to.startsWith('#') ? (
                  <Link key={item.label} href={item.to} underline="none" sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
                    {item.label}
                  </Link>
                ) : (
                  <Link key={item.label} component={RouterLink} to={item.to} underline="none" sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
                    {item.label}
                  </Link>
                )
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Log in
              </Link>
              <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 3, py: 1.2 }}>
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ pt: { xs: 4.5, md: 6 }, pb: { xs: 5, md: 8 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={1.5}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
                  MODERN LEARNING PLATFORM
                </Typography>
                <Typography variant="h1" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.04em', fontSize: { xs: '3rem', md: '4.5rem' }, lineHeight: 1.03 }}>
                  Unlock Potential with Modern Learning
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 640, fontWeight: 500, lineHeight: 1.7 }}>
                  LearnSpace gives educators and teams everything they need to launch engaging courses, grow communities,
                  and measure outcomes with beautiful analytics.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 3.25, py: 1.25 }}>
                    Get Started
                  </Button>
                  <Button component={RouterLink} to="/courses/explore" variant="outlined" sx={{ px: 3.25, py: 1.25, borderColor: '#CBD5E1', color: 'text.primary' }}>
                    Explore courses
                  </Button>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 6,
                  p: { xs: 1.1, md: 1.75 },
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.12)',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box
                  sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    bgcolor: '#0B1120',
                    color: '#FFFFFF',
                    p: 1,
                    backgroundImage:
                      'radial-gradient(circle at top left, rgba(59,130,246,0.20), transparent 34%), radial-gradient(circle at bottom right, rgba(16,185,129,0.16), transparent 30%), linear-gradient(180deg, #0B1120 0%, #111B34 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.6 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#EF4444' }} />
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#10B981' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>LearnSpace</Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', letterSpacing: '0.12em' }}>
                          LIVE DASHBOARD
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.45,
                        borderRadius: 999,
                        bgcolor: 'rgba(16,185,129,0.12)',
                        color: '#BBF7D0',
                        fontSize: 11,
                        fontWeight: 800,
                        border: '1px solid rgba(16,185,129,0.14)',
                      }}
                    >
                      Live
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 0.82fr' }, gap: 1.1 }}>
                    <Box
                      sx={{
                        borderRadius: 4,
                        p: 1.5,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#93C5FD', letterSpacing: '0.14em', fontWeight: 800 }}>
                        ENROLLMENTS
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 1, mt: 0.4, mb: 1.4 }}>
                        <Box>
                          <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em' }}>
                            12.4k
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.4 }}>
                            Monthly learners across active courses.
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 999,
                            bgcolor: 'rgba(59,130,246,0.14)',
                            color: '#DBEAFE',
                            fontSize: 12,
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          +18% this month
                        </Box>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.75 }}>
                        {[
                          { label: 'Completion', value: '86%' },
                          { label: 'Retention', value: '92%' },
                          { label: 'Revenue', value: '$48k' },
                        ].map((item) => (
                          <Box
                            key={item.label}
                            sx={{
                              borderRadius: 3,
                              px: 1,
                              py: 0.9,
                              bgcolor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{item.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        borderRadius: 4,
                        p: 1.5,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#94A3B8', letterSpacing: '0.14em', fontWeight: 800 }}>
                        REVENUE
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1, mt: 0.4 }}>
                        $48k
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.4, mb: 1.3 }}>
                        Last 30 days
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.8, height: 102, mb: 1.2 }}>
                        {[32, 46, 38, 58, 52, 68].map((value, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              height: "${value}%",
                              borderRadius: 999,
                              background:
                                index % 2 === 0
                                  ? 'linear-gradient(180deg, #60A5FA 0%, #2563EB 100%)'
                                  : 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
                              boxShadow: '0 12px 20px rgba(79,70,229,0.16)',
                            }}
                          />
                        ))}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          pt: 1,
                          borderTop: '1px solid rgba(255,255,255,0.08)',
                          color: '#94A3B8',
                          fontSize: 12,
                        }}
                      >
                        <span>Updated 2m ago</span>
                        <span>+12.8% week over week</span>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 2.5, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            {trustPartners.map((partner) => (
              <Box
                key={partner}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 999,
                  border: '1px solid #E2E8F0',
                  color: 'text.secondary',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  bgcolor: '#FFFFFF',
                }}
              >
                {partner}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="features" sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
                FEATURES
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
                Everything you need to teach online
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {features.map((feature) => (
                <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2.25 }}>
                      <Stack spacing={1.5}>
                        <Avatar sx={{ bgcolor: feature.color, color: 'text.primary', fontWeight: 800, width: 48, height: 48 }}>
                          {feature.title[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.7 }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Box id="courses" sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25}>
            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
                  POPULAR COURSES
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
                  Popular Courses
                </Typography>
              </Box>
              <Button component={RouterLink} to="/courses/explore" variant="outlined" sx={{ px: 3, py: 1.3, borderColor: '#CBD5E1' }}>
                Explore all courses
              </Button>
            </Box>

            <Grid container spacing={2}>
              {courses.map((course) => (
                <Grid key={course.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={{ height: '100%', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: 190,
                        backgroundImage: "linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.28)), url({course.image})",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 999,
                            bgcolor: 'rgba(255,255,255,0.18)',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          {course.category}
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2.25 }}>
                      <Stack spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          by {course.instructor}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            ★ {course.rating}
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
                            {course.price}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Box id="testimonials" sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
                TESTIMONIALS
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
                Loved by students and teachers
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {testimonials.map((item) => (
                <Grid key={item.name} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2.25 }}>
                      <Stack spacing={1.75}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={item.avatar} alt={item.name} sx={{ width: 52, height: 52 }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {item.role}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                          “{item.quote}”
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Box id="pricing" sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
                PRICING
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
                Simple, transparent pricing
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {pricing.map((plan) => (
                <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      borderColor: plan.featured ? 'primary.main' : '#E2E8F0',
                      boxShadow: plan.featured ? '0 18px 42px rgba(0,102,255,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
                      borderWidth: plan.featured ? 2 : 1,
                    }}
                  >
                    <CardContent sx={{ p: 2.25 }}>
                      <Stack spacing={1.75}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {plan.name}
                          </Typography>
                          {plan.featured ? (
                            <Box sx={{ px: 1.5, py: 0.75, borderRadius: 999, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: 12, fontWeight: 700 }}>
                              Most popular
                            </Box>
                          ) : null}
                        </Box>
                        <Box>
                          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                            {plan.price}
                            <Typography component="span" variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              /mo
                            </Typography>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.7 }}>
                            {plan.description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          {plan.features.map((feature) => (
                            <Typography key={feature} variant="body2" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                              {feature}
                            </Typography>
                          ))}
                        </Box>
                        <Button component={RouterLink} to="/auth/signup" variant={plan.featured ? 'contained' : 'outlined'} fullWidth sx={{ py: 1.4 }}>
                          Get Started
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, background: 'linear-gradient(135deg, #5B3DF5 0%, #6D28D9 100%)', color: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                Ready to launch your online academy?
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.75, fontWeight: 500, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>
                Build, sell, and scale your learning experience from one clean platform.
              </Typography>
            </Box>
            <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ bgcolor: '#FFFFFF', color: '#5B3DF5', px: 3.25, py: 1.15, '&:hover': { bgcolor: '#F8FAFC' } }}>
              Get Started for Free
            </Button>
          </Box>
        </Container>
      </Box>

      <Box id="about" sx={{ py: { xs: 7, md: 9 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                    LS
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    LearnSpace
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320, lineHeight: 1.8 }}>
                  A modern EdTech LMS for creators, instructors, and teams who need a polished learning experience.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Product
                    </Typography>
                    {[
                      { label: 'Features', to: '#features' },
                      { label: 'Courses', to: '#courses' },
                      { label: 'Pricing', to: '#pricing' },
                      { label: 'Testimonials', to: '#testimonials' },
                    ].map((item) => (
                      <Link key={item.label} href={item.to} underline="none" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                        {item.label}
                      </Link>
                    ))}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Company
                    </Typography>
                    {[
                      { label: 'About Us', to: '/about' },
                      { label: 'Blog', to: '/blog' },
                      { label: 'Careers', to: '/careers' },
                    ].map((item) => (
                      <Link key={item.label} component={RouterLink} to={item.to} underline="none" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                        {item.label}
                      </Link>
                    ))}
                    <Link component={RouterLink} to="/contact" underline="none" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                      Contact
                    </Link>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Resources
                    </Typography>
                    {[
                      { label: 'Help Center', to: '/help-center' },
                      { label: 'Docs', to: '/docs' },
                      { label: 'Community', to: '/community' },
                      { label: 'Status', to: '/status' },
                    ].map((item) => (
                      <Link key={item.label} component={RouterLink} to={item.to} underline="none" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                        {item.label}
                      </Link>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #E2E8F0' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © 2026 LearnSpace. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
function NotificationSocketBridge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socket = createAuthenticatedSocket();
    if (!socket) {
      return undefined;
    }

    const onNotification = () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
    };

    socket.on('notification:new', onNotification);
    socket.connect();

    return () => {
      socket.off('notification:new', onNotification);
      socket.disconnect();
    };
  }, [user, queryClient]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <NotificationSocketBridge />
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
          <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Loading LearnSpace
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Preparing the requested page...
            </Typography>
          </Stack>
        </Box>
      }
    >
      <Routes>
        <Route path="/" element={<MarketingHomepagePage />} />
        <Route path="/auth/login" element={<PublicAuthPage />} />
        <Route path="/auth/signup" element={<SignupAuthPage />} />
        <Route path="/auth/reset-password" element={<PasswordResetPage />} />
        <Route path="/reset-password" element={<LegacyResetPasswordRedirect />} />
        <Route path="/about" element={<PlaceholderPage title="About LearnSpace" description="Learn how LearnSpace helps educators and teams launch polished learning experiences with a compact, modern workflow." eyebrow="Company" actionLabel="Talk to Sales" actionTo="/contact" />} />
        <Route path="/blog" element={<BlogLandingPage />} />
        <Route path="/careers" element={<PlaceholderPage title="Careers at LearnSpace" description="We are building a focused team around product design, engineering, and customer success. Explore current opportunities and how to join us." eyebrow="Company" actionLabel="View open roles" actionTo="/contact" />} />
        <Route path="/help-center" element={<PlaceholderPage title="Help Center" description="Find quick answers, onboarding guides, and support resources for learners, instructors, and admins." eyebrow="Resources" actionLabel="Contact support" actionTo="/contact" />} />
        <Route path="/docs" element={<PlaceholderPage title="Docs" description="Read setup guides, workflow references, and platform documentation for LearnSpace features and roles." eyebrow="Resources" actionLabel="Visit blog" actionTo="/blog" />} />
        <Route path="/community" element={<PlaceholderPage title="Community" description="Join the LearnSpace community to share course ideas, product feedback, and best practices." eyebrow="Resources" actionLabel="Explore courses" actionTo="/courses/explore" />} />
        <Route path="/status" element={<PlaceholderPage title="System Status" description="Track platform health, uptime, and service updates for the LearnSpace product stack." eyebrow="Resources" actionLabel="Check updates" actionTo="/contact" />} />
        <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Review the LearnSpace terms that govern platform use, subscriptions, and account responsibilities." eyebrow="Legal" actionLabel="Create account" actionTo="/auth/signup" />} />
        <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="Understand how LearnSpace handles account data, course activity, and billing information." eyebrow="Legal" actionLabel="Create account" actionTo="/auth/signup" />} />
        <Route path="/cookies" element={<PlaceholderPage title="Cookie Policy" description="Learn how LearnSpace uses cookies and related technologies to keep the platform fast, secure, and personalized." eyebrow="Legal" actionLabel="Review privacy" actionTo="/privacy" />} />
        <Route path="/home" element={<MarketingHomepagePage />} />
        <Route path="/courses/:courseSlug" element={<CourseDetailPage />} />
        <Route path="/courses/bootcamp-2025" element={<CourseDetailPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route element={<RequireSession />}>
          <Route element={<LearnSpaceShell />}>
            <Route path="/courses/bootcamp-2025/quiz" element={<QuizTaker />} />
            <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<QuizTaker />} />
            <Route path="/courses/bootcamp-2025/learn" element={<CoursePlayer />} />
            <Route path="/courses/:courseId/learn" element={<CoursePlayer />} />
            <Route path="/courses/explore" element={<ExploreCourses />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/discussions" element={<CourseDiscussions />} />
            <Route path="/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/courses/:courseSlug/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/courses/:courseSlug/lessons/:lessonSlug/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/certificates" element={<MyCertificates />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />

            <Route element={<RequireRole allowedRoles={['admin', 'instructor', 'content_manager']} />}>
              <Route path="/cms/media" element={<MediaLibrary />} />
              <Route path="/cms/content" element={<ContentManager />} />
              <Route path="/cms/pages" element={<BlogPostEditor />} />
            </Route>

            <Route element={<RequireRole allowedRoles={['admin', 'instructor']} />}>
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/lessons/upload" element={<UploadLesson />} />
              <Route path="/courses/new" element={<CreateCourse />} />
            </Route>

            <Route element={<RequireRole allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route
              path="*"
              element={
                <PlaceholderPage
                  eyebrow="Fallback"
                  title="Page not found"
                  description="The requested route does not exist yet. Use the sidebar to navigate through the LearnSpace shell."
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeRouteProvider>
          <AppRoutes />
        </ThemeRouteProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

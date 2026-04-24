import { lazy, Suspense, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  BrowserRouter,
  Link as RouterLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  Container,
  Grid,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  KeyOutlined,
  MailOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api, ensureCsrfToken, normalizeApiError } from './services/api';
import { useGetCoursesQuery } from './store/api/courseApi';
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
const BlogLandingPage = lazy(() => import('./pages/main/BlogLandingPage'));
const CmsContentPage = lazy(() => import('./pages/main/CmsContentPage'));
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
  const location = useLocation();

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
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
        <Card sx={{ maxWidth: 480, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: alpha('#F44336', 0.1),
                  display: 'grid',
                  placeItems: 'center',
                  color: 'error.main',
                }}
              >
                <LockOutlined sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Access Denied
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                You do not have permission to access this page.
              </Typography>
              <Button
                component={RouterLink}
                to={getLandingRouteForRole(user.role)}
                variant="contained"
                sx={{ mt: 1, px: 3, py: 1.2, borderRadius: 3 }}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
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
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {eyebrow}
                </Typography>
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
        bgcolor: 'background.default',
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
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password states
  const [requestEmail, setRequestEmail] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getLandingRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!formValues.email || !formValues.email.trim()) {
      setErrorMessage('Email is required');
      return;
    }
    if (!formValues.password) {
      setErrorMessage('Password is required');
      return;
    }

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
        bgcolor: 'background.default',
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

            {view === 'login' ? (
              <>
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
                      label="Email"
                      type="email"
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                      <Typography component="label" htmlFor="password" variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        Password
                      </Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => {
                          setView('forgot-password');
                          setErrorMessage('');
                        }}
                        underline="none"
                        sx={{ color: 'primary.main', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', background: 'none' }}
                      >
                        Forgot password?
                      </Link>
                    </Box>
                    <TextField
                      value={formValues.password}
                      onChange={updateField('password')}
                      id="password"
                      type="password"
                      fullWidth
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
                        borderRadius: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </Stack>
                </Box>

                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  Don&apos;t have an account?{' '}
                  <Link component={RouterLink} to="/auth/signup" underline="none" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    Sign up
                  </Link>
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                    Reset password
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
                    We'll email you a link to reset your password
                  </Typography>
                </Box>

                {showSuccessBanner ? (
                  <Stack spacing={2.5}>
                    <Alert
                      severity="success"
                      icon={<CheckCircleOutlined sx={{ mt: 0.25 }} />}
                      sx={{ borderRadius: 3, '.MuiAlert-message': { width: '100%' } }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Check your inbox
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, color: 'success.dark', opacity: 0.9 }}>
                        If an account exists for {requestEmail}, you'll receive a secure link shortly.
                      </Typography>
                    </Alert>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setView('login');
                        setShowSuccessBanner(false);
                      }}
                      sx={{ p: 1.5, borderRadius: 3, fontWeight: 700 }}
                    >
                      Return to login
                    </Button>
                  </Stack>
                ) : (
                  <Box component="form" onSubmit={handleResetRequest}>
                    <Stack spacing={1.75}>
                      <TextField
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        label="Account Email"
                        type="email"
                        fullWidth
                        autoFocus
                      />

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
                          borderRadius: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {requestSubmitting ? 'Sending link...' : 'Send reset link'}
                      </Button>

                      <Button
                        variant="text"
                        fullWidth
                        onClick={() => {
                          setView('login');
                          setForgotError('');
                        }}
                        sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                      >
                        Cancel and return to login
                      </Button>
                    </Stack>
                  </Box>
                )}
              </>
            )}
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
        bgcolor: 'background.default',
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
              <Tab label="Student" value="student" />
              <Tab label="Instructor" value="instructor" />
            </Tabs>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.75}>
                <TextField
                  value={formValues.fullName}
                  onChange={updateField('fullName')}
                  label="Full Name"
                />
                <TextField
                  value={formValues.email}
                  onChange={updateField('email')}
                  label="Email Address"
                  type="email"
                />
                <TextField
                  value={formValues.password}
                  onChange={updateField('password')}
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

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function MarketingHomepagePage() {
  const { data: apiCourses = [], isLoading: coursesLoading } = useGetCoursesQuery();
  const [publicSettings, setPublicSettings] = useState<{
    trustPartners?: string[];
    homepageFeatures?: Array<{ title: string; description: string; color?: string }>;
    pricingPlans?: Array<{
      name: string;
      price: string;
      description: string;
      features: string[];
      featured?: boolean;
    }>;
  } | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const response = await api.get<{ settings: {
          trustPartners?: string[];
          homepageFeatures?: Array<{ title: string; description: string; color?: string }>;
          pricingPlans?: Array<{
            name: string;
            price: string;
            description: string;
            features: string[];
            featured?: boolean;
          }>;
        } }>('/api/settings/public');
        if (isMounted) {
          setPublicSettings(response.data.settings);
          setSettingsError(null);
        }
      } catch (requestError) {
        if (isMounted) {
          setSettingsError(normalizeApiError(requestError).message || 'Unable to load public content settings.');
          setPublicSettings(null);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { label: 'Features', to: '#features' },
    { label: 'Courses', to: '#courses' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Blog', to: '/blog' },
    { label: 'About Us', to: '#about' },
  ];

  const features = publicSettings?.homepageFeatures ?? [];

  const courses = useMemo(
    () =>
      apiCourses.slice(0, 4).map((course) => {
        const instructor = typeof course.instructor === 'object' && course.instructor
          ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.email
          : 'LearnSpace Instructor';
        const amount = typeof course.pricing?.amount === 'number' ? course.pricing.amount : 0;
        return {
          id: course._id,
          title: course.title,
          instructor,
          rating: Number(course.rating?.average || 0).toFixed(1),
          price: amount === 0 ? 'Free' : `$${amount}`,
          category: course.category || 'General',
          image: course.thumbnail || '',
        };
      }),
    [apiCourses],
  );

  const testimonials = useMemo(
    () =>
      apiCourses
        .filter((course) => (course.rating?.count || 0) > 0)
        .slice(0, 3)
        .map((course) => ({
          name: course.title,
          role: `${course.category || 'Course'} course`,
          quote: `Rated ${Number(course.rating?.average || 0).toFixed(1)} by ${course.rating?.count || 0} learners.`,
        })),
    [apiCourses],
  );

  const enrollmentTotal = useMemo(
    () => apiCourses.reduce((sum, course) => sum + Number(course.enrollmentCount || 0), 0),
    [apiCourses],
  );
  const averageCourseRating = useMemo(() => {
    if (apiCourses.length === 0) return 0;
    const sum = apiCourses.reduce((total, course) => total + Number(course.rating?.average || 0), 0);
    return Number((sum / apiCourses.length).toFixed(1));
  }, [apiCourses]);
  const estimatedRevenue = useMemo(
    () =>
      apiCourses.reduce((sum, course) => {
        const amount = Number(course.pricing?.amount || 0);
        const enrolled = Number(course.enrollmentCount || 0);
        return sum + amount * enrolled;
      }, 0),
    [apiCourses],
  );
  const enrollmentBars = useMemo(() => {
    const topCourses = [...apiCourses]
      .sort((a, b) => Number(b.enrollmentCount || 0) - Number(a.enrollmentCount || 0))
      .slice(0, 6);
    const max = Math.max(...topCourses.map((course) => Number(course.enrollmentCount || 0)), 1);
    return topCourses.map((course) => Math.max(15, Math.round((Number(course.enrollmentCount || 0) / max) * 100)));
  }, [apiCourses]);

  const pricing = publicSettings?.pricingPlans ?? [];

  return (
    <Box sx={{ bgcolor: '#FFFFFF', color: 'text.primary' }}>
      {settingsError ? (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {settingsError}
        </Alert>
      ) : null}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha('#FFFFFF', 0.94), backdropFilter: 'blur(16px)', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
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
                  color: '#FFFFFF',
                  fontWeight: 800,
                }}
              >
                LS
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
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

      <Box sx={{ pt: { xs: 2.5, md: 3 }, pb: { xs: 3, md: 4 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={1.5}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
                  THE COMPLETE LEARNING PLATFORM
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.1 }}>
                  Build and Scale Your Online Academy
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 640, fontWeight: 500, lineHeight: 1.7 }}>
                  Create inspiring courses, manage engaged communities, and drive real outcomes with LearnSpace. Transform your knowledge into a thriving educational business today.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 2.5, py: 0.9 }}>
                    Get Started
                  </Button>
                  <Button component={RouterLink} to="/courses/explore" variant="outlined" sx={{ px: 2.5, py: 0.9, borderColor: 'divider', color: 'text.primary' }}>
                    Explore courses
                  </Button>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  p: { xs: 1, md: 1.5 },
                  bgcolor: alpha('#FFFFFF', 0.6),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'grey.900',
                    color: '#FFF',
                    p: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>LearnSpace</Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 1.5 }}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        p: 2,
                        bgcolor: alpha('#FFFFFF', 0.05),
                        border: '1px solid',
                        borderColor: alpha('#FFFFFF', 0.1),
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8, letterSpacing: '0.1em', fontWeight: 600 }}>
                        ENROLLMENTS
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5, mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>
                          {enrollmentTotal.toLocaleString()}
                        </Typography>
                      </Box>
                        <Typography sx={{ color: 'text.secondary', opacity: 0.7, fontSize: '0.8rem', mb: 2 }}>
                          Total enrollments across published courses.
                        </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                        {[
                          { label: 'Courses', value: String(apiCourses.length) },
                          { label: 'Rating', value: averageCourseRating > 0 ? `${averageCourseRating}/5` : 'N/A' },
                          { label: 'Revenue', value: `$${Math.round(estimatedRevenue).toLocaleString()}` },
                        ].map((item) => (
                          <Box key={item.label}>
                            <Typography sx={{ color: 'text.secondary', opacity: 0.7, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'grey.200', mt: 0.2 }}>
                              {item.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        borderRadius: 3,
                        p: 2,
                        bgcolor: alpha('#FFFFFF', 0.05),
                        border: '1px solid',
                        borderColor: alpha('#FFFFFF', 0.1),
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8, letterSpacing: '0.1em', fontWeight: 600 }}>
                        REVENUE
                      </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', mt: 0.5 }}>
                          ${Math.round(estimatedRevenue).toLocaleString()}
                        </Typography>
                      <Typography sx={{ color: 'text.secondary', opacity: 0.7, fontSize: '0.75rem', mb: 'auto' }}>
                        Last 30 days
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 70, mt: 2 }}>
                          {enrollmentBars.map((value, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              height: `${value}%`,
                              borderRadius: 1,
                              bgcolor: index === 5 ? 'info.light' : alpha(theme.palette.info.main, 0.6),
                              transition: 'all 0.3s ease',
                              '&:hover': { bgcolor: 'info.light', transform: 'scaleY(1.05)' }
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, borderTop: '1px solid', borderColor: alpha('#FFFFFF', 0.05), pt: 1 }}>
                         <Typography sx={{ color: 'text.secondary', opacity: 0.6, fontSize: '0.65rem' }}>From live course catalog data</Typography>
                       </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="features" sx={{ py: { xs: 3, md: 4 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Everything you need to teach online
              </Typography>
            </Box>

            {features.length > 0 ? (
              <Grid container spacing={2}>
                {features.map((feature) => (
                  <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.7 }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No feature highlights have been published yet.
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      <Box id="courses" sx={{ py: { xs: 3, md: 4 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" sx={{ mt: 0, fontWeight: 800, letterSpacing: '-0.01em' }}>
                  Popular Courses
                </Typography>
              </Box>
              <Button component={RouterLink} to="/courses/explore" variant="outlined" sx={{ px: 2, py: 0.9, borderColor: 'divider' }}>
                Explore all courses
              </Button>
            </Box>

            <Grid container spacing={2}>
              {courses.map((course) => (
                <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={{ height: '100%', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: 190,
                        backgroundImage: course.image
                          ? `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.28)), url(${course.image})`
                          : 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {course.category}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          by {course.instructor}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            ★ {course.rating}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 800 }}>
                            {course.price}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {!coursesLoading && courses.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No published courses available yet.
              </Typography>
            ) : null}
          </Stack>
        </Container>
      </Box>

      <Box id="testimonials" sx={{ py: { xs: 3, md: 4 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Loved by students and teachers
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {testimonials.map((item) => (
                <Grid key={item.name} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Stack spacing={1.75}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {item.role}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                          "{item.quote}"
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {!coursesLoading && testimonials.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Ratings and learner feedback will appear here when courses receive reviews.
              </Typography>
            ) : null}
          </Stack>
        </Container>
      </Box>

      <Box id="pricing" sx={{ py: { xs: 3, md: 4 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Simple, transparent pricing
              </Typography>
            </Box>

            {pricing.length > 0 ? (
              <Grid container spacing={2}>
                {pricing.map((plan) => (
                  <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderColor: plan.featured ? 'primary.main' : 'divider',
                        borderWidth: plan.featured ? 2 : 1,
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Stack spacing={1.75}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                              {plan.name}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>
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
                          <Button component={RouterLink} to="/auth/signup" variant={plan.featured ? 'contained' : 'outlined'} fullWidth sx={{ py: 1.1 }}>
                            Get Started
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No pricing plans are configured yet.
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 3, md: 4 }, bgcolor: 'primary.main', color: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Ready to launch your online academy?
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                Build, sell, and scale your learning experience from one clean platform.
              </Typography>
            </Box>
            <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ bgcolor: '#FFFFFF', color: 'primary.main', px: 2.5, py: 0.8, fontSize: '0.9rem', '&:hover': { bgcolor: '#F1F5F9' } }}>
              Get Started for Free
            </Button>
          </Box>
        </Container>
      </Box>

      <Box id="about" sx={{ py: { xs: 3, md: 4 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                    LS
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
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

          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
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
        <Route path="/about" element={<CmsContentPage slug="about" eyebrow="Company" />} />
        <Route path="/blog" element={<BlogLandingPage />} />
        <Route path="/blog/:slug" element={<CmsContentPage eyebrow="Blog" />} />
        <Route path="/careers" element={<CmsContentPage slug="careers" eyebrow="Company" />} />
        <Route path="/help-center" element={<CmsContentPage slug="help-center" eyebrow="Resources" />} />
        <Route path="/docs" element={<CmsContentPage slug="docs" eyebrow="Resources" />} />
        <Route path="/community" element={<CmsContentPage slug="community" eyebrow="Resources" />} />
        <Route path="/status" element={<CmsContentPage slug="status" eyebrow="Resources" />} />
        <Route path="/terms" element={<CmsContentPage slug="terms" eyebrow="Legal" />} />
        <Route path="/privacy" element={<CmsContentPage slug="privacy" eyebrow="Legal" />} />
        <Route path="/cookies" element={<CmsContentPage slug="cookies" eyebrow="Legal" />} />
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
            <Route path="/courses/:courseSlug/details" element={<CourseDetailPage embedded />} />
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





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
  CircularProgress,
  CssBaseline,
  Alert,
  Container,
  Grid,
  InputAdornment,
  Link,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import {
  AutoGraph,
  CheckCircleOutlined,
  DragIndicator,
  FormatQuote,
  KeyOutlined,
  MailOutlined,
  LockOutlined,
  Payments,
  PhoneIphone,
  PlayCircleOutlined,
  Groups,
  StarRounded,
  VisibilityOutlined,
  VisibilityOffOutlined,
  WorkspacePremium,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api, ensureCsrfToken, normalizeApiError } from './services/api';
import { useGetCoursesQuery } from './store/api/courseApi';
import { createAuthenticatedSocket } from './services/realtimeSocket';
import { theme } from './theme';
import MainLayout from './components/layout/MainLayout';
import LearnSpaceShell from './routes/LearnSpaceShell';
import type { LearnSpaceRole } from './routes/learnSpaceNavigation';
import { getLandingRouteForRole } from './routes/learnSpaceNavigation';
import heroImage from './assets/hero-laptop-open.png';
import { LoadingSpinner, BrandMark } from './components/common/LoadingSpinner';
import { ForgotPasswordForm } from './components/common/ForgotPasswordForm';
import { CoursePreviewArtwork } from './components/ui/CoursePreviewArtwork';

const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetailPage'));
const ExploreCourses = lazy(() => import('./pages/courses/ExploreCourses'));
const CreateCourse = lazy(() => import('./pages/courses/CreateCourse'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminCourseManager = lazy(() => import('./pages/admin/CourseManager'));
const Messages = lazy(() => import('./pages/dashboard/Messages'));

const AnalyticsDashboard = lazy(() => import('./pages/dashboard/AnalyticsDashboard'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const ContactUs = lazy(() => import('./pages/main/ContactUs'));
const AboutPage = lazy(() => import('./pages/main/AboutPage'));
const BlogLandingPage = lazy(() => import('./pages/main/BlogLandingPage'));
const CmsContentPage = lazy(() => import('./pages/main/CmsContentPage'));
const MyCourses = lazy(() => import('./pages/dashboard/MyCourses'));
const CoursePlayer = lazy(() => import('./pages/courses/CoursePlayer'));
const PricingPage = lazy(() => import('./pages/main/PricingPage'));
const HelpCenterPage = lazy(() => import('./pages/main/HelpCenterPage'));
const CareersPage = lazy(() => import('./pages/main/CareersPage'));
const InstructorDashboard = lazy(() => import('./pages/dashboard/InstructorDashboard'));
const CheckoutPage = lazy(() => import('./pages/courses/CheckoutPage'));
const SystemSettings = lazy(() => import('./pages/dashboard/SystemSettings'));
const ProfileSettings = lazy(() => import('./pages/dashboard/ProfileSettings'));
const NotFoundPage = lazy(() => import('./pages/main/NotFoundPage'));
const CommunityPage = lazy(() => import('./pages/main/CommunityPage'));
const StatusPage = lazy(() => import('./pages/main/StatusPage'));
const DocsPage = lazy(() => import('./pages/main/DocsPage'));
const ActivityPage = lazy(() => import('./pages/dashboard/ActivityPage'));
const SignupAuthPage = lazy(() => import('./pages/auth/SignupAuthPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const OrderSuccessPage = lazy(() => import('./pages/orders/OrderSuccessPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/settings/NotificationPreferencesPage'));
const SearchResultsPage = lazy(() => import('./pages/search/SearchResultsPage'));
const MyQuizResultsPage = lazy(() => import('./pages/quizzes/MyQuizResultsPage'));
const UploadLesson = lazy(() => import('./pages/cms/UploadLesson'));
const QuizTaker = lazy(() => import('./pages/courses/QuizTaker'));
const CourseDiscussions = lazy(() => import('./pages/courses/CourseDiscussions'));
const AdminNotifications = lazy(() => import('./pages/dashboard/AdminNotifications'));
const MyCertificates = lazy(() => import('./pages/dashboard/MyCertificates'));
const MediaLibrary = lazy(() => import('./pages/cms/MediaLibrary'));
const ContentManager = lazy(() => import('./pages/cms/ContentManager'));
const BlogPostEditor = lazy(() => import('./pages/cms/BlogPostEditor'));
const QuizBuilder = lazy(() => import('./pages/courses/QuizBuilder'));
const UserManagement = lazy(() => import('./pages/dashboard/UserManagement'));


function RequireSession() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Getting you in..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}

function formatRoles(roles: string[]) {
  if (!roles.length) return '';
  const format = new Intl.ListFormat('en', { type: 'conjunction', style: 'long' });
  return format.format(roles.map(r => r.endsWith('s') ? r : r + 's'));
}

function RequireRole({ allowedRoles }: { allowedRoles: LearnSpaceRole[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Card sx={{ maxWidth: 420, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: alpha('#EF4444', 0.1),
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <LockOutlined sx={{ fontSize: 36, color: 'error.main' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Access Restricted
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 300 }}>
                This area is for {formatRoles(allowedRoles)} only. Your account doesn't have permission to view it.
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

function LearnSpaceBrandMark() {
  return <BrandMark />;
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
    border: activeStep === step ? `1px solid ${alpha(theme.palette.info.light, 0.5)}` : `1px solid ${theme.palette.divider}`,
    boxShadow: activeStep === step ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.08)}` : `0 4px 20px ${alpha(theme.palette.text.primary, 0.06)}`,
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
                            color: 'primary.contrastText',
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
                            color: 'primary.contrastText',
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
  const [showPassword, setShowPassword] = useState(false);

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
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!formValues.password) {
      setErrorMessage('Please enter your password.');
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

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'grid',
              placeItems: 'center',
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 24 24"
              sx={{ width: 28, height: 28, color: 'primary.contrastText', animation: 'pulse 1.5s ease-in-out infinite' }}
            >
              <path fill="currentColor" d="M12 2.5 5 5.25v5.53c0 4.52 2.95 8.57 7 10.22 4.05-1.65 7-5.7 7-10.22V5.25L12 2.5Z" />
            </Box>
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Preparing your workspace...
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
          maxWidth: 440,
          borderRadius: 2,
          boxShadow: '0 1px 2px rgba(15,23,42,0.06), 0 6px 14px rgba(15,23,42,0.05)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <LearnSpaceBrandMark />
            </Box>

            {view === 'login' ? (
              <>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em' }}>
                    Welcome back
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.65, color: 'text.secondary' }}>
                    Enter your credentials to access your courses
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack spacing={1.45}>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Email
                    </Typography>
                    <TextField
                      value={formValues.email}
                      onChange={updateField('email')}
                      type="email"
                      size="small"
                      placeholder="name@example.com"
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      size="small"
                      placeholder="••••••••"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box
                                component="button"
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                onMouseDown={(e) => e.preventDefault()}
                                sx={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  p: 0,
                                  color: '#94A3B8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  '&:hover': { color: 'text.primary' },
                                }}
                              >
                                {showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                              </Box>
                            </InputAdornment>
                          ),
                        },
                      }}
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
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: 'primary.contrastText' }} />
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
                  <Box sx={{ height: 1, bgcolor: 'divider', flex: 1 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    OR CONTINUE WITH
                  </Typography>
                  <Box sx={{ height: 1, bgcolor: 'divider', flex: 1 }} />
                </Box>

                <Stack direction="row" spacing={1.25}>
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={() => setErrorMessage('GitHub sign-in is not available yet. Please use email and password.')}
                  >
                    <Box component="span" sx={{ mr: 0.75, fontWeight: 700 }}>
                      GH
                    </Box>
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={() => setErrorMessage('Google sign-in is not available yet. Please use email and password.')}
                  >
                    <Box component="span" sx={{ mr: 0.75, fontWeight: 700 }}>
                      G
                    </Box>
                    Google
                  </Button>
                </Stack>

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

                <ForgotPasswordForm
                  onSuccess={() => {
                    setView('login');
                  }}
                />

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => {
                    setView('login');
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                  Cancel and return to login
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

// CoursePreviewArtwork is now imported from components/ui/CoursePreviewArtwork

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
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch public settings:', err);
          setSettingsError(err instanceof Error ? err.message : 'Failed to load settings');
          setPublicSettings(null);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const trustPartners = publicSettings?.trustPartners && publicSettings.trustPartners.length > 0
    ? publicSettings.trustPartners.slice(0, 5)
    : ['ACME Corp', 'GlobalEdu', 'Technicum', 'FutureLearn', 'UniScale'];

  const fallbackFeatures = [
    {
      title: 'Drag & Drop Builder',
      description: 'Create engaging courses with an intuitive editor and reusable blocks.',
    },
    {
      title: 'Advanced Analytics',
      description: 'Track learner progress, completion rates, and revenue in real time.',
    },
    {
      title: 'Community Hub',
      description: 'Build discussion spaces and direct engagement for your learners.',
    },
    {
      title: 'Mobile Ready',
      description: 'Deliver seamless learning experiences across every screen size.',
    },
    {
      title: 'Certificates',
      description: 'Automatically issue branded certificates for milestones and completion.',
    },
    {
      title: 'Seamless Payments',
      description: 'Accept one-time and subscription payments with built-in checkout.',
    },
  ];
  const features = publicSettings?.homepageFeatures && publicSettings.homepageFeatures.length > 0
    ? publicSettings.homepageFeatures.slice(0, 6)
    : fallbackFeatures;
  const featureIcons = [DragIndicator, AutoGraph, Groups, PhoneIphone, WorkspacePremium, Payments];

  const courses = useMemo(
    () =>
      apiCourses.slice(0, 3).map((course) => {
        const instructor = typeof course.instructor === 'object' && course.instructor
          ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.email
          : 'LearnSpace Instructor';
        const amount = typeof course.pricing?.amount === 'number' ? course.pricing.amount : 0;
        return {
          id: course._id,
          title: course.title,
          instructor,
          rating: Number(course.rating?.average || 0).toFixed(1),
          students: Number(course.enrollmentCount || 0),
          price: amount === 0 ? 'Free' : `$${amount}`,
          category: course.category || 'General',
          image: course.thumbnail || '',
        };
      }),
    [apiCourses],
  );

  const testimonials = [
    {
      name: 'Ariela',
      role: 'Educator',
      quote: 'Their platform has completely transformed the way I build and launch online courses.',
    },
    {
      name: 'Riya Sharma',
      role: 'Course Creator',
      quote: 'The analytics and payment flow made our first launch smooth from day one.',
    },
    {
      name: 'Teshale A.',
      role: 'Program Lead',
      quote: 'Community features helped us keep learners active and accountable every week.',
    },
  ];

  const fallbackPricing = [
    {
      name: 'Basic',
      price: '$0',
      description: 'For trying out LearnSpace',
      features: ['3 active courses', '1 admin account', 'Basic analytics'],
      featured: false,
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For scaling your academy',
      features: ['Unlimited courses', 'Custom certificates', 'Priority support'],
      featured: true,
    },
    {
      name: 'Business',
      price: '$99',
      description: 'For large educator teams',
      features: ['SSO & advanced security', 'Enterprise support', 'Advanced reporting'],
      featured: false,
    },
  ];
  const pricing = publicSettings?.pricingPlans && publicSettings.pricingPlans.length > 0
    ? publicSettings.pricingPlans.slice(0, 3)
    : fallbackPricing;
  const fallbackCourses = [
    {
      id: 'fallback-1',
      title: 'Full Stack Web Development',
      instructor: 'Alex Chen',
      rating: '4.9',
      students: 1245,
      price: '$149',
      category: 'Development',
      image: '',
    },
    {
      id: 'fallback-2',
      title: 'Digital Marketing Mastery',
      instructor: 'Maria Lewis',
      rating: '4.8',
      students: 980,
      price: '$129',
      category: 'Marketing',
      image: '',
    },
    {
      id: 'fallback-3',
      title: 'UI/UX Design Fundamentals',
      instructor: 'Emma Lopez',
      rating: '4.7',
      students: 1150,
      price: '$159',
      category: 'Design',
      image: '',
    },
  ];
  const landingCourses = courses.length > 0 ? courses : fallbackCourses;

  return (
    <Box id="top" sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      {settingsError ? (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {settingsError}
        </Alert>
      ) : null}
      <Box sx={{ py: { xs: 4.2, md: 5.2 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={1.5}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 0, fontSize: '0.66rem', textTransform: 'none', width: 'fit-content', px: 1.05, py: 0.25, borderRadius: 1.1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  New: AI Course Generator
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.05 }}>
                  Unlock Potential with Modern Learning
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 500, fontWeight: 500, lineHeight: 1.6, fontSize: { xs: '0.84rem', md: '0.82rem' } }}>
                  Create, manage, and scale your educational programs with the world's most intuitive LMS platform designed for growing teams.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.4 }}>
                  <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 2, py: 0.7, borderRadius: 0.9, fontSize: '0.78rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                    Start Free Trial
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/courses/explore"
                    variant="outlined"
                    startIcon={<PlayCircleOutlined sx={{ fontSize: '0.95rem' }} />}
                    sx={{ px: 2, py: 0.7, fontSize: '0.78rem', color: 'text.primary', borderColor: 'divider', bgcolor: 'background.paper', '&:hover': { borderColor: 'divider', bgcolor: 'action.hover' } }}
                  >
                    Watch Demo
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pt: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {[
                      { color: '#A16207', text: 'A' },
                      { color: '#92400E', text: 'B' },
                      { color: '#64748B', text: 'C' },
                    ].map((item, index) => (
                      <Box
                        key={item.text}
                        sx={{
                          width: 23,
                          height: 23,
                          borderRadius: '50%',
                          bgcolor: item.color,
                          border: '2px solid #F2F4FA',
                          color: '#FFFFFF',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '0.55rem',
                          fontWeight: 700,
                          ml: index === 0 ? 0 : -0.85,
                        }}
                      >
                        {item.text}
                      </Box>
                    ))}
                    <Box sx={{ width: 23, height: 23, borderRadius: '50%', bgcolor: '#E2E8F0', border: '2px solid #F2F4FA', color: '#64748B', display: 'grid', placeItems: 'center', fontSize: '0.5rem', fontWeight: 700, ml: -0.85 }}>
                      +2k
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 500 }}>
                    Trusted by 2,000+ organizations
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                component="img"
                src={heroImage}
                alt="LearnSpace dashboard preview"
                sx={{
                  width: { xs: '100%', md: '94%' },
                  height: 'auto',
                  display: 'block',
                  ml: 'auto',
                  bgcolor: 'transparent',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 2.05, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '0.58rem', color: 'text.secondary', letterSpacing: 0, fontWeight: 700 }}>
            POWERING TOP EDUCATION TEAMS
          </Typography>
          <Box sx={{ mt: 1.1, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
            {trustPartners.map((partner) => (
              <Typography key={partner} sx={{ textAlign: 'center', fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700 }}>
                {partner}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="features" sx={{ py: { xs: 3.8, md: 4.8 }, bgcolor: '#F6F8FE' }}>
        <Container maxWidth="lg">
          <Stack spacing={2.1}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.35rem', md: '1.7rem' } }}>
                Everything you need to teach online
              </Typography>
                <Typography sx={{ mt: 0.7, color: '#64748B', fontSize: '0.68rem' }}>
                From content creation to learner engagement and analytics, all in one place.
              </Typography>
            </Box>

            {features.length > 0 ? (
              <Grid container spacing={1.2}>
                {features.map((feature, index) => {
                  const FeatureIcon = featureIcons[index % featureIcons.length];
                  return (
                  <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card sx={{ height: '100%', bgcolor: 'transparent', borderColor: 'transparent' }}>
                      <CardContent sx={{ p: 1.35 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.68 }}>
                          <Box sx={{ width: 22, height: 22, borderRadius: 1, bgcolor: alpha('#4F46E5', 0.1), display: 'grid', placeItems: 'center', color: '#4F46E5' }}>
                            <FeatureIcon sx={{ fontSize: '0.8rem' }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.74rem' }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.62rem' }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No feature highlights have been published yet.
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      <Box id="courses" sx={{ py: { xs: 3.8, md: 4.6 }, bgcolor: '#EEF3FF' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.2rem', md: '1.45rem' } }}>
                  Popular Courses
                </Typography>
                <Typography sx={{ mt: 0.4, fontSize: '0.64rem', color: '#64748B' }}>
                  Discover high-impact courses from top instructors.
                </Typography>
              </Box>
              <Button component={RouterLink} to="/courses/explore" variant="outlined" sx={{ px: 1.4, py: 0.45, borderColor: '#D7DEEA', color: '#475569', bgcolor: '#FFFFFF', fontSize: '0.58rem' }}>
                View all courses
              </Button>
            </Box>

            <Grid container spacing={1.2}>
              {landingCourses.map((course, index) => (
                <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card sx={{ height: '100%', overflow: 'hidden', bgcolor: '#FFFFFF', borderColor: '#DCE3EE' }}>
                    {course.image ? (
                      <Box
                        sx={{
                          height: 120,
                          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.16)), url(${course.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
                      <CoursePreviewArtwork variant={index} />
                    )}
                    <CardContent sx={{ p: 1.05 }}>
                      <Stack spacing={0.75}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.58rem' }}>
                          {course.category}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: '0.72rem', minHeight: 34 }}>
                          {course.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.45, borderTop: '1px solid #EEF2F7' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#C7D2FE', display: 'grid', placeItems: 'center', fontSize: '0.45rem', color: '#3730A3', fontWeight: 700 }}>
                              {course.instructor.charAt(0).toUpperCase()}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.56rem' }}>
                              {course.instructor}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: '#64748B' }}>
                            <StarRounded sx={{ fontSize: '0.68rem', color: '#F59E0B' }} />
                            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.54rem' }}>
                              {course.rating} / {Math.max(course.students, 120)}+
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {!coursesLoading && courses.length === 0 && landingCourses.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No published courses available yet.
              </Typography>
            ) : null}
          </Stack>
        </Container>
      </Box>

      <Box id="testimonials" sx={{ py: { xs: 3.8, md: 4.8 }, bgcolor: '#F6F8FE' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.7}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.2rem', md: '1.45rem' } }}>
                Loved by students and teachers
              </Typography>
            </Box>

            <Grid container spacing={1.2}>
              {testimonials.map((item) => (
                <Grid key={item.name} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%', bgcolor: '#FFFFFF', borderColor: '#DCE3EE' }}>
                    <CardContent sx={{ p: 1.1 }}>
                      <Stack spacing={0.85}>
                        <FormatQuote sx={{ color: '#818CF8', fontSize: '0.9rem' }} />
                        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, fontSize: '0.63rem', minHeight: 58 }}>
                          {item.quote}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#C7D2FE', display: 'grid', placeItems: 'center', fontSize: '0.5rem', color: '#312E81', fontWeight: 700 }}>
                            {item.name.charAt(0).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.64rem' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.58rem' }}>
                              {item.role}
                            </Typography>
                          </Box>
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

      <Box id="pricing" sx={{ py: { xs: 4, md: 5 }, bgcolor: '#F6F8FE' }}>
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.25rem', md: '1.55rem' } }}>
                Simple, transparent pricing
              </Typography>
              <Typography sx={{ mt: 0.5, color: '#64748B', fontSize: '0.62rem' }}>
                Choose the plan that best fits your growth.
              </Typography>
            </Box>

            {pricing.length > 0 ? (
              <Grid container spacing={1.2}>
                {pricing.map((plan) => (
                  <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderColor: plan.featured ? '#6366F1' : '#DCE3EE',
                        borderWidth: plan.featured ? 2 : 1,
                        bgcolor: '#FFFFFF',
                        position: 'relative',
                      }}
                    >
                      <CardContent sx={{ p: 1.25 }}>
                        <Stack spacing={1}>
                          {plan.featured ? (
                            <Box sx={{ alignSelf: 'center', borderRadius: 999, bgcolor: alpha('#6366F1', 0.12), color: '#4F46E5', px: 1, py: 0.2, fontSize: '0.55rem', fontWeight: 700 }}>
                              Most popular
                            </Box>
                          ) : null}
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.76rem' }}>
                              {plan.name}
                            </Typography>
                            <Typography sx={{ mt: 0.4, color: '#94A3B8', fontSize: '0.55rem' }}>
                              {plan.description}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1, fontSize: '1.65rem' }}>
                              {plan.price}
                              <Typography component="span" variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.64rem' }}>
                                /mo
                              </Typography>
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gap: 1 }}>
                            {plan.features.map((feature) => (
                              <Typography key={feature} variant="body2" sx={{ color: '#334155', display: 'flex', alignItems: 'center', gap: 0.7, fontSize: '0.58rem' }}>
                                <CheckCircleOutlined sx={{ fontSize: '0.7rem', color: '#6366F1' }} />
                                {feature}
                              </Typography>
                            ))}
                          </Box>
                          <Button
                            component={RouterLink}
                            to="/auth/signup"
                            variant={plan.featured ? 'contained' : 'outlined'}
                            fullWidth
                            sx={{ py: 0.55, fontSize: '0.58rem' }}
                          >
                            {plan.featured ? 'Start for free' : 'Get started'}
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
        <Route element={<MainLayout />}>
          <Route path="/" element={<MarketingHomepagePage />} />
          <Route path="/home" element={<MarketingHomepagePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogLandingPage />} />
          <Route path="/blog/:slug" element={<CmsContentPage eyebrow="Blog" />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/help-center" element={<Navigate to="/help" replace />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/terms" element={<CmsContentPage slug="terms" eyebrow="Legal" />} />
          <Route path="/privacy" element={<CmsContentPage slug="privacy" eyebrow="Legal" />} />
          <Route path="/cookies" element={<CmsContentPage slug="cookies" eyebrow="Legal" />} />
          <Route path="/courses/explore" element={<ExploreCourses />} />
          <Route path="/courses/:courseSlug" element={<CourseDetailPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/pricing" element={<PricingPage />} />

          <Route element={<RequireSession />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<OrderSuccessPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/auth/login" element={<PublicAuthPage />} />
        <Route path="/auth/signup" element={<SignupAuthPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth/reset-password" element={<PasswordResetPage />} />
        <Route path="/reset-password" element={<LegacyResetPasswordRedirect />} />

        <Route element={<RequireSession />}>
          <Route element={<LearnSpaceShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/my-courses" element={<Navigate to="/courses" replace />} />
            <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<QuizTaker />} />
            <Route path="/courses/:courseId/learn" element={<CoursePlayer />} />
            <Route path="/courses/browse" element={<ExploreCourses />} />
            <Route path="/courses/:courseSlug/details" element={<CourseDetailPage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/discussions" element={<CourseDiscussions />} />
            <Route path="/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/courses/:courseSlug/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/courses/:courseSlug/lessons/:lessonSlug/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/certificates" element={<MyCertificates />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/quizzes" element={<MyQuizResultsPage />} />
            <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />

            <Route element={<RequireRole allowedRoles={['admin', 'instructor']} />}>
              <Route path="/lessons/upload" element={<UploadLesson />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/courses/new" element={<CreateCourse />} />
              <Route path="/courses/:courseId/lessons/:lessonId/quiz/new" element={<QuizBuilder />} />
            </Route>

            <Route element={<RequireRole allowedRoles={['admin', 'instructor', 'content_manager']} />}>
              <Route path="/cms/media" element={<MediaLibrary />} />
              <Route path="/cms/content" element={<ContentManager />} />
              <Route path="/cms/pages" element={<BlogPostEditor />} />
            </Route>

            <Route element={<RequireRole allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourseManager />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;





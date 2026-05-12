import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
} from '@mui/icons-material';
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../services/api';
import { getLandingRouteForRole } from '../../routes/learnSpaceNavigation';
import { theme } from '../../theme';
import { BrandMark } from '../../components/common/LoadingSpinner';
import { ForgotPasswordForm } from '../../components/common/ForgotPasswordForm';

function LearnSpaceBrandMark() {
  return <BrandMark />;
}

function PublicAuthPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setErrorMessage('Your session has expired. Please sign in again.');
      window.history.replaceState(null, '', '/auth/login');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getLandingRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!formValues.email || !formValues.email.trim()) {
      setErrorMessage('Email is required');
      return;
    }
    if (!formValues.password) {
      setErrorMessage('Password is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      setErrorMessage('Invalid credentials');
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
              width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.main',
              display: 'grid', placeItems: 'center',
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
                    <TextField
                      id="email"
                      label="Email"
                      value={formValues.email}
                      onChange={updateField('email')}
                      type="email"
                      size="small"
                      placeholder="name@example.com"
                      fullWidth
                      autoComplete="email"
                      autoFocus
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => {
                          setView('forgot-password');
                          setErrorMessage('');
                        }}
                        underline="none"
                        sx={{ color: 'primary.main', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', background: 'none', ml: 'auto' }}
                      >
                        Forgot password?
                      </Link>
                    </Box>
                    <TextField
                      label="Password"
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
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                sx={{
                                  border: 'none', background: 'none', cursor: 'pointer', p: 0,
                                  color: 'text.secondary', display: 'flex', alignItems: 'center',
                                  '&:hover': { color: 'text.primary' },
                                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', borderRadius: 0.5 },
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
                    <Box component="span" sx={{ mr: 0.75, fontWeight: 700 }}>GH</Box>
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={() => setErrorMessage('Google sign-in is not available yet. Please use email and password.')}
                  >
                    <Box component="span" sx={{ mr: 0.75, fontWeight: 700 }}>G</Box>
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
                    We&apos;ll email you a link to reset your password
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

export default PublicAuthPage;

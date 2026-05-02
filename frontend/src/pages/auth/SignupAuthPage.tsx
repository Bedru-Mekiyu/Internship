import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  SchoolOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../services/api';
import { getLandingRouteForRole } from '../../routes/learnSpaceNavigation';

type SignupRole = 'student' | 'instructor';

type SignupStatus = 'idle' | 'loading' | 'success' | 'error';

interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
}

interface AuthInputFieldProps {
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  icon: ReactNode;
  error?: string;
  showPasswordToggle?: boolean;
  autoComplete?: string;
}

function AuthInputField({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  icon,
  error,
  showPasswordToggle,
  autoComplete,
}: AuthInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {label}
      </Typography>
      <TextField
        placeholder={placeholder}
        type={showPasswordToggle && showPassword ? 'text' : type}
        value={value}
        onChange={onChange}
        size="small"
        error={Boolean(error)}
        helperText={error}
        autoComplete={autoComplete}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
                {icon}
              </InputAdornment>
            ),
            endAdornment: showPasswordToggle ? (
              <InputAdornment position="end">
                <Box
                  component="button"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  sx={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    p: 0,
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                </Box>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
    </Stack>
  );
}

function validateForm(values: SignupFormValues, role: SignupRole) {
  const errors: Partial<Record<keyof SignupFormValues, string>> = {};

  const normalizedName = values.fullName.trim();
  const normalizedEmail = values.email.trim().toLowerCase();

  if (!normalizedName) {
    errors.fullName = 'Please enter your full name.';
  } else if (normalizedName.split(/\s+/).filter(Boolean).length < 2) {
    errors.fullName = 'Please enter both your first and last name.';
  } else if (normalizedName.length > 100) {
    errors.fullName = 'Name is too long. Please use a shorter name.';
  }

  if (!normalizedEmail) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Please enter a valid email address.';
  } else if (normalizedEmail.length > 254) {
    errors.email = 'Email address is too long.';
  }

  if (!values.password) {
    errors.password = 'Please create a password.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (values.password.length > 128) {
    errors.password = 'Password is too long. Maximum 128 characters.';
  } else if (role === 'instructor' && values.password.length < 12) {
    errors.password = 'Instructors need a stronger password. Use at least 12 characters.';
  }

  return errors;
}

export default function SignupAuthPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, user } = useAuth();
  const [role, setRole] = useState<SignupRole>('student');
  const [formValues, setFormValues] = useState<SignupFormValues>({
    fullName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupFormValues, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupStatus, setSignupStatus] = useState<SignupStatus>('idle');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getLandingRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleRoleChange = (_: React.SyntheticEvent, newRole: SignupRole) => {
    setRole(newRole);
    setFieldErrors({});
    setSubmitError('');
  };

  const clearFieldError = (field: keyof SignupFormValues) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateField = (field: keyof SignupFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
    clearFieldError(field);
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    const errors = validateForm(formValues, role);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const nameParts = formValues.fullName.trim().split(/\s+/).filter(Boolean);
    const [firstName, ...rest] = nameParts;
    const lastName = rest.join(' ');
    const normalizedEmail = formValues.email.trim().toLowerCase();

    setIsSubmitting(true);
    setSignupStatus('loading');
    try {
      await register({
        firstName,
        lastName,
        email: normalizedEmail,
        password: formValues.password,
        role,
      });
      setSignupStatus('success');
    } catch (error) {
      setSignupStatus('error');
      const apiError = normalizeApiError(error);
      
      if (apiError.code === 'EMAIL_EXISTS' || apiError.message?.toLowerCase().includes('email')) {
        setFieldErrors({ email: apiError.message || 'This email is already registered.' });
        setSubmitError('');
      } else if (apiError.code === 'RATE_LIMITED' || apiError.message?.toLowerCase().includes('too many')) {
        setSubmitError('Too many attempts. Please wait a moment and try again.');
      } else if (apiError.code === 'INVALID_EMAIL') {
        setFieldErrors({ email: apiError.message || 'Please use a valid email address.' });
      } else {
        setSubmitError(apiError.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            LearnSpace
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Getting you set up...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getLandingRouteForRole(user.role)} replace />;
  }

if (signupStatus === 'success') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          px: 2,
          py: 3.5,
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 460, borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 3.5 } }}>
            <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                }}
              >
                <CheckCircleOutlined sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Check your email
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                We sent a verification link to <strong>{formValues.email}</strong>. 
                Click the link to activate your account.
              </Typography>
              <Button
                component={RouterLink}
                to="/auth/login"
                variant="contained"
                fullWidth
                sx={{
                  minHeight: 44,
                  mt: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 2px 8px rgba(30,103,242,0.25)',
                }}
              >
                Go to Login
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 3.5,
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 4px 16px rgba(30,103,242,0.25)',
          }}
        >
          <SchoolOutlined sx={{ fontSize: 24 }} />
        </Box>

        <Card sx={{ width: '100%', maxWidth: 460, borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: { xs: 2.8, sm: 3.2 } }}>
            <Stack spacing={2.2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', sm: '2rem' } }}>
                  Create an account
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.55, color: 'text.secondary' }}>
                  Start your learning journey today.
                </Typography>
              </Box>

              <Tabs
                value={role}
                onChange={handleRoleChange}
                variant="fullWidth"
                aria-label="Choose account role"
                sx={{
                  minHeight: 44,
                  p: 0.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  borderRadius: 2,
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTabs-flexContainer': { gap: 0.5 },
                  '& .MuiTab-root': {
                    minHeight: 34,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: 13,
                    transition: 'all 180ms ease',
                  },
                  '& .MuiTab-root.Mui-selected': {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Tab
                  value="student"
                  label={(
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                      <PersonOutlined sx={{ fontSize: 16 }} />
                      <span>Student</span>
                    </Stack>
                  )}
                />
                <Tab
                  value="instructor"
                  label={(
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                      <SchoolOutlined sx={{ fontSize: 16 }} />
                      <span>Instructor</span>
                    </Stack>
                  )}
                />
              </Tabs>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={1.35}>
                  <AuthInputField
                    label="Full Name"
                    placeholder="Jane Doe"
                    value={formValues.fullName}
                    onChange={updateField('fullName')}
                    icon={<PersonOutlined fontSize="small" />}
                    error={fieldErrors.fullName}
                    autoComplete="name"
                  />
                  <AuthInputField
                    label="Email address"
                    placeholder="jane@example.com"
                    type="email"
                    value={formValues.email}
                    onChange={updateField('email')}
                    icon={<EmailOutlined fontSize="small" />}
                    error={fieldErrors.email}
                    autoComplete="email"
                  />
                  <AuthInputField
                    label="Password"
                    placeholder="Create a password"
                    type="password"
                    value={formValues.password}
                    onChange={updateField('password')}
                    icon={<LockOutlined fontSize="small" />}
                    error={fieldErrors.password}
                    showPasswordToggle
                    autoComplete="new-password"
                  />

                  {submitError ? (
                    <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
                      {submitError}
                    </Alert>
                  ) : null}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{
                      minHeight: 44,
                      mt: 0.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 15,
                      boxShadow: '0 2px 8px rgba(30,103,242,0.25)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(30,103,242,0.35)',
                      },
                      '&:disabled': {
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={20} sx={{ color: 'primary.contrastText' }} />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Stack>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 1.6 }}>
                By clicking continue, you agree to our{' '}
                <Link component={RouterLink} to="/terms" underline="none" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Privacy Policy
                </Link>
                .
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'primary.main', fontWeight: 700 }}>
            Log in
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}

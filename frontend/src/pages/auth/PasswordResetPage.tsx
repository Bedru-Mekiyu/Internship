import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckCircleOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ensureCsrfToken, normalizeApiError } from '../../services/api';
import { theme } from '../../theme';

const PASSWORD_POLICY_REGEX = /^(?=.{8,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/;

export default function PasswordResetPage() {
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
    if (!PASSWORD_POLICY_REGEX.test(newPassword)) {
      setResetError('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
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
                          width: 54, height: 54, borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main',
                          display: 'grid', placeItems: 'center', flexShrink: 0,
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
                              position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                              zIndex: 1, pointerEvents: 'none', color: 'text.secondary',
                            }}
                          >
                            <MailOutlined fontSize="small" />
                          </Box>
                          <TextField
                            value={requestEmail}
                            onChange={(event) => setRequestEmail(event.target.value)}
                            placeholder="Enter your email"
                            label="Email Address"
                            sx={{ '& .MuiOutlinedInput-root': { pl: 5.5 } }}
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
                            bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.6,
                            fontSize: 16, '&:hover': { bgcolor: 'primary.dark' },
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
                        width: 54, height: 54, borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main',
                        display: 'grid', placeItems: 'center', flexShrink: 0,
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
                            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                            zIndex: 1, pointerEvents: 'none', color: 'text.secondary',
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
                          helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character."
                          sx={{ '& .MuiOutlinedInput-root': { pl: 5.5 } }}
                        />
                      </Box>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                            zIndex: 1, pointerEvents: 'none', color: 'text.secondary',
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
                          sx={{ '& .MuiOutlinedInput-root': { pl: 5.5 } }}
                        />
                      </Box>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={resetSubmitting}
                        sx={{
                          bgcolor: 'primary.main', color: 'primary.contrastText', py: 1.6,
                          fontSize: 16, '&:hover': { bgcolor: 'primary.dark' },
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

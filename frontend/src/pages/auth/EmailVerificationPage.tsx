import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckCircleOutlined,
  ErrorOutlined,
  EmailOutlined,
} from '@mui/icons-material';
import { api, normalizeApiError } from '../../services/api';

type VerificationState = 'loading' | 'success' | 'error';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isResendLoading, setIsResendLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const token = searchParams.get('token');

    if (!token) {
      setState('error');
      setErrorMessage('Verification link is missing a token. Please request a new verification email.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get('/api/auth/verify-email', { params: { token }, signal: controller.signal });
        if (!controller.signal.aborted) {
          setState('success');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setState('error');
        setErrorMessage(normalizeApiError(error).message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();

    return () => {
      controller.abort();
    };
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (isResendLoading) return;
    if (!resendEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsResendLoading(true);
    try {
      await api.post('/api/auth/resend-verification', { email: resendEmail.trim().toLowerCase() });
      setErrorMessage('');
      setResendMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      setResendMessage('');
      setErrorMessage(normalizeApiError(error).message || 'Failed to resend verification email.');
    } finally {
      setIsResendLoading(false);
    }
  };

  if (state === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: '#F8FAFC',
          px: 2,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: alpha('#0066FF', 0.1),
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Verifying your email...
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will only take a moment.
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (state === 'error') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: '#F8FAFC',
          px: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 3,
            border: '1px solid #E2E8F0',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
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
                <ErrorOutlined sx={{ fontSize: 36, color: 'error.main' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Verification Failed
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 320 }}>
                {errorMessage || 'This verification link is invalid or has expired. Please request a new one.'}
              </Typography>

              <Stack spacing={2} sx={{ width: '100%', mt: 1 }}>
                <TextField
                  id="resend-email-input"
                  label="Your email"
                  type="email"
                  fullWidth
                  value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <EmailOutlined fontSize="small" sx={{ color: '#94A3B8' }} />
                      ),
                    },
                  }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleResendEmail}
                  disabled={isResendLoading}
                  sx={{ py: 1.5 }}
                >
                  Resend Verification Email
                </Button>
              </Stack>

              {resendMessage && (
                <Alert severity="success" sx={{ width: '100%' }}>
                  {resendMessage}
                </Alert>
              )}

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/auth/login')}
                sx={{ py: 1.5 }}
              >
                Back to Login
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
        bgcolor: '#F8FAFC',
        px: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
          border: '1px solid #E2E8F0',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: alpha('#10B981', 0.1),
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CheckCircleOutlined sx={{ fontSize: 36, color: 'success.main' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Email Verified!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 320 }}>
              Your email has been verified successfully. You can now sign in to access your courses.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/auth/login')}
              sx={{ py: 1.5 }}
            >
              Sign In
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

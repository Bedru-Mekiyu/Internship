import { useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { CheckCircleOutlined, MailOutlined, KeyOutlined } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { api, ensureCsrfToken, normalizeApiError } from '../../services/api';
import { theme } from '../../theme';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await ensureCsrfToken();
      await api.post('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
      setShowSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  if (showSuccess) {
    return (
      <Alert
        icon={<CheckCircleOutlined sx={{ mt: 0.25 }} />}
        severity="success"
        sx={{ borderRadius: 3, '.MuiAlert-message': { width: '100%' } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          Check your inbox
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'success.dark', opacity: 0.9 }}>
          If an account exists for {email}, you'll receive a secure link shortly.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1.75}>
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
            value={email}
            onChange={handleChange}
            label="Account Email"
            type="email"
            fullWidth
            autoFocus
            placeholder="name@example.com"
            sx={{ '& .MuiOutlinedInput-root': { pl: 5.5 } }}
          />
        </Box>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting || !email.trim()}
        >
          {isSubmitting ? 'Sending link...' : 'Send reset link'}
        </Button>
      </Stack>
    </Box>
  );
}

interface PasswordResetCardProps {
  step: 'request' | 'new-password';
  activeStep: 'request' | 'new-password';
  children: React.ReactNode;
}

export function PasswordResetCard({ step, activeStep, children }: PasswordResetCardProps) {
  const getCardStyle = () => ({
    border:
      activeStep === step
        ? `1px solid ${alpha(theme.palette.info.light, 0.5)}`
        : `1px solid ${theme.palette.divider}`,
    boxShadow:
      activeStep === step
        ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.08)}`
        : `0 4px 20px ${alpha(theme.palette.text.primary, 0.06)}`,
  });

  return (
    <Card sx={{ borderRadius: 4, ...getCardStyle(), height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75, md: 3.25 } }}>
        {children}
      </CardContent>
    </Card>
  );
}

export function StepIndicator({ label, icon: Icon }: { label: string; icon: typeof KeyOutlined }) {
  return (
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
        <Icon />
      </Box>
      <Typography
        variant="caption"
        sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}
      >
        {label}
      </Typography>
    </Box>
  );
}
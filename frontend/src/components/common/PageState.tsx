import { type ReactNode } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface PageLoadingProps {
  message?: string;
  minHeight?: number | string;
}

interface PageEmptyProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: ReactNode;
  minHeight?: number | string;
}

interface PageErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  minHeight?: number | string;
}

interface PageStateProps {
  children: ReactNode;
}

const defaultMinHeight = 200;

export function PageLoading({ message = 'Loading...', minHeight = defaultMinHeight }: PageLoadingProps) {
  return (
    <Box
      sx={{
        minHeight,
        display: 'grid',
        placeItems: 'center',
        py: 4,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={32} sx={{ color: 'primary.main' }} />
        {message && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {message}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export function PageEmpty({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
  minHeight = defaultMinHeight,
}: PageEmptyProps) {
  return (
    <Box
      sx={{
        minHeight,
        display: 'grid',
        placeItems: 'center',
        py: 4,
      }}
    >
      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 360 }}>
        {icon && (
          <Box sx={{ color: 'text.secondary', opacity: 0.5 }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        )}
        {actionLabel && actionTo && (
          <Button
            component={RouterLink}
            to={actionTo}
            variant="contained"
            sx={{ mt: 1, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export function PageError({
  title = 'Something went wrong',
  message,
  onRetry,
  minHeight = defaultMinHeight,
}: PageErrorProps) {
  return (
    <Box
      sx={{
        minHeight,
        display: 'grid',
        placeItems: 'center',
        py: 4,
      }}
    >
      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 360 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {message}
        </Typography>
        {onRetry && (
          <Button
            variant="outlined"
            onClick={onRetry}
            sx={{ mt: 1, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
          >
            Try again
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export function PageStateWrapper({ children }: PageStateProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {children}
    </Box>
  );
}
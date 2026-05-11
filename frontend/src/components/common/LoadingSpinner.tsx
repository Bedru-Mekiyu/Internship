import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'grid',
            placeItems: 'center',
            boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
            opacity: 0.9,
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              width: 28,
              height: 28,
              color: 'primary.contrastText',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            <path
              fill="currentColor"
              d="M12 2.5 5 5.25v5.53c0 4.52 2.95 8.57 7 10.22 4.05-1.65 7-5.7 7-10.22V5.25L12 2.5Z"
            />
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}

export function BrandMark() {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.1,
        bgcolor: 'primary.main',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        boxShadow: '0 3px 10px rgba(0, 102, 255, 0.2)',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        sx={{ width: 18, height: 18, color: '#FFFFFF' }}
      >
        <path
          fill="currentColor"
          d="M8.75 6.75a1 1 0 0 0-1 1v.75H7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-.75v-.75a1 1 0 0 0-1-1h-6.5Zm.5 1.75v-.5h5.5v.5h-5.5Zm7.25 3.25h-3v-1h-1v1h-3v1h3v1h1v-1h3v-1Z"
        />
      </Box>
    </Box>
  );
}
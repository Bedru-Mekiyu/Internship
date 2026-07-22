import { Box, Typography } from '@mui/material';

export default function ContactAdminPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Contact Messages
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Admin contact management will be built next — the backend API is ready.
      </Typography>
    </Box>
  );
}

import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { HomeOutlined, SearchOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getLandingRouteForRole } from '../../routes/learnSpaceNavigation';

export default function NotFoundPage() {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'grid',
                  placeItems: 'center',
                  mx: 'auto',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                  }}
                >
                  404
                </Typography>
              </Box>

              <Stack spacing={1}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}
                >
                  Page not found
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                >
                  The page "{location.pathname}" doesn't exist or has been moved.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', pt: 1 }}>
                {isAuthenticated ? (
                  <Button
                    component={RouterLink}
                    to={getLandingRouteForRole(user.role)}
                    variant="contained"
                    startIcon={<HomeOutlined />}
                    sx={{ px: 2.5, py: 1.2 }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/"
                    variant="contained"
                    startIcon={<HomeOutlined />}
                    sx={{ px: 2.5, py: 1.2 }}
                  >
                    Go Home
                  </Button>
                )}
                <Button
                  component={RouterLink}
                  to="/help"
                  variant="outlined"
                  startIcon={<SearchOutlined />}
                  sx={{ px: 2.5, py: 1.2 }}
                >
                  Get Help
                </Button>
              </Stack>

              <Box
                sx={{
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Need assistance?{' '}
                  <Typography
                    component={RouterLink}
                    to="/contact"
                    sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Contact support
                  </Typography>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  MenuBookOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

function BrandMark() {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2.5,
        bgcolor: 'primary.main',
        display: 'grid',
        placeItems: 'center',
        color: '#FFFFFF',
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      LS
    </Box>
  );
}

interface OrderDetails {
  orderId?: string;
  courseName?: string;
  amount?: string;
  date?: string;
  paymentMethod?: string;
}

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fallbackOrderId] = useState(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `ORD-${timestamp}`;
  });

  const state = location.state as OrderDetails | null;
  const orderId = state?.orderId || fallbackOrderId;
  const courseName = state?.courseName || 'Your Course';
  const amount = state?.amount || '$0.00';
  const date = state?.date || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'success.main',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CheckCircleOutlined sx={{ fontSize: 48, color: '#FFFFFF' }} />
          </Box>

          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto', lineHeight: 1.7 }}>
              Thank you for your purchase. You now have full access to {courseName}.
            </Typography>
          </Stack>

          <Card sx={{ width: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Order ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {orderId}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Course
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {courseName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Amount Paid
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {amount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {date}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                component={RouterLink}
                to={`/courses/explore`}
                variant="outlined"
                fullWidth
                startIcon={<MenuBookOutlined />}
                sx={{ py: 1.5 }}
              >
                Continue Learning
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                component={RouterLink}
                to="/certificates"
                variant="contained"
                fullWidth
                startIcon={<WorkspacePremiumOutlined />}
                sx={{ py: 1.5 }}
              >
                View Certificate
              </Button>
            </Grid>
          </Grid>

          <Stack spacing={1.5} sx={{ pt: 2, width: '100%' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              A confirmation email has been sent to your email address.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Need help?{' '}
              <Typography
                component={RouterLink}
                to="/contact"
                sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Contact Support
              </Typography>
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export function OrderSuccessHeader() {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <BrandMark />
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              LearnSpace
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button component={RouterLink} to="/dashboard" sx={{ fontWeight: 600 }}>
              Dashboard
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

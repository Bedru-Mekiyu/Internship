import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Alert,
  Link,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';

type BillingCycle = 'monthly' | 'yearly';

type Plan = {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyLabel: string;
  features: string[];
  featured?: boolean;
  cta: string;
};

function PricingNav() {
  const navItems = [
    { label: 'Features', to: '/home#features' },
    { label: 'Courses', to: '/courses/explore' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Enterprise', to: '/home#about' },
  ];

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: '#FFFFFF', fontWeight: 900 }}>
              LS
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              LearnSpace
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {navItems.map((item) => (
              <Link key={item.label} component={RouterLink} to={item.to} underline="none" sx={{ color: 'text.secondary', fontWeight: 700, '&:hover': { color: 'primary.main' } }}>
                {item.label}
              </Link>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'text.primary', fontWeight: 700 }}>
              Log in
            </Link>
            <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 3, py: 1.25, borderRadius: 1.5 }}>
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return (
      <Typography variant="body2" sx={{ fontWeight: 700, color: value ? 'text.primary' : 'text.secondary' }}>
        {value ? 'Yes' : 'No'}
      </Typography>
    );
  }

  return <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{value}</Typography>;
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [comparisonRows, setComparisonRows] = useState<Array<{
    label: string;
    free: string | boolean;
    pro: string | boolean;
    business: string | boolean;
  }>>([]);

  useEffect(() => {
    void (async () => {
      try {
        const response = await api.get<{
          settings: {
            pricingPlans?: Plan[];
            pricingComparison?: Array<{
              label: string;
              free: string | boolean;
              pro: string | boolean;
              business: string | boolean;
            }>;
          };
        }>('/api/settings/public');
        setPlans(response.data.settings.pricingPlans || []);
        setComparisonRows(response.data.settings.pricingComparison || []);
        setSettingsError(null);
      } catch (requestError) {
        setPlans([]);
        setComparisonRows([]);
        setSettingsError(normalizeApiError(requestError).message || 'Unable to load pricing content.');
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <PricingNav />
      {settingsError ? (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {settingsError}
        </Alert>
      ) : null}

      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 7, md: 10 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.05, maxWidth: 860 }}>
              Simple, transparent pricing
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 860, fontWeight: 500, lineHeight: 1.7 }}>
              Choose a plan that fits your stage today and scale without friction as your academy grows.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2, py: 1.25, borderRadius: 999, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: billingCycle === 'monthly' ? 'text.primary' : 'text.secondary' }}>Monthly</Typography>
              <Switch checked={billingCycle === 'yearly'} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBillingCycle(event.target.checked ? 'yearly' : 'monthly')} />
              <Typography variant="body2" sx={{ fontWeight: 800, color: billingCycle === 'yearly' ? 'text.primary' : 'text.secondary' }}>Yearly</Typography>
            </Stack>
          </Stack>

          {plans.length > 0 ? (
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              {plans.map((plan) => {
                const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                const cadence = billingCycle === 'monthly' ? '/mo' : plan.yearlyLabel;

                return (
                  <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2.25}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>{plan.name}</Typography>
                          </Box>

                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{plan.description}</Typography>

                          <Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
                              {price}
                              <Typography component="span" variant="body1" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                {cadence}
                              </Typography>
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'grid', gap: 1.25 }}>
                            {plan.features.map((feature) => (
                              <Typography key={feature} variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                • {feature}
                              </Typography>
                            ))}
                          </Box>

                          <Button
                            component={RouterLink}
                            to={plan.featured ? '/checkout?plan=pro' : '/auth/signup'}
                            variant={plan.featured ? 'contained' : 'outlined'}
                            fullWidth
                            sx={{ py: 1.45, borderRadius: 1.5, fontWeight: 800, textTransform: 'none', ...(plan.featured ? {} : { borderColor: 'divider', color: 'text.primary' }) }}
                          >
                            {plan.cta}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              No pricing plans are available yet.
            </Typography>
          )}

          <Card sx={{ mt: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={2.25}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>Feature comparison</Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>Compare what&apos;s included across each plan.</Typography>
                </Box>

                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 560, md: 800 } }}>
                    <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid', borderColor: 'divider', fontWeight: 900, color: 'text.primary', py: { xs: 1.25, md: 1.75 }, fontSize: { xs: '0.75rem', md: '0.875rem' } } }}>
                        <TableCell>Feature</TableCell>
                        <TableCell align="center">Free</TableCell>
                        <TableCell align="center">Pro</TableCell>
                        <TableCell align="center">Business / Enterprise</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonRows.map((row) => (
                        <TableRow key={row.label} hover sx={{ '& .MuiTableCell-root': { py: { xs: 1.25, md: 1.8 }, borderBottom: '1px solid', borderColor: 'divider' } }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>{row.label}</TableCell>
                          <TableCell align="center"><FeatureCell value={row.free} /></TableCell>
                          <TableCell align="center"><FeatureCell value={row.pro} /></TableCell>
                          <TableCell align="center"><FeatureCell value={row.business} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {comparisonRows.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No comparison matrix is configured yet.
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                  Need a custom setup for your team?
                </Typography>
                <Typography variant="body1" sx={{ mt: 1.25, color: 'text.secondary', lineHeight: 1.8, maxWidth: 720 }}>
                  Contact us for a tailored onboarding plan, custom branding, and deployment support.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.25}>
                  <Button component={RouterLink} to="/contact" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 900, py: 1.45 }}>
                    Talk to Sales
                  </Button>
                  <Button component={RouterLink} to="/auth/signup" variant="outlined" sx={{ borderColor: 'divider', color: 'text.primary', borderRadius: 1.5, fontWeight: 900, py: 1.45 }}>
                    Start Free
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
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
import { alpha } from '@mui/material/styles';
import {
  CheckCircleOutlined,
  CloseOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

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
  accent: string;
};

const plans: Plan[] = [
  {
    name: 'Free',
    description: 'Best for exploring LearnSpace and launching your first course.',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    yearlyLabel: 'Forever',
    features: ['1 published course', 'Basic analytics', 'Community access', 'Email support'],
    cta: 'Start Free',
    accent: '#64748B',
  },
  {
    name: 'Pro',
    description: 'For creators who want better insights, more control, and faster growth.',
    monthlyPrice: '$29',
    yearlyPrice: '$24',
    yearlyLabel: '/mo billed yearly',
    features: ['Unlimited courses', 'Advanced analytics', 'Certificates', 'Payments', 'Priority support'],
    featured: true,
    cta: 'Get Pro',
    accent: '#0066FF',
  },
  {
    name: 'Business / Enterprise',
    description: 'For teams, academies, and organizations needing custom onboarding.',
    monthlyPrice: '$99',
    yearlyPrice: '$84',
    yearlyLabel: '/mo billed yearly',
    features: ['Everything in Pro', 'Team roles', 'Custom branding', 'Dedicated onboarding', 'SLA support'],
    cta: 'Talk to Sales',
    accent: '#6366F1',
  },
];

const comparisonRows = [
  { label: 'Published courses', free: '1', pro: 'Unlimited', business: 'Unlimited' },
  { label: 'Analytics dashboard', free: 'Basic', pro: 'Advanced', business: 'Advanced' },
  { label: 'Certificates', free: false, pro: true, business: true },
  { label: 'Payments', free: false, pro: true, business: true },
  { label: 'Team roles', free: false, pro: false, business: true },
  { label: 'Custom branding', free: false, pro: false, business: true },
  { label: 'Dedicated onboarding', free: false, pro: false, business: true },
  { label: 'Priority support', free: false, pro: true, business: true },
];

function PricingNav() {
  const navItems = [
    { label: 'Features', to: '/home#features' },
    { label: 'Courses', to: '/courses/explore' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Enterprise', to: '/home#about' },
  ];

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha('#FFFFFF', 0.94), backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: '#FFFFFF', fontWeight: 900, boxShadow: '0 10px 20px rgba(0,102,255,0.18)' }}>
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
            <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 3, py: 1.25, borderRadius: '12px' }}>
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
    return value ? <CheckCircleOutlined sx={{ color: 'success.main' }} /> : <CloseOutlined sx={{ color: 'text.disabled' }} />;
  }

  return <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{value}</Typography>;
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const billingLabel = useMemo(() => (billingCycle === 'monthly' ? 'Billed monthly' : 'Save 20% with yearly billing'), [billingCycle]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', color: 'text.primary' }}>
      <PricingNav />

      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 7, md: 10 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Chip label="PRICING" sx={{ bgcolor: alpha('#0066FF', 0.08), color: 'primary.main', fontWeight: 800, letterSpacing: '0.12em', px: 1.25 }} />
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.05, maxWidth: 860 }}>
              Simple, transparent pricing
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 860, fontWeight: 500, lineHeight: 1.7 }}>
              Choose a plan that fits your stage today and scale without friction as your academy grows.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2, py: 1.25, borderRadius: '999px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 10px 24px rgba(15,23,42,0.05)' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: billingCycle === 'monthly' ? 'text.primary' : 'text.secondary' }}>Monthly</Typography>
              <Switch checked={billingCycle === 'yearly'} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBillingCycle(event.target.checked ? 'yearly' : 'monthly')} />
              <Typography variant="body2" sx={{ fontWeight: 800, color: billingCycle === 'yearly' ? 'text.primary' : 'text.secondary' }}>Yearly</Typography>
              <Chip label={billingLabel} size="small" sx={{ bgcolor: alpha('#10B981', 0.1), color: 'success.main', fontWeight: 800 }} />
            </Stack>
          </Stack>

          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const cadence = billingCycle === 'monthly' ? '/mo' : plan.yearlyLabel;

              return (
                <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '16px',
                      border: plan.featured ? '2px solid #0066FF' : '1px solid #E2E8F0',
                      boxShadow: plan.featured ? '0 18px 42px rgba(0,102,255,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 34px rgba(15,23,42,0.1)' },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2.25}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>{plan.name}</Typography>
                          {plan.featured ? (
                            <Chip label="Most Popular" sx={{ bgcolor: alpha('#0066FF', 0.1), color: 'primary.main', fontWeight: 900 }} />
                          ) : null}
                        </Box>

                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{plan.description}</Typography>

                        <Box>
                          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {price}
                            <Typography component="span" variant="body1" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                              {cadence}
                            </Typography>
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {billingCycle === 'monthly' ? 'Cancel anytime' : 'Annual billing with savings'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gap: 1.25 }}>
                          {plan.features.map((feature) => (
                            <Typography key={feature} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 600 }}>
                              <CheckCircleOutlined sx={{ color: plan.accent, fontSize: 18 }} />
                              {feature}
                            </Typography>
                          ))}
                        </Box>

                        <Button
                          component={RouterLink}
                          to={plan.featured ? '/checkout?plan=pro' : '/auth/signup'}
                          variant={plan.featured ? 'contained' : 'outlined'}
                          fullWidth
                          sx={{ py: 1.45, borderRadius: '12px', fontWeight: 800, textTransform: 'none', ...(plan.featured ? { bgcolor: '#0066FF', boxShadow: '0 12px 26px rgba(0,102,255,0.22)' } : { borderColor: '#CBD5E1', color: 'text.primary' }) }}
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

          <Card sx={{ mt: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={2.25}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>Feature comparison</Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>Compare what&apos;s included across each plan.</Typography>
                </Box>

                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid #E2E8F0', fontWeight: 900, color: 'text.primary' } }}>
                        <TableCell>Feature</TableCell>
                        <TableCell align="center">Free</TableCell>
                        <TableCell align="center">Pro</TableCell>
                        <TableCell align="center">Business / Enterprise</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonRows.map((row) => (
                        <TableRow key={row.label} hover sx={{ '& .MuiTableCell-root': { py: 1.8, borderBottom: '1px solid #E2E8F0' } }}>
                          <TableCell sx={{ fontWeight: 700 }}>{row.label}</TableCell>
                          <TableCell align="center"><FeatureCell value={row.free} /></TableCell>
                          <TableCell align="center"><FeatureCell value={row.pro} /></TableCell>
                          <TableCell align="center"><FeatureCell value={row.business} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4, p: { xs: 2.5, md: 3.5 }, borderRadius: '16px', background: 'linear-gradient(135deg, #0066FF 0%, #6366F1 100%)', color: '#FFFFFF', boxShadow: '0 18px 40px rgba(0,102,255,0.18)' }}>
            <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                  Need a custom setup for your team?
                </Typography>
                <Typography variant="body1" sx={{ mt: 1.25, color: 'rgba(255,255,255,0.84)', lineHeight: 1.8, maxWidth: 720 }}>
                  Contact us for a tailored onboarding plan, custom branding, and deployment support.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.25}>
                  <Button component={RouterLink} to="/contact" variant="contained" sx={{ bgcolor: '#FFFFFF', color: '#0066FF', borderRadius: '12px', fontWeight: 900, py: 1.45, '&:hover': { bgcolor: '#F8FAFC' } }}>
                    Talk to Sales
                  </Button>
                  <Button component={RouterLink} to="/auth/signup" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF', borderRadius: '12px', fontWeight: 900, py: 1.45, '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                    Start Free
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

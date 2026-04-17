import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForwardOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  LockOutlined,
  LocalOfferOutlined,
  ReceiptLongOutlined,
  ShieldOutlined,
  VerifiedOutlined,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

type BillingForm = {
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  country: string;
  postalCode: string;
};

const defaultForm: BillingForm = {
  nameOnCard: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
  country: 'United States',
  postalCode: '',
};

const courseByPlan = {
  free: { title: 'LearnSpace Free', price: 0, badge: 'Starter', description: 'Unlock core learning features and begin exploring the platform.' },
  pro: { title: 'LearnSpace Pro', price: 29, badge: 'Most Popular', description: 'Advanced analytics, certificates, and premium course tools.' },
  business: { title: 'LearnSpace Business', price: 99, badge: 'Team Plan', description: 'Best for organizations needing team roles and onboarding support.' },
  enterprise: { title: 'LearnSpace Enterprise', price: 149, badge: 'Enterprise', description: 'Custom onboarding, SLA support, and branded deployment.' },
};

function TopNav() {
  const navLinks = [
    { label: 'Features', to: '/home#features' },
    { label: 'Courses', to: '/courses/explore' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Enterprise', to: '/home#about' },
  ];

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha('#FFFFFF', 0.96), backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'primary.main', color: '#FFFFFF', display: 'grid', placeItems: 'center', boxShadow: '0 10px 20px rgba(0,102,255,0.18)', fontWeight: 900 }}>
              LS
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              LearnSpace
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {navLinks.map((item) => (
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

export default function CheckoutPage() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const planKey = params.get('plan') ?? 'pro';
  const selectedPlan = courseByPlan[(planKey as keyof typeof courseByPlan) || 'pro'] ?? courseByPlan.pro;

  const [form, setForm] = useState<BillingForm>(defaultForm);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const discount = promoApplied ? Math.round(selectedPlan.price * 0.15) : 0;
  const subtotal = selectedPlan.price;
  const total = Math.max(subtotal - discount, 0);
  const tax = total > 0 ? Math.round(total * 0.08) : 0;

  const updateField = (field: keyof BillingForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitted(false);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const applyPromo = () => {
    setPromoApplied(promoCode.trim().toLowerCase() === 'learn15');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 10 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25} sx={{ alignItems: 'center', textAlign: 'center', mb: 4 }}>
            <Chip label="SECURE CHECKOUT" sx={{ bgcolor: alpha('#0066FF', 0.08), color: 'primary.main', fontWeight: 800, letterSpacing: '0.12em' }} />
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '2.35rem', md: '3.8rem' }, lineHeight: 1.08, maxWidth: 840 }}>
              Secure checkout for your LearnSpace purchase
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, fontWeight: 500, lineHeight: 1.7 }}>
              Complete your order with a clean, trusted payment experience. Stripe Elements can be connected here, or use the secure placeholder form below.
            </Typography>
          </Stack>

          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                          Payment details
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          Your payment is encrypted and processed securely.
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip icon={<ShieldOutlined />} label="SSL secured" sx={{ bgcolor: alpha('#10B981', 0.1), color: 'success.main', fontWeight: 800 }} />
                        <Chip icon={<VerifiedOutlined />} label="PCI compliant" sx={{ bgcolor: alpha('#0066FF', 0.08), color: 'primary.main', fontWeight: 800 }} />
                      </Stack>
                    </Box>

                    <Card sx={{ boxShadow: 'none', borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={1.25}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCardOutlined fontSize="small" /> Stripe Elements ready
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                            Replace this placeholder with <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>CardElement</Box>, <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>PaymentElement</Box>, or your preferred Stripe integration.
                          </Typography>
                          <Box sx={{ p: 2, borderRadius: '12px', border: '1px dashed #CBD5E1', bgcolor: '#FFFFFF' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>Card number</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700, color: 'text.primary' }}>•••• •••• •••• 4242</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label="Name on card" placeholder="Jane Doe" value={form.nameOnCard} onChange={updateField('nameOnCard')} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label="Card number" placeholder="1234 1234 1234 1234" value={form.cardNumber} onChange={updateField('cardNumber')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Expiration date" placeholder="MM / YY" value={form.expiry} onChange={updateField('expiry')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="CVC" placeholder="123" value={form.cvc} onChange={updateField('cvc')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Billing country" value={form.country} onChange={updateField('country')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Postal code" placeholder="10001" value={form.postalCode} onChange={updateField('postalCode')} />
                      </Grid>
                    </Grid>

                    <Box sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalOfferOutlined fontSize="small" /> Promo code
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                          <TextField fullWidth placeholder="Enter promo code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
                          <Button variant="outlined" onClick={applyPromo} sx={{ minWidth: { xs: '100%', sm: 140 }, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}>
                            Apply
                          </Button>
                        </Stack>
                        {promoApplied ? (
                          <Alert severity="success" sx={{ borderRadius: '12px' }}>
                            Promo code applied successfully.
                          </Alert>
                        ) : promoCode ? (
                          <Alert severity="info" sx={{ borderRadius: '12px' }}>
                            Try <Box component="span" sx={{ fontWeight: 800 }}>LEARN15</Box> for 15% off.
                          </Alert>
                        ) : null}
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <LockOutlined sx={{ color: 'success.main' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        This is a secure checkout. Your payment details are protected using industry-standard encryption.
                      </Typography>
                    </Box>

                    {submitted ? (
                      <Alert severity="success" sx={{ borderRadius: '12px' }}>
                        Payment submitted. This is a placeholder checkout flow ready for Stripe integration.
                      </Alert>
                    ) : null}

                    <Button type="submit" variant="contained" endIcon={<ArrowForwardOutlined />} sx={{ bgcolor: '#0066FF', py: 1.5, borderRadius: '12px', fontWeight: 900, boxShadow: '0 12px 26px rgba(0,102,255,0.22)' }}>
                      Complete Secure Payment
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: { lg: 'sticky' }, top: { lg: 24 } }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2.25}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>Order summary</Typography>
                      <Chip label={selectedPlan.badge} sx={{ bgcolor: alpha('#0066FF', 0.08), color: 'primary.main', fontWeight: 800 }} />
                    </Box>

                    <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>LS</Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                            {selectedPlan.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                            {selectedPlan.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Stack spacing={1.25}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Subtotal</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>${subtotal}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Promo discount</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: promoApplied ? 'success.main' : 'text.primary' }}>-${discount}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Estimated tax</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>${tax}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>Total</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'primary.main' }}>${total + tax}</Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: alpha('#10B981', 0.08), border: '1px solid #D1FAE5' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>What&apos;s included</Typography>
                      <Stack spacing={1.1} sx={{ mt: 1.25 }}>
                        {[
                          'Access to your selected LearnSpace plan',
                          'Secure Stripe-ready payment flow',
                          'Immediate course and billing confirmation',
                          'Email receipt and payment summary',
                        ].map((item) => (
                          <Typography key={item} variant="body2" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1, lineHeight: 1.7 }}>
                            <CheckCircleOutlined sx={{ color: 'success.main', fontSize: 18 }} />
                            {item}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ p: 2.25, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <ReceiptLongOutlined sx={{ color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Need an invoice?</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>Business buyers can request invoicing and purchase support.</Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Button component={RouterLink} to="/contact" variant="text" sx={{ textTransform: 'none', fontWeight: 800, color: 'primary.main' }}>
                      Need help with your payment?
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

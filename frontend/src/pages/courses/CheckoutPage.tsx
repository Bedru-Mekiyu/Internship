import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { api, ensureCsrfToken, normalizeApiError } from '../../services/api';

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

const isTrustedCheckoutUrl = (value: string) => {
  try {
    const parsed = new URL(value, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    if (parsed.origin === window.location.origin) {
      return true;
    }

    const hostname = parsed.hostname.toLowerCase();
    return hostname === 'checkout.stripe.com' || hostname === 'www.paypal.com' || hostname.endsWith('.paypal.com');
  } catch {
    return false;
  }
};

function TopNav() {
  const navLinks = [
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
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'primary.main', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
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
            <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 3, py: 1.25, borderRadius: 1.5 }}>
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
  const courseId = params.get('courseId')?.trim() ?? '';
  const [courseSummary, setCourseSummary] = useState<{
    title: string;
    description: string;
    badge: string;
    price: number;
  } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [form, setForm] = useState<BillingForm>(defaultForm);
  const [promoCode, setPromoCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discount = 0;
  const subtotal = courseSummary?.price ?? 0;
  const total = Math.max(subtotal - discount, 0);
  const tax = total > 0 ? Math.round(total * 0.08) : 0;

  useEffect(() => {
    if (!courseId) {
      setCourseSummary(null);
      setSummaryError('Select a course first, then checkout from the course page.');
      return;
    }

    let active = true;
    setSummaryLoading(true);
    setSummaryError(null);
    void (async () => {
      try {
        const response = await api.get<{
          title: string;
          shortDescription?: string;
          description?: string;
          pricing?: { amount?: number };
          level?: string;
        }>(`/api/courses/${courseId}`);
        if (!active) {
          return;
        }
        setCourseSummary({
          title: response.data.title,
          description: response.data.shortDescription || response.data.description || '',
          badge: response.data.level ? response.data.level.toUpperCase() : 'COURSE',
          price: Number(response.data.pricing?.amount ?? 0),
        });
      } catch (error) {
        if (!active) {
          return;
        }
        setCourseSummary(null);
        setSummaryError(normalizeApiError(error).message || 'Unable to load course pricing details.');
      } finally {
        if (active) {
          setSummaryLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [courseId]);

  const updateField = (field: keyof BillingForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitted(false);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setSubmitted(false);

    if (!courseId) {
      setStatusMessage({
        type: 'error',
        text: 'Select a course first, then checkout from the course page.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await ensureCsrfToken();
      const response = await api.post<{ checkoutUrl?: string; message?: string }>('/api/payments', {
        courseId,
        method: 'card',
      });

      setSubmitted(true);

      if (response.data.checkoutUrl) {
        if (!isTrustedCheckoutUrl(response.data.checkoutUrl)) {
          setStatusMessage({
            type: 'error',
            text: 'Payment redirect URL was rejected for security reasons.',
          });
          return;
        }

        window.location.assign(response.data.checkoutUrl);
        return;
      }

      setStatusMessage({
        type: 'success',
        text: response.data.message || 'Payment request submitted successfully.',
      });
    } catch (error) {
      const normalized = normalizeApiError(error);
      setStatusMessage({
        type: 'error',
        text: normalized.message || 'Unable to initialize payment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 10 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25} sx={{ alignItems: 'center', textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '2.35rem', md: '3.8rem' }, lineHeight: 1.08, maxWidth: 840 }}>
              Secure checkout for your LearnSpace purchase
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, fontWeight: 500, lineHeight: 1.7 }}>
              Complete your order with a clean, trusted payment experience backed by the LearnSpace payments API.
            </Typography>
          </Stack>

          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
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
                    </Box>

                    <Card sx={{ boxShadow: 'none', borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={1.25}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                            Payment gateway
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                            Submitting this checkout creates a payment session on the backend and redirects to the provider checkout URL when available.
                          </Typography>
                          <Box sx={{ p: 2, borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>Checkout status</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700, color: 'text.primary' }}>Ready to create payment session</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label="Name on card" value={form.nameOnCard} onChange={updateField('nameOnCard')} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label="Card number" value={form.cardNumber} onChange={updateField('cardNumber')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Expiration date" value={form.expiry} onChange={updateField('expiry')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="CVC" placeholder="123" value={form.cvc} onChange={updateField('cvc')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Billing country" value={form.country} onChange={updateField('country')} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Postal code" value={form.postalCode} onChange={updateField('postalCode')} />
                      </Grid>
                    </Grid>

                    <Box sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                          Promo code
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                          <TextField fullWidth placeholder="Enter promo code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
                        </Stack>
                        <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                          Promotions are validated and applied by the backend at checkout confirmation.
                        </Alert>
                      </Stack>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      This is a secure checkout. Your payment details are protected using industry-standard encryption.
                    </Typography>

                    {statusMessage ? (
                      <Alert severity={statusMessage.type} sx={{ borderRadius: 1.5 }}>
                        {statusMessage.text}
                      </Alert>
                    ) : null}

                    {submitted ? (
                      <Alert severity="success" sx={{ borderRadius: 1.5 }}>
                        Payment submitted.
                      </Alert>
                    ) : null}

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{ py: 1.5, borderRadius: 1.5, fontWeight: 900 }}
                    >
                      {isSubmitting ? 'Processing Payment...' : 'Complete Secure Payment'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', position: { lg: 'sticky' }, top: { lg: 24 } }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2.25}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>Order summary</Typography>
                    </Box>

                    <Box sx={{ p: 2.25, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                            {courseSummary?.title || 'Course'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                            {courseSummary?.description || ''}
                            </Typography>
                      </Box>
                    </Box>
                      {summaryLoading ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Loading course pricing...
                        </Typography>
                      ) : null}
                      {summaryError ? (
                        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                          {summaryError}
                        </Alert>
                      ) : null}

                    <Stack spacing={1.25}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Subtotal</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>${subtotal}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Promo discount</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>-${discount}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Estimated tax</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>${tax}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, pt: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>Total</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'primary.main' }}>${total + tax}</Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ p: 2.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>What&apos;s included</Typography>
                      <Stack spacing={1.1} sx={{ mt: 1.25 }}>
                        {[
                          'Access to your selected LearnSpace plan',
                          'Secure Stripe-ready payment flow',
                          'Immediate course and billing confirmation',
                          'Email receipt and payment summary',
                        ].map((item) => (
                          <Typography key={item} variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                            • {item}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ p: 2.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Need an invoice?</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                        Business buyers can request invoicing and purchase support.
                      </Typography>
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

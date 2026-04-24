import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
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
import { Link as RouterLink } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { sanitizeHttpUrl, sanitizeUrl } from '../../utils/safeUrl';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

type ContactPublicSettings = {
  platformName: string;
  supportEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
  contactMapUrl: string;
  contactResponseTime: string;
};

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
};

const emptySettings: ContactPublicSettings = {
  platformName: '',
  supportEmail: '',
  contactPhone: '',
  contactAddress: '',
  contactHours: '',
  contactMapUrl: '',
  contactResponseTime: '',
};

function BrandMark() {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: 'primary.main',
        color: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      LS
    </Box>
  );
}

function TopNav() {
  const navItems = [
    { label: 'Features', to: '/#features' },
    { label: 'Courses', to: '/#courses' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Enterprise', to: '/pricing' },
  ];

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

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {navItems.map((item) => (
              <Link key={item.label} component={RouterLink} to={item.to} underline="none" sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
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

function ContactCard({ title, description, value, href }: { title: string; description: string; value: string; href?: string }) {
  const safeHref = sanitizeUrl(
    href,
    new Set(['http:', 'https:', 'mailto:', 'tel:']),
  );
  const content = (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 1 }}>
          {description}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (!safeHref) {
    return content;
  }

  return (
    <Link href={safeHref} underline="none" sx={{ color: 'inherit' }}>
      {content}
    </Link>
  );
}

function FooterColumn({ heading, items }: { heading: string; items: string[] }) {
  const resolveLink = (item: string) => {
    switch (item) {
      case 'Features':
        return '/#features';
      case 'Courses':
        return '/#courses';
      case 'Pricing':
        return '/pricing';
      case 'About':
      case 'About Us':
        return '/about';
      case 'Blog':
        return '/blog';
      case 'Careers':
        return '/careers';
      case 'Contact':
        return '/contact';
      case 'Help Center':
        return '/help-center';
      case 'Docs':
        return '/docs';
      case 'Community':
        return '/community';
      case 'Status':
        return '/status';
      default:
        return '/home';
    }
  };

  return (
    <Stack spacing={1.25}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        {heading}
      </Typography>
      {items.map((item) => (
        <Link key={item} component={RouterLink} to={resolveLink(item)} underline="none" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
          {item}
        </Link>
      ))}
    </Stack>
  );
}

export default function ContactUs() {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusSeverity, setStatusSeverity] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<ContactPublicSettings>(emptySettings);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await api.get<{ settings: ContactPublicSettings }>('/api/settings/public');
        if (response.data?.settings) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        setSettingsError(normalizeApiError(error).message || 'Unable to load contact details right now.');
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || current.fullName,
      email: user.email || current.email,
      phone: user.phone || current.phone,
    }));
  }, [user]);

  const contactCards = useMemo(
    () => [
      {
        title: 'Email support',
        description: settings.contactResponseTime
          ? `Our ${settings.platformName} team replies ${settings.contactResponseTime.toLowerCase()}.`
          : 'Get in touch with our support team.',
        value: settings.supportEmail,
        href: settings.supportEmail ? `mailto:${settings.supportEmail}` : undefined,
      },
      {
        title: 'Call us',
        description: settings.contactHours || 'Business hours vary by region.',
        value: settings.contactPhone,
        href: settings.contactPhone ? `tel:${settings.contactPhone.replace(/\s+/g, '')}` : undefined,
      },
      {
        title: 'Visit us',
        description: 'For partnerships, enterprise onboarding, and strategic support.',
        value: settings.contactAddress,
      },
    ],
    [settings],
  );
  const safeMapUrl = useMemo(() => sanitizeHttpUrl(settings.contactMapUrl), [settings.contactMapUrl]);

  const updateField = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStatusMessage(null);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
      setStatusSeverity('error');
      setStatusMessage('Full name, email, and message are required.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await api.post('/api/contact', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });

      setStatusSeverity('success');
      setStatusMessage(`Thanks for reaching out to ${settings.platformName}. Our team will get back to you shortly.`);
      setForm((current) => ({ ...current, message: '' }));
    } catch (error) {
      setStatusSeverity('error');
      setStatusMessage(normalizeApiError(error).message || 'Could not send your message right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <TopNav />

      <Box
        sx={{
          pt: { xs: 6, md: 9 },
          pb: { xs: 8, md: 10 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3.5} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack spacing={2.5}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Stack spacing={1.5}>
                      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Let&apos;s build something great together
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                        Whether you need product support, enterprise onboarding, or integration help, the {settings.platformName} team is ready.
                      </Typography>
                      {settings.contactResponseTime ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Average response time: <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>{settings.contactResponseTime}</Box>
                        </Typography>
                      ) : null}
                      {settingsError ? (
                        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                          {settingsError}
                        </Alert>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>

                <Stack spacing={2.25}>
                  {contactCards.map((item) => (
                    <ContactCard key={item.title} title={item.title} description={item.description} value={item.value} href={item.href} />
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Box component="form" onSubmit={handleSubmit}>
                      <Stack spacing={2.25}>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                          Send us a message
                        </Typography>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Full Name" placeholder="Enter your full name" value={form.fullName} onChange={updateField('fullName')} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Email Address" placeholder="you@company.com" type="email" value={form.email} onChange={updateField('email')} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Phone Number (Optional)" placeholder={settings.contactPhone} value={form.phone} onChange={updateField('phone')} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={7}
                            label="Message"
                            placeholder="Tell us what you need help with..."
                            value={form.message}
                            onChange={updateField('message')}
                          />
                        </Grid>
                      </Grid>

                      {statusMessage ? (
                        <Alert severity={statusSeverity} sx={{ borderRadius: 1.5 }}>
                          {statusMessage}
                        </Alert>
                      ) : null}

                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          py: 1.6,
                          borderRadius: 1.5,
                          fontWeight: 800,
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                  {safeMapUrl ? (
                    <Box component="iframe" title="Office location" src={safeMapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" sx={{ width: '100%', minHeight: { xs: 240, md: 310 }, border: 0 }} />
                  ) : (
                    <Box
                      sx={{
                        minHeight: { xs: 240, md: 310 },
                        p: 3,
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Visit our office
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
                        {settings.contactAddress}
                      </Typography>
                      {settings.contactHours ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {settings.contactHours}
                        </Typography>
                      ) : null}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ pt: { xs: 7, md: 10 }, pb: 5, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <BrandMark />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {settings.platformName}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 330, lineHeight: 1.8 }}>
                  A modern EdTech platform for teams, creators, and learners who want polished learning experiences.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Product" items={['Features', 'Courses', 'Pricing', 'Enterprise']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Company" items={['About', 'Careers', 'Blog', 'Contact']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Resources" items={['Help Center', 'Docs', 'Community', 'Status']} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © 2026 {settings.platformName}. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                Privacy
              </Link>
              <Link component={RouterLink} to="/terms" underline="none" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                Terms
              </Link>
              <Link component={RouterLink} to="/cookies" underline="none" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                Cookies
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

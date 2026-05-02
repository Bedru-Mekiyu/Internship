import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
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
import {
  BoltOutlined,
  EmailOutlined,
  LocationOnOutlined,
  PhoneOutlined,
} from '@mui/icons-material';
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
  return <BoltOutlined sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />;
}

function TopNav() {
  const navItems = [
    { label: 'Features', to: '/#features' },
    { label: 'Courses', to: '/#courses' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Enterprise', to: '/pricing' },
  ];

  return (
    <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid', borderColor: '#E3E8F1' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1 }}>
          <Link component={RouterLink} to="/" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1.1, color: 'inherit' }}>
            <BrandMark />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.025em', color: 'primary.main', fontSize: '0.92rem' }}>
              LearnSpace
            </Typography>
          </Link>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2.5 }}>
            {navItems.map((item) => (
              <Link key={item.label} component={RouterLink} to={item.to} underline="none" sx={{ color: 'text.secondary', fontSize: '0.75rem', '&:hover': { color: 'primary.main' } }}>
                {item.label}
              </Link>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              Log in
            </Link>
            <Button component={RouterLink} to="/auth/signup" variant="contained" color="secondary" sx={{ px: 1.15, py: 0.48, borderRadius: 0.8, fontSize: '0.66rem', minWidth: 0 }}>
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function ContactCard({
  title,
  description,
  value,
  icon,
  href,
}: {
  title: string;
  description: string;
  value: string;
  icon: ReactNode;
  href?: string;
}) {
  const safeHref = sanitizeUrl(href, new Set(['http:', 'https:', 'mailto:', 'tel:']));
  const content = (
    <Card sx={{ borderRadius: 1, border: '1px solid', borderColor: '#DFE5F1', boxShadow: 'none' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ width: 22, height: 22, borderRadius: 0.8, bgcolor: '#EEF3FF', color: 'primary.main', display: 'grid', placeItems: 'center', mb: 1.2 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.45, fontSize: '1rem' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65, mb: 0.9, fontSize: '0.76rem' }}>
          {description}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (!safeHref) return content;
  return <Link href={safeHref} underline="none" sx={{ color: 'inherit' }}>{content}</Link>;
}

function FooterColumn({ heading, items }: { heading: string; items: string[] }) {
  const resolveLink = (item: string) => {
    switch (item) {
      case 'Features':
        return '/#features';
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
      case 'Community':
        return '/community';
      default:
        return '/';
    }
  };

  return (
    <Stack spacing={1.1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{heading}</Typography>
      {items.map((item) => (
        <Link key={item} component={RouterLink} to={resolveLink(item)} underline="none" sx={{ color: 'text.secondary', fontSize: '0.78rem', '&:hover': { color: 'primary.main' } }}>
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
    if (!user) return;
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
        title: 'Chat with us',
        description: 'Speak to our friendly team via email.',
        value: settings.supportEmail || 'hello@learnspace.com',
        icon: <EmailOutlined sx={{ fontSize: 13 }} />,
        href: settings.supportEmail ? `mailto:${settings.supportEmail}` : undefined,
      },
      {
        title: 'Call us',
        description: settings.contactHours || 'Mon-Fri from 8am to 5pm EST.',
        value: settings.contactPhone || '+1 (555) 000-0000',
        icon: <PhoneOutlined sx={{ fontSize: 13 }} />,
        href: settings.contactPhone ? `tel:${settings.contactPhone.replace(/\s+/g, '')}` : undefined,
      },
      {
        title: 'Visit us',
        description: 'Visit our office HQ.',
        value: settings.contactAddress || '100 Smith Street, Collingwood VIC 3066',
        icon: <LocationOnOutlined sx={{ fontSize: 13 }} />,
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
      setStatusMessage(`Thanks for reaching out to ${settings.platformName || 'LearnSpace'}. Our team will get back to you shortly.`);
      setForm((current) => ({ ...current, message: '' }));
    } catch (error) {
      setStatusSeverity('error');
      setStatusMessage(normalizeApiError(error).message || 'Could not send your message right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F5F7FD', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 4.5, md: 5.5 }, pb: { xs: 6.5, md: 7.5 } }}>
        <Container maxWidth="xl">
          <Stack spacing={4.25}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', px: 1.2, py: 0.45, borderRadius: 999, bgcolor: '#EEF3FF', border: '1px solid #E1E8F6', color: 'primary.main', fontSize: '0.68rem', fontWeight: 700 }}>
                Contact Us
              </Box>
              <Typography variant="h2" sx={{ mt: 1.15, fontWeight: 900, letterSpacing: '-0.035em', fontSize: { xs: '2.1rem', md: '2.9rem' }, lineHeight: 1.1 }}>
                We&apos;d love to hear from you
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.05, color: 'text.secondary', maxWidth: 650, mx: 'auto', lineHeight: 1.75, fontSize: '0.88rem' }}>
                Whether you have a question about features, pricing, or enterprise solutions, our team is ready to answer all your questions.
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack spacing={1}>
                  {settingsError ? (
                    <Alert severity="error" sx={{ borderRadius: 1 }}>
                      {settingsError}
                    </Alert>
                  ) : null}
                  {contactCards.map((item) => (
                    <ContactCard key={item.title} title={item.title} description={item.description} value={item.value} icon={item.icon} href={item.href} />
                  ))}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ borderRadius: 1, border: '1px solid', borderColor: '#DFE5F1', boxShadow: 'none' }}>
                  <CardContent sx={{ p: { xs: 2.2, md: 2.4 } }}>
                    <Box component="form" onSubmit={handleSubmit}>
                      <Stack spacing={1.15}>
                        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Full Name</Typography>
                        <TextField fullWidth size="small" placeholder="Enter your full name" value={form.fullName} onChange={updateField('fullName')} />
                        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Email Address</Typography>
                        <TextField fullWidth size="small" placeholder="you@company.com" type="email" value={form.email} onChange={updateField('email')} />
                        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Phone Number (Optional)</Typography>
                        <TextField fullWidth size="small" placeholder={settings.contactPhone || '+1 (555) 000-0000'} value={form.phone} onChange={updateField('phone')} />
                        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Message</Typography>
                        <TextField fullWidth multiline minRows={4} placeholder="Tell us how we can help..." value={form.message} onChange={updateField('message')} />

                        {statusMessage ? (
                          <Alert severity={statusSeverity} sx={{ borderRadius: 1 }}>
                            {statusMessage}
                          </Alert>
                        ) : null}

                        <Button type="submit" variant="contained" color="secondary" sx={{ mt: 0.2, py: 1.1, borderRadius: 0.8, fontWeight: 700, fontSize: '0.8rem' }} disabled={isSubmitting}>
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ borderRadius: 1, border: '1px solid', borderColor: '#DFE5F1', overflow: 'hidden', boxShadow: 'none' }}>
              <CardContent sx={{ p: 0 }}>
                {safeMapUrl ? (
                  <Box component="iframe" title="Office location" src={safeMapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" sx={{ width: '100%', minHeight: { xs: 200, md: 240 }, border: 0 }} />
                ) : (
                  <Box sx={{ minHeight: { xs: 200, md: 240 }, p: 3, bgcolor: '#E9EEF6', color: 'text.primary', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Visit our office
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
                      {settings.contactAddress || '100 Smith Street, Collingwood VIC 3066'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ pt: { xs: 5, md: 6 }, pb: 3, bgcolor: '#FFFFFF', borderTop: '1px solid', borderColor: '#E3E8F1' }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                  <BrandMark />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.92rem' }}>
                    {settings.platformName || 'LearnSpace'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 330, lineHeight: 1.8 }}>
                  Empowering educators to share knowledge and build sustainable businesses online.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Product" items={['Features', 'Pricing', 'Integrations', 'Changelog']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Company" items={['About', 'Careers', 'Blog', 'Contact']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Resources" items={['Help Center', 'Community', 'Creator Academy', 'Webinars']} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, pt: 2.5, borderTop: '1px solid', borderColor: '#E3E8F1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              © 2024 {settings.platformName || 'LearnSpace'} Inc. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
              <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: 'text.secondary', fontSize: '0.75rem', '&:hover': { color: 'primary.main' } }}>
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms" underline="none" sx={{ color: 'text.secondary', fontSize: '0.75rem', '&:hover': { color: 'primary.main' } }}>
                Terms of Service
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

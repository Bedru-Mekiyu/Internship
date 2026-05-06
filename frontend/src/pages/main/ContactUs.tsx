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
  EmailOutlined,
  LocationOnOutlined,
  PhoneOutlined,
} from '@mui/icons-material';
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

    </Box>
  );
}




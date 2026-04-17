import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
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
import { alpha } from '@mui/material/styles';
import { EmailOutlined, LocalPhoneOutlined, LocationOnOutlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
};

function BrandMark() {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '12px',
        bgcolor: 'primary.main',
        color: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 10px 22px rgba(0,102,255,0.18)',
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
        bgcolor: alpha('#FFFFFF', 0.96),
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
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
            <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 3, py: 1.25, borderRadius: '12px' }}>
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function ContactCard({ icon, title, description, value }: { icon: ReactNode; title: string; description: string; value: string }) {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 16px 34px rgba(15,23,42,0.1)' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: alpha('#0066FF', 0.1), color: 'primary.main', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
          {description}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
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
      case 'Testimonials':
        return '/#testimonials';
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
      setStatusMessage('Thanks for reaching out. Our team will get back to you shortly.');
      setForm((current) => ({
        ...current,
        message: '',
      }));
    } catch (error) {
      setStatusSeverity('error');
      setStatusMessage(normalizeApiError(error).message || 'Could not send your message right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25} sx={{ alignItems: 'center', textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.75, borderRadius: '999px', bgcolor: alpha('#0066FF', 0.08), color: 'primary.main', fontWeight: 800, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Contact Us
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '2.4rem', md: '3.8rem' }, lineHeight: 1.08, maxWidth: 820 }}>
              We&apos;d love to hear from you
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 900, fontWeight: 500, lineHeight: 1.7 }}>
              Whether you have a question about features, pricing, or enterprise solutions, our team is ready to answer all your questions.
            </Typography>
          </Stack>

          <Grid container spacing={3.5} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack spacing={2.25}>
                <ContactCard
                  icon={<EmailOutlined />}
                  title="Chat with us"
                  description="Speak to our friendly team via email."
                  value="hello@learnspace.com"
                />
                <ContactCard
                  icon={<LocalPhoneOutlined />}
                  title="Call us"
                  description="Mon–Fri from 9am to 5pm EST"
                  value="+1 (555) 000-0000"
                />
                <ContactCard
                  icon={<LocationOnOutlined />}
                  title="Visit us"
                  description="Visit our office HQ."
                  value="100 Smith Street, Collingwood VIC 3066"
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 14px 36px rgba(15,23,42,0.07)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2.25}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Full Name" placeholder="Enter your full name" value={form.fullName} onChange={updateField('fullName')} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Email Address" placeholder="you@company.com" type="email" value={form.email} onChange={updateField('email')} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label="Phone Number (Optional)" placeholder="(555) 000-0000" value={form.phone} onChange={updateField('phone')} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={6}
                            label="Message"
                            placeholder="Tell us how we can help..."
                            value={form.message}
                            onChange={updateField('message')}
                          />
                        </Grid>
                      </Grid>

                      {statusMessage ? (
                        <Alert severity={statusSeverity} sx={{ borderRadius: '12px' }}>
                          {statusMessage}
                        </Alert>
                      ) : null}

                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          bgcolor: '#6366F1',
                          color: '#FFFFFF',
                          py: 1.6,
                          borderRadius: '12px',
                          fontWeight: 800,
                          boxShadow: '0 12px 26px rgba(99,102,241,0.24)',
                          '&:hover': { bgcolor: '#4F46E5' },
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ mt: 3, borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 14px 36px rgba(15,23,42,0.08)' }}>
                <Box
                  sx={{
                    minHeight: { xs: 240, md: 360 },
                    backgroundImage:
                      'linear-gradient(135deg, rgba(2,6,23,0.14), rgba(0,102,255,0.16)), url(https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=1600&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.32), transparent 24%), radial-gradient(circle at 70% 25%, rgba(99,102,241,0.18), transparent 26%), radial-gradient(circle at 55% 70%, rgba(0,102,255,0.20), transparent 28%)' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ pt: { xs: 7, md: 10 }, pb: 5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <BrandMark />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    LearnSpace
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

          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © 2026 LearnSpace. All rights reserved.
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

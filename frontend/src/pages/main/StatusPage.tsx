import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  CloudOutlined,
  ErrorOutlineOutlined,
  HistoryOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
  lastIncident: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'resolved' | 'investigating' | 'monitoring';
  date: string;
  impact: string;
  description: string;
}

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
    { label: 'Courses', to: '/courses/explore' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Status', to: '/status' },
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

function StatusIndicator({ status }: { status: 'operational' | 'degraded' | 'outage' }) {
  const config = {
    operational: { color: 'success.main', icon: <CheckCircleOutlined />, label: 'Operational' },
    degraded: { color: 'warning.main', icon: <ScheduleOutlined />, label: 'Degraded' },
    outage: { color: 'error.main', icon: <ErrorOutlineOutlined />, label: 'Outage' },
  };
  const c = config[status];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ color: c.color }}>{c.icon}</Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: c.color }}>
        {c.label}
      </Typography>
    </Box>
  );
}

function ServiceCard({ service }: { service: SystemStatus }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: service.status === 'operational' ? 'success.light' : 'warning.light',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {service.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Last incident: {service.lastIncident}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <StatusIndicator status={service.status} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {service.uptime} uptime
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const statusConfig = {
    resolved: { color: 'success.main', label: 'Resolved' },
    investigating: { color: 'warning.main', label: 'Investigating' },
    monitoring: { color: 'info.main', label: 'Monitoring' },
  };
  const s = statusConfig[incident.status];

  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {incident.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: `${s.color}15`,
                color: s.color,
                fontWeight: 700,
              }}
            >
              {s.label}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {incident.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <Typography component="span" sx={{ fontWeight: 700 }}>Impact:</Typography> {incident.impact}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {incident.date}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FooterColumn({ heading, items }: { heading: string; items: string[] }) {
  const resolveLink = (item: string) => {
    switch (item) {
      case 'Features': return '/#features';
      case 'Courses': return '/courses/explore';
      case 'Pricing': return '/pricing';
      case 'About': return '/about';
      case 'Blog': return '/blog';
      case 'Careers': return '/careers';
      case 'Contact': return '/contact';
      case 'Help Center': return '/help-center';
      default: return '/home';
    }
  };

  return (
    <Stack spacing={1.25}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{heading}</Typography>
      {items.map((item) => (
        <Link key={item} component={RouterLink} to={resolveLink(item)} underline="none" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
          {item}
        </Link>
      ))}
    </Stack>
  );
}

export default function StatusPage() {
  const [activeTab, setActiveTab] = useState<'systems' | 'history'>('systems');

  const systems: SystemStatus[] = [
    { name: 'Website', status: 'operational', uptime: '99.9%', lastIncident: 'None' },
    { name: 'Course Player', status: 'operational', uptime: '99.9%', lastIncident: 'None' },
    { name: 'Video Streaming', status: 'operational', uptime: '99.8%', lastIncident: '2 weeks ago' },
    { name: 'API', status: 'operational', uptime: '99.9%', lastIncident: 'None' },
    { name: 'Database', status: 'operational', uptime: '99.9%', lastIncident: 'None' },
    { name: 'CDN', status: 'operational', uptime: '99.9%', lastIncident: 'None' },
  ];

  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Video playback delays',
      status: 'resolved',
      date: 'March 15, 2026',
      impact: 'Minor',
      description: 'Users experienced delays when loading video content. Issue was resolved within 2 hours.',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 4, md: 5 }, bgcolor: 'background.default', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
              <CheckCircleOutlined sx={{ fontSize: 32, color: 'success.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'success.main' }}>
                All Systems Operational
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560, mx: 'auto', lineHeight: 1.8 }}>
              All LearnSpace services are running normally. Last updated: {new Date().toLocaleString()}
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={activeTab === 'systems' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('systems')}
              >
                Systems
              </Button>
              <Button
                variant={activeTab === 'history' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('history')}
                startIcon={<HistoryOutlined />}
              >
                History
              </Button>
            </Box>

            {activeTab === 'systems' ? (
              <Grid container spacing={2}>
                {systems.map((service) => (
                  <Grid key={service.name} size={{ xs: 12, md: 6 }}>
                    <ServiceCard service={service} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Stack spacing={2}>
                {incidents.length === 0 ? (
                  <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <CloudOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No past incidents. All systems have been stable.
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  incidents.map((incident) => (
                    <IncidentCard key={incident.id} incident={incident} />
                  ))
                )}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 5, md: 6 }, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <BrandMark />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>LearnSpace</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 330, lineHeight: 1.8 }}>
                  A modern EdTech platform for teams, creators, and learners.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Product" items={['Features', 'Courses', 'Pricing']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Company" items={['About', 'Careers', 'Blog', 'Contact']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Resources" items={['Help Center', 'Community', 'Status']} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © 2026 LearnSpace. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
import { useState } from 'react';
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
  CloudOutlined,
  HistoryOutlined,
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

function ServiceCard({ service }: { service: SystemStatus }) {
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {service.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Status: {service.status} • Uptime {service.uptime}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {incident.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {incident.date} • {incident.impact}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {incident.description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
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

    </Box>
  );
}




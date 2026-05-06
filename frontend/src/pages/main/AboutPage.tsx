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
import { Link as RouterLink } from 'react-router-dom';
import {
  AutoAwesomeOutlined,
  PublicOutlined,
  VerifiedOutlined,
} from '@mui/icons-material';

const teamMembers = [
  { name: 'Sarah Johnson', role: 'Founder & CEO', avatar: 'https://i.pravatar.cc/120?img=32' },
  { name: 'David Chen', role: 'Chief Product Officer', avatar: 'https://i.pravatar.cc/120?img=12' },
  { name: 'Emily Zhang', role: 'Lead Designer', avatar: 'https://i.pravatar.cc/120?img=5' },
  { name: 'Marcus Johnson', role: 'Head of Engineering', avatar: 'https://i.pravatar.cc/120?img=68' },
  { name: 'Priya Patel', role: 'Learning Director', avatar: 'https://i.pravatar.cc/120?img=47' },
  { name: 'Ken Ito', role: 'Engineering Manager', avatar: 'https://i.pravatar.cc/120?img=53' },
  { name: 'Sofia Rodriguez', role: 'Growth Lead', avatar: 'https://i.pravatar.cc/120?img=44' },
  { name: 'Tom Baker', role: 'Content Manager', avatar: 'https://i.pravatar.cc/120?img=61' },
];

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: '#F5F7FD', color: 'text.primary' }}>
      <Box sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="md">
          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
              OUR JOURNEY
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Democratizing education for
              <br />
              everyone, everywhere.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
              We believe talent is equally distributed, but opportunity is not. LearnSpace is building the infrastructure to bridge that gap.
            </Typography>
          </Stack>
        </Container>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80"
            alt="LearnSpace team collaborating"
            sx={{ width: '100%', borderRadius: 1.5, display: 'block' }}
          />
        </Container>

        <Container maxWidth="lg" sx={{ mt: 2.5 }}>
          <Grid container spacing={2} sx={{ bgcolor: '#EEF1FF', borderRadius: 1.5, p: { xs: 2, md: 2.5 } }}>
            {[
              { value: '2M+', label: 'Active Learners' },
              { value: '15K+', label: 'Courses Created' },
              { value: '120+', label: 'Countries Reached' },
              { value: '4.9', label: 'Average User Rating' },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {item.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={1.6}>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Our Story
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.85 }}>
                  LearnSpace began in 2018 when two founders, Sarah and David, noticed that traditional learning management systems were too rigid for modern educators and teams.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.85 }}>
                  We set out to build a platform that puts creators first, scales from solo instructors to global teams, and makes high-quality learning experiences accessible to everyone.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.85 }}>
                  Today, our mission is more urgent than ever: education should not be gated by geography, income, or institutional barriers.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80"
                    alt="Team member working"
                    sx={{ width: '100%', borderRadius: 1.5, height: { xs: 180, md: 240 }, objectFit: 'cover' }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=700&q=80"
                    alt="Workspace setup"
                    sx={{ width: '100%', borderRadius: 1.5, height: { xs: 180, md: 240 }, objectFit: 'cover' }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Core Values
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              The principles that guide our decisions and shape our day.
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {[
              {
                icon: <AutoAwesomeOutlined sx={{ color: 'primary.main', fontSize: 18 }} />,
                title: 'Learners First',
                description: 'We design every feature around real learner outcomes, not vanity metrics.',
              },
              {
                icon: <VerifiedOutlined sx={{ color: 'primary.main', fontSize: 18 }} />,
                title: 'Transparency',
                description: 'We foster open communication and share context so every team can contribute.',
              },
              {
                icon: <PublicOutlined sx={{ color: 'primary.main', fontSize: 18 }} />,
                title: 'Global Impact',
                description: 'We build for a global audience, ensuring education is inclusive and accessible.',
              },
            ].map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1.25}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#EEF1FF', display: 'grid', placeItems: 'center' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                        {item.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Meet the Team
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              The humans behind the mission.
            </Typography>
          </Stack>

          <Grid container spacing={2.5}>
            {teamMembers.map((member) => (
              <Grid key={member.name} size={{ xs: 6, sm: 4, md: 3 }}>
                <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={member.avatar}
                    alt={member.name}
                    sx={{ width: 66, height: 66, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {member.role}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 7, md: 8 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Join us on our journey
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              We&apos;re always looking for talented individuals to help us shape the future of education.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', pt: 1, flexWrap: 'wrap' }}>
              <Button component={RouterLink} to="/careers" variant="contained" sx={{ px: 3 }}>
                Explore Roles
              </Button>
              <Button component={RouterLink} to="/contact" variant="text">
                Contact Us
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

    </Box>
  );
}




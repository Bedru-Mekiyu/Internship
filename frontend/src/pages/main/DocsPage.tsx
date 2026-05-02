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
  TextField,
  Typography,
} from '@mui/material';
import {
  ArticleOutlined,
  ChevronRightOutlined,
  MenuBookOutlined,
  SearchOutlined,
} from '@mui/icons-material';

interface DocSection {
  id: string;
  title: string;
  description: string;
  articles: string[];
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
    { label: 'Docs', to: '/docs' },
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

function DocSectionCard({ section, onSelect }: { section: DocSection; onSelect: (id: string) => void }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 180ms ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => onSelect(section.id)}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ color: 'primary.main' }}>
              <MenuBookOutlined />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {section.title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {section.description}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {section.articles.slice(0, 3).map((article) => (
              <Typography
                key={article}
                variant="caption"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.5,
                  bgcolor: 'primary.main',
                  opacity: 0.08,
                }}
              >
                {article}
              </Typography>
            ))}
            {section.articles.length > 3 && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                +{section.articles.length - 3} more
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ArticleContent({ section }: { section: DocSection }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 900 }}>
        {section.title}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
        {section.description}
      </Typography>
      <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            {section.articles.map((article, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <ArticleOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {article}
                  </Typography>
                </Stack>
                <ChevronRightOutlined sx={{ color: 'text.secondary' }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
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

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of setting up your LearnSpace account and creating your first course.',
      articles: ['Quick Start Guide', 'Creating Your Account', 'First Course Setup', 'Inviting Team Members'],
    },
    {
      id: 'courses',
      title: 'Course Building',
      description: 'Everything you need to know about creating and managing courses.',
      articles: ['Course Structure', 'Adding Lessons', 'Creating Quizzes', 'Drip Content'],
    },
    {
      id: 'video',
      title: 'Video & Media',
      description: 'Learn how to upload, host, and optimize your video content.',
      articles: ['Video Upload', 'Supported Formats', 'Thumbnail Setup', 'Video Analytics'],
    },
    {
      id: 'payments',
      title: 'Payments & Pricing',
      description: 'Set up pricing, handle payments, and manage subscriptions.',
      articles: ['Pricing Models', 'Setting Prices', 'Payment Processing', 'Handling Refunds'],
    },
    {
      id: 'certificates',
      title: 'Certificates',
      description: 'Create and manage completion certificates for your courses.',
      articles: ['Certificate Templates', 'Auto-issuance', 'Custom Certificates', 'Verification'],
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect LearnSpace with your favorite tools.',
      articles: ['Zapier', 'Slack', 'Webhooks', 'Analytics Tools'],
    },
  ];

  const filteredSections = sections.filter((section) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.articles.some((a) => a.toLowerCase().includes(query));
  });

  const selectedSectionData = sections.find((s) => s.id === selectedSection);

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 4, md: 5 }, bgcolor: 'background.default', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack spacing={2.5} sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
              DOCUMENTATION
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Build with LearnSpace
            </Typography>
            <TextField
              fullWidth
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchOutlined sx={{ color: 'text.secondary', mr: 1 }} />,
                }
              }}
              sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}
            />
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: selectedSection ? 4 : 12 }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                  {searchQuery.trim() ? 'Search Results' : 'Documentation'}
                </Typography>
                <Grid container spacing={2}>
                  {filteredSections.map((section) => (
                    <Grid key={section.id} size={{ xs: 12, md: selectedSection ? 12 : 6 }}>
                      <DocSectionCard
                        section={section}
                        onSelect={(id) => setSelectedSection(selectedSection === id ? null : id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>

            {selectedSection && selectedSectionData && (
              <Grid size={{ xs: 12, md: 8 }}>
                <Button
                  variant="text"
                  onClick={() => setSelectedSection(null)}
                  sx={{ mb: 2 }}
                >
                  ← Back to all sections
                </Button>
                <ArticleContent section={selectedSectionData} />
              </Grid>
            )}
          </Grid>
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
                  <FooterColumn heading="Resources" items={['Help Center', 'Docs', 'Community', 'Status']} />
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
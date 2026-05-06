import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  SearchOutlined,
} from '@mui/icons-material';

interface DocSection {
  id: string;
  title: string;
  description: string;
  articles: string[];
}

function DocSectionCard({
  section,
  onSelect,
}: {
  section: DocSection;
  onSelect: (id: string) => void;
}) {
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {section.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {section.description}
          </Typography>
          <Button variant="outlined" onClick={() => onSelect(section.id)}>
            View articles
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ArticleContent({ section }: { section: DocSection }) {
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {section.title}
          </Typography>
          <Stack spacing={1}>
            {section.articles.map((article) => (
              <Typography key={article} variant="body2" sx={{ color: 'text.secondary' }}>
                • {article}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
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
                  ΓåÉ Back to all sections
                </Button>
                <ArticleContent section={selectedSectionData} />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

    </Box>
  );
}



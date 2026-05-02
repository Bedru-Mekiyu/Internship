import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  BusinessCenterOutlined,
  ExpandMoreOutlined,
  HelpOutlineOutlined,
  SchoolOutlined,
  SearchOutlined,
  SettingsOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  faqs: FaqItem[];
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
    { label: 'Help Center', to: '/help-center' },
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

function FaqAccordion({ question, answer }: FaqItem) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: expanded ? 'primary.main' : 'divider',
        transition: 'border-color 180ms ease',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          component="button"
          onClick={() => setExpanded(!expanded)}
          sx={{
            width: '100%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700, pr: 2 }}>
            {question}
          </Typography>
          <ExpandMoreOutlined
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 180ms ease',
              color: 'text.secondary',
            }}
          />
        </Box>
        {expanded && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              {answer}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function HelpCategoryCard({
  category,
  onSelect,
}: {
  category: HelpCategory;
  onSelect: (id: string) => void;
}) {
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
      onClick={() => onSelect(category.id)}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ mb: 1.5, color: 'primary.main' }}>{category.icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
          {category.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 1.5 }}>
          {category.description}
        </Typography>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
          {category.faqs.length} articles
        </Typography>
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
      case 'Help Center': return '/help-center';
      case 'About': return '/about';
      case 'Blog': return '/blog';
      case 'Careers': return '/careers';
      case 'Contact': return '/contact';
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

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: HelpCategory[] = useMemo(() => [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics and get up and running quickly.',
      icon: <SchoolOutlined sx={{ fontSize: 32 }} />,
      faqs: [
        { question: 'How do I create my first course?', answer: 'Sign up for an account, then navigate to your dashboard and click "Create Course". Fill in the course details, add lessons, and publish when ready.' },
        { question: 'How do students enroll in my course?', answer: 'Share your course link or enable public enrollment in course settings. Students can also purchase through your checkout page.' },
        { question: 'Can I use my own domain?', answer: 'Yes! Enterprise plans support custom domains. Contact us to get set up.' },
        { question: 'How do I add videos to lessons?', answer: 'Go to lesson editor, click Add Content, select Video, and upload or embed from your preferred hosting.' },
      ],
    },
    {
      id: 'account-billing',
      title: 'Account & Billing',
      description: 'Manage your account settings and subscriptions.',
      icon: <SettingsOutlined sx={{ fontSize: 32 }} />,
      faqs: [
        { question: 'How do I change my plan?', answer: 'Go to Settings > Billing in your dashboard to upgrade or downgrade your plan.' },
        { question: 'Where can I find my invoices?', answer: 'All invoices are available in Settings > Billing > Invoice History.' },
        { question: 'How do I update my payment method?', answer: 'Navigate to Settings > Billing > Payment Methods to add or update your card.' },
        { question: 'What happens if I cancel?', answer: 'You\'ll keep access until your billing period ends, then lose premium features.' },
      ],
    },
    {
      id: 'teaching-tools',
      title: 'Teaching Tools',
      description: 'Tools and features for creating great courses.',
      icon: <BusinessCenterOutlined sx={{ fontSize: 32 }} />,
      faqs: [
        { question: 'How do I create quizzes?', answer: 'Open any lesson, click Add Quiz, choose question types, and set correct answers.' },
        { question: 'Can I drip content?', answer: 'Yes! Set release dates in lesson settings to drip content over time.' },
        { question: 'How do certificates work?', answer: 'Enable certificates in course settings, set completion criteria, and customize the template.' },
        { question: 'Can I import existing content?', answer: 'We support SCORM packages and can help migrate from other platforms.' },
      ],
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'Troubleshooting and technical questions.',
      icon: <HelpOutlineOutlined sx={{ fontSize: 32 }} />,
      faqs: [
        { question: 'Video won\'t play', answer: 'Check your browser, try a different browser, or clear cache. Also ensure your internet connection is stable.' },
        { question: 'Can\'t access my course', answer: 'Try logging out and back in. If still issues, check your enrollment status in My Courses.' },
        { question: 'Site runs slowly', answer: 'Disable browser extensions, try a different browser, or check your internet speed.' },
        { question: 'Features not working', answer: 'Ensure you\'re on the latest browser version. Try clearing cache or Incognito mode.' },
      ],
    },
  ], []);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return categories.flatMap((cat) =>
      cat.faqs
        .filter((faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query))
        .map((faq) => ({ ...faq, category: cat.title }))
    );
  }, [searchQuery, categories]);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(selectedCategory === id ? null : id);
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 }, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Stack spacing={2.5} sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
              SUPPORT
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              How can we help?
            </Typography>
            <TextField
              fullWidth
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                maxWidth: 600,
                mx: 'auto',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Stack>
        </Container>
      </Box>

      {searchQuery.trim() ? (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Container maxWidth="md">
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Search Results ({filteredFaqs.length})
              </Typography>
              {filteredFaqs.length === 0 ? (
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      No results found for "{searchQuery}". Try a different search term.
                    </Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredFaqs.map((faq, idx) => (
                  <Card key={idx} sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5 }}>
                        {faq.category}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, mb: 0.75 }}>
                        {faq.question}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {faq.answer}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Container>
        </Box>
      ) : (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Container maxWidth="lg">
            <Stack spacing={3}>
              <Typography variant="h5" sx={{ fontWeight: 900, textAlign: 'center', mb: 1 }}>
                Browse by Topic
              </Typography>
              <Grid container spacing={2.5}>
                {categories.map((category) => (
                  <Grid key={category.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <HelpCategoryCard category={category} onSelect={handleCategorySelect} />
                  </Grid>
                ))}
              </Grid>

              {selectedCategoryData && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
                    {selectedCategoryData.title} FAQs
                  </Typography>
                  <Stack spacing={1.5}>
                    {selectedCategoryData.faqs.map((faq, idx) => (
                      <FaqAccordion key={idx} question={faq.question} answer={faq.answer} />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Container>
        </Box>
      )}

      <Box sx={{ py: { xs: 5, md: 6 }, bgcolor: 'background.default', textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'primary.main' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={1.5}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
                  Still need help?
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  Can't find what you're looking for? Our support team is here to help.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="contained"
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: 'primary.main',
                    fontWeight: 800,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  Contact Support
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Box sx={{ pt: { xs: 5, md: 6 }, pb: 4, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
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